// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { 
  ChartCard, 
  EmailPerformanceChart, 
  CampaignPerformanceChart, 
  AudienceGrowthChart, 
  DeviceBreakdownChart 
} from "@/components/ChartComponents";
import { apiService } from "@/services/ApiService";

interface DashboardStats {
  contactsCount: number;
  campaignsCount: number;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  campaigns?: Array<{
    _id: string;
    name: string;
    createdAt: string;
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    openRate: number;
    clickRate: number;
  }>;
}

interface ChartData {
  emailPerformance: Array<{
    date: string;
    sent: number;
    opened: number;
    clicked: number;
  }>;
  campaignPerformance: Array<{
    name: string;
    openRate: number;
    clickRate: number;
  }>;
  audienceGrowth: Array<{
    month: string;
    contacts: number;
    growth: number;
  }>;
  deviceBreakdown: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export default function DashboardPage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState<DashboardStats>({
    contactsCount: 0,
    campaignsCount: 0,
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0,
    campaigns: [],
  });
  
  const [chartData, setChartData] = useState<ChartData>({
    emailPerformance: [],
    campaignPerformance: [],
    audienceGrowth: [],
    deviceBreakdown: [],
  });
  
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);

  // Auth guard - redirect if not authenticated
  useEffect(() => {
    console.log("Dashboard: Auth loading:", authLoading, "Is authenticated:", isAuthenticated);
    
    if (!authLoading) {
      if (!isAuthenticated) {
        console.log("Dashboard: Not authenticated, redirecting to auth");
        router.replace("/auth");
        return;
      } else {
        console.log("Dashboard: User is authenticated, loading dashboard data");
      }
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch dashboard data only when authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchDashboardData();
    }
  }, [authLoading, isAuthenticated]);

  async function fetchDashboardData() {
    try {
      console.log("Dashboard: Starting to fetch data");
      setLoading(true);
      setChartLoading(true);
      
      // ✅ Fetch dashboard stats (already includes campaigns + analytics)
      const dashboardStats = await apiService.getDashboardStats();
      console.log("Dashboard: Received stats:", dashboardStats);
      setStats(dashboardStats);

      // ✅ Build charts directly from campaigns
      const emailPerformance = dashboardStats.campaigns?.map(c => ({
        date: new Date(c.createdAt).toLocaleDateString(),
        sent: c.totalSent,
        opened: c.totalOpened,
        clicked: c.totalClicked,
      })) || [];

      const campaignPerformance = dashboardStats.campaigns?.map(c => ({
        name: c.name,
        openRate: c.openRate,
        clickRate: c.clickRate,
      })) || [];

      // (You can leave these empty until you add backend support)
      const audienceGrowth: ChartData["audienceGrowth"] = [];
      const deviceBreakdown: ChartData["deviceBreakdown"] = [];

      setChartData({
        emailPerformance,
        campaignPerformance,
        audienceGrowth,
        deviceBreakdown,
      });
      
      console.log("Dashboard: Data loaded successfully");
    } catch (error) {
      console.error("Dashboard: Failed to load dashboard data:", error);
      // Don't redirect on API errors, just show error state
    } finally {
      setLoading(false);
      setChartLoading(false);
    }
  }

  // Show loading screen while auth is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  // Show nothing if not authenticated (will redirect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            Welcome back, {user?.name || user?.email}!
          </h1>
          <p className="text-white/70 text-lg">Monitor your email marketing performance and grow your audience</p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Contacts"
            value={loading ? "..." : stats.contactsCount.toLocaleString()}
            subtitle="People in your database"
            icon="👥"
            gradient="from-blue-600 to-purple-600"
            delay={100}
            loading={loading}
            trend={{ value: 12.5, isPositive: true }}
          />
          
          <StatCard
            title="Active Campaigns"
            value={loading ? "..." : stats.campaignsCount}
            subtitle="Email campaigns running"
            icon="📧"
            gradient="from-purple-600 to-pink-600"
            delay={200}
            loading={loading}
            trend={{ value: 8.2, isPositive: true }}
          />
          
          <StatCard
            title="Emails Sent"
            value={loading ? "..." : stats.totalSent.toLocaleString()}
            subtitle="Total emails delivered"
            icon="📤"
            gradient="from-green-600 to-emerald-600"
            delay={300}
            loading={loading}
            trend={{ value: 23.1, isPositive: true }}
          />
          
          <StatCard
            title="Open Rate"
            value={loading ? "..." : `${stats.openRate.toFixed(1)}%`}
            subtitle="Average email open rate"
            icon="👀"
            gradient="from-orange-600 to-red-600"
            delay={400}
            loading={loading}
            trend={{ value: 5.3, isPositive: true }}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Opens"
            value={loading ? "..." : stats.totalOpened.toLocaleString()}
            subtitle="Emails opened by recipients"
            icon="📖"
            gradient="from-indigo-600 to-blue-600"
            delay={500}
            loading={loading}
          />
          
          <StatCard
            title="Total Clicks"
            value={loading ? "..." : stats.totalClicked.toLocaleString()}
            subtitle="Links clicked in emails"
            icon="🔗"
            gradient="from-teal-600 to-green-600"
            delay={600}
            loading={loading}
          />
          
          <StatCard
            title="Click Rate"
            value={loading ? "..." : `${stats.clickRate.toFixed(1)}%`}
            subtitle="Average click-through rate"
            icon="📊"
            gradient="from-pink-600 to-purple-600"
            delay={700}
            loading={loading}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Email Performance (Last 7 Days)" loading={chartLoading}>
            <EmailPerformanceChart data={chartData.emailPerformance} />
          </ChartCard>
          
          <ChartCard title="Campaign Performance" loading={chartLoading}>
            <CampaignPerformanceChart data={chartData.campaignPerformance} />
          </ChartCard>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105">
              Create New Campaign
            </button>
            <button className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105">
              Import Contacts
            </button>
            <button className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105">
              View Analytics
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </DashboardLayout>
  );
}