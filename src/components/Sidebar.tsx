"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Mail,
  BarChart3,
  Settings,
  FileText,
  Target,
  Calendar,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/contacts", label: "Contacts", icon: Users },
  {
    href: "#",
    label: "Campaigns",
    icon: Mail,
    subItems: [
      { href: "/campaigns", label: "All Campaigns" },
      { href: "/campaigns/new", label: "Create Campaign" },
      { href: "/campaigns/templates", label: "Templates" },
    ],
  },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/lists", label: "Lists", icon: FileText },
  { href: "/dashboard/automation", label: "Automation", icon: Target },
  { href: "/dashboard/scheduler", label: "Scheduler", icon: Calendar },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close sidebar on route change (only mobile)
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      onClose?.();
    }
  }, [pathname]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const handleLinkClick = () => {
    if (isMobile) {
      onClose?.();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed left-0 top-0 h-full bg-gray-900/95 backdrop-blur-sm border-r border-gray-700/50 z-40 
          transition-transform duration-300 ease-in-out
          ${isMobile ? "w-80" : "w-64"}
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:w-64
        `}
      >
        <div className="h-full overflow-y-auto">
          <div className="p-4 sm:p-6">
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-6 sm:mb-8">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">EmailPro</h2>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <div key={item.label}>
                  {item.subItems ? (
                    <div>
                      <button
                        onClick={() => toggleExpand(item.label)}
                        className={`w-full flex items-center justify-between px-3 sm:px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                          expandedItems.includes(item.label) ||
                          pathname.includes("campaigns")
                            ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                            : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {expandedItems.includes(item.label) ? (
                          <ChevronDown className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 flex-shrink-0" />
                        )}
                      </button>
                      {expandedItems.includes(item.label) && (
                        <div className="mt-2 ml-4 sm:ml-6 space-y-1">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={handleLinkClick}
                              className={`block px-3 sm:px-4 py-2 text-sm rounded-lg transition-colors ${
                                isActive(subItem.href)
                                  ? "bg-purple-600/20 text-purple-300"
                                  : "text-gray-400 hover:bg-gray-800/30 hover:text-white"
                              }`}
                            >
                              <span className="truncate">{subItem.label}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`flex items-center space-x-3 px-3 sm:px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive(item.href)
                          ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                          : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                      }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
