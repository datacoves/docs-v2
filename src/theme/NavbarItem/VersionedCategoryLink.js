import React from 'react';
import Link from '@docusaurus/Link';
import {useDocsVersionCandidates} from '@docusaurus/plugin-content-docs/client';
import {useLocation} from '@docusaurus/router';
import clsx from 'clsx';

// Custom navbar item that creates version-aware category links
export default function VersionedCategoryLink({label, category, className}) {
  const location = useLocation();
  const versionCandidates = useDocsVersionCandidates();

  // Get the preferred version - first from URL, then from candidates
  let version = null;

  // Try to extract version from current URL path
  const pathMatch = location.pathname.match(/^\/docs\/([^/]+)/);
  if (pathMatch) {
    version = pathMatch[1];
  }

  // Fall back to first version candidate (usually the "preferred" version)
  if (!version && versionCandidates.length > 0) {
    version = versionCandidates[0].name;
  }

  // Construct the versioned category URL
  const href = version
    ? `/docs/${version}/category/${category}`
    : `/docs/category/${category}`;

  return (
    <Link
      className={clsx('navbar__item', 'navbar__link', className)}
      to={href}
    >
      {label}
    </Link>
  );
}
