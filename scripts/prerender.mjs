import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');

// Define the static routes you want to prerender (SSG) for Googlebot and SEO
// Note: Dynamic routes like /masters/:slug should ideally be fetched from the API and appended here
// if you want to statically generate them. Otherwise, standard Vite CSR works fine for them if sitemap points to them.
const routesToPrerender = [
    '/',
    '/masters',
    '/plans',
    '/faq',
    '/how-it-works',
    '/contact',
    '/login',
    '/register',
];

async function prerender() {
    console.log('Starting Prerender Process for SEO...');

    // 1. Check if dist exists
    if (!fs.existsSync(DIST_DIR)) {
        console.error('dist folder not found. Please run "npm run build" first.');
        process.exit(1);
    }

    // 2. Start a static express server on port 4173 to serve the built files
    const app = express();
    app.use(express.static(DIST_DIR));

    // Fallback for SPA
    app.use((req, res) => {
        res.sendFile(path.join(DIST_DIR, 'index.html'));
    });

    const server = app.listen(4173, async () => {
        console.log('Local static server started at http://localhost:4173');

        // 3. Launch headless chromium
        const browser = await chromium.launch();
        const page = await browser.newPage();

        for (const route of routesToPrerender) {
            const url = `http://localhost:4173${route}`;
            console.log(`Prerendering ${url}...`);

            try {
                // Wait for network idle to ensure React has fully rendered the page
                await page.goto(url, { waitUntil: 'networkidle' });

                // Also wait specifically for crucial elements if needed
                // await page.waitForSelector('#root > *');

                let content = await page.content();

                // Create directory structure if needed (e.g., dist/masters)
                const relativeDir = route === '/' ? '' : route;
                const dir = path.join(DIST_DIR, relativeDir);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }

                // Wait! If React loads on the client, it compares the DOM to hydrate it.
                // Because we're using createRoot (not hydrateRoot) normally, we don't need to rewrite tags, 
                // but removing scripts is a bad idea because then the app becomes static HTML.
                // We keep everything. React will replace the static DOM on load, 
                // but Googlebot will instantly see the SEO HTML!

                // Write the prerendered HTML into that route's folder
                fs.writeFileSync(path.join(dir, 'index.html'), content);
                console.log(`✅ Saved ${relativeDir}/index.html`);
            } catch (error) {
                console.error(`❌ Failed to prerender ${url}:`, error);
            }
        }

        await browser.close();
        server.close();
        console.log('🎉 Prerendering complete! SEO HTML is now in dist.');
        process.exit(0);
    });
}

prerender();
