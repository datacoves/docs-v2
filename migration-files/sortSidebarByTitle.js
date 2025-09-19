// sortSidebarByTitle.js
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

/**
 * Recursively get all markdown/mdx files in a folder
 */
function getAllMdFiles(folderPath) {
  let results = [];
  const files = fs.readdirSync(folderPath);

  files.forEach(file => {
    const fullPath = path.join(folderPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results = results.concat(getAllMdFiles(fullPath));
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      results.push(fullPath);
    }
  });

  return results;
}

/**
 * Sort files by frontmatter title and assign sidebar_position
 */
function sortFilesByTitle(rootFolder) {
  const files = getAllMdFiles(rootFolder);

  // Group files by parent directory
  const folders = {};
  files.forEach(filePath => {
    const dir = path.dirname(filePath);
    if (!folders[dir]) folders[dir] = [];
    folders[dir].push(filePath);
  });

  // Process each folder individually
  Object.keys(folders).forEach(folder => {
    const folderFiles = folders[folder].map(filePath => {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = matter(content);
      return { filePath, title: parsed.data.title || path.basename(filePath), data: parsed.data, content };
    });

    // Sort by title
    folderFiles.sort((a, b) => a.title.localeCompare(b.title));

    // Update sidebar_position and rewrite files
    folderFiles.forEach((fileObj, index) => {
      fileObj.data.sidebar_position = index + 1;
      const newContent = matter.stringify(fileObj.content, fileObj.data);
      fs.writeFileSync(fileObj.filePath, newContent);
      console.log(`Updated ${fileObj.filePath}: sidebar_position ${index + 1}`);
    });
  });

  console.log('All files sorted by title and sidebar_position updated.');
}

// Run it on the entire docs folder
sortFilesByTitle(path.join(process.cwd(), 'docs'));
