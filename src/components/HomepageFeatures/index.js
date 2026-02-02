import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import Link from '@docusaurus/Link';
import React, { useEffect } from 'react';
import CTASection from '../CTA/CTAsection';

const FeatureList = [
  {
    title: 'How to',
    Svg: require('@site/static/img/how-to.svg').default,
    description: (
      <>
       How to guides provide step-by-step instructions to accomplish tasks on the platform. Topics include Airflow, Datacoves, dbt, Git, and Snowflake for practical use.
      </>
    ),
    link: '/docs/4.1/category/how-tos',
  },
  {
    title: 'Best Practice',
    Svg: require('@site/static/img/best-practice.svg').default,
    description: (
      <>
       Best Practice guides help you improve your analytics workflows with proven strategies. These come from experience working at large enterprises across multiple teams.
      </>
    ),
    link: '/docs/4.1/category/best-practices',
  },
  {
    title: 'Reference',
    Svg: require('@site/static/img/resources.svg').default,
    description: (
      <>
       Reference guides provide detailed technical information on tools like the Administration Menu, Airflow, Datacoves, Metrics & Logs, Security, and VS Code for easy lookup.
      </>
    ),
     link: '/docs/4.1/category/reference',
  },
];

function Feature({Svg, title, description, link}) {
  return (
    <div className={clsx('col col--4')}>
      <Link to={link} className={styles.card}>
        <div className="text--center">
          <Svg className={styles.featureSvg} role="img" />
        </div>
        <div className="text--center padding-horiz--md">
          <Heading as="h3">{title}</Heading>
          <p>{description}</p>
        </div>
      </Link>
    </div>
  );
}

export default function HomepageFeatures() {
  useEffect(() => {
    const cards = document.querySelectorAll(`.${styles.card}`);
    if (!cards.length) return;

    const resizeCards = () => {
      let maxHeight = 0;
      cards.forEach(card => {
        card.style.height = 'auto'; // reset
        if (card.offsetHeight > maxHeight) maxHeight = card.offsetHeight;
      });
      cards.forEach(card => (card.style.height = maxHeight + 'px'));
    };

    resizeCards(); // initial run
    window.addEventListener('resize', resizeCards); // recalc on window resize

    return () => window.removeEventListener('resize', resizeCards);
  }, []);

  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
