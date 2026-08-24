/**
 * Lennox ChinaMall — Branded Email Template Engine
 * Generates responsive, executive HTML emails with Lennox China Mall branding
 * (#00143D Navy, #FF1028 China Red, #F59E0B Gold) and dynamic variable replacement.
 */

export interface EmailRenderOptions {
  customerName?: string;
  orderNumber?: string;
  orderId?: string;
  paymentId?: string;
  amount?: string | number;
  currency?: string;
  productTitle?: string;
  productSummary?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  courier?: string;
  actionLabel?: string;
  actionUrl?: string;
  supportTicketId?: string;
  ticketSubject?: string;
  replyExcerpt?: string;
  securityEvent?: string;
  ipAddress?: string;
  location?: string;
  promoTitle?: string;
  promoHeadline?: string;
  promoBody?: string;
  returnStatus?: string;
  decisionNote?: string;
  trackingToken?: string;
  customVariables?: Record<string, string | number>;
}

export interface RenderedEmail {
  subject: string;
  headline: string;
  html: string;
  text: string;
}

/**
 * Replace all {{variable_name}} tokens with corresponding values
 */
export function interpolateVariables(template: string, vars: Record<string, unknown>): string {
  if (!template) return "";
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    const val = vars[key];
    if (val !== undefined && val !== null) {
      return String(val);
    }
    return `{{${key}}}`;
  });
}

/**
 * Generate full responsive branded HTML shell for Lennox China Mall
 */
