"use client";

// "App installieren"-Option für die Kopfzeile. Die Seite ist bereits eine
// vollwertige PWA (Manifest + Service Worker + Icons) — dieser Button macht
// die Installation nur sichtbar:
//   - Chrome/Edge/Android: fängt `beforeinstallprompt` ab und öffnet beim
//     Klick den nativen Installations-Dialog.
//   - iOS Safari (kennt kein beforeinstallprompt) & andere Browser: zeigt
//     eine kurze Anleitung ("Teilen -> Zum Home-Bildschirm").
//   - Bereits installiert (Standalone-Modus): Button wird ausgeblendet.

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useMounted } from "@/lib/useMounted";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // iPadOS 13+ meldet sich als "Macintosh" mit Touch-Unterstützung.
  return (
    /iPhone|iPad|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  );
}

export function InstallAppButton({ variant }: { variant: "icon" | "menu" }) {
  const { t } = useLanguage();
  const mounted = useMounted();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  // Läuft die Seite bereits als installierte App, ist der Button überflüssig.
  const [installed, setInstalled] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(display-mode: standalone)").matches,
  );
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Bis zum Mount nichts rendern (SSR-Markup bleibt so identisch zum ersten
  // Client-Render, obwohl `installed` nur im Browser ermittelt werden kann).
  if (!mounted || installed) return null;

  const onClick = async () => {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setDeferred(null);
      return;
    }
    setShowHelp(true);
  };

  const icon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );

  return (
    <>
      {variant === "icon" ? (
        <button
          onClick={onClick}
          aria-label={t("pwa.install")}
          title={t("pwa.install")}
          className="grid h-9 w-9 place-items-center rounded-md text-muted transition-colors hover:bg-surface hover:text-text"
        >
          {icon}
        </button>
      ) : (
        <button
          onClick={onClick}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-semibold text-muted transition-colors hover:bg-surface hover:text-text"
        >
          {icon}
          <span>{t("pwa.install")}</span>
        </button>
      )}

      {showHelp ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold">
              {icon}
              {t("pwa.howTitle")}
            </h3>
            <p className="text-sm leading-relaxed text-muted">
              {isIos() ? t("pwa.iosHint") : t("pwa.genericHint")}
            </p>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-5 w-full rounded-lg bg-accent px-4 py-2 font-semibold text-bg transition-colors hover:bg-accent-soft"
            >
              {t("pwa.close")}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
