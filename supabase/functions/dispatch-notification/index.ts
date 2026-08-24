// @ts-nocheck
// Supabase Edge Function: dispatch-notification
// Deploy with: supabase functions deploy dispatch-notification

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      userId,
      userEmail,
      category = "orders",
      channels = ["in_app"],
      priority = "normal",
      title,
      body,
      actionLabel,
      actionUrl,
      data = {},
    } = await req.json();

    if (!title || !body) {
      return new Response(JSON.stringify({ error: "title and body are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert in-app notification if userId is provided
    let notificationId = null;
    if (userId && channels.includes("in_app")) {
      const { data: notif, error: notifErr } = await supabase
        .from("notifications")
        .insert({
          user_id: userId,
          category,
          channel: "in_app",
          priority,
          title,
          body,
          action_label: actionLabel,
          action_url: actionUrl,
          data,
        })
        .select("id")
        .single();

      if (!notifErr && notif) {
        notificationId = notif.id;
      }
    }

    // Log delivery
    await supabase.from("notification_logs").insert({
      notification_id: notificationId,
      user_id: userId,
      recipient_email: userEmail,
      channel: channels[0] || "in_app",
      category,
      status: "delivered",
      provider: "edge_function",
      subject: title,
      payload: { body, actionUrl },
      sent_at: new Date().toISOString(),
      delivered_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ success: true, notificationId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
