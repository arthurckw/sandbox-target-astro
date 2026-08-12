import { createClient } from '@supabase/supabase-js';

// For SSG build-time queries
// These env vars must be set in the build environment (Netlify, etc.)
const supabaseUrl = import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Dynamic pages will not be generated.');
}

// Guard: createClient throws if URL is empty. Return a chainable dummy that returns empty results.
const dummyResult = { data: [], error: { message: 'Supabase not configured' } };
const chainable: any = new Proxy({}, {
  get: () => (..._args: any[]) => chainable,
});
// Override terminal methods that return data
chainable.then = (resolve: any) => resolve(dummyResult);
chainable.single = () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } });
// Make it thenable for await
Object.defineProperty(chainable, Symbol.for('nodejs.util.inspect.custom'), { value: () => 'DummySupabaseClient' });

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : { from: () => chainable } as unknown as ReturnType<typeof createClient>;

// Types for eval_proj_ideas table
export interface EvalProjIdea {
  id: string;
  slug: string;
  headline: string;
  subheadline: string;
  evaluation_id: string | null;
  created_at: string;
  updated_at: string;
  meta_title: string;
  meta_description: string;
  keywords: string[];
  category_name: string;
  category_slug: string;
  ai_claims: { emoji: string; text: string }[];
  topics: { emoji: string; title: string; description: string }[];
  faq: { question: string; answer: string }[];
  why_matters: string | null;
  reward_amount: number | null;
  time_estimate: string;
  related_slugs: string[];
  is_published: boolean;
  instructions: string | null;
}

// Fetch all published ideas (for getStaticPaths), sorted by newest first
export async function getPublishedIdeas(): Promise<EvalProjIdea[]> {
  const { data, error } = await supabase
    .from('eval_proj_ideas')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching eval_proj_ideas:', error);
    return [];
  }

  return data || [];
}

// Fetch single idea by slug
export async function getIdeaBySlug(slug: string): Promise<EvalProjIdea | null> {
  const { data, error } = await supabase
    .from('eval_proj_ideas')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) {
    console.error(`Error fetching idea ${slug}:`, error);
    return null;
  }

  return data;
}

// Fetch related ideas by slugs
export async function getRelatedIdeas(slugs: string[]): Promise<EvalProjIdea[]> {
  if (!slugs.length) return [];

  const { data, error } = await supabase
    .from('eval_proj_ideas')
    .select('slug, headline, category_name')
    .in('slug', slugs)
    .eq('is_published', true);

  if (error) {
    console.error('Error fetching related ideas:', error);
    return [];
  }

  return data || [];
}
