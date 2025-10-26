"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import RichTextEditor from "@/components/RichTextEditor";
import { API_BASE_URL } from "@/config";
interface Recipient {
  _id?: string;
  email: string;
  body: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  opened?: boolean;
  clicked?: boolean;
  openedAt?: string;
  clickedAt?: string;
  clickedLinks?: string[];
  trackingMethod?: string;
}

interface Campaign {
  _id: string;
  subject: string;
  body: string;
  status: string;
  recipients: Recipient[];
  sentCount: number;
  openedCount?: number;
  clickedCount?: number;
  createdAt: string;
  scheduledAt?: string;
}

interface Analytics {
  totalRecipients: number;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  openRate: number;
  clickRate: number;
  linkStats: { [url: string]: number };
}

export default function CampaignDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'recipients'>('overview');

  // Editable fields
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  // Lists & contacts
  const [lists, setLists] = useState<string[]>([]);
  const [selectedList, setSelectedList] = useState("");
  const [contacts, setContacts] = useState<Recipient[]>([]);

  // Preview selection
  const [previewEmail, setPreviewEmail] = useState("");

  // Fetch campaign and analytics
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch campaign
        const campaignRes = await fetch(`${API_BASE_URL}/campaigns/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const campaignData = await campaignRes.json();
        setCampaign(campaignData);

        setSubject(campaignData.subject);
        setBody(campaignData.body);
        setRecipients(campaignData.recipients.map((r: Recipient) => r.email).join(", "));
        setScheduledAt(campaignData.scheduledAt ? campaignData.scheduledAt.slice(0, 16) : "");

        // Fetch analytics if campaign was sent
        if (['sent', 'sending', 'completed'].includes(campaignData.status)) {
          const analyticsRes = await fetch(`${API_BASE_URL}/campaigns/${id}/analytics`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (analyticsRes.ok) {
            const analyticsData = await analyticsRes.json();
            setAnalytics(analyticsData);
          }
        }
      } catch (err) {
        console.error("Failed to fetch campaign", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Fetch available lists
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/contacts/lists`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setLists(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLists();
  }, []);

  // Fetch contacts for selected list
  useEffect(() => {
    if (!selectedList) {
      setContacts([]);
      return;
    }
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_BASE_URL}/contacts/by-list/${selectedList}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setContacts(
          data.map((c: any) => ({
            email: c.email,
            firstName: c.firstName,
            lastName: c.lastName,
            body,
          }))
        );
        setPreviewEmail("");
      } catch (err) {
        console.error(err);
      }
    };
    fetchContacts();
  }, [selectedList, body]);

  const handleUpdate = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      let finalRecipients: Recipient[] = [];

      if (contacts.length > 0) {
        finalRecipients = contacts.map((c) => ({
          email: c.email,
          body,
        }));
      } else if (recipients.trim().length > 0) {
        finalRecipients = recipients
          .split(",")
          .map((email) => ({
            email: email.trim(),
            body,
          }))
          .filter((r) => r.email.length > 0);
      }

      const newStatus = scheduledAt ? "scheduled" : "draft";

      const res = await fetch(`${API_BASE_URL}/campaigns/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject,
          body,
          recipients: finalRecipients,
          scheduledAt: scheduledAt || null,
          status: newStatus,
        }),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text || "Failed to update campaign");

      const updated = JSON.parse(text);
      setCampaign(updated);
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert("Error updating campaign.");
    } finally {
      setSaving(false);
    }
  };

  const makeManualPreviewContacts = (): Recipient[] =>
    recipients
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean)
      .map((email) => ({ email, body }));

  const getDisplayName = (r?: Recipient) =>
    r?.firstName || r?.name || (r?.email ? r.email.split("@")[0] : "there");

  const personalize = (html: string, r?: Recipient) =>
    (html || "").replace(/\{Name\}/g, getDisplayName(r));

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-50">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">Campaign not found</h2>
          <p className="text-white/60 mb-6">The campaign you're looking for doesn't exist.</p>
          <Link
            href="/campaigns"
            className="inline-flex items-center bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Campaigns
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 animate-fade-in">
          <div>
            <div className="flex items-center mb-4">
              <Link
                href="/campaigns"
                className="inline-flex items-center text-white/80 hover:text-white transition-colors mr-6 group"
              >
                <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Campaigns
              </Link>
            </div>
            <div className="flex items-center mb-2">
              <h1 className="text-4xl font-bold text-white mr-4 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                {campaign.subject || 'Untitled Campaign'}
              </h1>
              <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(campaign.status)}`}>
                <span className="mr-2">{getStatusIcon(campaign.status)}</span>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </div>
            </div>
            <p className="text-white/70">Created on {new Date(campaign.createdAt).toLocaleDateString()}</p>
          </div>

          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center mt-4 lg:mt-0"
            >
              <span className="text-xl mr-2">✏️</span>
              Edit Campaign
            </button>
          )}
        </div>

        {editing ? (
          /* ================= EDITING MODE ================= */
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Left Column - Editing Form */}
            <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="text-3xl mr-3">⚙️</span>
                  Campaign Settings
                </h2>

                <div className="space-y-6">
                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Subject Line</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Enter email subject..."
                    />
                  </div>

                  {/* List Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Select Contact List</label>
                    <select
                      value={selectedList}
                      onChange={(e) => setSelectedList(e.target.value)}
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="" className="bg-slate-800">-- Select a list --</option>
                      {lists.map((list) => (
                        <option key={list} value={list} className="bg-slate-800">
                          {list}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Contacts Preview */}
                  {contacts.length > 0 && (
                    <div className="bg-white/10 rounded-xl border border-white/20 overflow-hidden">
                      <div className="bg-white/10 px-4 py-3">
                        <h3 className="text-white font-medium">Selected Contacts ({contacts.length})</h3>
                      </div>
                      <div className="max-h-40 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-white/5">
                            <tr>
                              <th className="px-4 py-2 text-left text-white/80">Email</th>
                              <th className="px-4 py-2 text-left text-white/80">Name</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {contacts.slice(0, 10).map((c, i) => (
                              <tr key={i} className="hover:bg-white/5">
                                <td className="px-4 py-2 text-white/90">{c.email}</td>
                                <td className="px-4 py-2 text-white/70">{c.firstName || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {contacts.length > 10 && (
                          <div className="px-4 py-2 text-center text-white/60 text-sm bg-white/5">
                            +{contacts.length - 10} more contacts...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Manual Recipients */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Or Enter Recipients Manually</label>
                    <textarea
                      value={recipients}
                      onChange={(e) => setRecipients(e.target.value)}
                      rows={3}
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                      placeholder="email1@example.com, email2@example.com..."
                    />
                    <p className="text-white/60 text-sm mt-1">Separate email addresses with commas</p>
                  </div>

                  {/* Schedule */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Schedule Delivery</label>
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                    <p className="text-white/60 text-sm mt-1">Leave empty to save as draft</p>
                  </div>

                  {/* Email Body */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Email Content</label>
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-1">
                      <RichTextEditor value={body} onChange={setBody} />
                    </div>
                    <div className="mt-2 flex items-center text-sm text-white/60">
                      <span className="mr-2">💡</span>
                      Use <code className="bg-white/20 px-1 rounded text-cyan-300">{'{Name}'}</code> to personalize with recipient's name
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleUpdate}
                      disabled={saving}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <span className="mr-2">💾</span>
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      disabled={saving}
                      className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                    >
                      <span className="mr-2">❌</span>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Live Preview */}
            <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 sticky top-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="text-3xl mr-3">👀</span>
                  Live Preview
                </h2>

                {(() => {
                  const previewCandidates = contacts.length > 0 ? contacts : makeManualPreviewContacts();

                  if (previewCandidates.length === 0) {
                    return (
                      <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                        <div className="text-center py-8">
                          <div className="text-4xl mb-4 opacity-50">📧</div>
                          <p className="text-white/60 mb-4">Add recipients to see preview</p>
                          <div className="text-left">
                            <p className="font-bold text-white mb-2">{subject || "No subject yet"}</p>
                            <div
                              className="prose prose-invert max-w-none text-white/80"
                              dangerouslySetInnerHTML={{ __html: body || "<p>No content yet</p>" }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const selectedRecipient = previewCandidates.find((r) => r.email === previewEmail) || previewCandidates[0];
                  const personalizedBody = personalize(body, selectedRecipient);

                  return (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Preview for recipient</label>
                        <select
                          className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          value={previewEmail || selectedRecipient.email}
                          onChange={(e) => setPreviewEmail(e.target.value)}
                        >
                          {previewCandidates.map((r, i) => (
                            <option key={i} value={r.email} className="bg-slate-800">
                              {r.email} {r.firstName && `(${r.firstName})`}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                        {/* Email Header */}
                        <div className="bg-gray-100 px-6 py-4 border-b">
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div>
                              <span className="font-medium">To:</span> {selectedRecipient.email}
                            </div>
                            <div className="text-xs">Preview Mode</div>
                          </div>
                          <div className="mt-2">
                            <span className="font-medium text-gray-800 text-lg">
                              {subject || "No subject yet"}
                            </span>
                          </div>
                        </div>

                        {/* Email Body */}
                        <div className="p-6 bg-white">
                          <div
                            className="prose max-w-none text-gray-800"
                            dangerouslySetInnerHTML={{ __html: personalizedBody || "<p>No content yet</p>" }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        ) : (
          /* ================= VIEW MODE WITH TABS ================= */
          <div className="space-y-8">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${activeTab === 'overview'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                    : 'bg-white/10 backdrop-blur-sm text-white/80 hover:bg-white/20'
                  }`}
              >
                📊 Overview
              </button>
              {(['sent', 'sending', 'completed'].includes(campaign.status)) && (
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${activeTab === 'analytics'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                      : 'bg-white/10 backdrop-blur-sm text-white/80 hover:bg-white/20'
                    }`}
                >
                  📈 Analytics
                </button>
              )}
              <button
                onClick={() => setActiveTab('recipients')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${activeTab === 'recipients'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                    : 'bg-white/10 backdrop-blur-sm text-white/80 hover:bg-white/20'
                  }`}
              >
                👥 Recipients ({campaign.recipients.length})
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Campaign Stats */}
                <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <span className="text-3xl mr-3">📊</span>
                      Campaign Stats
                    </h2>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-white/20">
                        <span className="text-white/70">Recipients</span>
                        <span className="text-white font-semibold text-lg">{campaign.recipients.length}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/20">
                        <span className="text-white/70">Delivered</span>
                        <span className="text-white font-semibold text-lg">{campaign.sentCount || 0}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/20">
                        <span className="text-white/70">Delivery Rate</span>
                        <span className="text-white font-semibold text-lg">
                          {campaign.recipients.length > 0 ?
                            `${((campaign.sentCount || 0) / campaign.recipients.length * 100).toFixed(1)}%` :
                            '0%'
                          }
                        </span>
                      </div>
                      {campaign.openedCount !== undefined && (
                        <div className="flex justify-between items-center py-3 border-b border-white/20">
                          <span className="text-white/70">Opens</span>
                          <span className="text-white font-semibold text-lg">{campaign.openedCount}</span>
                        </div>
                      )}
                      {campaign.clickedCount !== undefined && (
                        <div className="flex justify-between items-center py-3 border-b border-white/20">
                          <span className="text-white/70">Clicks</span>
                          <span className="text-white font-semibold text-lg">{campaign.clickedCount}</span>
                        </div>
                      )}
                      {campaign.scheduledAt && (
                        <div className="flex justify-between items-center py-3">
                          <span className="text-white/70">Scheduled</span>
                          <span className="text-white font-semibold text-sm">
                            {new Date(campaign.scheduledAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Email Preview */}
                <div className="xl:col-span-2 animate-slide-up" style={{ animationDelay: '400ms' }}>
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <span className="text-3xl mr-3">📧</span>
                      Email Preview
                    </h2>

                    {campaign.recipients.length > 0 && (
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-white mb-2">Preview for recipient</label>
                        <select
                          className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          value={previewEmail || campaign.recipients[0]?.email}
                          onChange={(e) => setPreviewEmail(e.target.value)}
                        >
                          {campaign.recipients.map((r, i) => (
                            <option key={i} value={r.email} className="bg-slate-800">
                              {r.email} {r.firstName && `(${r.firstName})`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                      {/* Email Header */}
                      <div className="bg-gray-100 px-6 py-4 border-b">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div>
                            <span className="font-medium">To:</span>{" "}
                            {previewEmail || campaign.recipients[0]?.email}
                          </div>
                          <div className="text-xs">Preview Mode</div>
                        </div>
                        <div className="mt-2">
                          <span className="font-medium text-gray-800 text-lg">
                            {campaign.subject}
                          </span>
                        </div>
                      </div>

                      {/* Email Body */}
                      <div className="p-6 bg-white">
                        <div
                          className="prose max-w-none text-gray-800"
                          dangerouslySetInnerHTML={{
                            __html: personalize(
                              campaign.body,
                              campaign.recipients.find((r) => r.email === previewEmail) ||
                              campaign.recipients[0]
                            ),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "analytics" && analytics && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-slide-up" style={{ animationDelay: "300ms" }}>
                {/* Summary Metrics */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <span className="text-3xl mr-3">📈</span>
                    Performance Metrics
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-white/20">
                      <span className="text-white/70">Recipients</span>
                      <span className="text-white font-semibold text-lg">{analytics.totalRecipients}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/20">
                      <span className="text-white/70">Sent</span>
                      <span className="text-white font-semibold text-lg">{analytics.totalSent}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/20">
                      <span className="text-white/70">Opens</span>
                      <span className="text-white font-semibold text-lg">{analytics.totalOpened}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/20">
                      <span className="text-white/70">Clicks</span>
                      <span className="text-white font-semibold text-lg">{analytics.totalClicked}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/20">
                      <span className="text-white/70">Open Rate</span>
                      <span className="text-cyan-300 font-semibold text-lg">
                        {(analytics.openRate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-white/70">Click Rate</span>
                      <span className="text-purple-300 font-semibold text-lg">
                        {(analytics.clickRate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Link Stats */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <span className="text-3xl mr-3">🔗</span>
                    Top Clicked Links
                  </h2>
                  {Object.keys(analytics.linkStats).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(analytics.linkStats)
                        .sort(([, a], [, b]) => b - a)
                        .map(([url, clicks], i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center text-sm bg-white/5 rounded-lg px-4 py-2"
                          >
                            <span className="text-white/80 truncate mr-2" title={url}>
                              {url.length > 50 ? url.substring(0, 50) + "..." : url}
                            </span>
                            <span className="text-purple-300 font-medium">{clicks} clicks</span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-white/60">No link clicks recorded yet.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "recipients" && (
              <div className="animate-slide-up" style={{ animationDelay: "300ms" }}>
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <span className="text-3xl mr-3">👥</span>
                    Recipients
                  </h2>
                  {campaign.recipients.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-white/10 text-sm">
                        <thead className="bg-white/5">
                          <tr>
                            <th className="px-4 py-2 text-left text-white/80">Email</th>
                            <th className="px-4 py-2 text-left text-white/80">Name</th>
                            <th className="px-4 py-2 text-center text-white/80">Opened</th>
                            <th className="px-4 py-2 text-center text-white/80">Clicked</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {campaign.recipients.map((r, i) => (
                            <tr key={i} className="hover:bg-white/5">
                              <td className="px-4 py-2 text-white/90">{r.email}</td>
                              <td className="px-4 py-2 text-white/70">
                                {r.firstName || r.lastName || "-"}
                              </td>
                              <td className="px-4 py-2 text-center">
                                {r.opened ? (
                                  <span className="text-green-400">✔️</span>
                                ) : (
                                  <span className="text-white/40">-</span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-center">
                                {r.clicked ? (
                                  <span className="text-purple-400">✔️</span>
                                ) : (
                                  <span className="text-white/40">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-white/60">No recipients added yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
