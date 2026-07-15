import { notFound } from 'next/navigation';

import { ReplaysPageClient } from '@/components/ReplaysPageClient';
import { REPLAYS_ENABLED } from '@/lib/features';

export const metadata = {
  title: 'Match Replays – R6 Codex',
  description:
    'Rainbow Six Siege Match-Replays (.rec) lokal im Browser analysieren – Teams, Roster, Rundenverlauf und Kill-Timeline. Nichts wird hochgeladen.',
};

export default function ReplaysPage() {
  if (!REPLAYS_ENABLED) notFound();
  return <ReplaysPageClient />;
}
