-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION: 009_notification_communication_system.sql
-- Description: Complete Multi-Channel Notification & Communication Engine for Lennox China Mall
--              Includes In-App, Email, Web Push, SMS, Customer Preferences,
--              Branded Templates, Admin Broadcasts, Delivery Tracking, Idempotency,
--              Automated Event Triggers, and Row-Level Security.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Create Enums for Channels, Categories, Priorities, and Statuses
DO $$ BEGIN
  CREATE TYPE public.notification_channel AS ENUM ('in_app', 'email', 'push', 'sms');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.notification_category AS ENUM (
    'orders',
    'payments',
    'shipping',
    'delivery',
    'returns',
    'refunds',
    'reviews',
    'support',
    'security',
    'promotions'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.notification_priority AS ENUM ('low', 'normal', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.delivery_status AS ENUM (
    'pending',
    'sent',
    'delivered',
    'opened',
    'clicked',
    'failed',
    'retried'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.broadcast_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. User In-App Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category      public.notification_category NOT NULL DEFAULT 'orders',
  channel       public.notification_channel NOT NULL DEFAULT 'in_app',
  priority      public.notification_priority NOT NULL DEFAULT 'normal',
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  action_label  TEXT,
  action_url    TEXT,
  icon          TEXT,
  data          JSONB DEFAULT '{}'::jsonb,
  expires_at    TIMESTAMPTZ,
  read_at       TIMESTAMPTZ,
  archived_at   TIMESTAMPTZ,
  is_deleted    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications(user_id, created_at DESC)
  WHERE read_at IS NULL AND is_deleted = FALSE;

CREATE INDEX IF NOT EXISTS idx_notifications_user_active
  ON public.notifications(user_id, archived_at, is_deleted, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_category
  ON public.notifications(category);

CREATE INDEX IF NOT EXISTS idx_notifications_expires
  ON public.notifications(expires_at)
  WHERE expires_at IS NOT NULL;

-- 3. Customer Notification Preferences Table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  in_app_enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  email_enabled       BOOLEAN NOT NULL DEFAULT TRUE,
  push_enabled        BOOLEAN NOT NULL DEFAULT TRUE,
  sms_enabled         BOOLEAN NOT NULL DEFAULT FALSE,
  phone_number        TEXT,
  -- Channel settings per category: { in_app: bool, email: bool, push: bool, sms: bool }
  categories_config   JSONB NOT NULL DEFAULT '{
    "orders": { "in_app": true, "email": true, "push": true, "sms": true },
    "payments": { "in_app": true, "email": true, "push": true, "sms": true },
    "shipping": { "in_app": true, "email": true, "push": true, "sms": true },
    "delivery": { "in_app": true, "email": true, "push": true, "sms": true },
    "returns": { "in_app": true, "email": true, "push": true, "sms": false },
    "refunds": { "in_app": true, "email": true, "push": true, "sms": true },
    "reviews": { "in_app": true, "email": true, "push": false, "sms": false },
    "support": { "in_app": true, "email": true, "push": true, "sms": false },
    "security": { "in_app": true, "email": true, "push": true, "sms": true },
    "promotions": { "in_app": true, "email": true, "push": true, "sms": false }
  }'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_pref_user ON public.notification_preferences(user_id);

-- 4. Notification Templates Table
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_key      TEXT NOT NULL UNIQUE,
  name              TEXT NOT NULL,
  description       TEXT,
  category          public.notification_category NOT NULL DEFAULT 'orders',
  subject           TEXT NOT NULL,
  headline          TEXT NOT NULL,
  body_html         TEXT NOT NULL,
  body_text         TEXT NOT NULL,
  sms_template      TEXT,
  push_title        TEXT,
  push_body         TEXT,
  variables_schema  JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_templates_key ON public.notification_templates(template_key);
CREATE INDEX IF NOT EXISTS idx_notif_templates_category ON public.notification_templates(category);

-- 5. Admin Broadcast Announcements Table
CREATE TABLE IF NOT EXISTS public.notification_broadcasts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             TEXT NOT NULL,
  message           TEXT NOT NULL,
  category          public.notification_category NOT NULL DEFAULT 'promotions',
  priority          public.notification_priority NOT NULL DEFAULT 'normal',
  channels          public.notification_channel[] NOT NULL DEFAULT '{in_app}',
  target_audience   TEXT NOT NULL DEFAULT 'all_users', -- 'all_users' | 'vip_customers' | 'by_country' | 'by_order_history' | 'by_account_status' | 'specific_users' | 'staff_only'
  target_filter     JSONB DEFAULT '{}'::jsonb,
  action_label      TEXT,
  action_url        TEXT,
  status            public.broadcast_status NOT NULL DEFAULT 'draft',
  scheduled_at      TIMESTAMPTZ,
  expires_at        TIMESTAMPTZ,
  sent_at           TIMESTAMPTZ,
  total_targeted    INT NOT NULL DEFAULT 0,
  total_sent        INT NOT NULL DEFAULT 0,
  total_delivered   INT NOT NULL DEFAULT 0,
  total_opened      INT NOT NULL DEFAULT 0,
  total_clicked     INT NOT NULL DEFAULT 0,
  total_failed      INT NOT NULL DEFAULT 0,
  created_by        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_broadcasts_status ON public.notification_broadcasts(status);
CREATE INDEX IF NOT EXISTS idx_notif_broadcasts_sched ON public.notification_broadcasts(scheduled_at) WHERE status = 'scheduled';

-- 6. Multi-Channel Notification Delivery Logs Table
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_id     UUID REFERENCES public.notifications(id) ON DELETE SET NULL,
  broadcast_id        UUID REFERENCES public.notification_broadcasts(id) ON DELETE SET NULL,
  user_id             UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  recipient_email     TEXT,
  recipient_phone     TEXT,
  channel             public.notification_channel NOT NULL,
  category            public.notification_category NOT NULL,
  idempotency_key     TEXT UNIQUE,
  status              public.delivery_status NOT NULL DEFAULT 'pending',
  provider            TEXT, -- 'resend', 'smtp', 'webpush', 'twilio', 'in_app'
  provider_message_id TEXT,
  subject             TEXT,
  payload             JSONB DEFAULT '{}'::jsonb,
  retry_count         INT NOT NULL DEFAULT 0,
  max_retries         INT NOT NULL DEFAULT 3,
  last_error          TEXT,
  next_retry_at       TIMESTAMPTZ,
  tracking_token      TEXT UNIQUE,
  sent_at             TIMESTAMPTZ,
  delivered_at        TIMESTAMPTZ,
  opened_at           TIMESTAMPTZ,
  clicked_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_logs_user ON public.notification_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_logs_status ON public.notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notif_logs_idempotency ON public.notification_logs(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_notif_logs_tracking ON public.notification_logs(tracking_token);
CREATE INDEX IF NOT EXISTS idx_notif_logs_retry ON public.notification_logs(status, next_retry_at) WHERE status = 'failed' AND retry_count < 3;

-- 7. Web Push Subscriptions Table
CREATE TABLE IF NOT EXISTS public.notification_push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL UNIQUE,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_push_user ON public.notification_push_subscriptions(user_id);

-- 8. Seed Default Notification Templates with Lennox China Mall Branding
INSERT INTO public.notification_templates (
  template_key, name, description, category, subject, headline, body_html, body_text, push_title, push_body, sms_template, variables_schema
)
VALUES
(
  'order_confirmed',
  'Order Confirmed & Sourcing Initiated',
  'Triggered automatically when a buyer places an order',
  'orders',
  'Order Confirmed #{{order_number}} — Lennox China Mall Sourcing',
  'Your China Factory Sourcing Has Started',
  '<p>Dear <strong>{{customer_name}}</strong>,</p><p>Thank you for purchasing with Lennox China Mall. Your order <strong>#{{order_number}}</strong> totaling <strong>{{amount}}</strong> has been confirmed. Our Shenzhen sourcing team is currently procuring and inspecting your hardware.</p>',
  'Dear {{customer_name}}, Your order #{{order_number}} totaling {{amount}} is confirmed. Our sourcing team in Shenzhen is inspecting your goods. Track at: {{action_url}}',
  'Order Confirmed: #{{order_number}}',
  'Your order #{{order_number}} for {{amount}} has been confirmed and queued for sourcing.',
  'Lennox China Mall: Order #{{order_number}} confirmed. Total: {{amount}}. Track at {{action_url}}',
  '["customer_name", "order_number", "amount", "action_url", "product_summary"]'::jsonb
),
(
  'payment_success',
  'Payment Successfully Verified',
  'Triggered when Binance Pay USDT or fiat transaction confirms',
  'payments',
  'Payment Received #{{payment_id}} — Zero Fee Escrow Verified',
  'Payment Confirmed via Binance Pay',
  '<p>Dear <strong>{{customer_name}}</strong>,</p><p>We have successfully verified your settlement of <strong>{{amount}}</strong> for Order <strong>#{{order_number}}</strong>. Zero transaction fees applied via Binance Pay Direct Escrow.</p>',
  'Dear {{customer_name}}, payment of {{amount}} for Order #{{order_number}} has been verified. Transaction ID: {{payment_id}}.',
  'Payment Confirmed ({{amount}})',
  'Your settlement for Order #{{order_number}} was successfully verified.',
  'Lennox China Mall: Payment of {{amount}} confirmed for Order #{{order_number}}. TX: {{payment_id}}',
  '["customer_name", "order_number", "amount", "payment_id", "currency", "action_url"]'::jsonb
),
(
  'shipping_dispatched',
  'Air Cargo Flight Dispatched',
  'Triggered when shipment leaves Shenzhen/Hong Kong hub',
  'shipping',
  'Air Cargo En Route: Order #{{order_number}} ({{tracking_number}})',
  'Your Parcel Has Taken Flight from China',
  '<p>Dear <strong>{{customer_name}}</strong>,</p><p>Your order <strong>#{{order_number}}</strong> has departed from Hong Kong International Air Hub via <strong>{{courier}}</strong>. Tracking number: <strong>{{tracking_number}}</strong>.</p>',
  'Dear {{customer_name}}, order #{{order_number}} is en route via {{courier}}. Tracking: {{tracking_number}}. Track: {{action_url}}',
  'Air Cargo Dispatched: #{{order_number}}',
  'Your package {{tracking_number}} is in transit from Hong Kong air hub.',
  'Lennox China Mall: Order #{{order_number}} dispatched. Tracking: {{tracking_number}}. Link: {{action_url}}',
  '["customer_name", "order_number", "tracking_number", "courier", "action_url", "estimated_delivery"]'::jsonb
),
(
  'delivery_completed',
  'Parcel Successfully Delivered',
  'Triggered when carrier confirms parcel delivery',
  'delivery',
  'Delivered: Order #{{order_number}} — Enjoy Your Factory Goods',
  'Your Package Has Arrived',
  '<p>Dear <strong>{{customer_name}}</strong>,</p><p>Carrier <strong>{{courier}}</strong> has confirmed delivery of Order <strong>#{{order_number}}</strong>. Please inspect your items and let us know if everything meets your standards.</p>',
  'Dear {{customer_name}}, order #{{order_number}} was delivered today. Leave a review at {{action_url}}',
  'Delivered: Order #{{order_number}}',
  'Your order #{{order_number}} has been delivered. Tap to review your items.',
  'Lennox China Mall: Order #{{order_number}} delivered. Rate your purchase: {{action_url}}',
  '["customer_name", "order_number", "courier", "action_url"]'::jsonb
),
(
  'return_update',
  'Return & Refund Status Update',
  'Triggered when return request is approved, received, or refunded',
  'returns',
  'Return Update: Order #{{order_number}} — Status: {{return_status}}',
  'Return Request Status Update',
  '<p>Dear <strong>{{customer_name}}</strong>,</p><p>Your return request for Order <strong>#{{order_number}}</strong> has been updated to: <strong>{{return_status}}</strong>. Decision details: {{decision_note}}.</p>',
  'Dear {{customer_name}}, your return for Order #{{order_number}} is now {{return_status}}. Details: {{decision_note}}',
  'Return Status: {{return_status}}',
  'Update on your return for Order #{{order_number}}: {{return_status}}.',
  'Lennox China Mall: Return for Order #{{order_number}} is {{return_status}}. Details: {{action_url}}',
  '["customer_name", "order_number", "return_status", "decision_note", "action_url"]'::jsonb
),
(
  'support_reply',
  'Customer Support Agent Replied',
  'Triggered when support staff replies to a ticket',
  'support',
  'New Reply on Ticket #{{ticket_id}}: {{ticket_subject}}',
  'New Message from Lennox Support Team',
  '<p>Dear <strong>{{customer_name}}</strong>,</p><p>A support specialist has responded to ticket <strong>#{{ticket_id}}</strong> (<em>{{ticket_subject}}</em>):</p><blockquote style="border-left: 3px solid #FF1028; padding-left: 12px; margin: 12px 0; color: #475569;">{{reply_excerpt}}</blockquote>',
  'Dear {{customer_name}}, a support agent responded to Ticket #{{ticket_id}}. Read reply: {{action_url}}',
  'Support Reply: Ticket #{{ticket_id}}',
  'Our support team replied to your ticket "{{ticket_subject}}".',
  'Lennox Support: New reply on ticket #{{ticket_id}}. View at {{action_url}}',
  '["customer_name", "ticket_id", "ticket_subject", "reply_excerpt", "action_url"]'::jsonb
),
(
  'security_alert',
  'Account Security Alert',
  'Triggered for new logins, password resets, or API key alterations',
  'security',
  'Security Alert: New Sign-in Detected on Your Lennox Account',
  'New Security Event Detected',
  '<p>Dear <strong>{{customer_name}}</strong>,</p><p>We detected a new security event on your account: <strong>{{security_event}}</strong> from IP <strong>{{ip_address}}</strong> ({{location}}). If this was not you, please secure your account immediately.</p>',
  'Security Alert: New {{security_event}} from IP {{ip_address}}. If this was not you, reset your password immediately at {{action_url}}',
  'Security Alert: {{security_event}}',
  'Security notification for your Lennox China Mall account. Tap to review.',
  'Lennox Security: {{security_event}} detected from IP {{ip_address}}. Review at {{action_url}}',
  '["customer_name", "security_event", "ip_address", "location", "action_url"]'::jsonb
),
(
  'promotional_broadcast',
  'Promotional Hardware Drop & Voucher Alert',
  'Template for scheduled flash sales and VIP discounts',
  'promotions',
  '⚡ {{promo_title}} — Exclusive China Factory Drop',
  '{{promo_headline}}',
  '<p>Dear <strong>{{customer_name}}</strong>,</p><p>{{promo_body}}</p><div style="text-align: center; margin: 24px 0;"><a href="{{action_url}}" style="background-color: #FF1028; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">{{action_label}}</a></div>',
  'Dear {{customer_name}}, {{promo_body}} Shop now at: {{action_url}}',
  '⚡ {{promo_title}}',
  '{{promo_headline}} — Limited factory inventory available.',
  'Lennox China Mall: {{promo_title}}. Shop now: {{action_url}}',
  '["customer_name", "promo_title", "promo_headline", "promo_body", "action_url", "action_label"]'::jsonb
)
ON CONFLICT (template_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  subject = EXCLUDED.subject,
  headline = EXCLUDED.headline,
  body_html = EXCLUDED.body_html,
  body_text = EXCLUDED.body_text,
  sms_template = EXCLUDED.sms_template,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  variables_schema = EXCLUDED.variables_schema,
  updated_at = now();

-- 9. Automatic Database Trigger: New User Notification Preferences Setup
CREATE OR REPLACE FUNCTION public.handle_new_user_notification_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id, phone_number)
  VALUES (NEW.id, NEW.phone)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profile_created_notification_prefs ON public.profiles;
CREATE TRIGGER trg_profile_created_notification_prefs
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_notification_preferences();

-- 10. Automatic Database Trigger: Order Status Change Notification
CREATE OR REPLACE FUNCTION public.handle_order_status_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_title TEXT;
  v_body TEXT;
  v_category public.notification_category := 'orders';
  v_priority public.notification_priority := 'normal';
  v_action_url TEXT := '/account/orders';
  v_action_label TEXT := 'View Order';
  v_icon TEXT := 'Package';
BEGIN
  -- Only act if status actually changed
  IF (TG_OP = 'UPDATE' AND OLD.status = NEW.status) THEN
    RETURN NEW;
  END IF;

  IF NEW.status = 'paid' THEN
    v_category := 'payments';
    v_title := 'Payment Confirmed for Order #' || NEW.order_number;
    v_body := 'Your settlement of $' || NEW.total || ' has been verified with zero fees via Binance Pay.';
    v_action_label := 'View Receipt';
    v_icon := 'Coins';
  ELSIF NEW.status = 'sourcing' THEN
    v_title := 'Sourcing Started for Order #' || NEW.order_number;
    v_body := 'Our Shenzhen sourcing agents are procuring and inspecting your items.';
    v_action_label := 'Track Sourcing';
    v_icon := 'Factory';
  ELSIF NEW.status = 'shipped' THEN
    v_category := 'shipping';
    v_priority := 'high';
    v_title := 'Order #' || NEW.order_number || ' Has Shipped';
    v_body := 'Your air cargo has departed China hub. Tracking: ' || COALESCE(NEW.tracking_number, 'Pending update');
    v_action_label := 'Live Air Track';
    v_icon := 'Plane';
  ELSIF NEW.status = 'delivered' THEN
    v_category := 'delivery';
    v_priority := 'high';
    v_title := 'Order #' || NEW.order_number || ' Delivered';
    v_body := 'Carrier confirms your package was successfully delivered. Please rate your items!';
    v_action_label := 'Review Items';
    v_icon := 'CheckCircle2';
  ELSIF NEW.status = 'cancelled' THEN
    v_priority := 'urgent';
    v_title := 'Order #' || NEW.order_number || ' Cancelled';
    v_body := 'Order #' || NEW.order_number || ' has been cancelled. Any collected funds will be refunded.';
    v_action_label := 'View Details';
    v_icon := 'AlertTriangle';
  ELSE
    v_title := 'Order #' || NEW.order_number || ' Status: ' || NEW.status;
    v_body := 'Your order has updated to ' || NEW.status || '.';
  END IF;

  -- Insert in-app notification for the customer
  INSERT INTO public.notifications (
    user_id, category, channel, priority, title, body, action_label, action_url, icon, data
  ) VALUES (
    NEW.user_id,
    v_category,
    'in_app',
    v_priority,
    v_title,
    v_body,
    v_action_label,
    v_action_url,
    v_icon,
    jsonb_build_object(
      'order_id', NEW.id,
      'order_number', NEW.order_number,
      'status', NEW.status,
      'total', NEW.total,
      'tracking_number', NEW.tracking_number
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_order_status_notification ON public.orders;
CREATE TRIGGER trg_order_status_notification
  AFTER INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_status_notification();

-- 11. Automatic Database Trigger: Low Stock Variant Admin Alert
CREATE OR REPLACE FUNCTION public.handle_low_stock_variant_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_product_title TEXT;
  v_admin_record RECORD;
BEGIN
  -- Trigger only when stock falls below or equals threshold
  IF (NEW.stock <= NEW.low_stock_threshold AND (TG_OP = 'INSERT' OR OLD.stock > NEW.low_stock_threshold)) THEN
    SELECT title INTO v_product_title FROM public.products WHERE id = NEW.product_id;

    -- Send in-app notification to all staff/super_admin users
    FOR v_admin_record IN (
      SELECT id FROM public.profiles WHERE role IN ('super_admin', 'catalogue_manager', 'order_manager')
    ) LOOP
      INSERT INTO public.notifications (
        user_id, category, channel, priority, title, body, action_label, action_url, icon, data
      ) VALUES (
        v_admin_record.id,
        'orders',
        'in_app',
        'urgent',
        '⚠️ Low Stock Alert: ' || COALESCE(v_product_title, 'Product SKU: ' || NEW.sku),
        'Inventory for SKU ' || NEW.sku || ' is down to ' || NEW.stock || ' unit(s) (threshold: ' || NEW.low_stock_threshold || ').',
        'Restock Inventory',
        '/admin/inventory',
        'AlertTriangle',
        jsonb_build_object(
          'variant_id', NEW.id,
          'product_id', NEW.product_id,
          'sku', NEW.sku,
          'stock', NEW.stock,
          'threshold', NEW.low_stock_threshold
        )
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_variant_low_stock_notification ON public.variants;
CREATE TRIGGER trg_variant_low_stock_notification
  AFTER INSERT OR UPDATE OF stock ON public.variants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_low_stock_variant_notification();

-- 12. Enable Row Level Security (RLS) on all Notification Tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 13. RLS Policies

-- Notifications: Customers can only select/update their own non-deleted notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id AND is_deleted = FALSE);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can soft delete own notifications" ON public.notifications;
CREATE POLICY "Users can soft delete own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Staff can manage all notifications" ON public.notifications;
CREATE POLICY "Staff can manage all notifications"
  ON public.notifications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
      AND p.role IN ('super_admin', 'order_manager', 'support_agent', 'catalogue_manager')
    )
  );

-- Notification Preferences
DROP POLICY IF EXISTS "Users can manage own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can manage own notification preferences"
  ON public.notification_preferences FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Push Subscriptions
DROP POLICY IF EXISTS "Users can manage own push subscriptions" ON public.notification_push_subscriptions;
CREATE POLICY "Users can manage own push subscriptions"
  ON public.notification_push_subscriptions FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Notification Templates (Public read, Staff edit)
DROP POLICY IF EXISTS "Anyone authenticated can view templates" ON public.notification_templates;
CREATE POLICY "Anyone authenticated can view templates"
  ON public.notification_templates FOR SELECT
  TO authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "Staff can manage notification templates" ON public.notification_templates;
CREATE POLICY "Staff can manage notification templates"
  ON public.notification_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
      AND p.role IN ('super_admin', 'order_manager', 'support_agent', 'catalogue_manager')
    )
  );

-- Broadcasts & Delivery Logs (Staff only)
DROP POLICY IF EXISTS "Staff can manage broadcasts" ON public.notification_broadcasts;
CREATE POLICY "Staff can manage broadcasts"
  ON public.notification_broadcasts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
      AND p.role IN ('super_admin', 'order_manager', 'support_agent', 'catalogue_manager')
    )
  );

DROP POLICY IF EXISTS "Staff can view all delivery logs" ON public.notification_logs;
CREATE POLICY "Staff can view all delivery logs"
  ON public.notification_logs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
      AND p.role IN ('super_admin', 'order_manager', 'support_agent', 'catalogue_manager')
    )
  );

-- 14. Enable Realtime Publications for Notifications & Broadcasts
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_broadcasts;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
  END;
END $$;
