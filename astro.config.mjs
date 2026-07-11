// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';

// Served as a subdirectory of the marketing site for SEO: www.savvytechies.com/docs
// (a CloudFront /docs/* behavior points at this bucket). base must match.
export default defineConfig({
  site: 'https://www.savvytechies.com',
  base: '/docs',
  integrations: [
    starlight({
      title: 'SavvyTechies Keycloak SaaS Docs',
      description:
        'How SavvyTechies runs managed Keycloak: architecture, HA, multi-cloud, migration, upgrades, realms, analytics, and security.',
      customCss: ['./src/styles/custom.css'],
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/savvytechies-dev' },
      ],
      sidebar: [
        { label: 'Overview', items: [{ label: 'Introduction', slug: 'index' }] },
        {
          label: 'Platform',
          items: [
            { label: 'Architecture', slug: 'architecture' },
            { label: 'High Availability & Resiliency', slug: 'ha' },
            { label: 'Multi-Cloud', slug: 'multi-cloud' },
          ],
        },
        {
          label: 'Operations',
          items: [
            { label: 'Migration Approaches', slug: 'migration' },
            { label: 'Rolling Upgrades & Patching', slug: 'upgrades' },
            { label: 'Realm Setup & Configuration', slug: 'realms' },
          ],
        },
        {
          label: 'Features',
          items: [
            { label: 'Reporting & Analytics', slug: 'analytics' },
            { label: 'Advanced Security', slug: 'security' },
          ],
        },
        { label: 'About', items: [{ label: 'Roadmap', slug: 'roadmap' }] },
      ],
    }),
    react(),
  ],
});
