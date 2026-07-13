"use client";

import { useLanguage } from "@/context/LanguageContext";
import { OperatorBrowser } from "@/components/OperatorBrowser";

export function OperatorsPageClient() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-black">{t("ops.title")}</h1>
      <p className="mb-8 text-muted">
        {t("ops.subtitle")}
      </p>
      <OperatorBrowser />
    </div>
  );
}
