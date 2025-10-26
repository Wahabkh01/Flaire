"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import CampaignsTable from "@/components/CampaignsTable";
import { API_BASE_URL } from "@/config";
interface Campaign {
  _id: string;
  subject: string;
  body: string;
  status: string;
  recipients: Array<{
    email: string;
    opened?: boolean;
    clicked?: boolean;
    firstName?: string;
    lastName?: string;
  }>;
  sentCount: number;
  openedCount?: number;
  clickedCount?: number;
  createdAt: string;
}

interface CampaignStats {
  total: number;
  draft: number;
  sent: number;
  scheduled: number;
  sending: number;
}

export default function CampaignsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{ send?: string; delete?: string }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const getAuthHeaders = (json = false) => {
    const token = localStorage.getItem("token") || "";
    const headers: any = {
      Authorization: `Bearer ${token}`,
      "x-auth-token": token,
    };
    if (json) headers["Content-Type"] = "application/json";
    return headers;
  };

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/campaigns`, {
        headers: getAuthHeaders(false),
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setCampaigns(data);
      } else {
        console.error("Expected array, got:", data);
        setCampaigns([]);
      }
    } catch (err) {
      console.error("Failed to fetch campaigns", err);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleSend = async (id: string) => {
    try {
      setActionLoading((s) => ({ ...s, send: id }));
      const res = await fetch(`${API_BASE_URL}/campaigns/${id}/send`, {
        method: "POST",
        headers: getAuthHeaders(false),
      });
      if (!res.ok) {
        const txt = await res.text();
        console.error("Send error:", txt);
        alert("Failed to send campaign.");
      } else {
        // Show success message
        alert("Campaign sent successfully!");
      }
      await fetchCampaigns(); // refresh
    } catch (err) {
      console.error("Send failed:", err);
      alert("Failed to send campaign.");
    } finally {
      setActionLoading((s) => ({ ...s, send: undefined }));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      setActionLoading((s) => ({ ...s, delete: id }));
      const res = await fetch(`${API_BASE_URL}/campaigns/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(false),
      });
      if (!res.ok) {
        const txt = await res.text();
        console.error("Delete error:", txt);
        alert("Failed to delete campaign.");
      } else {
        alert("Campaign deleted successfully!");
      }
      await fetchCampaigns();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete campaign.");
    } finally {
      setActionLoading((s) => ({ ...s, delete: undefined }));
    }
  };

  // Calculate campaign statistics
  const campaignStats: CampaignStats = campaigns.reduce(
    (stats, campaign) => {
      stats.total++;
      switch (campaign.status) {
        case 'draft':
          stats.draft++;
          break;
        case 'sent':
          stats.sent++;
          break;
        case 'scheduled':
          stats.scheduled++;
          break;
        case 'sending':
          stats.sending++;
          break;
      }
      return stats;
    },
    { total: 0, draft: 0, sent: 0, scheduled: 0, sending: 0 }
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col lg:ml-64 transition-all">
        {/* Header */}
        <Header
          isSidebarOpen={isSidebarOpen}
          onMenuToggle={() => setIsSidebarOpen((prev) => !prev)}
        />
        
        <main className="flex-1 p-6 relative">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 animate-fade-in">
              <div>
                <div className="flex items-center mb-4">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center text-white/80 hover:text-white transition-colors mr-6 group"
                  >
                    <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                  </Link>
                </div>
                <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                  Email Campaigns
                </h1>
                <p className="text-white/70">Create, manage, and track your email marketing campaigns</p>
              </div>
              
              <Link
                href="/campaigns/new"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center mt-4 lg:mt-0"
              >
                <span className="text-xl mr-2">➕</span>
                New Campaign
              </Link>
            </div>

            {/* Campaign Statistics */}
            <div className="mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
                  <div className="text-3xl font-bold text-white mb-1">{campaignStats.total}</div>
                  <div className="text-white/60 text-sm">Total</div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
                  <div className="text-3xl font-bold text-yellow-300 mb-1">{campaignStats.draft}</div>
                  <div className="text-white/60 text-sm">Draft</div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
                  <div className="text-3xl font-bold text-blue-300 mb-1">{campaignStats.scheduled}</div>
                  <div className="text-white/60 text-sm">Scheduled</div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
                  <div className="text-3xl font-bold text-purple-300 mb-1">{campaignStats.sending}</div>
                  <div className="text-white/60 text-sm">Sending</div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
                  <div className="text-3xl font-bold text-green-300 mb-1">{campaignStats.sent}</div>
                  <div className="text-white/60 text-sm">Sent</div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="mb-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Search campaigns..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="block w-full px-4 py-3 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="all" className="bg-slate-800">All Statuses</option>
                      <option value="draft" className="bg-slate-800">Draft</option>
                      <option value="scheduled" className="bg-slate-800">Scheduled</option>
                      <option value="sending" className="bg-slate-800">Sending</option>
                      <option value="sent" className="bg-slate-800">Sent</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Campaigns Table */}
            <CampaignsTable
              campaigns={campaigns}
              onSend={handleSend}
              onDelete={handleDelete}
              actionLoading={actionLoading}
              searchTerm={searchTerm}
              statusFilter={statusFilter}
            />
          </div>

                    <style jsx global>{`
            @keyframes fade-in {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes slide-up {
              from { opacity: 0; transform: translateY(30px); }
              to { opacity: 1; transform: translateY(0); }
            }
            
            .animate-fade-in {
              animation: fade-in 0.8s ease-out forwards;
              opacity: 0;
            }
            
            .animate-slide-up {
              animation: slide-up 0.8s ease-out forwards;
              opacity: 0;
            }
            
            /* Custom scrollbar for the table */
            .campaigns-table {
              scrollbar-width: thin;
              scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
            }
            
            .campaigns-table::-webkit-scrollbar {
              height: 8px;
              width: 8px;
            }
            
            .campaigns-table::-webkit-scrollbar-track {
              background: transparent;
            }
            
            .campaigns-table::-webkit-scrollbar-thumb {
              background-color: rgba(255, 255, 255, 0.3);
              border-radius: 4px;
            }
            
            .campaigns-table::-webkit-scrollbar-thumb:hover {
              background-color: rgba(255, 255, 255, 0.5);
            }
          `}</style>
        </main>
      </div>
    </div>
  );
}