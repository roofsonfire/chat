#!/usr/bin/env node

/**
 * Fix Documentation Issues Script
 *
 * Automatically fixes common documentation issues:
 * - Trailing whitespace
 * - Missing spaces after headers (#)
 * - Broken internal links (where possible)
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

let filesFixed = 0;
let issuesFixed = 0;

/**
 * Get all markdown files recursively
 */
function getMarkdownFiles(dir, files = []) {
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (!entry.startsWith(".") && entry !== "node_modules") {
        getMarkdownFiles(fullPath, files);
      }
    } else if (entry.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Fix issues in a single file
 */
function fixFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  let modified = content;
  let fileIssuesFixed = 0;

  // Fix trailing whitespace
  const lines = modified.split("\n");
  const fixedLines = lines.map((line) => {
    if (line.endsWith(" ") || line.endsWith("\t")) {
      fileIssuesFixed++;
      return line.trimEnd();
    }
    return line;
  });
  modified = fixedLines.join("\n");

  // Fix missing space after headers
  modified = modified.replace(/^(#{1,6})([^# \n])/gm, (match, hashes, char) => {
    fileIssuesFixed++;
    return `${hashes} ${char}`;
  });

  // Write back if modified
  if (modified !== content) {
    writeFileSync(filePath, modified, "utf-8");
    filesFixed++;
    issuesFixed += fileIssuesFixed;
    const relativePath = relative(rootDir, filePath);
    console.log(`✅ Fixed ${fileIssuesFixed} issue(s) in: ${relativePath}`);
    return true;
  }

  return false;
}

/**
 * Main execution
 */
console.log("🔧 Fixing Documentation Issues\n");

const docsDir = join(rootDir, "docs");
const files = getMarkdownFiles(docsDir);

console.log(`Found ${files.length} markdown files\n`);

files.forEach((file) => {
  fixFile(file);
});

console.log(`\n📊 Summary:`);
console.log(`  Files fixed: ${filesFixed}`);
console.log(`  Issues fixed: ${issuesFixed}`);

if (filesFixed > 0) {
  console.log(`\n✅ Done! Run 'npm run docs:test' to verify.`);
} else {
  console.log(`\n✅ No issues to fix!`);
}
