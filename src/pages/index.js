import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Icon from '@site/src/components/Home/icons';
import styles from './index.module.css';

const START_HERE = [
  {
    icon: 'users',
    eyebrow: 'For administrators',
    title: 'Set up Datacoves for your team',
    to: '/docs/category/administrator',
    links: [
      {label: 'Create your account', to: '/docs/getting-started/create-account'},
      {label: 'Configure your repository', to: '/docs/getting-started/admin/configure-repository'},
      {label: 'Configure Airflow', to: '/docs/getting-started/admin/configure-airflow'},
      {label: 'Manage users', to: '/docs/getting-started/admin/user-management'},
    ],
  },
  {
    icon: 'terminal',
    eyebrow: 'For developers',
    title: 'Start building with dbt',
    to: '/docs/category/developer',
    links: [
      {label: 'Open the Transform tab', to: '/docs/getting-started/developer/transform-tab'},
      {label: 'Work with dbt in Datacoves', to: '/docs/getting-started/developer/working-with-dbt-datacoves'},
      {label: 'Use git', to: '/docs/getting-started/developer/using-git'},
      {label: 'Snowflake extension', to: '/docs/getting-started/developer/snowflake-extension'},
    ],
  },
];

const TOPICS = [
  {
    icon: 'wind',
    title: 'Airflow',
    to: '/docs/category/airflow',
    links: [
      {label: 'Run dbt in a DAG', to: '/docs/how-tos/airflow/dags/run-dbt'},
      {label: 'Datacoves decorators', to: '/docs/reference/airflow/datacoves-decorators'},
      {label: 'My Airflow', to: '/docs/how-tos/my_airflow'},
    ],
  },
  {
    icon: 'layers',
    title: 'dbt',
    to: '/docs/category/dbt',
    links: [
      {label: 'dbt guidelines', to: '/docs/best-practices/dbt/dbt-guidelines'},
      {label: 'Fix runtime errors', to: '/docs/how-tos/dbt/runtime-errors'},
    ],
  },
  {
    icon: 'code',
    title: 'VS Code',
    to: '/docs/category/vs-code',
    links: [
      {label: 'Initial setup', to: '/docs/how-tos/vs-code/initial'},
      {label: 'Environment variables', to: '/docs/how-tos/vs-code/environment-variables'},
    ],
  },
  {
    icon: 'snowflake',
    title: 'Snowflake',
    to: '/docs/category/snowflake',
    links: [
      {label: 'Key-based auth', to: '/docs/how-tos/snowflake/snowflake-key-based-auth'},
      {label: 'Warehouses, schemas and roles', to: '/docs/how-tos/snowflake/warehouses-schemas-roles'},
    ],
  },
  {
    icon: 'gitBranch',
    title: 'Git',
    to: '/docs/how-tos/git',
    links: [
      {label: 'SSH keys', to: '/docs/how-tos/git/ssh-keys'},
      {label: 'Git best practices', to: '/docs/best-practices/git'},
    ],
  },
  {
    icon: 'shield',
    title: 'Security and secrets',
    to: '/docs/reference/security',
    links: [
      {label: 'Datacoves Secrets Manager', to: '/docs/how-tos/airflow/use-datacoves-secrets-manager'},
      {label: 'AWS Secrets Manager', to: '/docs/how-tos/airflow/use-aws-secrets-manager'},
    ],
  },
  {
    icon: 'activity',
    title: 'Metrics and logs',
    to: '/docs/how-tos/datacoves/metrics-and-logs',
    links: [{label: 'Grafana', to: '/docs/how-tos/datacoves/metrics-and-logs/grafana'}],
  },
  {
    icon: 'sliders',
    title: 'Administration',
    to: '/docs/reference/admin-menu',
    links: [
      {label: 'Environments', to: '/docs/reference/admin-menu/environments'},
      {label: 'Service connections', to: '/docs/reference/admin-menu/service_connections'},
    ],
  },
];

