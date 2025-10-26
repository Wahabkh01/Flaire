import { API_BASE_URL } from "@/config";

// Helper functions for personalization & tracking


export function personalizeBody(template: string, contact: any) {
    return template
      .replaceAll("{FirstName}", contact.firstName || "")
      .replaceAll("{LastName}", contact.lastName || "")
      .replaceAll("{Email}", contact.email || "");
  }
  
  export function injectTrackingPixel(
    html: string,
    campaignId: string,
    email: string
  ) {
    return (
      html +
      `<img src="${API_BASE_URL}/track/open?campaignId=${campaignId}&email=${encodeURIComponent(
        email
      )}" width="1" height="1" style="display:none;" />`
    );
  }
  
  export function injectTrackingLinks(
    html: string,
    campaignId: string,
    email: string
  ) {
    return html.replace(
      /href="(.*?)"/g,
      `href="${API_BASE_URL}/track/click?campaignId=${campaignId}&email=${encodeURIComponent(
        email
      )}&url=$1"`
    );
  }
  