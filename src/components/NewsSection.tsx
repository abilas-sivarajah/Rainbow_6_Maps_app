'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import type { NewsItem } from '@/lib/news';

const LOCALE_MAP: Record<string, string> = { de: 'de-DE', en: 'en-US', fr: 'fr-FR' };

function formatDate(iso: string, lang: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(LOCALE_MAP[lang] ?? 'de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Aktuelle offizielle Ubisoft-News (Patchnotes etc.) für die Startseite.
 * Lädt /api/news in der UI-Sprache; bei Fehler/leerer Antwort wird die
 * Sektion einfach nicht gerendert (die Startseite bleibt sauber).
 */
export default function NewsSection() {
  const { t, language } = useLanguage();
  const [items, setItems] = useState<NewsItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    fetch(`/api/news?lang=${language}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { items?: NewsItem[] }) => {
        if (!cancelled) setItems(Array.isArray(data.items) ? data.items : []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [language]);

  // Noch am Laden oder nichts bekommen → nichts anzeigen.
  if (!items || items.length === 0) return null;

  const overviewUrl = `https://www.ubisoft.com/${
    { de: 'de-de', en: 'en-us', fr: 'fr-fr' }[language]
  }/game/rainbow-six/siege/news-updates`;

  return (
    <section className="mt-4">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            {t('home.news.kicker')}
          </p>
          <h2 className="text-2xl font-black">{t('home.news.title')}</h2>
        </div>
        <a
          href={overviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-sm font-semibold text-accent hover:underline"
        >
          {t('home.news.all')} →
        </a>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 6).map((n) => (
          <a
            key={n.id}
            href={n.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:bg-surface-2"
          >
            {n.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={n.image}
                alt=""
                loading="lazy"
                className="h-36 w-full object-cover"
              />
            ) : null}
            <div className="flex flex-1 flex-col p-4">
              <div className="mb-1 text-xs text-muted">
                {formatDate(n.date, language)}
              </div>
              <div className="font-bold leading-snug group-hover:text-accent">
                {n.title}
              </div>
              {n.abstract ? (
                <p className="mt-1 line-clamp-2 text-sm text-muted">{n.abstract}</p>
              ) : null}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
