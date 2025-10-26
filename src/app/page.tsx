"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/campaigns"); // logged in → go campaigns
    } else {
      router.replace("/auth"); // not logged in → go login
    }
  }, [router]);

  return null; // nothing visible while redirecting
}
