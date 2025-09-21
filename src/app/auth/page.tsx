// src/app/auth/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const { isAuthenticated, login, loading: authLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      console.log("DEBUG: User already authenticated, redirecting to dashboard");
      router.replace("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";
      const body = isLogin ? { email, password } : { email, password, name };

      const res = await fetch(`https://emailmarketingbackend.onrender.com${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        console.log("DEBUG: Login success, using auth context");
        setMessage("✅ Login successful! Redirecting...");
        
        // Use the auth context login function
        login(data.token, data.user);
        
      } else {
        console.log("DEBUG: Login failed", data);
        setMessage(data.msg || "❌ Invalid credentials, please try again.");
      }      
    } catch (error) {
      console.error("Auth error:", error);
      setMessage("⚠️ Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading if auth context is still loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="relative overflow-hidden bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          
          {/* Header */}
          <div className="relative z-10 text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isLogin ? "Welcome Back" : "Get Started"}
            </h1>
            <p className="text-white/70">
              {isLogin
                ? "Sign in to your email marketing account"
                : "Create your email marketing account"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            
            {/* Name input (only signup) */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-white/90 font-semibold text-sm">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300"
                  required
                />
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-white/90 font-semibold text-sm">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300"
                required
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-white/90 font-semibold text-sm">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-white/70 hover:text-white focus:outline-none"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" 
                        viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" 
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" 
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" 
                        viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" 
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.955 9.955 0 012.225-3.592M9.88 9.88a3 3 0 104.24 4.24" />
                      <path strokeLinecap="round" strokeLinejoin="round" 
                        d="M6.1 6.1l11.8 11.8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Feedback Message */}
            {message && (
              <p className="text-center text-sm font-medium text-white/90 bg-white/10 rounded-lg p-2">
                {message}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
            </button>

            {/* Toggle Auth Mode */}
            <div className="text-center pt-4 border-t border-white/20">
              <p className="text-white/70 mb-3">
                {isLogin ? "New to our platform?" : "Already have an account?"}
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setMessage(null);
                }}
                className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
              >
                {isLogin ? "Create Account" : "Sign In Instead"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}