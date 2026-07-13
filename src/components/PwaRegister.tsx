"use client";

import { useEffect } from "react";

/** Registriert den Service Worker und fängt automatische Updates ab. */
export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      let intervalId: ReturnType<typeof setInterval> | undefined;
      const onLoad = () => {
        navigator.serviceWorker.register("/sw.js")
          .then((reg) => {
            // Prüfe alle 60 Sekunden auf Updates
            intervalId = setInterval(() => {
              reg.update().catch(() => {});
            }, 60000);
          })
          .catch(() => {});
      };
      
      window.addEventListener("load", onLoad);

      // Aktualisiere die Seite automatisch, wenn ein neuer Service Worker die Kontrolle übernimmt
      const onControllerChange = () => {
        window.location.reload();
      };
      navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

      return () => {
        window.removeEventListener("load", onLoad);
        navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
        if (intervalId) clearInterval(intervalId);
      };
    }
  }, []);
  return null;
}
