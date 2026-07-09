/* Copyright (c) 2026 Kunal Suri (CEA LIST). Apache-2.0. */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { STRINGS, tr } from '../src/lib/i18n';

const rootDir = join(__dirname, '..');

describe('Vercel Deployment Configuration & Verification', () => {
  it('has a valid vercel.json file with required configurations', () => {
    const vercelConfigPath = join(rootDir, 'vercel.json');
    expect(existsSync(vercelConfigPath)).toBe(true);

    const configContent = readFileSync(vercelConfigPath, 'utf8');
    let config: any;
    expect(() => {
      config = JSON.parse(configContent);
    }).not.toThrow();

    expect(config.cleanUrls).toBe(true);
    expect(Array.isArray(config.headers)).toBe(true);

    // Verify cache-control headers for static assets
    const astroHeaderRule = config.headers.find((h: any) => h.source === '/_astro/(.*)');
    expect(astroHeaderRule).toBeDefined();
    const astroCacheControl = astroHeaderRule.headers.find((header: any) => header.key === 'Cache-Control');
    expect(astroCacheControl).toBeDefined();
    expect(astroCacheControl.value).toContain('max-age=31536000');
    expect(astroCacheControl.value).toContain('immutable');

    // Verify security headers for all paths
    const allPathsRule = config.headers.find((h: any) => h.source === '/(.*)');
    expect(allPathsRule).toBeDefined();
    
    const cspHeader = allPathsRule.headers.find((header: any) => header.key === 'Content-Security-Policy');
    expect(cspHeader).toBeDefined();
    expect(cspHeader.value).toContain("default-src 'self'");
    expect(cspHeader.value).toContain("script-src 'self' 'unsafe-inline'");

    const frameOptionsHeader = allPathsRule.headers.find((header: any) => header.key === 'X-Frame-Options');
    expect(frameOptionsHeader).toBeDefined();
    expect(frameOptionsHeader.value).toBe('DENY');

    const contentTypeOptionsHeader = allPathsRule.headers.find((header: any) => header.key === 'X-Content-Type-Options');
    expect(contentTypeOptionsHeader).toBeDefined();
    expect(contentTypeOptionsHeader.value).toBe('nosniff');
  });

  it('has a custom 404 page', () => {
    const errorPagePath = join(rootDir, 'src', 'pages', '404.astro');
    expect(existsSync(errorPagePath)).toBe(true);
  });

  it('defines 404 translation strings for both English and French', () => {
    // English assertions
    expect(STRINGS.en.error404Title).toBeDefined();
    expect(STRINGS.en.error404Lede).toBeDefined();
    expect(STRINGS.en.error404Btn).toBeDefined();
    expect(tr('en', 'error404Title')).toBe('Page not found');

    // French assertions
    expect(STRINGS.fr.error404Title).toBeDefined();
    expect(STRINGS.fr.error404Lede).toBeDefined();
    expect(STRINGS.fr.error404Btn).toBeDefined();
    expect(tr('fr', 'error404Title')).toBe('Page non trouvée');
  });
});
