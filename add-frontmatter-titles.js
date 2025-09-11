// add-frontmatter-titles.js
import fs from 'fs';
import path from 'path';

const sidebarFile = '_sidebar.md';
const docsFolder = 'docs';

function parseSidebar(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const linkRegex = /^\s*-\s*\[(.*?)\]\((.*?)\)/gm;
  const matches = [...content.matchAll(linkRegex)];

  const docs = matches.map((m, index) => {
    let [_, title, link] = m;
    title = title.trim();

    if (/^https?:\/\//.test(link)) return null; // skip external links

    if (link.startsWith('/')) link = link.slice(1);

    const folderReadme = path.join(docsFolder, link, 'README.md');
    const fileMd = path.join(docsFolder, link + '.md');

    if (fs.existsSync(fileMd)) {
      return { title, filePath: fileMd, position: index + 1 };
    } else if (fs.existsSync(folderReadme)) {
      return { title, filePath: folderReadme, position: index + 1 };
    } else {
      console.warn(`⚠️ Skipping link (no file found): ${link}`);
      return null;
    }
  });

  return docs.filter(Boolean);
}

function addTitleAndPosition(filePath, title, position) {
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.startsWith('---')) {
    const endIndex = content.indexOf('---', 3);
    if (endIndex !== -1) {
      let fm = content.slice(3, endIndex).trim();

      fm = /^title:/m.test(fm)
        ? fm.replace(/^title:.*$/m, `title: ${title}`)
        : `title: ${title}\n${fm}`;

      fm = /sidebar_position:/m.test(fm)
        ? fm.replace(/sidebar_position:.*$/m, `sidebar_position: ${position}`)
        : `${fm}\nsidebar_position: ${position}`;

      const newContent = `---\n${fm}\n---\n` + content.slice(endIndex + 3).trimStart();
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      return;
    }
  }

  const newContent = `---\ntitle: ${title}\nsidebar_position: ${position}\n---\n\n${content}`;
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`✅ Added front matter to ${filePath}`);
}

function main() {
  const docs = parseSidebar(sidebarFile);
  docs.forEach(({ title, filePath, position }) => {
    addTitleAndPosition(filePath, title, position);
  });
}

main();
