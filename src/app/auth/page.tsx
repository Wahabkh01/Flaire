"use client";

import { useState } from "react";
import { API_BASE_URL } from "@/config";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");   // ✅ new field
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";
      const body = isLogin
        ? { email, password }
        : { email, password, name }; // ✅ send name when signing up

        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user)); // ✅ save user info too
        window.location.href = "/dashboard";
      } else {
        alert(data.msg || "Something went wrong");
      }
    } catch (error) {
      console.error("Auth error:", error);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300"
                required
              />
            </div>

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
                onClick={() => setIsLogin(!isLogin)}
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
