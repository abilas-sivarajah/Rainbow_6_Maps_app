// Offizielle Rainbow-Six-News für die Startseite.
//
// Primärquelle ist Ubisofts öffentliche News-API (nimbus.ubisoft.com) — die
// gleiche, die die offizielle Siege-News-Seite nutzt. Sie unterstützt Locales
// (de-de/en-us/fr-fr) und liefert Titel, Teaser, Thumbnail und Link. Das
// Format ist nicht offiziell dokumentiert, daher wird hier ALLES defensiv
// geparst. Fällt Ubisoft aus, springt Steams News-API ein (nur Englisch).

import type { Language } from '@/data/i18n';

export interface NewsItem {
  id: string;
  title: string;
  abstract: string;
  url: string;
  image: string;
  date: string; // ISO
  category: string;
}

const UBI_LOCALES: Record<Language, string> = {
  de: 'de-de',
  en: 'en-us',
  fr: 'fr-fr',
};

const STEAM_APP_ID = 359550; // Rainbow Six Siege

function newsOverviewUrl(lang: Language): string {
  return `https://www.ubisoft.com/${UBI_LOCALES[lang]}/game/rainbow-six/siege/news-updates`;
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

/** Text kann als String oder als { html } / { text } kommen. */
function looseText(v: unknown): string {
  if (typeof v === 'string') return v;
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    return str(o.text) || stripHtml(str(o.html));
  }
  return '';
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Thumbnail kann als String-URL oder als { url } kommen. */
function looseImage(v: unknown): string {
  if (typeof v === 'string') return v;
  if (v && typeof v === 'object') return str((v as Record<string, unknown>).url);
  return '';
}

function articleUrl(button: unknown, lang: Language): string {
  const raw =
    button && typeof button === 'object'
      ? str((button as Record<string, unknown>).buttonUrl)
      : '';
  if (!raw) return newsOverviewUrl(lang);
  if (/^https?:\/\//.test(raw)) return raw;
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return `https://www.ubisoft.com/${UBI_LOCALES[lang]}/game/rainbow-six/siege${path}`;
}

async function fetchUbisoftNews(lang: Language, limit: number): Promise<NewsItem[]> {
  const params = new URLSearchParams({
    categoriesFilter: 'all',
    mediaFilter: 'news',
    limit: String(limit),
    skip: '0',
    locale: UBI_LOCALES[lang],
    tags: 'BR-rainbow-six GA-siege',
  });
  const res = await fetch(`https://nimbus.ubisoft.com/api/v1/items?${params}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (r6-codex-wiki)' },
    // News ändern sich selten — Next darf die Antwort 30 Min. cachen.
    next: { revalidate: 1800 },
  });
  if (!res.ok) throw new Error(`Ubisoft news HTTP ${res.status}`);
  const data = (await res.json()) as { items?: unknown[] };
  const items = Array.isArray(data.items) ? data.items : [];

  return items
    .filter((it): it is Record<string, unknown> => !!it && typeof it === 'object')
    .map((it, i) => ({
      id: str(it.id) || `ubi-${i}`,
      title: looseText(it.title),
      abstract: looseText(it.abstract),
      url: articleUrl(it.button, lang),
      image: looseImage(it.thumbnail),
      date: str(it.publishedAt) || str(it.date),
      category: Array.isArray(it.categories) ? str(it.categories[0]) : str(it.type),
    }))
    .filter((n) => n.title);
}

interface SteamNewsItem {
  gid?: string;
  title?: string;
  url?: string;
  contents?: string;
  date?: number;
  feedlabel?: string;
}

async function fetchSteamNews(limit: number): Promise<NewsItem[]> {
  const url =
    `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/` +
    `?appid=${STEAM_APP_ID}&count=${limit}&maxlength=300&format=json`;
  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) throw new Error(`Steam news HTTP ${res.status}`);
  const data = (await res.json()) as { appnews?: { newsitems?: SteamNewsItem[] } };
  const items = data.appnews?.newsitems ?? [];
  return items
    .map((it, i) => ({
      id: str(it.gid) || `steam-${i}`,
      title: str(it.title),
      abstract: stripHtml(str(it.contents)),
      url: str(it.url),
      image: '',
      date: it.date ? new Date(it.date * 1000).toISOString() : '',
      category: str(it.feedlabel),
    }))
    .filter((n) => n.title && n.url);
}

/** Neueste offizielle News; Ubisoft zuerst, Steam als Fallback. */
export async function getNews(lang: Language, limit = 6): Promise<NewsItem[]> {
  try {
    const items = await fetchUbisoftNews(lang, limit);
    if (items.length > 0) return items;
  } catch (err) {
    console.error('[r6-news] Ubisoft news failed, trying Steam:', err);
  }
  return fetchSteamNews(limit);
}

/** Mock-News für den Demo-Modus (R6_DEMO=1) — kein Netzwerk nötig. */
export function getDemoNews(lang: Language): NewsItem[] {
  const overview = newsOverviewUrl(lang);
  return [
    {
      id: 'demo-1',
      title: 'Y11S2.2 Mid-Season Patch Notes',
      abstract:
        'Jäger wird wieder ein 3-Speed-Operator, Wamai erhält Nitro Cell und Deployable Shield, Zofia bekommt je drei Granaten.',
      url: overview,
      image: '',
      date: '2026-07-14T13:00:00.000Z',
      category: 'patch-notes',
    },
    {
      id: 'demo-2',
      title: 'Operation System Override jetzt live',
      abstract: 'Die neue Season bringt Ranked 3.0, einen überarbeiteten Battle Pass und mehr.',
      url: overview,
      image: '',
      date: '2026-06-10T15:00:00.000Z',
      category: 'game-updates',
    },
    {
      id: 'demo-3',
      title: 'Community-Update: Anti-Cheat-Report Q2',
      abstract: 'Neue Maßnahmen gegen Cheating und die aktuellen Ban-Zahlen im Überblick.',
      url: overview,
      image: '',
      date: '2026-05-28T10:00:00.000Z',
      category: 'community',
    },
  ];
}
