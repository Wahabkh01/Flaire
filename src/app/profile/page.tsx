"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/config";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        window.location.href = "/auth";
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setProfile(data);
        } else {
          alert(data.msg || "Failed to load profile");
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        alert("Network error.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch(`${API_BASE_URL}/auth/upload-avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setProfile({ ...profile, avatar: data.avatar });
        alert("✅ Avatar uploaded!");
      } else {
        alert(data.msg || "Failed to upload avatar");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // Update profile
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setUpdating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          avatar: profile.avatar,
          bio: profile.bio,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        alert("✅ Profile updated successfully");
        localStorage.setItem("user", JSON.stringify(data));
      } else {
        alert(data.msg || "Failed to update profile");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      alert("Network error.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="animate-spin w-10 h-10 border-4 border-white/30 border-t-white rounded-full"></div>
        <span className="ml-3">Loading profile...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Failed to load profile. Please log in again.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">👤 Manage Profile</h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition"
          >
            ← Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          {/* Avatar Preview */}
          {profile.avatar && (
            <div className="flex justify-center mb-4">
              <img
                src={profile.avatar}
                alt="Avatar"
                className="w-24 h-24 rounded-full border-4 border-purple-400 shadow-lg object-cover"
              />
            </div>
          )}

          {/* Upload New Avatar */}
          <div>
            <label className="block text-white/90 font-semibold mb-1">Upload Avatar</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={uploading}
              className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
            />
            {uploading && <p className="text-sm text-gray-400 mt-1">Uploading...</p>}
          </div>

          {/* Name */}
          <div>
            <label className="block text-white/90 font-semibold mb-1">Full Name</label>
            <input
              type="text"
              value={profile.name || ""}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all"
              required
            />
          </div>

          {/* Email (readonly) */}
          <div>
            <label className="block text-white/90 font-semibold mb-1">Email</label>
            <input
              type="email"
              value={profile.email || ""}
              disabled
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-white/90 font-semibold mb-1">Bio</label>
            <textarea
              placeholder="Tell us about yourself..."
              value={profile.bio || ""}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all h-24 resize-none"
            ></textarea>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={updating}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {updating ? "Updating..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
