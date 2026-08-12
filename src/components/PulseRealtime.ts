/**
 * Pulse Realtime — Supabase websocket subscription for live human_evaluations inserts.
 * Loaded ONLY when realtime is enabled (via dynamic import) so the supabase URL
 * + anon key never end up in bundles where realtime is disabled.
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oodfmtbnkumtfhcdzqoi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZGZtdGJua3VtdGZoY2R6cW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MDcxNjksImV4cCI6MjA2MjA4MzE2OX0.AlJSivHdcv7cRZCiG34mgzHefX6geqjtNG5Y7STYSMo';

type LiveClaim = {
  slug: string | null;
  verdict: string;
  feedback: string | null;
  model_name: string;
  benchmark_name: string | null;
  reviewer_name: string | null;
  created_at: string;
};

export function subscribeToPulseFeed(onInsert: (claim: LiveClaim) => void): () => void {
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const channel = sb.channel('pulse-feed').on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'human_evaluations' },
    (payload: any) => {
      const row = payload.new;
      if (row.is_hidden || row.verdict_boolean_pass_flag == null) return;
      const hasComment = row.feedback && row.feedback.length >= 50 && row.slug;
      onInsert({
        slug: hasComment ? row.slug : null,
        verdict: row.verdict_boolean_pass_flag ? 'pass' : 'flag',
        feedback: hasComment ? row.feedback : null,
        model_name: row.model_name || '',
        benchmark_name: row.benchmark_name || null,
        reviewer_name: row.reviewer_name || null,
        created_at: row.created_at,
      });
    },
  ).subscribe();

  return () => { channel?.unsubscribe(); };
}
