import { notFound } from 'next/navigation';

import { StatsPageClient } from '@/components/StatsPageClient';
import { TRACKER_ENABLED } from '@/lib/features';

export default function StatsPage() {
  if (!TRACKER_ENABLED) notFound();
  return <StatsPageClient />;
}
