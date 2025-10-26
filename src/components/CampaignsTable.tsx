import { useState, useEffect } from "react";
import Link from "next/link";
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

interface CampaignAnalytics {
  totalRecipients: number;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  openRate: number;
  clickRate: number;
  linkStats: Record<string, number>;
}

interface CampaignsTableProps {
  campaigns: Campaign[];
  onSend: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  actionLoading: { send?: string; delete?: string };
  searchTerm: string;
  statusFilter: string;
}

export default function CampaignsTable({
  campaigns,
  onSend,
  onDelete,
  actionLoading,
  searchTerm,
  statusFilter
}: CampaignsTableProps) {
  const [analytics, setAnalytics] = useState<Record<string, CampaignAnalytics>>({});
  const [loadingAnalytics, setLoadingAnalytics] = useState<Record<string, boolean>>({});

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || "";
    return {
      Authorization: `Bearer ${token}`,
      "x-auth-token": token,
    };
  };

  const fetchCampaignAnalytics = async (campaignId: string) => {
    if (analytics[campaignId] || loadingAnalytics[campaignId]) return;
    
    try {
      setLoadingAnalytics(prev => ({ ...prev, [campaignId]: true }));
      const res = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/analytics`, {
        headers: getAuthHeaders(),
      });
      
      if (res.ok) {
        const data = await res.json();
        setAnalytics(prev => ({ ...prev, [campaignId]: data }));
      }
    } catch (err) {
      console.error("Failed to fetch analytics for campaign:", campaignId, err);
    } finally {
      setLoadingAnalytics(prev => ({ ...prev, [campaignId]: false }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return '📝';
      case 'scheduled': return '⏰';
      case 'sent': return '✅';
      case 'sending': return '🚀';
      default: return '📧';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'scheduled': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'sent': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'sending': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100) / 100}%`;
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Fetch analytics for sent campaigns when they first appear
  useEffect(() => {
    filteredCampaigns.forEach(campaign => {
      if (campaign.status === 'sent' && !analytics[campaign._id]) {
        fetchCampaignAnalytics(campaign._id);
      }
    });
  }, [filteredCampaigns]);

  if (filteredCampaigns.length === 0) {
    return (
      <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
          <div className="text-6xl mb-6 opacity-50">📧</div>
          <h3 className="text-2xl font-bold text-white mb-4">
            {campaigns.length === 0 ? 'No campaigns yet' : 'No campaigns found'}
          </h3>
          <p className="text-white/60 mb-8">
            {campaigns.length === 0 
              ? 'Create your first email campaign to get started'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          {campaigns.length === 0 && (
            <Link
              href="/campaigns/new"
              className="inline-flex items-center bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <span className="text-xl mr-2">🚀</span>
              Create Your First Campaign
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
        {/* Table Header */}
        <div className="bg-white/5 px-6 py-4">
          <div className="grid grid-cols-16 gap-4 items-center text-sm font-semibold text-white/80 uppercase tracking-wider">
            <div className="col-span-4">Campaign</div>
            <div className="col-span-2 text-center">Recipients</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-2 text-center">Sent</div>
            <div className="col-span-2 text-center">Opens</div>
            <div className="col-span-2 text-center">Clicks</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-white/10">
          {filteredCampaigns.map((campaign, index) => {
            const campaignAnalytics = analytics[campaign._id];
            const isLoadingAnalytics = loadingAnalytics[campaign._id];
            
            return (
              <div
                key={campaign._id}
                className="px-6 py-4 hover:bg-white/5 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 100 + 500}ms` }}
              >
                <div className="grid grid-cols-16 gap-4 items-center">
                  {/* Campaign Info */}
                  <div className="col-span-4">
                    <Link
                      href={`/campaigns/${campaign._id}`}
                      className="group"
                    >
                      <h3 className="text-white font-medium group-hover:text-cyan-300 transition-colors mb-1 truncate">
                        {campaign.subject}
                      </h3>
                      <p className="text-white/60 text-sm">
                        Created {new Date(campaign.createdAt).toLocaleDateString()}
                      </p>
                    </Link>
                  </div>

                  {/* Recipients */}
                  <div className="col-span-2 text-center">
                    <div className="text-white font-semibold">
                      {campaign.recipients?.length || 0}
                    </div>
                    <div className="text-white/60 text-xs">contacts</div>
                  </div>

                  {/* Status */}
                  <div className="col-span-2 text-center">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full border text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      <span className="mr-1">{getStatusIcon(campaign.status)}</span>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </div>
                  </div>

                  {/* Sent Count */}
                  <div className="col-span-2 text-center">
                    <div className="text-white font-semibold">
                      {campaign.sentCount || 0}
                    </div>
                    <div className="text-white/60 text-xs">delivered</div>
                  </div>

                  {/* Opens */}
<div className="col-span-2 text-center">
  {campaign.status === 'sent' ? (
    isLoadingAnalytics ? (
      <div className="text-white/60 text-sm">Loading...</div>
    ) : campaignAnalytics ? (
      <div>
        <div className="text-white font-semibold">
          {campaignAnalytics.totalOpened}
        </div>
        <div className="text-cyan-300 text-xs">
          Raw: {formatPercentage(campaignAnalytics.openRate)}
        </div>
        <div className="text-green-300 text-xs">
          Adj: {formatPercentage(campaignAnalytics.adjustedOpenRate)}
        </div>
      </div>
    ) : (
      <div className="text-white/60 text-sm">-</div>
    )
  ) : (
    <div className="text-white/40 text-sm">-</div>
  )}
</div>


                  {/* Clicks */}
                  <div className="col-span-2 text-center">
                    {campaign.status === 'sent' ? (
                      isLoadingAnalytics ? (
                        <div className="text-white/60 text-sm">Loading...</div>
                      ) : campaignAnalytics ? (
                        <div>
                          <div className="text-white font-semibold">
                            {campaignAnalytics.totalClicked}
                          </div>
                          <div className="text-purple-300 text-xs">
                            {formatPercentage(campaignAnalytics.clickRate)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-white/60 text-sm">-</div>
                      )
                    ) : (
                      <div className="text-white/40 text-sm">-</div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-2">
                    <div className="flex items-center justify-center space-x-1">
                      {(campaign.status === "draft" || campaign.status === "scheduled") && (
                        <button
                          onClick={() => onSend(campaign._id)}
                          disabled={actionLoading.send === campaign._id}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-2 py-1 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-xs font-medium"
                          title="Send Campaign"
                        >
                          {actionLoading.send === campaign._id ? "..." : "Send"}
                        </button>
                      )}

                      <Link
                        href={`/campaigns/${campaign._id}`}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-2 py-1 rounded-lg transition-all duration-300 transform hover:scale-105 text-xs font-medium"
                        title="Edit Campaign"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => onDelete(campaign._id)}
                        disabled={actionLoading.delete === campaign._id}
                        className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-2 py-1 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-xs font-medium"
                        title="Delete Campaign"
                      >
                        {actionLoading.delete === campaign._id ? "..." : "Del"}
                      </button>

                      {campaign.status === 'sent' && (
                        <Link
                          href={`/campaigns/${campaign._id}/analytics`}
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-2 py-1 rounded-lg transition-all duration-300 transform hover:scale-105 text-xs font-medium"
                          title="View Analytics"
                        >
                          📊
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Analytics Row for Sent Campaigns */}
{campaign.status === 'sent' && campaignAnalytics && (
  <div className="mt-3 pt-3 border-t border-white/10">
    <div className="grid grid-cols-4 gap-4 text-sm">
      <div className="bg-white/5 rounded-lg p-3 text-center">
        <div className="text-white/60 text-xs mb-1">Delivery Rate</div>
        <div className="text-white font-semibold">
          {formatPercentage((campaignAnalytics.totalSent / campaignAnalytics.totalRecipients) * 100)}
        </div>
      </div>
      <div className="bg-white/5 rounded-lg p-3 text-center">
        <div className="text-white/60 text-xs mb-1">Open Rate</div>
        <div className="text-cyan-300 font-semibold">
          {formatPercentage(campaignAnalytics.openRate)}
        </div>
      </div>
      <div className="bg-white/5 rounded-lg p-3 text-center">
        <div className="text-white/60 text-xs mb-1">Click Rate</div>
        <div className="text-purple-300 font-semibold">
          {formatPercentage(campaignAnalytics.clickRate)}
        </div>
      </div>
      <div className="bg-white/5 rounded-lg p-3 text-center">
        <div className="text-white/60 text-xs mb-1">CTR</div>
        <div className="text-green-300 font-semibold">
          {campaignAnalytics.totalOpened > 0 
            ? formatPercentage((campaignAnalytics.totalClicked / campaignAnalytics.totalOpened) * 100)
            : "0%"
          }
        </div>
      </div>
    </div>
    
    {/* Link Performance */}
    {campaignAnalytics?.linkStats && Object.keys(campaignAnalytics.linkStats || {}).length > 0 && (
      <div className="mt-3">
        <div className="text-white/60 text-xs mb-2">Top Clicked Links:</div>
        <div className="space-y-1">
          {Object.entries(campaignAnalytics.linkStats || {})
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([url, clicks], i) => (
              <div key={i} className="flex justify-between items-center text-xs bg-white/5 rounded px-2 py-1">
                <span className="text-white/80 truncate mr-2" title={url}>
                  {url.length > 40 ? url.substring(0, 40) + '...' : url}
                </span>
                <span className="text-purple-300 font-medium">{clicks} clicks</span>
              </div>
            ))
          }
        </div>
      </div>
    )}
  </div>
)}

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}