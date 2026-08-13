import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://humanjudge.com',
  integrations: [tailwind({
    applyBaseStyles: false,
  }), sitemap({
    filter: (page) => !page.includes('/claims/'),
  }), react()],
  output: 'static',
  build: {
    format: 'file',
    assets: 'assets',
  },
});
