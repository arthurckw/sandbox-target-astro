/**
 * AIProfile React Island — modals + waitlist for AI profile page.
 */
import { useState, useEffect } from 'react';

declare global { interface Window { gtag?: (...args: unknown[]) => void; __aiProfile?: any } }

const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'grandjury.xyz' || window.location.hostname === 'humanjudge.com'))
  ? 'https://grandjury-server.onrender.com' : 'http://127.0.0.1:8001';

const btnPrimary = 'inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-on shadow-xs transition-[color,background-color,box-shadow] duration-150 hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent-soft active:bg-accent-hover active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50';

interface FlagClaim {
  slug: string | null;
  feedback: string | null;
  model_name: string;
  benchmark_name: string | null;
  reviewer_name: string | null;
  verdict: string;
  created_at: string;
}

interface Props {
  modelSlug: string;
  modelName: string;
  flagClaims: FlagClaim[];
}

export default function AIProfileIsland({ modelSlug, modelName, flagClaims }: Props) {
  const [showSubscribe, setShowSubscribe] = useState<string | false>(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);
  const [waitlistDone, setWaitlistDone] = useState(false);

  const submitWaitlist = async (type: string, position: string, email?: string) => {
    const e = email || waitlistEmail;
    if (!e.trim() || !e.includes('@')) return;
    setWaitlistSubmitting(true);
    try {
      await fetch(`${API_BASE}/api/v1/claims/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: e.trim(), waitlist_type: type, position, page_url: window.location.href }),
      });
      window.gtag?.('event', 'waitlist_signup', { event_category: 'ai_profile', type, position, model: modelSlug });
      setWaitlistDone(true);
    } catch {}
    setWaitlistSubmitting(false);
  };

  // Expose functions for Astro onclick handlers
  useEffect(() => {
    window.__aiProfile = {
      subscribe: (position: string) => {
        setShowSubscribe(position);
        window.gtag?.('event', 'cta_click', { event_category: 'ai_profile', cta: 'subscribe', position, model: modelSlug });
      },
      claimOwner: () => {
        const emailInput = document.getElementById('ai-owner-email') as HTMLInputElement;
        const email = emailInput?.value || '';
        if (!email.includes('@')) return;
        submitWaitlist('ai_owner', `ai_profile_${modelSlug}`, email).then(() => {
          const form = document.getElementById('ai-owner-form');
          const done = document.getElementById('ai-owner-done');
          if (form) form.classList.add('hidden');
          if (done) done.classList.remove('hidden');
        });
      },
    };
  }, [modelSlug]);

  return (
    <>
      {/* Subscribe modal — premium data access */}
      {showSubscribe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => { setShowSubscribe(false); setWaitlistEmail(''); setWaitlistDone(false); }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-bg border border-border-emphasis rounded-xl shadow-2xl shadow-black/40 w-full max-w-lg mx-4 p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setShowSubscribe(false); setWaitlistEmail(''); setWaitlistDone(false); }} className="absolute top-4 right-4 text-tertiary hover:text-secondary text-sm">✕</button>
            <div className="text-[10px] text-accent uppercase tracking-widest font-bold mb-2">Beta</div>
            <h2 className="text-xl font-bold text-primary mb-1">Pulse Check — All Access</h2>
            <p className="text-tertiary text-sm mb-6">Full evaluation data for {modelName} and all other AIs.</p>

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
              {waitlistDone ? (
                <p className="text-success text-sm text-center py-3">You're on the list! We'll be in touch.</p>
              ) : (
                <>
                  <input type="email" placeholder="your@email.com" value={waitlistEmail} onChange={(e) => setWaitlistEmail(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submitWaitlist('premium_subscriber', typeof showSubscribe === 'string' ? showSubscribe : 'ai_profile_modal'); }} className="w-full rounded-md border border-border-emphasis bg-surface px-4 py-3 text-sm text-primary placeholder:text-tertiary focus:outline-none focus:border-accent" />
                  <button onClick={() => submitWaitlist('premium_subscriber', typeof showSubscribe === 'string' ? showSubscribe : 'ai_profile_modal')} disabled={waitlistSubmitting} className={`w-full ${btnPrimary} !py-3`}>{waitlistSubmitting ? 'Joining...' : 'Get All Access'}</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
