"use client";

import { useLanguage } from "@/context/LanguageContext";

export function SiteFooter() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-border py-6 text-center text-sm text-muted">
      {t("footer.text")}
    </footer>
  );
}
