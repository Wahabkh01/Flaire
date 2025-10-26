"use client";

import { ReactNode, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleMenuToggle = () => {
      // Only toggle on mobile
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(prev => !prev);
      }
    };
    

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="relative min-h-screen">
        {/* Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={handleSidebarClose}
        />
        
        {/* Main content area */}
        <div className="lg:ml-64 min-h-screen">
          {/* Header */}
          <Header 
            onMenuToggle={handleMenuToggle}
            isSidebarOpen={isSidebarOpen}
          />
          
          {/* Page content */}
          <main className="p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}