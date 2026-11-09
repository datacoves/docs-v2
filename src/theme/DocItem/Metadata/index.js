// Wraps the doc page <head> metadata to add TechArticle structured data, so
// search engines read each doc as an article rather than an untyped page.
import React from 'react';
import Metadata from '@theme-original/DocItem/Metadata';
import Head from '@docusaurus/Head';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function MetadataWrapper(props) {
  const {metadata, frontMatter} = useDoc();
  const {siteConfig} = useDocusaurusContext();
  const image = useBaseUrl(frontMatter.image || siteConfig.themeConfig.image, {
    absolute: true,
  });
  const article = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: metadata.title,
    description: metadata.description,
    url: siteConfig.url + metadata.permalink,
    image,
    inLanguage: 'en',
    publisher: {'@id': 'https://datacoves.com/#organization'},
  };
  if (metadata.lastUpdatedAt) {
    article.dateModified = new Date(metadata.lastUpdatedAt).toISOString();
  }
  return (
    <>
      <Metadata {...props} />
      <Head>
        <script type="application/ld+json">{JSON.stringify(article)}</script>
      </Head>
    </>
  );
}
