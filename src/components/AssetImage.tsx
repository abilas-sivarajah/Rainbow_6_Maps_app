"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Rendert ein Bild aus dem public-Ordner. Ist die Datei (noch) nicht vorhanden
 * oder schlägt das Laden fehl, wird `fallback` angezeigt. So funktioniert die
 * UI schon ohne Bilder und zeigt automatisch die echten Grafiken, sobald der
 * Bilderordner ergänzt wurde.
 */
export function AssetImage({
  src,
  alt,
  className,
  fallback = null,
}: {
  src?: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // Falls das Bild bereits VOR der Hydration fehlgeschlagen ist (404), feuert
  // das onError-Event nicht mehr – daher hier nachträglich prüfen.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setFailed(true);
    }
  }, [src]);

  if (!src || failed) return <>{fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
