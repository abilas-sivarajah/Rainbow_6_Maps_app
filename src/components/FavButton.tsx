"use client";

import { toggleFavorite, useIsFavorite, type FavType } from "@/lib/favorites";
import { useLanguage } from "@/context/LanguageContext";

export function FavButton({
  type,
  id,
  className = "",
}: {
  type: FavType;
  id: string;
  className?: string;
}) {
  const fav = useIsFavorite(type, id);
  const { t } = useLanguage();

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(type, id);
      }}
      aria-label={fav ? t("fav.remove") : t("fav.add")}
      title={fav ? t("fav.remove") : t("fav.add")}
      className={`grid h-8 w-8 place-items-center rounded-md transition-colors ${
        fav ? "text-accent" : "text-muted hover:text-text"
      } ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={fav ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </button>
  );
}
