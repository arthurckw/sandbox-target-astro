/**
 * Thin wrapper around the shared PulseFeedIsland that adds Supabase Realtime
 * for the humanjudge.com pulse page. Lives in astro-site/ (not shared/) so the
 * supabase-js import resolves against this project's node_modules.
 *
 * Campaign shells use the shared PulseFeedIsland directly (no realtime).
 */
import { useState, useEffect } from 'react';
import PulseFeedIsland from '../../../shared/components/PulseFeedIsland';
import { subscribeToPulseFeed } from './PulseRealtime';

interface Claim {
  slug: string | null;
  display_title: string;
  feedback: string | null;
  model_name: string;
  benchmark_name: string | null;
  benchmark_id: string | null;
  reviewer_name: string | null;
  verdict: string;
  created_at: string;
}

interface Arena {
  evaluation_id: string;
  name: string;
  slug: string;
}

interface Props {
  initialClaims: Claim[];
  arenas: Arena[];
  totalClaims: number;
  apiBase?: string;
}

export default function PulseFeedIslandWithRealtime(props: Props) {
  const [liveClaims, setLiveClaims] = useState<any[]>([]);

  useEffect(() => {
    const cleanup = subscribeToPulseFeed((claim) => {
      setLiveClaims(prev => [claim, ...prev].slice(0, 10));
    });
    return cleanup;
  }, []);

  return <PulseFeedIsland {...props} liveClaims={liveClaims} />;
}
