import type { APIRoute } from 'astro';
import { getPublishedIdeas } from '../../lib/supabase';

export const prerender = true;

export const GET: APIRoute = async () => {
  const challenges = await getPublishedIdeas();
  const siteUrl = 'https://humanjudge.com';

  const rssItems = challenges.map(challenge => {
    const pubDate = new Date(challenge.created_at).toUTCString();
    return `
    <item>
      <title><![CDATA[${challenge.headline}]]></title>
      <link>${siteUrl}/ai-reviews/${challenge.slug}</link>
      <guid isPermaLink="true">${siteUrl}/ai-reviews/${challenge.slug}</guid>
      <description><![CDATA[${challenge.subheadline}]]></description>
      <pubDate>${pubDate}</pubDate>
      ${challenge.category_name ? `<category>${challenge.category_name}</category>` : ''}
    </item>`;
  }).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>HumanJudge - AI Reviews</title>
    <link>${siteUrl}/ai-reviews</link>
    <description>Independent human evaluations of AI knowledge across culture, language, and specialized domains. New topics added daily.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/ai-reviews/rss.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
