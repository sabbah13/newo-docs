// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Newo SuperAgent Documentation',
  tagline: 'Digital Employee platform with sophisticated multi-agent orchestration',
  favicon: 'img/favicon.ico',
  url: 'https://newo-superagent-docs.netlify.app',
  baseUrl: '/',
  organizationName: 'newo',
  projectName: 'superagent-docs',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  
  i18n: { 
    defaultLocale: 'en', 
    locales: ['en'] 
  },
  
  markdown: { 
    mermaid: true 
  },
  
  themes: ['@docusaurus/theme-mermaid'],
  
  presets: [
    [
      'classic',
      ({
        docs: {
          path: './docs-new',
          routeBasePath: '/docs',
          sidebarPath: require.resolve('./sidebars-new.js'),
          includeCurrentVersion: true,
          editUrl: 'https://github.com/newo-ai/superagent-docs/edit/main/',
        },
        blog: false,
        theme: { 
          customCss: require.resolve('./src/css/custom.css') 
        },
      }),
    ],
  ],
  
  themeConfig: {
    navbar: {
      title: 'Newo SuperAgent',
      logo: { 
        alt: 'Newo SuperAgent Logo', 
        src: 'img/logo.svg' 
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: '📚 Documentation',
        },
        {
          to: '/docs/executive-summary',
          label: '📋 Overview',
          position: 'left'
        },
        {
          to: '/docs/system-architecture',
          label: '🏗️ Architecture',
          position: 'left'
        },
        {
          to: '/docs/actions-api',
          label: '🔧 API Reference',
          position: 'left'
        },
        {
          to: '/docs/business-applications',
          label: '💼 Business',
          position: 'left'
        },
        {
          href: 'https://github.com/newo-ai/superagent',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Core Documentation',
          items: [
            { label: '📋 Executive Summary', to: '/docs/executive-summary' },
            { label: '🏗️ System Architecture', to: '/docs/system-architecture' },
            { label: '🤖 Agent Analysis', to: '/docs/agent-analysis' },
            { label: '🔄 Event System', to: '/docs/event-system' },
          ],
        },
        {
          title: 'Development',
          items: [
            { label: '👨‍💻 Development Guide', to: '/docs/development-guide' },
            { label: '🔧 Integration Guide', to: '/docs/integration-guide' },
            { label: '🔧 Actions API', to: '/docs/actions-api' },
            { label: '📖 System Reference', to: '/docs/system-reference' },
          ],
        },
        {
          title: 'Business & Support',
          items: [
            { label: '💼 Business Applications', to: '/docs/business-applications' },
            { label: '🔗 Integration Setup', to: '/docs/integration-setup' },
            { label: '🐛 Troubleshooting', to: '/docs/troubleshooting' },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/newo-ai/superagent',
            },
            {
              label: 'Newo.ai Platform',
              href: 'https://newo.ai',
            },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Newo.ai - Digital Employee Platform. Built with Docusaurus.`,
    },
    
    prism: { 
      additionalLanguages: ['json', 'yaml', 'bash', 'python', 'javascript', 'typescript'] 
    },
    
    // algolia: {
    //   // Add search configuration when available
    //   appId: 'YOUR_APP_ID',
    //   apiKey: 'YOUR_SEARCH_API_KEY', 
    //   indexName: 'newo-superagent-docs',
    //   contextualSearch: true,
    // },
    
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    
    announcementBar: {
      id: 'new_docs',
      content:
        '🚀 <strong>New comprehensive documentation!</strong> Complete guide to the Newo SuperAgent Digital Employee platform.',
      backgroundColor: '#e3f2fd',
      textColor: '#1976d2',
      isCloseable: true,
    },
  },
};

module.exports = config;