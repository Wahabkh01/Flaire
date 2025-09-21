// src/app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth to load
    
    if (isAuthenticated) {
      console.log("DEBUG: User authenticated, redirecting to dashboard");
      router.replace("/dashboard");
    } else {
      console.log("DEBUG: User not authenticated, redirecting to auth");
      router.replace("/auth");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-white text-lg">Redirecting...</div>
    </div>
  );
}