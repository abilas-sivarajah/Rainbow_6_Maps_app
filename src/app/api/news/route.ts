import { NextResponse } from 'next/server';

import { NEWS_ENABLED } from '@/lib/features';
import { getDemoNews, getNews } from '@/lib/news';
import type { Language } from '@/data/i18n';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// News ändern sich selten — großzügig cachen, schont Ubisofts API.
const CACHE_HEADER = 's-maxage=1800, stale-while-revalidate=3600';

const VALID_LANGS: Language[] = ['de', 'en', 'fr'];

export async function GET(request: Request) {
  if (!NEWS_ENABLED) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const langParam = searchParams.get('lang') ?? 'de';
  const lang: Language = (VALID_LANGS as string[]).includes(langParam)
    ? (langParam as Language)
    : 'de';

  if (process.env.R6_DEMO === '1') {
    return NextResponse.json(
      { items: getDemoNews(lang) },
      { headers: { 'Cache-Control': CACHE_HEADER } },
    );
  }

  try {
    const items = await getNews(lang, 6);
    return NextResponse.json(
      { items },
      { headers: { 'Cache-Control': CACHE_HEADER } },
    );
  } catch (err) {
    console.error('[r6-news] news fetch failed:', err);
    return NextResponse.json(
      { error: 'News konnten nicht geladen werden.' },
      { status: 502 },
    );
  }
}
