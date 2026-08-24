/**
 * Lennox ChinaMall — Notification & Communication System Types
 */

export type NotificationChannel = "in_app" | "email" | "push" | "sms";

export type NotificationCategory =
  | "orders"
  | "payments"
  | "shipping"
  | "delivery"
  | "returns"
  | "refunds"
  | "reviews"
  | "support"
  | "security"
  | "promotions";

export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export type DeliveryStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "failed"
  | "retried";

export type BroadcastStatus = "draft" | "scheduled" | "sending" | "sent" | "cancelled";

export type TargetAudienceType =
  | "all_users"
  | "vip_customers"
  | "by_country"
  | "by_order_history"
  | "by_account_status"
  | "specific_users"
  | "staff_only";

export interface CategoryChannelPreference {
  in_app: boolean;
  email: boolean;
  push: boolean;
  sms: boolean;
}

export type CategoriesConfig = Record<NotificationCategory, CategoryChannelPreference>;

export interface NotificationPreference {
  id: string;
  user_id: string;
  in_app_enabled: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  phone_number: string | null;
  categories_config: CategoriesConfig;
  created_at: string;
  updated_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  category: NotificationCategory;
  channel: NotificationChannel;
  priority: NotificationPriority;
  title: string;
  body: string;
  action_label?: string | null;
  action_url?: string | null;
  icon?: string | null;
  data?: Record<string, unknown> | null;
  expires_at?: string | null;
  read_at?: string | null;
  archived_at?: string | null;
  is_deleted?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface NotificationTemplate {
  id: string;
  template_key: string;
  name: string;
  description?: string | null;
  category: NotificationCategory;
  subject: string;
  headline: string;
  body_html: string;
  body_text: string;
  sms_template?: string | null;
  push_title?: string | null;
  push_body?: string | null;
  variables_schema: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationBroadcast {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  target_audience: TargetAudienceType;
  target_filter?: {
    countries?: string[];
    min_orders?: number;
    account_status?: "verified" | "all" | "staff";
    user_ids?: string[];
    emails?: string[];
  } | null;
  action_label?: string | null;
  action_url?: string | null;
  status: BroadcastStatus;
  scheduled_at?: string | null;
  expires_at?: string | null;
  sent_at?: string | null;
  total_targeted: number;
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_failed: number;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationDeliveryLog {
  id: string;
  notification_id?: string | null;
  broadcast_id?: string | null;
  user_id?: string | null;
  recipient_email?: string | null;
  recipient_phone?: string | null;
  channel: NotificationChannel;
  category: NotificationCategory;
  idempotency_key?: string | null;
  status: DeliveryStatus;
  provider?: string | null;
  provider_message_id?: string | null;
  subject?: string | null;
  payload?: Record<string, unknown> | null;
  retry_count: number;
  max_retries: number;
  last_error?: string | null;
  next_retry_at?: string | null;
  tracking_token?: string | null;
  sent_at?: string | null;
  delivered_at?: string | null;
  opened_at?: string | null;
  clicked_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PushSubscriptionRecord {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OperationalAlert {
  id: string;
  type: "new_order" | "paid_order" | "low_stock" | "failed_payment" | "return_request" | "urgent_ticket";
  title: string;
  message: string;
  severity: "urgent" | "high" | "normal" | "low";
  entity_id: string;
  link: string;
  created_at: string;
  is_read?: boolean;
}

export interface NotificationAnalytics {
  totalDispatched: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalFailed: number;
  deliveryRate: string;
  openRate: string;
  clickRate: string;
  failureRate: string;
  channelStats: {
    in_app: number;
    email: number;
    push: number;
    sms: number;
  };
  categoryStats: Record<NotificationCategory, number>;
  recentVolume: { date: string; sent: number; failed: number }[];
}

export interface DispatchNotificationParams {
  userId?: string;
  userEmail?: string;
  userPhone?: string;
  category: NotificationCategory;
  channels?: NotificationChannel[];
  priority?: NotificationPriority;
  templateKey?: string;
  title: string;
  body: string;
  headline?: string;
  actionLabel?: string;
  actionUrl?: string;
  icon?: string;
  data?: Record<string, unknown>;
  variables?: Record<string, string | number>;
  idempotencyKey?: string;
  expiresAt?: string;
}