export function wrapInLennoxBrandShell(options: {
  headline: string;
  contentHtml: string;
  actionLabel?: string;
  actionUrl?: string;
  categoryBadge?: string;
  trackingToken?: string;
  appUrl?: string;
}): string {
  const {
    headline,
    contentHtml,
    actionLabel,
    actionUrl,
    categoryBadge = "OFFICIAL COMMUNICATION",
    trackingToken,
    appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lennoxchinamall.com",
  } = options;

  const trackingPixelUrl = trackingToken
    ? `${appUrl}/api/notifications/track/open?token=${encodeURIComponent(trackingToken)}&channel=email`
    : null;

  const trackedActionUrl = trackingToken && actionUrl
    ? `${appUrl}/api/notifications/track/click?token=${encodeURIComponent(trackingToken)}&channel=email&target=${encodeURIComponent(actionUrl)}`
    : actionUrl;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headline}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1E293B;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #F8FAFC;
      padding: 30px 0;
    }
    .main-table {
      background-color: #ffffff;
      margin: 0 auto;
      width: 100%;
      max-width: 600px;
      border-spacing: 0;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 20, 61, 0.06);
      border: 1px solid #E2E8F0;
    }
    .header-bar {
      background: linear-gradient(135deg, #00143D 0%, #002366 100%);
      padding: 32px 30px;
      text-align: center;
    }
    .brand-logo-text {
      color: #ffffff;
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.5px;
      margin: 0;
      text-transform: uppercase;
    }
    .brand-logo-red {
      color: #FF1028;
    }
    .brand-tagline {
      color: #94A3B8;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-top: 4px;
    }
    .badge {
      display: inline-block;
      background-color: rgba(255, 16, 40, 0.15);
      color: #FF1028;
      border: 1px solid rgba(255, 16, 40, 0.3);
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    .content-body {
      padding: 36px 32px;
      font-size: 14px;
      line-height: 1.65;
      color: #334155;
    }
    .headline {
      font-size: 20px;
      font-weight: 800;
      color: #00143D;
      margin: 0 0 16px 0;
      line-height: 1.3;
    }
    .cta-container {
      text-align: center;
      margin: 32px 0 16px 0;
    }
    .cta-button {
      background-color: #FF1028;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 12px;
      font-weight: 800;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: inline-block;
      box-shadow: 0 4px 12px rgba(255, 16, 40, 0.25);
    }
    .info-card {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 18px 20px;
      margin: 20px 0;
    }
    .footer {
      background-color: #00143D;
      color: #94A3B8;
      padding: 28px 30px;
      text-align: center;
      font-size: 11px;
      line-height: 1.6;
    }
    .footer a {
      color: #CBD5E1;
      text-decoration: underline;
    }
    .footer-divider {
      border-top: 1px solid #1E293B;
      margin: 16px 0;
    }
    .gold-accent {
      color: #F59E0B;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main-table" align="center">
      <!-- Executive Header -->
      <tr>
        <td class="header-bar">
          <p class="brand-logo-text">LENNOX <span class="brand-logo-red">CHINA MALL</span></p>
          <div class="brand-tagline">Direct Factory Sourcing Hub • Zero-Fee Binance Pay</div>
        </td>
      </tr>

      <!-- Main Message Body -->
      <tr>
        <td class="content-body">
          <div class="badge">${categoryBadge}</div>
          <h1 class="headline">${headline}</h1>
          ${contentHtml}

          ${
            trackedActionUrl && actionLabel
              ? `<div class="cta-container">
                  <a href="${trackedActionUrl}" class="cta-button">${actionLabel} &rarr;</a>
                </div>`
              : ""
          }
        </td>
      </tr>

      <!-- Footer Info -->
      <tr>
        <td class="footer">
          <p style="margin: 0 0 6px 0; color: #FFFFFF; font-weight: 700; font-size: 12px;">
            Lennox China Mall Sourcing &amp; Air Logistics Desk
          </p>
          <p style="margin: 0;">
            Direct from Shenzhen &amp; Yiwu Factory Hubs to your doorstep via international air freight.
          </p>
          <div class="footer-divider"></div>
          <p style="margin: 0; color: #64748B;">
            Need assistance? Reach our 24/7 Desk at <a href="${appUrl}/account/support">Customer Support</a>
            &bull; <a href="${appUrl}/account/orders">Track Orders</a>
            &bull; <a href="${appUrl}/account/notifications/preferences">Preferences</a>
          </p>
          <p style="margin: 8px 0 0 0; color: #475569; font-size: 10px;">
            &copy; ${new Date().getFullYear()} Lennox China Mall. All rights reserved.
          </p>
        </td>
      </tr>
    </table>
    ${trackingPixelUrl ? `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />` : ""}
  </div>
</body>
</html>`;
}

/**
 * Built-in email templates dictionary with Lennox branding and variables
 */
export const BUILTIN_TEMPLATES: Record<
  string,
  {
    category: string;
    subject: string;
    headline: string;
    bodyHtmlTemplate: string;
    bodyTextTemplate: string;
    defaultActionLabel: string;
    defaultActionPath: string;
  }
> = {
  order_confirmed: {
    category: "ORDERS",
    subject: "Order Confirmed #{{order_number}} — Lennox China Mall Sourcing",
    headline: "Your China Factory Sourcing Has Begun",
    bodyHtmlTemplate: `
      <p>Dear <strong>{{customer_name}}</strong>,</p>
      <p>Thank you for purchasing with <strong>Lennox China Mall</strong>. Your order <strong>#{{order_number}}</strong> totaling <strong class="gold-accent">{{amount}}</strong> has been confirmed and locked into our Shenzhen procurement queue.</p>
      <div class="info-card">
        <table width="100%" style="font-size: 12px; color: #334155;">
          <tr>
            <td style="padding: 4px 0;"><strong>Order Reference:</strong></td>
            <td align="right" style="font-family: monospace; font-weight: bold;">#{{order_number}}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Settlement Amount:</strong></td>
            <td align="right" style="color: #10B981; font-weight: bold;">{{amount}}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Current Phase:</strong></td>
            <td align="right" style="color: #2F65F6; font-weight: bold;">Factory Quality Inspection (Shenzhen)</td>
          </tr>
        </table>
      </div>
      <p style="font-size: 13px; color: #64748B;">Our on-site QA team in Shenzhen will verify packaging, test electronic components, and prepare your parcel for direct air transit.</p>
    `,
    bodyTextTemplate:
      "Dear {{customer_name}},\n\nYour order #{{order_number}} totaling {{amount}} is confirmed. Sourcing and factory inspection are now in progress in Shenzhen. Track live status at: {{action_url}}",
    defaultActionLabel: "Track Order Status",
    defaultActionPath: "/account/orders",
  },

  payment_success: {
    category: "PAYMENTS",
    subject: "Payment Confirmed: Order #{{order_number}} — Zero-Fee Binance Pay",
    headline: "Settlement Confirmed via Binance Pay Escrow",
    bodyHtmlTemplate: `
      <p>Dear <strong>{{customer_name}}</strong>,</p>
      <p>We have successfully verified your settlement of <strong class="gold-accent">{{amount}}</strong> for Order <strong>#{{order_number}}</strong>. Zero network/merchant fees were applied via Binance Pay Direct Escrow.</p>
      <div class="info-card">
        <table width="100%" style="font-size: 12px; color: #334155;">
          <tr>
            <td style="padding: 4px 0;"><strong>Transaction ID:</strong></td>
            <td align="right" style="font-family: monospace;">{{payment_id}}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Order Number:</strong></td>
            <td align="right" style="font-weight: bold;">#{{order_number}}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Escrow Status:</strong></td>
            <td align="right" style="color: #10B981; font-weight: bold;">✓ 100% Protected Buyer Escrow</td>
          </tr>
        </table>
      </div>
      <p style="font-size: 13px; color: #64748B;">Your payment is safely held in escrow and will be released to factory partners only upon parcel dispatch.</p>
    `,
    bodyTextTemplate:
      "Dear {{customer_name}},\n\nPayment of {{amount}} for Order #{{order_number}} has been verified. Transaction ID: {{payment_id}}. View invoice at: {{action_url}}",
    defaultActionLabel: "View Order Invoice",
    defaultActionPath: "/account/orders",
  },

  shipping_dispatched: {
    category: "SHIPPING",
    subject: "✈️ Air Cargo Dispatched: Order #{{order_number}} ({{tracking_number}})",
    headline: "Your Parcel Has Taken Flight from China",
    bodyHtmlTemplate: `
      <p>Dear <strong>{{customer_name}}</strong>,</p>
      <p>Great news! Your package for Order <strong>#{{order_number}}</strong> has cleared export customs and departed from the Hong Kong International Air Freight Hub via <strong>{{courier}}</strong>.</p>
      <div class="info-card" style="border-left: 4px solid #2F65F6;">
        <table width="100%" style="font-size: 12px; color: #334155;">
          <tr>
            <td style="padding: 4px 0;"><strong>Air Waybill / Tracking:</strong></td>
            <td align="right" style="font-family: monospace; font-weight: bold; color: #00143D;">{{tracking_number}}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Carrier Partner:</strong></td>
            <td align="right" style="font-weight: bold;">{{courier}} Air Express</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Customs Status:</strong></td>
            <td align="right" style="color: #10B981; font-weight: bold;">DDP Prepaid (No Import Duties)</td>
          </tr>
        </table>
      </div>
      <p style="font-size: 13px; color: #64748B;">You can track the live flight position and milestone scans in real-time through your Lennox China Mall account.</p>
    `,
    bodyTextTemplate:
      "Dear {{customer_name}},\n\nYour order #{{order_number}} is in transit via {{courier}}. Tracking number: {{tracking_number}}. Live Air Tracking: {{action_url}}",
    defaultActionLabel: "Live Airfreight Tracking",
    defaultActionPath: "/account/orders",
  },

  delivery_completed: {
    category: "DELIVERY",
    subject: "Delivered: Order #{{order_number}} — Enjoy Your Factory Goods",
    headline: "Your Package Has Been Delivered",
    bodyHtmlTemplate: `
      <p>Dear <strong>{{customer_name}}</strong>,</p>
      <p>Carrier <strong>{{courier}}</strong> has reported that your package for Order <strong>#{{order_number}}</strong> has been successfully delivered to your shipping address.</p>
      <div class="info-card">
        <p style="margin: 0; font-size: 13px; color: #334155;">
          Please inspect your hardware and verified factory packaging. If you have any questions or require warranty support, our team is ready to help.
        </p>
      </div>
      <p style="font-size: 13px; color: #64748B;">Share your experience with other global buyers by leaving a verified rating and photo review.</p>
    `,
    bodyTextTemplate:
      "Dear {{customer_name}},\n\nOrder #{{order_number}} has been delivered. Leave a review for factory hardware at: {{action_url}}",
    defaultActionLabel: "Review Your Purchase",
    defaultActionPath: "/account/reviews",
  },

  return_update: {
    category: "RETURNS",
    subject: "Return Update: Order #{{order_number}} — Status: {{return_status}}",
    headline: "Return & Refund Case Update",
    bodyHtmlTemplate: `
      <p>Dear <strong>{{customer_name}}</strong>,</p>
      <p>Your return request for Order <strong>#{{order_number}}</strong> has been updated to: <strong style="color: #2F65F6; text-transform: uppercase;">{{return_status}}</strong>.</p>
      <div class="info-card">
        <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: bold; color: #00143D;">Specialist Decision Note:</p>
        <p style="margin: 0; font-size: 13px; color: #475569;">{{decision_note}}</p>
      </div>
      <p style="font-size: 13px; color: #64748B;">If a refund was approved, funds will settle back to your original USDT address or payment method within 24 hours.</p>
    `,
    bodyTextTemplate:
      "Dear {{customer_name}},\n\nReturn update for Order #{{order_number}}: {{return_status}}. Notes: {{decision_note}}. View details at: {{action_url}}",
    defaultActionLabel: "View Return Case",
    defaultActionPath: "/account/returns",
  },

  support_reply: {
    category: "SUPPORT",
    subject: "Support Reply on Ticket #{{support_ticket_id}}: {{ticket_subject}}",
    headline: "New Response from Lennox Support Specialist",
    bodyHtmlTemplate: `
      <p>Dear <strong>{{customer_name}}</strong>,</p>
      <p>A support specialist has responded to your ticket <strong>#{{support_ticket_id}}</strong> (<em>{{ticket_subject}}</em>):</p>
      <div class="info-card" style="border-left: 4px solid #FF1028; background-color: #FFF5F5;">
        <p style="margin: 0; font-size: 13px; color: #1E293B; white-space: pre-line;">{{reply_excerpt}}</p>
      </div>
      <p style="font-size: 13px; color: #64748B;">You can reply directly inside your Lennox China Mall Support Desk.</p>
    `,
    bodyTextTemplate:
      "Dear {{customer_name}},\n\nA support specialist replied to Ticket #{{support_ticket_id}} ({{ticket_subject}}):\n\n{{reply_excerpt}}\n\nReply at: {{action_url}}",
    defaultActionLabel: "Open Support Desk",
    defaultActionPath: "/account/support",
  },

  security_alert: {
    category: "SECURITY",
    subject: "🛡️ Security Alert: {{security_event}} on Your Lennox Account",
    headline: "Important Account Security Notice",
    bodyHtmlTemplate: `
      <p>Dear <strong>{{customer_name}}</strong>,</p>
      <p>We detected a new security event on your account: <strong style="color: #E11D48;">{{security_event}}</strong>.</p>
      <div class="info-card" style="border-left: 4px solid #E11D48;">
        <table width="100%" style="font-size: 12px; color: #334155;">
          <tr>
            <td style="padding: 4px 0;"><strong>Event:</strong></td>
            <td align="right" style="font-weight: bold; color: #E11D48;">{{security_event}}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>IP Address:</strong></td>
            <td align="right" style="font-family: monospace;">{{ip_address}}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Estimated Location:</strong></td>
            <td align="right">{{location}}</td>
          </tr>
        </table>
      </div>
      <p style="font-size: 13px; color: #64748B;">If you did not authorize this activity, please immediately change your password and revoke active sessions.</p>
    `,
    bodyTextTemplate:
      "Dear {{customer_name}},\n\nSecurity alert: {{security_event}} detected from IP {{ip_address}} ({{location}}). If this was not you, secure your account at: {{action_url}}",
    defaultActionLabel: "Review Account Security",
    defaultActionPath: "/account/profile",
  },

  promotional_broadcast: {
    category: "PROMOTIONS",
    subject: "⚡ {{promo_title}} — China Factory Direct Drop",
    headline: "{{promo_headline}}",
    bodyHtmlTemplate: `
      <p>Dear <strong>{{customer_name}}</strong>,</p>
      <p>{{promo_body}}</p>
      <div class="info-card" style="text-align: center; background: linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%); border-color: #FECDD3;">
        <p style="margin: 0; font-size: 13px; font-weight: 800; color: #FF1028; text-transform: uppercase;">
          Exclusive VIP Wholesale Tier Pricing Applied
        </p>
      </div>
    `,
    bodyTextTemplate:
      "Dear {{customer_name}},\n\n{{promo_headline}}\n\n{{promo_body}}\n\nShop exclusive drops at: {{action_url}}",
    defaultActionLabel: "Explore Factory Drops",
    defaultActionPath: "/categories/flash-deals",
  },
};

/**
 * Render a complete branded email by templateKey or custom content
 */
export function renderEmail(
  templateKey: string,
  options: EmailRenderOptions
): RenderedEmail {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lennoxchinamall.com";
  const tpl = BUILTIN_TEMPLATES[templateKey] || BUILTIN_TEMPLATES.promotional_broadcast;

  const mergedVars: Record<string, unknown> = {
    customer_name: options.customerName || "Valued Buyer",
    order_number: options.orderNumber || "LCM-2026-PENDING",
    order_id: options.orderId || "",
    payment_id: options.paymentId || "BINANCE-PAY-TX",
    amount: options.amount !== undefined ? (typeof options.amount === "number" ? `$${options.amount.toFixed(2)}` : options.amount) : "$0.00",
    currency: options.currency || "USDT",
    product_title: options.productTitle || "Factory Product",
    product_summary: options.productSummary || "Direct Factory Hardware",
    tracking_number: options.trackingNumber || "YUN-AIR-PENDING",
    tracking_url: options.trackingUrl || `${appUrl}/account/orders`,
    courier: options.courier || "YunExpress Air Express",
    support_ticket_id: options.supportTicketId || "TCK-001",
    ticket_subject: options.ticketSubject || "Support Inquiry",
    reply_excerpt: options.replyExcerpt || "Our support team has processed your inquiry.",
    security_event: options.securityEvent || "New Sign-in from unrecognized device",
    ip_address: options.ipAddress || "127.0.0.1",
    location: options.location || "United States",
    promo_title: options.promoTitle || "Flash Factory Restock",
    promo_headline: options.promoHeadline || "Shenzhen Hardware Drop: Exclusive Pricing",
    promo_body: options.promoBody || "New factory-direct inventory has arrived with zero middlemen markups.",
    return_status: options.returnStatus || "Under Review",
    decision_note: options.decisionNote || "Our sourcing team is reviewing your return request details.",
    action_label: options.actionLabel || tpl.defaultActionLabel,
    action_url: options.actionUrl || `${appUrl}${tpl.defaultActionPath}`,
    ...(options.customVariables || {}),
  };

  const subject = interpolateVariables(tpl.subject, mergedVars);
  const headline = interpolateVariables(tpl.headline, mergedVars);
  const contentHtml = interpolateVariables(tpl.bodyHtmlTemplate, mergedVars);
  const textBody = interpolateVariables(tpl.bodyTextTemplate, mergedVars);

  const finalHtml = wrapInLennoxBrandShell({
    headline,
    contentHtml,
    actionLabel: mergedVars.action_label as string,
    actionUrl: mergedVars.action_url as string,
    categoryBadge: tpl.category,
    trackingToken: options.trackingToken,
    appUrl,
  });

  return {
    subject,
    headline,
    html: finalHtml,
    text: textBody,
  };
}
