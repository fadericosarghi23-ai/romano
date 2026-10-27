import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Dominio canonico. Su Netlify arriva dalla variabile di build URL (dominio personalizzato se
// collegato, altrimenti https://<nome>.netlify.app). In locale resta il dominio attuale del sito.
export const SITE_URL = (process.env.URL || 'https://www.lauraromano.net').replace(/\/$/, '');

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/grazie/') && !page.includes('/404'),
    }),
  ],
});
