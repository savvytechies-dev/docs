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
      // Use the SavvyTechies brand favicon (copied from the marketing site) instead
      // of the default Astro/Starlight one.
      favicon: '/favicon.svg',
      components: {
        // Two-line header: "SavvyTechies" (→ marketing home) over "Keycloak SaaS Docs".
        SiteTitle: './src/components/SiteTitle.astro',
      },
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
            { label: 'Release & Deployment Policy', slug: 'release-policy' },
            { label: 'Realm Setup & Configuration', slug: 'realms' },
          ],
        },
        {
          label: 'Configuring your user pool',
          items: [
            { label: 'Overview', slug: 'config' },
            { label: 'Login & security', slug: 'config/login-security' },
            { label: 'Passwords & MFA', slug: 'config/passwords-mfa' },
            { label: 'Tokens & sessions', slug: 'config/tokens-sessions' },
            { label: 'Registration & email', slug: 'config/registration' },
            { label: 'Single sign-on (SSO)', slug: 'config/sso' },
            { label: 'Applications (clients)', slug: 'config/applications' },
            { label: 'Login branding', slug: 'config/branding' },
            { label: 'Events & audit', slug: 'config/events-audit' },
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
