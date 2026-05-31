"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Shield, ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function SignupPage() {
  const router = useRouter();

  // Form states
  const [fullName, setFullName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !username || !email || !password) {
      setError("براہ کرم تمام رجسٹریشن معلومات درج کریں");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          username: username.trim().toLowerCase().replace(/\s+/g, ""),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "رجسٹریشن میں خرابی ہوئی");
        setLoading(false);
        return;
      }

      // Save user to localStorage and redirect
      localStorage.setItem("currentUser", JSON.stringify(data.user));

      // Propagate credential sync
      const event = new Event("credentialsUpdated");
      window.dispatchEvent(event);

      setLoading(false);
      router.push("/");
    } catch (err) {
      console.log("[v0] Signup error:", err);
      setError("براہ کرم دوبارہ کوشش کریں");
      setLoading(false);
    }
  };

  const handleOAuthSignup = (provider: "google" | "github") => {
    const redirectUri = `${window.location.origin}/api/auth/callback`;
    const state = provider;
    
    // Open OAuth window
    const oauthWindow = window.open(
      `/api/auth/${provider}?redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`,
      `${provider}-signup`,
      "width=500,height=600"
    );

    // Listen for message from OAuth callback
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === "oauth-success") {
        localStorage.setItem("currentUser", JSON.stringify(event.data.user));
        
        // Propagate credential sync
        const credEvent = new Event("credentialsUpdated");
        window.dispatchEvent(credEvent);
        
        if (oauthWindow) oauthWindow.close();
        router.push("/");
      } else if (event.data.type === "oauth-error") {
        setError(event.data.message || `${provider} سے سائن اپ میں خرابی`);
        if (oauthWindow) oauthWindow.close();
      }
    };

    window.addEventListener("message", handleMessage);
    
    // Cleanup listener
    return () => window.removeEventListener("message", handleMessage);
  };

  return (
    <div className="min-h-full h-screen bg-[#05060f] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-slate-100" id="signup-root-view">
      
      {/* Background radial spotlights with drift */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            x: [0, -30, 30, 0],
            y: [0, 40, -40, 0],
            scale: [1, 1.2, 0.95, 1]
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-amber-500/10 via-rose-500/5 to-transparent rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, 40, -40, 0],
            y: [0, -30, 30, 0],
            scale: [1, 0.9, 1.15, 1]
          }}
          transition={{
            duration: 26,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-transparent rounded-full blur-[120px]"
        />
      </div>

      {/* Navigation link to Home page */}
      <div className="absolute top-6 left-6 z-10">
        <button 
          onClick={() => router.push("/")}
          className="flex items-center space-x-2 text-slate-400 hover:text-white text-xs font-semibold bg-slate-900/60 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg cursor-pointer transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Landing</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 via-rose-400 to-violet-500 flex items-center justify-center text-slate-950 font-black text-xl tracking-tighter"
          >
            vC
          </motion.div>
        </div>
        <h2 className="mt-5 text-center text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-violet-400 font-sans">
          VVCV Creative
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400">
          Create an account to build secure design workflows
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        {/* Sleek card featuring a rich glassmorphism border and 3D shadow depth */}
        <div className="bg-[#0a0d1b]/85 border border-white/[0.05] shadow-2xl rounded-3xl p-6 sm:p-8 space-y-5">
          
          {error && (
            <div className="bg-rose-950/20 border border-rose-900/50 text-rose-400 text-xs px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Integration social login buttons as requested */}
          <div className="grid grid-cols-2 gap-3" id="social-sign-ups">
            <button
              type="button"
              onClick={() => handleOAuthSignup("google")}
              className="flex items-center justify-center gap-2 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 text-white font-semibold py-2 px-3 rounded-xl cursor-pointer text-xs transition-colors hover:border-amber-500/30"
              title="Google کے ساتھ سائن اپ کریں"
            >
              <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.706 0 3.268.613 4.49 1.642l2.384-2.384C17.203 1.646 14.862 1 12.24 1 6.584 1 2 5.584 2 11.24s4.584 10.24 10.24 10.24c5.795 0 10.254-4.074 10.254-10.24 0-.69-.08-1.355-.22-1.955H12.24z"/>
              </svg>
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuthSignup("github")}
              className="flex items-center justify-center gap-2 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 text-white font-semibold py-2 px-3 rounded-xl cursor-pointer text-xs transition-colors hover:border-violet-500/30"
              title="GitHub کے ساتھ سائن اپ کریں"
            >
              <svg className="w-4 h-4 text-violet-400 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.024A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.293 2.747-1.024 2.747-1.024.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          <div className="relative flex py-1.5 items-center">
            <div className="flex-grow border-t border-slate-900"></div>
            <span className="flex-shrink mx-3 text-[10px] font-mono text-slate-600 uppercase tracking-wider">or register custom info</span>
            <div className="flex-grow border-t border-slate-900"></div>
          </div>

          <form className="space-y-3.5" onSubmit={handleSignup}>
            
            <div className="space-y-1">
              <label htmlFor="fullName" className="block text-xs font-semibold text-slate-400">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Lariab Ali"
                className="w-full bg-[#04060d] border border-slate-900 hover:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/20"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="username" className="block text-xs font-semibold text-amber-400 font-mono">
                @username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="lariab"
                className="w-full bg-[#04060d] border border-slate-900 hover:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/20"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="block text-xs font-semibold text-slate-400">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="lariabali13@gmail.com"
                className="w-full bg-[#04060d] border border-slate-900 hover:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/20"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-400">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#04060d] border border-slate-900 hover:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-400/40 focus:ring-1 focus:ring-violet-400/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-400 via-rose-400 to-violet-500 text-slate-950 font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition-transform cursor-pointer mt-3 shadow-lg shadow-amber-500/5"
            >
              {loading ? (
                <span>Spawning secure sandbox workspace...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

          </form>

          {/* Demo credentials info */}
          <div className="border-t border-slate-900/60 pt-3 text-center">
            <p className="text-[10px] font-mono text-slate-500">
              نیا اکاؤنٹ بنانے کے لیے تمام فیلڈز بھریں
            </p>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-[10px] text-slate-500 hover:text-slate-350 transition-colors"
            >
              Already have a profile? Sign In here
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
