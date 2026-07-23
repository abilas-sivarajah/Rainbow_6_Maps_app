// Selbst-generierte, hostunabhängige SVG-Rang-Badges. Dienen als Datenquelle
// UND als Fallback, falls externe Rang-Bilder (z. B. r6data.com) im Browser
// nicht laden (Hotlink-Schutz/404/offline). Reine Funktion → client- und
// serverseitig nutzbar.

const TIER_COLORS: Record<string, string> = {
  Unranked: '#6b7280',
  Copper: '#b4764a',
  Bronze: '#cd7f32',
  Silver: '#9aa7b5',
  Gold: '#e8b13a',
  Platinum: '#28aab4',
  Emerald: '#2fb56a',
  Diamond: '#5bc8ff',
  Champions: '#d14fd1',
};

/** Baut eine in sich geschlossene SVG-Rang-Badge (kein externes Hosting nötig). */
export function rankBadge(name: string): string {
  const tier = (name || 'Unranked').split(' ')[0];
  const color = TIER_COLORS[tier] ?? '#6b7280';
  const label =
    name === 'Unranked' || name === 'Champions' || !name.includes(' ')
      ? tier[0]
      : `${tier[0]}${name.split(' ')[1] ?? ''}`;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="#0b0e14"/>` +
    `</linearGradient></defs>` +
    `<path d="M32 4 L58 14 V34 C58 48 46 57 32 62 C18 57 6 48 6 34 V14 Z" fill="url(#g)" stroke="${color}" stroke-width="2"/>` +
    `<text x="32" y="40" font-family="Arial" font-size="20" font-weight="bold" fill="#fff" text-anchor="middle">${label}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
