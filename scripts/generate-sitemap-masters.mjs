/**
 * Post-build script: fetches master IDs from API and generates sitemap-masters.xml.
 * Run after `npm run build`. Requires API to be available.
 *
 * Usage: SITEMAP_API_URL=https://api.faber.md node scripts/generate-sitemap-masters.mjs
 * Or: VITE_API_URL=https://api.faber.md node scripts/generate-sitemap-masters.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../dist');
const SITE_URL = 'https://faber.md';
const API_URL =
  process.env.SITEMAP_API_URL ||
  process.env.VITE_API_URL ||
  'http://localhost:4000';

async function fetchAllMasterIds() {
  const ids = [];
  let page = 1;
  const limit = 100;

  while (true) {
    const url = `${API_URL}/masters?page=${page}&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[sitemap-masters] API error ${res.status} at ${url}`);
      break;
    }
    const data = await res.json();
    const root = data?.data ?? data;
    const items = Array.isArray(root?.items) ? root.items : Array.isArray(root) ? root : [];
    if (!Array.isArray(items) || items.length === 0) break;

    for (const m of items) {
      const id = m?.id ?? m?.slug;
      if (id && typeof id === 'string') ids.push(id);
    }
    if (items.length < limit) break;
    page++;
  }
  return ids;
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function main() {
  if (!fs.existsSync(DIST)) {
    console.error('[sitemap-masters] dist/ not found. Run npm run build first.');
    process.exit(1);
  }

  console.log('[sitemap-masters] Fetching masters from', API_URL);
  const ids = await fetchAllMasterIds();
  console.log(`[sitemap-masters] Found ${ids.length} masters`);

  const urls = ids
    .map(
      (id) =>
        `  <url><loc>${escapeXml(`${SITE_URL}/masters/${id}`)}</loc></url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  const outPath = path.join(DIST, 'sitemap-masters.xml');
  fs.writeFileSync(outPath, xml, 'utf8');
  console.log(`[sitemap-masters] Wrote ${outPath}`);

  const sitemapPath = path.join(DIST, 'sitemap.xml');
  if (fs.existsSync(sitemapPath) && ids.length > 0) {
    const pages = fs.readFileSync(sitemapPath, 'utf8');
    const pagesPath = path.join(DIST, 'sitemap-pages.xml');
    fs.writeFileSync(pagesPath, pages, 'utf8');

    const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${SITE_URL}/sitemap-pages.xml</loc></sitemap>
  <sitemap><loc>${SITE_URL}/sitemap-masters.xml</loc></sitemap>
</sitemapindex>
`;
    fs.writeFileSync(sitemapPath, indexXml, 'utf8');
    console.log('[sitemap-masters] Created sitemap index');
  }
}

main().catch((err) => {
  console.error('[sitemap-masters]', err);
  process.exit(1);
});
