/**
 * ClaimPage React Island — interactive parts of the claim page.
 * Rendered inside Astro SSR page with client:load.
 *
 * Handles: search bar, modals, GA tracking, Supabase Realtime feed.
 * Static content (claim, stats, output, leaderboard) is rendered by Astro.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

// GA helper
declare global { interface Window { gtag?: (...args: unknown[]) => void } }
function track(action: string, params?: Record<string, string | number>) {
  window.gtag?.('event', action, { event_category: 'claim_page', ...params });
}

const btn = 'inline-flex items-center justify-center rounded-md bg-surface border border-border-emphasis px-5 py-2.5 text-sm font-medium text-secondary shadow-xs transition-[color,background-color,border-color,box-shadow] duration-150 hover:bg-surface-elevated hover:text-primary hover:border-border-bright focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent-soft active:scale-[0.98]';
const btnPrimary = 'inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-on shadow-xs transition-[color,background-color,box-shadow] duration-150 hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent-soft active:bg-accent-hover active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50';

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'grandjury.xyz' || window.location.hostname === 'humanjudge.com'))
  ? 'https://grandjury-server.onrender.com' : 'http://127.0.0.1:8001';

interface ReviewItem {
  slug: string | null;
  reviewer_name: string | null;
  verdict: string;
  flag_category: string | null;
  feedback: string | null;
  created_at: string;
}

interface CrossModelItem {
  model_name: string;
  model_slug: string | null;
  claim_slug: string | null;
  output_teaser: string;
  pass_rate: number | null;
  total_votes: number;
  latest_reviewer: string | null;
  latest_verdict: string | null;
  latest_time: string | null;
}

interface Props {
  inputText: string;
  traceId?: string;
  claimSlug?: string;
  evaluationId?: string;
  recentReviews?: ReviewItem[];
  crossModel?: CrossModelItem[];
}

interface LiveVote {
  id: string;
  verdict: 'pass' | 'flag';
  flag_category: string | null;
  feedback: string | null;
  reviewer_name: string | null;
}

export default function ClaimPageIsland({ inputText, traceId, claimSlug, evaluationId, recentReviews = [], crossModel = [] }: Props) {
  const [liveVotes, setLiveVotes] = useState<LiveVote[]>([]);

  // Supabase Realtime subscription for live votes
  useEffect(() => {
    if (!traceId) return;
    let channel: any = null;
    (async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const sb = createClient(
          'https://oodfmtbnkumtfhcdzqoi.supabase.co',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZGZtdGJua3VtdGZoY2R6cW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MDcxNjksImV4cCI6MjA2MjA4MzE2OX0.AlJSivHdcv7cRZCiG34mgzHefX6geqjtNG5Y7STYSMo'
        );
        channel = sb.channel(`votes-${traceId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'human_evaluations',
            filter: `trace_id=eq.${traceId}`,
          }, (payload: any) => {
            const row = payload.new;
            if (row.is_hidden || row.verdict_boolean_pass_flag == null || !row.feedback || row.feedback.length < 50) return;
            setLiveVotes(prev => [{
              id: row.id,
              verdict: row.verdict_boolean_pass_flag ? 'pass' : 'flag',
              flag_category: row.flag_category,
              feedback: row.feedback,
              reviewer_name: row.reviewer_name || null,
            }, ...prev].slice(0, 5));
          })
          .subscribe();
      } catch {}
    })();
    return () => { channel?.unsubscribe(); };
  }, [traceId]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [inputExpanded, setInputExpanded] = useState(false);
  const [showSubscribe, setShowSubscribe] = useState<string | false>(false);
  const [showReviewerSignup, setShowReviewerSignup] = useState(false);
  const [showDevSignup, setShowDevSignup] = useState<'add' | 'create' | null>(null);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);
  const [waitlistDone, setWaitlistDone] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const submitWaitlist = async (type: string, position: string) => {
    if (!waitlistEmail.trim() || !waitlistEmail.includes('@')) return;
    setWaitlistSubmitting(true);
    try {
      await fetch(`${API_BASE}/api/v1/claims/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: waitlistEmail.trim(), waitlist_type: type, position, page_url: window.location.href }),
      });
      track('waitlist_signup', { type, position });
      setWaitlistDone(type);
    } catch {}
    setWaitlistSubmitting(false);
  };

  const resetWaitlist = () => { setWaitlistEmail(''); setWaitlistDone(null); };

  // Click outside to dismiss search
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Bridge: listen for Astro button events to open modals
  useEffect(() => {
    const onSubscribe = (e: Event) => setShowSubscribe((e as CustomEvent).detail || 'subscribe_modal');
    const onReviewer = () => setShowReviewerSignup(true);
    const onDev = (e: Event) => setShowDevSignup((e as CustomEvent).detail || 'add');
    document.addEventListener('claim:subscribe', onSubscribe);
    document.addEventListener('claim:reviewer', onReviewer);
    document.addEventListener('claim:dev', onDev);
    return () => {
      document.removeEventListener('claim:subscribe', onSubscribe);
      document.removeEventListener('claim:reviewer', onReviewer);
      document.removeEventListener('claim:dev', onDev);
    };
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) { setSearchResults(null); setSearching(false); return; }
    track('search', { query: query.trim() });
    setSearching(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/claims/search?text=${encodeURIComponent(query.trim())}&limit=5`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results.map((r: any) => ({
          modelName: r.model_name,
          inputPreview: r.input_preview,
          outputPreview: r.output_preview,
          feedback: r.feedback_headline,
          reviewerName: r.reviewer_name,
          flagCount: r.flag_count,
          totalVotes: r.total_votes,
          matchType: r.match_type,
          slug: '/sandbox/fuji', // TODO: link to real claim page
        })));
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchResults([]);
    }
    setSearching(false);
  }, []);

  // Debounced search — triggers 300ms after user stops typing
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!searchFocused) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchText.trim()) { setSearchResults(null); return; }
    debounceRef.current = setTimeout(() => handleSearch(searchText), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchText, searchFocused, handleSearch]);

  return (
    <>
      {/* STICKY: home strip + input/search */}
      <div className="sticky top-0 z-40 bg-surface shadow-[0_4px_12px_rgba(0,0,0,0.3)]" ref={searchRef}>
        {/* Home strip */}
        <div className="pt-3 pb-1 flex justify-center">
          <a href="/pulse" className="flex items-center gap-1.5 text-xs text-tertiary uppercase tracking-[0.2em] font-mono hover:text-secondary transition-[color] duration-150">
            <span>HumanJudge</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
            </svg>
            <span>Pulse Check</span>
          </a>
        </div>
        {/* Search / Input */}
        <div className="px-8 md:px-16 pb-3">
        <div className="relative">
          {searchFocused || searchText ? (
            <div>
              <div className="text-[10px] text-tertiary uppercase tracking-widest font-mono mb-1"><button onClick={() => { setSearchFocused(false); setSearchText(''); setSearchResults(null); }} className="uppercase hover:text-secondary transition-[color] duration-150 cursor-pointer">Input</button> / <span className="text-secondary">SEARCH</span></div>
              <div className="flex items-center gap-2">
                <input
                  id="claim-search"
                  type="text"
                  value={searchText}
                  onChange={(e) => { setSearchText(e.target.value); setSearchResults(null); }}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => { if (!searchText) setTimeout(() => setSearchFocused(false), 200); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                  placeholder="Type or paste your AI response..."
                  autoFocus
                  className="flex-1 bg-transparent text-sm text-primary font-mono placeholder:text-tertiary focus:outline-none caret-accent"
                />
                {searchText && !searching && (
                  <button onClick={(e) => { e.stopPropagation(); setSearchText(''); setSearchResults(null); setSearchFocused(false); }} className="text-tertiary hover:text-secondary text-xs">✕</button>
                )}
                {searching && <span className="text-tertiary text-xs font-mono animate-pulse">Searching...</span>}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-[10px] text-tertiary uppercase tracking-widest font-mono mb-1"><span className="text-secondary">INPUT</span> / <button onClick={() => { setSearchFocused(true); setTimeout(() => document.getElementById('claim-search')?.focus(), 50); }} className="uppercase hover:text-secondary transition-[color] duration-150 cursor-pointer">Search</button></div>
              <div className="flex items-start gap-3">
                <button onClick={() => setInputExpanded(!inputExpanded)} className="flex-1 text-left min-w-0">
                  <p className={`text-sm text-primary font-mono ${inputExpanded ? '' : 'line-clamp-1'}`}>{inputText}</p>
                </button>
              </div>
            </div>
          )}
          {/* Results dropdown */}
          {searchResults && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full bg-surface border border-t-0 border-border-emphasis shadow-xl shadow-black/30 z-50">
              {searchResults.map((r: any, i: number) => {
                const isOutputMatch = r.matchType === 'ilike_output';
                return (
                  <a key={i} href={r.slug} className="block px-4 py-3 hover:bg-surface-elevated transition-[background-color] duration-100 border-b border-border-emphasis last:border-0">
                    <p className={`text-xs line-clamp-1 ${isOutputMatch ? 'text-primary/40' : 'text-secondary'}`}>{r.inputPreview}</p>
                    <p className={`text-xs line-clamp-1 mt-0.5 ${isOutputMatch ? 'text-secondary' : 'text-primary/40'}`}>{r.outputPreview}</p>
                    {r.feedback && (
                      <p className="text-[11px] text-tertiary line-clamp-1 mt-1">
                        {r.reviewerName && <span className="text-secondary">{r.reviewerName}:</span>} "{r.feedback}"
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-secondary font-medium">{r.modelName}</span>
                      {r.totalVotes > 0 && <span className="text-[10px] font-mono text-tertiary">{r.flagCount} flagged · {r.totalVotes} votes</span>}
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Feeds — rendered into #claim-feeds via portal */}
      {typeof document !== 'undefined' && document.getElementById('claim-feeds') && createPortal(
        <>
          {/* Latest flags on this response */}
          <div className="pb-4">
            <div className="text-sm font-medium text-primary mb-3">Latest flags on this response</div>
            <div className="space-y-2">
              {/* Live votes from Realtime */}
              {liveVotes.map((v) => (
                <div key={`live-${v.id}`} className="px-3 py-2.5 rounded-md bg-surface animate-[fadeIn_0.3s_ease-in]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse shrink-0" title="Live" />
                    <span className="text-secondary text-[11px] font-medium">{v.reviewer_name || 'Reviewer'}</span>
                    <span className={`text-[9px] px-1 py-0.5 rounded-sm ${v.verdict === 'flag' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                      {v.verdict}
                    </span>
                    {v.flag_category && <span className="text-[9px] text-tertiary">{v.flag_category}</span>}
                    <span className="text-tertiary text-[10px] ml-auto font-mono">just now</span>
                  </div>
                  {v.feedback && <p className="text-primary/70 text-xs leading-relaxed pl-4 line-clamp-1">{v.feedback}</p>}
                </div>
              ))}
              {/* Server-rendered reviews — last item blurred */}
              {recentReviews.slice(0, 5 - liveVotes.length).map((r, i, arr) => {
                const isLast = i === arr.length - 1 && arr.length > 1;
                return (
                  <div
                    key={`review-${i}`}
                    className={`relative px-3 py-2.5 rounded-md bg-surface ${isLast ? 'select-none cursor-pointer' : 'hover:bg-surface transition-[background-color] duration-150'}`}
                    style={isLast ? { filter: 'blur(3px)' } : undefined}
                    onClick={isLast ? () => { document.dispatchEvent(new CustomEvent('claim:subscribe', { detail: 'right_feed_blurred_review' })); } : undefined}
                  >
                    {!isLast ? (
                      <a href={r.slug ? `/claims/${r.slug}` : '#'} className="block">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 rounded-full bg-bg flex items-center justify-center text-[9px] text-secondary font-medium shrink-0">
                            {(r.reviewer_name || 'A').charAt(0)}
                          </div>
                          <span className="text-secondary text-[11px] font-medium">{r.reviewer_name || 'Anonymous'}</span>
                          <span className={`text-[9px] px-1 py-0.5 rounded-sm ${r.verdict === 'flag' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                            {r.verdict}
                          </span>
                          {r.flag_category && <span className="text-[9px] text-tertiary">{r.flag_category}</span>}
                          <span className="text-tertiary text-[10px] ml-auto font-mono">{timeAgo(r.created_at)}</span>
                        </div>
                        {r.feedback && <p className="text-primary/70 text-xs leading-relaxed pl-7 line-clamp-1">{r.feedback}</p>}
                      </a>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 rounded-full bg-bg flex items-center justify-center text-[9px] text-secondary font-medium shrink-0">
                            {(r.reviewer_name || 'A').charAt(0)}
                          </div>
                          <span className="text-secondary text-[11px] font-medium">{r.reviewer_name || 'Anonymous'}</span>
                          <span className={`text-[9px] px-1 py-0.5 rounded-sm ${r.verdict === 'flag' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                            {r.verdict}
                          </span>
                        </div>
                        {r.feedback && <p className="text-primary/70 text-xs leading-relaxed pl-7 line-clamp-1">{r.feedback}</p>}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cross-model comparison */}
          {crossModel.length > 0 && (
            <div className="pb-4">
              <div className="text-sm font-medium text-primary mb-3">Latest flags on other AIs (same input)</div>
              <div className="space-y-2">
                {crossModel.map((cm, i, arr) => {
                  const isLast = i === arr.length - 1 && arr.length > 1;
                  const inner = (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 rounded-full bg-bg flex items-center justify-center text-[9px] text-secondary font-medium shrink-0">
                          {cm.model_name.charAt(0)}
                        </div>
                        <span className="text-secondary text-[11px] font-medium">{cm.model_name}</span>
                        {cm.latest_verdict && (
                          <span className={`text-[9px] px-1 py-0.5 rounded-sm ${cm.latest_verdict === 'flag' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                            {cm.latest_verdict}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-secondary">{cm.pass_rate != null ? `${cm.pass_rate}%` : '—'}</span>
                        <span className="text-tertiary text-[10px] ml-auto font-mono">{cm.latest_time ? timeAgo(cm.latest_time) : `${cm.total_votes} votes`}</span>
                      </div>
                      <p className="text-primary/70 text-xs leading-relaxed pl-7 line-clamp-1">{cm.output_teaser}</p>
                    </>
                  );
                  return isLast ? (
                    <div
                      key={`cross-${i}`}
                      className="px-3 py-2.5 rounded-md bg-surface select-none cursor-pointer"
                      style={{ filter: 'blur(3px)' }}
                      onClick={() => document.dispatchEvent(new CustomEvent('claim:subscribe', { detail: 'right_feed_blurred_crossmodel' }))}
                    >{inner}</div>
                  ) : (
                    <a
                      key={`cross-${i}`}
                      href={`/claims/${cm.claim_slug}`}
                      className="block px-3 py-2.5 rounded-md bg-surface hover:bg-surface transition-[background-color] duration-150"
                    >{inner}</a>
                  );
                })}
              </div>
            </div>
          )}
        </>,
        document.getElementById('claim-feeds')!
      )}

      {/* Modals — subscribe, reviewer signup, developer signup */}
      {showSubscribe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => { setShowSubscribe(false); resetWaitlist(); }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-bg border border-border-emphasis rounded-xl shadow-2xl shadow-black/40 w-full max-w-lg mx-4 p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowSubscribe(false)} className="absolute top-4 right-4 text-tertiary hover:text-secondary text-sm">✕</button>
            <div className="text-[10px] text-accent uppercase tracking-widest font-bold mb-2">Beta</div>
            <h2 className="text-xl font-bold text-primary mb-1">Pulse Check — All Access</h2>
            <p className="text-tertiary text-sm mb-6">Stay ahead of AI quality shifts. One subscription, everything included.</p>

            {/* Pricing card */}
            <div className="border border-border-emphasis rounded-lg p-5 mb-6">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-black font-mono text-primary">$0</span>
                <span className="text-sm text-tertiary line-through">$12/mo</span>
              </div>
              <p className="text-xs text-tertiary mb-4">Free during founding period. Cancel anytime.</p>
              <ul className="space-y-1.5 text-xs text-secondary">
                <li>✓ Real-time alerts when rankings change</li>
                <li>✓ New evaluation results as they drop</li>
                <li>✓ AI degradation warnings</li>
                <li>✓ Reviewer insights & deep analysis</li>
                <li>✓ Full data export (CSV, API, MCP)</li>
                <li>✓ All channels: Email, Telegram, Slack, MCP, Push</li>
              </ul>
            </div>

            <div className="space-y-3">
              {waitlistDone === 'premium_subscriber' ? (
                <p className="text-success text-sm text-center py-3">You're on the list! We'll be in touch.</p>
              ) : (
                <>
                  <input type="email" placeholder="your@email.com" value={waitlistEmail} onChange={(e) => setWaitlistEmail(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submitWaitlist('premium_subscriber', typeof showSubscribe === 'string' ? showSubscribe : 'subscribe_modal'); }} className="w-full rounded-md border border-border-emphasis bg-surface px-4 py-3 text-sm text-primary placeholder:text-tertiary focus:outline-none focus:border-accent" />
                  <button onClick={() => submitWaitlist('premium_subscriber', typeof showSubscribe === 'string' ? showSubscribe : 'subscribe_modal')} disabled={waitlistSubmitting} className={`w-full ${btnPrimary} !py-3`}>{waitlistSubmitting ? 'Joining...' : 'Get All Access'}</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showReviewerSignup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowReviewerSignup(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-bg border border-border-emphasis rounded-xl shadow-2xl shadow-black/40 w-full max-w-md mx-4 p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowReviewerSignup(false)} className="absolute top-4 right-4 text-tertiary hover:text-secondary text-sm">✕</button>
            <h2 className="text-xl font-bold text-primary mb-1">Become a Reviewer</h2>
            <p className="text-tertiary text-sm mb-6">Help shape AI quality standards</p>
            <div className="space-y-3">
              <a href={`/auth?track=empowerment${evaluationId ? `&project=${evaluationId}` : ''}`} className={`w-full ${btnPrimary} !py-3 text-center`} onClick={() => track('cta_click', { cta: 'reviewer_apply' })}>Apply Now</a>
            </div>
          </div>
        </div>
      )}

      {showDevSignup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => { setShowDevSignup(null); resetWaitlist(); }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-bg border border-border-emphasis rounded-xl shadow-2xl shadow-black/40 w-full max-w-md mx-4 p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowDevSignup(null)} className="absolute top-4 right-4 text-tertiary hover:text-secondary text-sm">✕</button>
            <h2 className="text-xl font-bold text-primary mb-1">Register as Developer</h2>
            <p className="text-tertiary text-sm mb-6">Get human feedback on your AI — register your model after sign-in</p>
            <div className="space-y-3">
              {waitlistDone === 'developer' ? (
                <p className="text-success text-sm text-center py-3">You're on the list! We'll be in touch.</p>
              ) : (
                <>
                  <input type="email" placeholder="Enter your work email" value={waitlistEmail} onChange={(e) => setWaitlistEmail(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submitWaitlist('developer', `dev_modal_${showDevSignup}`); }} className="w-full rounded-md border border-border-emphasis bg-surface px-4 py-3 text-sm text-primary placeholder:text-tertiary focus:outline-none focus:border-accent" />
                  <button onClick={() => submitWaitlist('developer', `dev_modal_${showDevSignup}`)} disabled={waitlistSubmitting} className={`w-full ${btnPrimary} !py-3`}>{waitlistSubmitting ? 'Joining...' : 'Continue'}</button>
                </>
              )}
            </div>
            <p className="text-tertiary text-[11px] mt-4 leading-relaxed">Join the waitlist — we'll notify you when developer access opens.</p>
          </div>
        </div>
      )}

      {/* Expose modal triggers for Astro page buttons */}
      <div id="claim-island-triggers" className="hidden"
        data-subscribe={String(showSubscribe)}
        data-reviewer={String(showReviewerSignup)}
        data-dev={String(showDevSignup)}
      />
      <script dangerouslySetInnerHTML={{ __html: `
        // Bridge: Astro buttons trigger React modals
        window.__claimIsland = {
          subscribe: (position) => document.dispatchEvent(new CustomEvent('claim:subscribe', { detail: position || 'subscribe_modal' })),
          reviewer: () => document.dispatchEvent(new CustomEvent('claim:reviewer')),
          devSignup: (type) => document.dispatchEvent(new CustomEvent('claim:dev', { detail: type })),
          share: () => { navigator.clipboard.writeText(window.location.href); window.gtag?.('event', 'cta_click', { event_category: 'claim_page', cta: 'share_copy_link' }); },
          report: () => window.gtag?.('event', 'cta_click', { event_category: 'claim_page', cta: 'report' }),
        };
      `}} />
    </>
  );
}
