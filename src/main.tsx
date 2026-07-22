import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App.tsx";

// In development, unregister any lingering PWA service worker and clear its
// caches. A service worker registered by a previous production build/preview
// will otherwise keep serving a stale bundle over the dev server, making new
// changes appear missing.
if (import.meta.env.DEV && "serviceWorker" in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => registrations.forEach((r) => r.unregister()))
    .catch(() => {});
  if (typeof caches !== "undefined") {
    caches
      .keys()
      .then((keys) => keys.forEach((k) => caches.delete(k)))
      .catch(() => {});
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
