import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  let redirectUri = searchParams.get("redirect_uri");

  const githubClientId = process.env.GITHUB_CLIENT_ID || (req.headers.get("x-github-client-id") || "");

  if (!githubClientId) {
    return NextResponse.json(
      { error: "GitHub OAuth credentials not configured in environment variables." },
      { status: 400 }
    );
  }

  // If redirect_uri not provided, use current origin
  if (!redirectUri) {
    const origin = req.headers.get("origin") || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    redirectUri = `${origin}/api/auth/callback`;
  }

  const queryParams = new URLSearchParams({
    client_id: githubClientId,
    redirect_uri: redirectUri,
    scope: "read:user user:email",
  });

  const authUrl = `https://github.com/login/oauth/authorize?${queryParams.toString()}`;
  return NextResponse.json({ url: authUrl });
}
