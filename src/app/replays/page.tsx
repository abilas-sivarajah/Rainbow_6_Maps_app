import { notFound } from 'next/navigation';

import { ReplaysPageClient } from '@/components/ReplaysPageClient';
import { TRACKER_ENABLED } from '@/lib/features';

export const metadata = {
  title: 'Match Replays – R6 Codex',
  description:
    'Rainbow Six Siege Match-Replays (.rec) hochladen und analysieren – Karte, Modus, Rundenverlauf und Ergebnis.',
};

export default function ReplaysPage() {
  // Teil des Tracker-Featuresets (gleicher R6Data-Key) — gemeinsam schaltbar.
  if (!TRACKER_ENABLED) notFound();
  return <ReplaysPageClient />;
}
