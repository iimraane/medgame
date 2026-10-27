import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/visual', timeout: 30000, fullyParallel: false,
  use: { baseURL: 'http://127.0.0.1:5173', viewport: { width: 1440, height: 960 }, locale: 'fr-FR', reducedMotion: 'reduce', screenshot: 'only-on-failure' },
  webServer: { command: 'npm run dev -- --host 127.0.0.1', url: 'http://127.0.0.1:5173', reuseExistingServer: !process.env.CI },
});
