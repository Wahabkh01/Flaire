// src/services/ApiService.ts

import { API_BASE_URL } from "@/config";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText}`);
  }
  return res.json();
}

export const apiService = {
  // ✅ Dashboard Stats (with campaign details for graphs)
  async getDashboardStats() {
    const contactsRes = await fetch(`${API_BASE_URL}/contacts`, {
      headers: getAuthHeaders(),
    });
    const contactsData = await handleResponse(contactsRes);
    const contacts = Array.isArray(contactsData)
      ? contactsData
      : contactsData.contacts || [];

    const campaignsRes = await fetch(`${API_BASE_URL}/campaigns`, {
      headers: getAuthHeaders(),
    });
    const campaignsData = await handleResponse(campaignsRes);
    const campaigns = Array.isArray(campaignsData)
      ? campaignsData
      : campaignsData.campaigns || [];

    let totalSent = 0;
    let totalOpened = 0;
    let totalClicked = 0;
    let totalRecipients = 0;

    const campaignAnalytics: any[] = [];

    for (const c of campaigns) {
      try {
        const analyticsRes = await fetch(
          `${API_BASE_URL}/campaigns/${c._id}/analytics`,
          { headers: getAuthHeaders() }
        );
        const analytics = await handleResponse(analyticsRes);

        totalSent += analytics.totalSent || 0;
        totalOpened += analytics.totalOpened || 0;
        totalClicked += analytics.totalClicked || 0;
        totalRecipients += analytics.totalRecipients || 0;

        campaignAnalytics.push({
          id: c._id,
          name: c.subject || "Untitled Campaign",
          createdAt: c.createdAt,
          totalRecipients: analytics.totalRecipients || 0,
          totalSent: analytics.totalSent || 0,
          totalOpened: analytics.totalOpened || 0,
          totalClicked: analytics.totalClicked || 0,
          openRate: analytics.openRate || 0,
          clickRate: analytics.clickRate || 0,
          linkStats: analytics.linkStats || {},
        });
      } catch (err) {
        console.error(`Analytics fetch failed for campaign ${c._id}`, err);
      }
    }

    const deliveryRate =
      totalRecipients > 0 ? (totalSent / totalRecipients) * 100 : 0;
    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;

    return {
      contactsCount: contacts.length,
      campaignsCount: campaigns.length,
      totalSent,
      totalOpened,
      totalClicked,
      deliveryRate,
      openRate,
      clickRate,
      campaigns: campaignAnalytics,
    };
  },

  // ✅ Email Performance (time-series)
  async getEmailPerformanceData() {
    const res = await fetch(`${API_BASE_URL}/analytics/email-performance`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // ✅ Campaign Performance (aggregates by campaign type or list)
  async getCampaignPerformanceData() {
    const res = await fetch(`${API_BASE_URL}/analytics/campaign-performance`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // ✅ Audience Growth (new contacts over time)
  async getAudienceGrowthData() {
    const res = await fetch(`${API_BASE_URL}/analytics/audience-growth`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // ✅ Device Breakdown (open clicks by device)
  async getDeviceBreakdownData() {
    const res = await fetch(`${API_BASE_URL}/analytics/device-breakdown`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // ========================================
  // ✅ UPDATED: Email Settings with Auth
  // ========================================
  async getEmailSettings() {
    const res = await fetch(`${API_BASE_URL}/email-settings`, {
      headers: getAuthHeaders(), // ✅ Now includes auth token
    });
    return handleResponse(res);
  },

  async updateEmailSettings(settings: {
    smtpHost: string;
    smtpPort: number;
    secure: boolean;
    user: string;
    pass: string;
    senderName?: string;
    replyTo?: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/email-settings`, {
      method: "POST",
      headers: getAuthHeaders(), // ✅ Now includes auth token
      body: JSON.stringify(settings),
    });
    return handleResponse(res);
  },

  // ========================================
  // ✅ NEW: Test SMTP Connection
  // ========================================
  async testEmailConnection() {
    const res = await fetch(`${API_BASE_URL}/email-settings/test`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // ========================================
  // ✅ NEW: Delete Email Settings
  // ========================================
  async deleteEmailSettings() {
    const res = await fetch(`${API_BASE_URL}/email-settings`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // ✅ Test email (optional helper if you want to add "Send Test Email" button)
  async sendTestEmail(to: string) {
    const res = await fetch(`${API_BASE_URL}/test`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ to }),
    });
    return handleResponse(res);
  },
};