import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import Link from '@docusaurus/Link';
import React from 'react';
import CTASection from '../CTA/CTAsection';


const FeatureList = [
  {
    title: 'How to',
    Svg: require('@site/static/img/how-to.svg').default,
    description: (
      <>
       How to guides provide step-by-step instructions to accomplish tasks assuming a basic understanding of the platform. They include topics like Airflow, Datacoves, dbt, Git and Snowflake.
      </>
    ),
    link: '/',
  },
  {
    title: 'Best Practice',
    Svg: require('@site/static/img/best-practice.svg').default,
    description: (
      <>
       Here we present some guidance to help you mature your analytics practice. This guidance comes from experience working at large enterprises.
      </>
    ),
    link: '/',
  },
  {
    title: 'Reference',
    Svg: require('@site/static/img/resources.svg').default,
    description: (
      <>
      Your go-to source for technical details on tools like the Administration Menu, Airflow, Datacoves, Metrics & Logs, Security and VS Code organized for easy lookup and practical use.
      </>
    ),
     link: '/',
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
