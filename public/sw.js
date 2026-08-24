/**
 * Lennox ChinaMall — Web Push Service Worker
 */

self.addEventListener("push", function (event) {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const title = payload.title || "Lennox China Mall Alert";
    const options = {
      body: payload.body || "You have a new update on your order or account.",
      icon: payload.icon || "/logo-lennoxchinamall.jpeg",
      badge: "/logo-lennoxchinamall.jpeg",
      data: {
        url: payload.url || "/account/notifications",
        trackingToken: payload.trackingToken,
      },
      vibrate: [100, 50, 100],
      actions: payload.actions || [
        { action: "explore", title: payload.actionLabel || "View Details" }
      ],
    };

    // Track delivery if tracking token exists
    if (payload.trackingToken) {
      fetch(`/api/notifications/track/open?token=${encodeURIComponent(payload.trackingToken)}&channel=push`, {
        method: "GET",
        mode: "no-cors",
      }).catch(() => {});
    }

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error("Push event handling error:", err);
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/account/notifications";
  const trackingToken = event.notification.data?.trackingToken;

  if (trackingToken) {
    fetch(`/api/notifications/track/click?token=${encodeURIComponent(trackingToken)}&channel=push`, {
      method: "GET",
      mode: "no-cors",
    }).catch(() => {});
  }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
