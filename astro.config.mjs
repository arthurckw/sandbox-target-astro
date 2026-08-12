import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://humanjudge.com',
  integrations: [tailwind({
    // Don't apply Tailwind base styles (we'll import from frontend)
    applyBaseStyles: false,
  }), sitemap({
    filter: (page) =>
      // Exclude /claims/ dynamic routes (they have their own claims-sitemap.xml)
      !page.includes('/claims/'),
  }), react()],
  output: 'server',  // SSR mode — existing pages opt into static via prerender = true
  adapter: netlify(),
  build: {
    format: 'file', // Generate .html files instead of directories
    assets: 'assets',
  },
});
