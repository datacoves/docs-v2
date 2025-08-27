import React from 'react';
import Link from '@docusaurus/Link';
import styles from './CTASection.module.css';

export default function CTASection({ 
  title = <>Lower your Total <span className={styles.textHighlight}>Cost of Ownership by 50%</span></>, 
  subtitle = 'Start a trial account and see how Datacoves can accelerate your time to market. Set up a Datacoves Trial account with the help of our team.',
  link = '/',
  buttonText = 'Start your Datacoves journey',
}) {
  return (
    <section className={styles.ctaSection}>
      <h2>{title}</h2>
      <p>{subtitle}</p>
     <Link className={`button button--lg ${styles.ctaButton}`} to={link}>
        {buttonText}
    </Link>
    </section>
  );
}
