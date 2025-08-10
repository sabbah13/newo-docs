import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './index.module.css';

export default function Home() {
  return (
    <Layout title="Newo SuperAgent" description="Multi-agent orchestration docs">
      <header className={styles.heroBanner}>
        <div className="container">
          <h1 className={styles.heroTitle}>Newo SuperAgent</h1>
          <p className={styles.heroSubtitle}>Clear, visual, and practical documentation for your multi-agent system</p>
          <div className={styles.buttons}>
            <Link className="button button--primary button--lg" to="/docs">Explore Docs</Link>
            <Link className="button button--secondary button--lg" to="/docs/architecture-overview">Architecture</Link>
          </div>
        </div>
      </header>
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              <div className="col col--4">
                <h3>Event-driven</h3>
                <p>System events and external commands orchestrate every interaction.</p>
              </div>
              <div className="col col--4">
                <h3>Stateful</h3>
                <p>Persona attributes and memory provide durable user-specific context.</p>
              </div>
              <div className="col col--4">
                <h3>Extensible</h3>
                <p>Add skills, flows, and connectors with minimal boilerplate.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
