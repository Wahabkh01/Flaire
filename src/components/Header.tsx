"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Search, Settings, User, LogOut, UserCircle, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/config";

interface HeaderProps {
  onMenuToggle?: () => void;
  isSidebarOpen?: boolean;
}

export default function Header({ onMenuToggle, isSidebarOpen }: HeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    avatar: null as string | null,
  });
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch user profile
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const profile = await response.json();
          setUserProfile(profile);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    fetchUserProfile();

    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth");
  };

  return (
    <>
      <header className="relative z-50 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Menu button and Logo (mobile) */}
          <div className="flex items-center space-x-3">
            {/* Mobile menu toggle */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-700 text-gray-300"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Mobile logo */}
            <div className="lg:hidden flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-white font-bold text-lg">EmailPro</span>
            </div>
          </div>

          {/* Center - Search (desktop) */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search campaigns, contacts..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-4 relative" ref={menuRef}>
            {/* Mobile search toggle */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-700 text-gray-300"
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-lg hover:bg-gray-700 text-gray-300">
              <Bell className="w-5 h-5" />
            </button>

            {/* Profile button */}
            <button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 text-gray-300"
            >
              {userProfile.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt="avatar"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full"
                />
              ) : (
                <UserCircle className="w-7 h-7 sm:w-8 sm:h-8" />
              )}
              <span className="hidden sm:inline text-sm lg:text-base">{userProfile.name}</span>
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 top-12 w-48 sm:w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-[9999]">
                <div className="p-3 sm:p-4 border-b border-gray-700">
                  <p className="text-sm font-medium text-white truncate">
                    {userProfile.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{userProfile.email}</p>
                </div>
                <ul className="py-2">
                  <li>
                    <button
                      onClick={() => {
                        router.push("/profile");
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center px-3 sm:px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    >
                      <User className="w-4 h-4 mr-2" /> Profile
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        router.push("/settings");
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center px-3 sm:px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    >
                      <Settings className="w-4 h-4 mr-2" /> Settings
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-3 sm:px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="md:hidden fixed inset-x-0 top-0 z-[60] bg-gray-800/95 backdrop-blur-sm border-b border-gray-700/50">
          <div className="p-4">
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search campaigns, contacts..."
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowMobileSearch(false)}
                className="p-2 rounded-lg hover:bg-gray-700 text-gray-300"
                aria-label="Close search"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}