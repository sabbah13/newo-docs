import React from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">🤖 {siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs">
            📚 Explore Documentation
          </Link>
          <Link
            className="button button--primary button--lg margin-left--md"
            to="/docs/executive-summary">
            🚀 Quick Start
          </Link>
        </div>
      </div>
    </header>
  );
}

function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          <div className={clsx('col col--4')}>
            <div className="text--center padding-horiz--md">
              <h3>🏗️ Enterprise Architecture</h3>
              <p>
                Production-ready multi-agent system with sophisticated event-driven 
                architecture, supporting 9 specialized agents and 100+ event types.
              </p>
            </div>
          </div>
          <div className={clsx('col col--4')}>
            <div className="text--center padding-horiz--md">
              <h3>🤖 Digital Employees</h3>
              <p>
                True Digital Employees with omnichannel, omniflow, and omniuser 
                capabilities - not just intelligent agents but autonomous workers.
              </p>
            </div>
          </div>
          <div className={clsx('col col--4')}>
            <div className="text--center padding-horiz--md">
              <h3>💼 Business Ready</h3>
              <p>
                Industry-specific templates for hospitality, healthcare, and services 
                with real ROI - deploy conversational AI in weeks, not months.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomepageStats() {
  return (
    <section className={styles.stats}>
      <div className="container">
        <div className="row">
          <div className="col col--12 text--center margin-bottom--lg">
            <h2>📊 Platform Capabilities</h2>
          </div>
        </div>
        <div className="row">
          <div className={clsx('col col--3 text--center')}>
            <div className={styles.statBox}>
              <h3>25+</h3>
              <p>Business Flows</p>
            </div>
          </div>
          <div className={clsx('col col--3 text--center')}>
            <div className={styles.statBox}>
              <h3>100+</h3>
              <p>Event Types</p>
            </div>
          </div>
          <div className={clsx('col col--3 text--center')}>
            <div className={styles.statBox}>
              <h3>50+</h3>
              <p>Newo Actions</p>
            </div>
          </div>
          <div className={clsx('col col--3 text--center')}>
            <div className={styles.statBox}>
              <h3>9</h3>
              <p>Specialized Agents</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Complete guide to the Newo SuperAgent Digital Employee platform - sophisticated multi-agent conversational AI with production-ready architecture">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <HomepageStats />
      </main>
    </Layout>
  );
}