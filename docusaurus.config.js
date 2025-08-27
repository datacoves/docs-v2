// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Welcome to the Datacoves Documentation',
  tagline: 'Our Mission is to be the best dbt platform for enterprises by offering a simple solution with robust orchestration that reduces time to market while handling the complexities of a large enterprise.',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  // Amy: GitHub Pages deployment config
  url:'https://amypchan.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/docusaurus-test/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'amypchan', // Usually your GitHub org/user name.
  projectName:  'docusaurus-test', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
  
      navbar: {
  logo: {
    alt: 'Datacoves Site Logo',
    src: 'img/datacoves-logo.svg',//light mode logo
    srcDark: 'img/datacoves-logo-dark.png',//dark mode logo
  },
  items: [
    {
      label: 'Getting Started',
      position: 'left',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          label: 'Administrator', // You can add more internal doc links here
          to: '/docs/intro',
        },
         {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          label: 'Developer', // You can add more internal doc links here
          to: '/docs/intro',
        },
        // Add more internal docs here if needed
      ],
    },
    {
      label: 'How to',
      position: 'left',
      items: [
        {
          label: 'Airflow',
          href: '/',
        },
        {
          label: 'Datacoves',
          href: '/',
        },
        {
          label: 'Datahub',
          href: '/',
        },
         {
          label: 'DataOps',
          href: '/',
        },
         {
          label: 'dbt',
          href: '/',
        },
         {
          label: 'Git',
          href: '/',
        },
         {
          label: 'My Airflow',
          href: '/',
        },
         {
          label: 'Snowflake',
          href: '/',
        },
         {
          label: 'Superset',
          href: '/',
        },
         {
          label: 'VS Code',
          href: '/',
        },
        
      ],
    },

     {
      label: 'Best Practices',
      position: 'left',
      items: [
        {
          label: 'Datacoves',
          href: '/',
        },
        {
          label: 'dbt',
          href: '/',
        },
        {
          label: 'Git',
          href: '/',
        },
         {
          label: 'Snowflake',
          href: '/',
        },
         
        ],
      },
      {
      label: 'Reference',
      position: 'left',
      items: [
        {
          label: 'Administration Menu',
          href: '/',
        },
        {
          label: 'Airflow',
          href: '/',
        },
        {
          label: 'Datacoves',
          href: '/',
        },
         {
          label: 'Metrics & Logs',
          href: '/',
        },
         {
          label: 'Security',
          href: '/',
        },
        {
          label: 'VS Code',
          href: '/',
        },
        ],
      },
    /*{ to: '/blog', label: 'Blog', position: 'left' },*/
  ],
},

     /* navbar: {
       // title: 'datacoves.com',
        logo: {
          alt: 'My Site Logo',
          src: 'img/datacoves-logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Our Docs',
          },
          {to: '/blog', label: 'Blog', position: 'left'},
          {
            href: 'https://datacoves.com/learning-resources?_gl=1*tkmkiz*_ga*MjYwMzYwODE1LjE3NTIyNTAwNDk.*_ga_WFBP8GG4YV*czE3NTYxMzk0NDkkbzQxJGcxJHQxNzU2MTQwODM0JGo2MCRsMCRoMA',
            label: 'Learning Resources',
            position: 'left',
          },
          {
            href: 'https://github.com/datacoves',
            label: 'Git repos',
            position: 'left',
          },   
          {
            href: 'https://docs.getdbt.com/',
            label: 'dbt',
            position: 'left',
          },
        ],
      },*/
      footer: {
  style: 'dark',
/* logo: {
    alt: 'Datacoves Logo',
    src: 'img/datacoves-logo.svg',
    href: 'https://datacoves.com',
  },*/
  links: [
    {
       // title: 'datacoves', required (can't be empty)
      items: [
        {
          // put your brand HTML here as an item
            html: `
            <div class="footer__brand footer__brand--wide">
              <img src="img/datacoves-footer-logo.png" alt="Datacoves-logo" class="footer__brand-logo" />
              <p class="footer__brand-desc text--left">
                Datacoves is an enterprise DataOps platform with managed dbt and Airflow
                for data transformation and orchestration, as well as VS Code in the browser
                for development.
              </p>
            </div>
          `,
        },
      ],
    },
    
          {
            title: 'Resources',
            items: [
               {
                label: 'dbt docs',
                href: 'https://docs.getdbt.com/',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/datacoves',
              },
              {
                label: 'Learning Resources',
                href: 'https://datacoves.com/learning-resources?_gl=1*18cmhau*_ga*MjYwMzYwODE1LjE3NTIyNTAwNDk.*_ga_WFBP8GG4YV*czE3NTYyNDYzMzAkbzUwJGcxJHQxNzU2MjQ2NDg4JGo2MCRsMCRoMA..',
              },
             
            /*  {
                label: 'Blog',
                to: '/blog',
              },*/
            
            ],
          },
          {
            title: 'Company',
            items: [
              {
                label: 'Product',
                href: 'https://datacoves.com',
              },
              {
                label: 'Blog',
                href: 'https://discordapp.com/invite/docusaurus',
              },
              {
                label: 'Email',
                href: 'https://x.com/docusaurus',
              },
               {
                label: 'Slack',
                href: 'https://x.com/docusaurus',
              },
            ],
          },
          {
            title: 'Platform',
            items: [
              {
                label: 'Status Tracker',
                href: 'https://datacoves.statuspage.io/',
              },
              {
                label: 'SLA',
                href: 'https://docs.datacoves.com/sla.html',
              },
              
            ],
          },
        ],
    copyright: `
    <div class="footer__legal">
      Copyright © ${new Date().getFullYear()} Datacoves. 
      All rights reserved. 
      <a href="/privacy-policy">Privacy Policy</a> | 
      <a href="/terms-of-service">Terms of Service</a>
      <br />
      <span class="footer__trademarks">
        Apache, Apache Airflow, Airflow, Apache Superset, the Airflow logo,
        the Apache feather logo, Superset, and the Superset logo are trademarks 
        of the Apache Software Foundation. dbt, dbt core, dbt logo are trademarks 
        of dbt Labs, Inc. Airbyte, Airbyte logo are trademarks of Airbyte, Inc. 
        Snowflake, Snowflake logo are trademarks of Snowflake Inc.
      </span>
    </div>
  `,
},
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
      
       algolia: {
      // The application ID provided by Algolia
      appId: '5OPWKE6FBT',

      // Public API key: it is safe to commit it
      apiKey: 'ceb57b2c9e64bfe1b4fb25d42be7467a',

      indexName: 'Datacoves Docs Website',

      // Optional: see doc section below
      contextualSearch: true,

      // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
      externalUrlRegex: 'external\\.com|domain\\.com',

      // Optional: Replace parts of the item URLs from Algolia. Useful when using the same search index for multiple deployments using a different baseUrl. You can use regexp or string in the `from` param. For example: localhost:3000 vs myCompany.com/docs
      replaceSearchResultPathname: {
        from: '/docs/', // or as RegExp: /\/docs\//
        to: '/',
      },

      // Optional: Algolia search parameters
      searchParameters: {},

      // Optional: path for search page that enabled by default (`false` to disable it)
      searchPagePath: 'search',

      // Optional: whether the insights feature is enabled or not on Docsearch (`false` by default)
      insights: false,

      //... other Algolia params
    },
    plugins: [
    [
      "docusaurus-plugin-generate-llms-txt",
      {
        outputFile: "llms.txt", // will live at /build/llms.txt
      },
    ],
    // other plugins...
  ],
    }),
};

export default config;
