const fs = require('fs');
const path = require('path');

// Map old admonition to Docusaurus type
const admonitionMap = {
  NOTE: 'note',
  TIP: 'tip',
  WARNING: 'warning',
  INFO: 'info'
};

// Recursively walk through a directory
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath, callback);
    } else if (file.endsWith('.md')) {
      callback(fullPath);
    }
  });
}

// Convert old admonition blocks to Docusaurus ::: syntax
function convertFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Regex to match > [!TYPE] at the start of a line
  const admonitionRegex = /^> \[!(NOTE|TIP|WARNING|INFO)\](.*)/gm;

  content = content.replace(admonitionRegex, (_, type, rest) => {
    return `:::${admonitionMap[type]}${rest || ''}`;
  });

  // Remove leading '> ' from lines inside the note
  content = content.replace(/^> /gm, '');

  // Add closing ::: after each admonition block if missing
  const blockStartRegex = /^:::(note|tip|warning|info)/gm;
  let lines = content.split('\n');
  let newLines = [];
  let insideBlock = false;

  lines.forEach(line => {
    if (/^:::(note|tip|warning|info)/.test(line)) {
      insideBlock = true;
      newLines.push(line);
    } else if (insideBlock && line.trim() === '') {
      // Allow blank lines inside block
      newLines.push(line);
    } else if (insideBlock && !/^:::/ .test(line)) {
      newLines.push(line);
    } else if (insideBlock && /^:::/ .test(line)) {
      // skip, already a closing :::
    } else {
      newLines.push(line);
    }

    // Detect end of block: if next line is empty or not indented, close it
    if (insideBlock && (line.trim() === '' || line.match(/^[^:]/))) {
      newLines.push(':::');
      insideBlock = false;
    }
  });

  // Ensure file ends with ::: if still inside block
  if (insideBlock) newLines.push(':::');

  fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
  console.log(`Converted: ${filePath}`);
}

// Run conversion
const docsDir = path.join(__dirname, 'docs'); // replace with your docs folder if needed
walkDir(docsDir, convertFile);

console.log('All admonitions converted!');
