import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state") || "";
  const error = searchParams.get("error");

  if (error) {
    return renderErrorHtml(`Authentication Error: ${error}`);
  }

  if (!code) {
    return renderErrorHtml("Authorization code not found in request callback");
  }

  let finalUser = {
    fullName: "",
    username: "",
    email: "",
    authMethod: "",
    avatarUrl: "",
  };

  const isGoogle = state.includes("google") || state === "google";

  try {
    if (isGoogle) {
      // 1. Google token exchange
      const googleId = process.env.GOOGLE_CLIENT_ID || "";
      const googleSecret = process.env.GOOGLE_CLIENT_SECRET || "";

      // Reconstruct original redirect_uri passed to Google
      const currentOrigin = process.env.APP_URL || req.nextUrl.origin;
      const redirectUri = `${currentOrigin}/api/auth/callback`;

      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: googleId,
          client_secret: googleSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenRes.ok) {
        const errorText = await tokenRes.text();
        throw new Error(`Google token exchange failed: ${errorText}`);
      }

      const tokens = await tokenRes.json();
      
      // 2. Fetch Google User Profile
      const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      if (!userRes.ok) {
        throw new Error("Failed to load Google user profile details");
      }

      const profile = await userRes.json();
      finalUser = {
        fullName: profile.name || "Google Client",
        username: (profile.email || "google_user").split("@")[0],
        email: profile.email,
        authMethod: "Google SSO (Verified)",
        avatarUrl: profile.picture || "",
      };
    } else {
      // 1. GitHub token exchange
      const githubId = process.env.GITHUB_CLIENT_ID || "";
      const githubSecret = process.env.GITHUB_CLIENT_SECRET || "";

      const currentOrigin = process.env.APP_URL || req.nextUrl.origin;
      const redirectUri = `${currentOrigin}/api/auth/callback`;

      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          code,
          client_id: githubId,
          client_secret: githubSecret,
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenRes.ok) {
        const errorText = await tokenRes.text();
        throw new Error(`GitHub token exchange failed: ${errorText}`);
      }

      const tokens = await tokenRes.json();
      if (tokens.error) {
        throw new Error(`GitHub token exchange error: ${tokens.error_description || tokens.error}`);
      }

      // 2. Fetch GitHub Profile
      const userRes = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          "User-Agent": "vCreative-SSO-Client",
        },
      });

      if (!userRes.ok) {
        throw new Error("Failed to load GitHub user profile details");
      }

      const profile = await userRes.json();
      
      // 3. Fetch GitHub Email if empty or hidden
      let emailAddress = profile.email;
      if (!emailAddress) {
        const emailRes = await fetch("https://api.github.com/user/emails", {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            "User-Agent": "vCreative-SSO-Client",
          },
        });
        if (emailRes.ok) {
          const emails = await emailRes.json();
          const primaryEmail = emails.find((e: any) => e.primary) || emails[0];
          emailAddress = primaryEmail?.email;
        }
      }

      finalUser = {
        fullName: profile.name || profile.login || "GitHub Client",
        username: profile.login || "github_user",
        email: emailAddress || `${profile.login}@github-user.local`,
        authMethod: "GitHub OAuth (Verified)",
        avatarUrl: profile.avatar_url || "",
      };
    }

    // 3. Register user profile to Atlas MongoDB (Direct real connection!)
    const db = await getMongoDb();
    if (db) {
      try {
        const usersCollection = db.collection("users");
        await usersCollection.updateOne(
          { email: finalUser.email.toLowerCase() },
          { 
            $set: {
              ...finalUser,
              updatedAt: new Date().toISOString(),
            },
            $setOnInsert: {
              createdAt: new Date().toISOString()
            }
          },
          { upsert: true }
        );
        console.log("Successfully registered user profile in Atlas MongoDB users collection!");
      } catch (dbErr) {
        console.error("Failed to insert user profile in Atlas MongoDB collection:", dbErr);
      }
    }

    // Render popup communications HTML
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Login Verification - vCreative</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              background-color: #070a13;
              color: #f1f5f9;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .card {
              max-width: 400px;
              width: 100%;
              text-align: center;
              padding: 40px 24px;
              border-radius: 20px;
              background-color: #0b101f;
              border: 1px solid #1e293b;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
            }
            .loader {
              border: 3px solid #131b2c;
              border-top: 3px solid #14b8a6;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
              margin: 0 auto 20px auto;
            }
            h3 {
              color: #14b8a6;
              margin: 0 0 10px 0;
              font-size: 20px;
            }
            p {
              color: #94a3b8;
              font-size: 14px;
              line-height: 1.5;
              margin: 0;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="loader"></div>
            <h3>SSO Verified Successfully</h3>
            <p>Aapka authentication request tasdeeq ho gaya hai. Workspace system update kiya ja raha hai...</p>
            <script>
              const userObj = ${JSON.stringify(finalUser)};
              
              if (window.opener) {
                // Return verified user object back to login tab view
                window.opener.postMessage({ type: 'oauth-success', user: userObj }, '*');
                setTimeout(() => {
                  window.close();
                }, 1000);
              } else {
                localStorage.setItem('currentUser', JSON.stringify(userObj));
                setTimeout(() => {
                  window.location.href = '/';
                }, 1000);
              }
            </script>
          </div>
        </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html" }
    });

  } catch (err: any) {
    console.error("SSO Callback Verification Failure:", err);
    return renderErrorHtml(`OAuth Verification Mismatch: ${err.message || err}`);
  }
}

function renderErrorHtml(message: string) {
  return new NextResponse(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>SSO Verification Failed - vCreative</title>
        <style>
          body {
            background-color: #070a13;
            color: #f1f5f9;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
          }
          .card {
            max-width: 400px;
            width: 100%;
            text-align: center;
            padding: 40px 24px;
            border-radius: 20px;
            background-color: #0b101f;
            border: 1px solid #7f1d1d;
          }
          h3 {
            color: #ef4444;
            margin: 0 0 10px 0;
          }
          p {
            color: #94a3b8;
            font-size: 14px;
          }
          .btn {
            display: inline-block;
            margin-top: 20px;
            background-color: #1e293b;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h3>Authentication Failure</h3>
          <p>${message}</p>
          <a href="#" onclick="window.close()" class="btn">Close Window</a>
        </div>
      </body>
    </html>
  `, {
    headers: { "Content-Type": "text/html" }
  });
}
