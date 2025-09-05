// add-frontmatter-titles.js
import fs from 'fs';
import path from 'path';
import sidebars from './sidebars.js'; // adjust path if needed

/**
 * Recursively extract docs with their labels from sidebar
 */
function extractDocsWithLabels(items) {
  let docs = [];
  for (const item of items) {
    if (typeof item === 'string') {
      docs.push({ id: item, label: item.split('/').pop().replace(/-/g, ' ') });
    } else if (item.type === 'doc') {
      docs.push({ id: item.id, label: item.label || item.id.split('/').pop().replace(/-/g, ' ') });
    } else if (item.type === 'category' && item.items) {
      // If the category itself has a link to a doc, include that
      if (item.link && item.link.type === 'doc') {
        docs.push({ id: item.link.id, label: item.label });
      }
      docs.push(...extractDocsWithLabels(item.items));
    }
  }
  return docs;
}

/**
 * Convert a doc ID to its file path
 */
function findFilePath(docId) {
  const mdPath = path.join('docs', `${docId}.md`);
  const mdxPath = path.join('docs', `${docId}.mdx`);

  if (fs.existsSync(mdPath)) return mdPath;
  if (fs.existsSync(mdxPath)) return mdxPath;

  console.warn(`File not found for doc: ${docId}`);
  return null;
}

/**
 * Add or update front matter title
 */
function addTitleToFile(filePath, title) {
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.startsWith('---')) {
    const endIndex = content.indexOf('---', 3);
    if (endIndex !== -1) {
      let fm = content.slice(3, endIndex).trim();

      // Replace existing title if present
      if (/^title:/m.test(fm)) {
        fm = fm.replace(/^title:.*$/m, `title: ${title}`);
      } else {
        fm = `title: ${title}\n${fm}`;
      }

      const newContent = `---\n${fm}\n---\n` + content.slice(endIndex + 3).trimStart();
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated title in ${filePath}`);
      return;
    }
  }

  // No front matter, add new
  const newContent = `---\ntitle: ${title}\n---\n\n${content}`;
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Added front matter to ${filePath}`);
}

/**
 * Main
 */
function main() {
  for (const sidebarKey in sidebars) {
    const sidebarItems = sidebars[sidebarKey];
    const docs = extractDocsWithLabels(sidebarItems);

    docs.forEach(({ id, label }) => {
      const filePath = findFilePath(id);
      if (filePath) {
        addTitleToFile(filePath, label);
      }
    });
  }
}

main();
