// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Newo SuperAgent Documentation',
  tagline: 'Digital Employee platform with sophisticated multi-agent orchestration',
  // Point to favicon at website/static/favicon.ico
  favicon: 'favicon.ico',
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
          routeBasePath: '/',
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
          to: '/executive-summary',
          label: '📋 Overview',
          position: 'left'
        },
        {
          to: '/system-architecture',
          label: '🏗️ Architecture',
          position: 'left'
        },
        {
          to: '/actions-api',
          label: '🔧 API Reference',
          position: 'left'
        },
        {
          to: '/business-applications',
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
            { label: '📋 Executive Summary', to: '/executive-summary' },
            { label: '🏗️ System Architecture', to: '/system-architecture' },
            { label: '🤖 Agent Analysis', to: '/agent-analysis' },
            { label: '🔄 Event System', to: '/event-system' },
          ],
        },
        {
          title: 'Development',
          items: [
            { label: '👨‍💻 Development Guide', to: '/development-guide' },
            { label: '🔧 Integration Guide', to: '/integration-guide' },
            { label: '🔧 Actions API', to: '/actions-api' },
            { label: '📖 System Reference', to: '/system-reference' },
          ],
        },
        {
          title: 'Business & Support',
          items: [
            { label: '💼 Business Applications', to: '/business-applications' },
            { label: '🔗 Integration Setup', to: '/integration-setup' },
            { label: '🐛 Troubleshooting', to: '/troubleshooting' },
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
    
    mermaid: {
      theme: {
        light: 'base',
        dark: 'base'
      },
      options: {
        themeVariables: {
          // Use the same colors for both light and dark modes
          primaryColor: '#e3f2fd',
          primaryTextColor: '#1976d2',
          primaryBorderColor: '#1976d2',
          lineColor: '#1976d2',
          secondaryColor: '#f3e5f5',
          tertiaryColor: '#fff3e0',
          background: 'transparent',
          mainBkg: '#e3f2fd',
          secondBkg: '#f3e5f5',
          tertiaryBkg: '#fff3e0',
          // Text colors
          textColor: '#1976d2',
          darkTextColor: '#1976d2',
          // Node colors
          nodeBkg: '#e3f2fd',
          nodeBorder: '#1976d2',
          // Arrow colors
          arrowheadColor: '#1976d2',
          // Sequence diagram colors
          actorBkg: '#e3f2fd',
          actorBorder: '#1976d2',
          actorTextColor: '#1976d2',
          activationBkg: '#f3e5f5',
          activationBorderColor: '#7b1fa2',
          // Note colors
          noteBkg: '#fff3e0',
          noteBorderColor: '#f57c00',
          noteTextColor: '#1976d2'
        }
      }
    },
  },
};

module.exports = config;