const DOC_TYPES = [
  {
    icon: 'listChecks',
    title: 'How-tos',
    text: 'Step-by-step instructions for a specific task.',
    to: '/docs/category/how-tos',
  },
  {
    icon: 'lightbulb',
    title: 'Best practices',
    text: 'Proven patterns from large enterprise teams.',
    to: '/docs/category/best-practices',
  },
  {
    icon: 'bookOpen',
    title: 'Reference',
    text: 'Settings, commands and configuration details.',
    to: '/docs/category/reference',
  },
];

// The navbar search listens for Cmd/Ctrl+K on the window; send it the same
// shortcut so the hero opens that one modal instead of a second search bar.
function openSearch() {
  window.dispatchEvent(new KeyboardEvent('keydown', {key: 'k', metaKey: true, ctrlKey: true}));
}

function Hero() {
  return (
    <header className={styles.hero}>
      <div className="container">
        <p className={styles.eyebrow}>Datacoves Documentation</p>
        <Heading as="h1" className={styles.heroTitle}>
          Everything you need to build with Datacoves
        </Heading>
        <p className={styles.heroSubtitle}>
          Guides and reference for the managed dbt and Airflow platform, from your first
          environment to production pipelines.
        </p>
        <button type="button" className={styles.searchButton} onClick={openSearch}>
          <Icon name="search" size={20} />
          <span>Search the docs</span>
          <kbd className={styles.kbd}>Ctrl K</kbd>
        </button>
        <div className={styles.heroActions}>
          <Link className={styles.primaryButton} to="/docs/category/getting-started">
            Get started
          </Link>
          <Link className={styles.secondaryButton} to="/docs/category/tutorials">
            Tutorials
          </Link>
        </div>
      </div>
    </header>
  );
}

function LinkList({links}) {
  return (
    <ul className={styles.linkList}>
      {links.map((link) => (
        <li key={link.to}>
          <Link to={link.to}>{link.label}</Link>
        </li>
      ))}
    </ul>
  );
}

function StartHere() {
  return (
    <section className={styles.section}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          Start here
        </Heading>
        <div className={styles.startGrid}>
          {START_HERE.map((item) => (
            <div key={item.title} className={styles.startCard}>
              <div className={styles.iconBadge}>
                <Icon name={item.icon} />
              </div>
              <div>
                <p className={styles.cardEyebrow}>{item.eyebrow}</p>
                <Heading as="h3" className={styles.cardTitle}>
                  <Link to={item.to}>{item.title}</Link>
                </Heading>
                <LinkList links={item.links} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Topics() {
  return (
    <section className={styles.section}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          Browse by topic
        </Heading>
        <div className={styles.topicGrid}>
          {TOPICS.map((topic) => (
            <div key={topic.title} className={styles.topicCard}>
              <Link to={topic.to} className={styles.topicHeader}>
                <span className={styles.topicIcon}>
                  <Icon name={topic.icon} size={20} />
                </span>
                <span className={styles.topicTitle}>{topic.title}</span>
                <Icon name="arrowRight" size={16} className={styles.topicArrow} />
              </Link>
              <LinkList links={topic.links} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DocTypes() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.typeGrid}>
          {DOC_TYPES.map((type) => (
            <Link key={type.title} to={type.to} className={styles.typeCard}>
              <span className={styles.typeIcon}>
                <Icon name={type.icon} size={22} />
              </span>
              <span>
                <span className={styles.typeTitle}>{type.title}</span>
                <span className={styles.typeText}>{type.text}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function DemoBand() {
  return (
    <section className={styles.demoBand}>
      <div className={`container ${styles.demoInner}`}>
        <p>
          <strong>New to Datacoves?</strong> See how teams lower their total cost of ownership
          by 50%.
        </p>
        <Link className={styles.demoLink} to="https://datacoves.com/book-demo">
          Book a demo <Icon name="arrowRight" size={16} />
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Layout
      title="Docs: dbt, Airflow & Data Engineering"
      description="Official documentation for Datacoves — the enterprise dbt platform with Airflow orchestration, VS Code, and Superset. Get started in minutes.">
      <Hero />
      <main className={styles.main}>
        <StartHere />
        <Topics />
        <DocTypes />
      </main>
      <DemoBand />
    </Layout>
  );
}
