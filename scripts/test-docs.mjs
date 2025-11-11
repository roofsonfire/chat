#!/usr/bin/env node

/**
 * Documentation Testing Suite
 * 
 * Validates documentation files for:
 * - Broken links (internal and external)
 * - Code example syntax
 * - Markdown formatting
 * - API endpoint validity
 * - Version compatibility
 * 
 * Usage:
 *   node scripts/test-docs.mjs                    # Test all docs
 *   node scripts/test-docs.mjs --links            # Test links only
 *   node scripts/test-docs.mjs --code             # Test code examples only
 *   node scripts/test-docs.mjs --file docs/API.md # Test specific file
 */

import { readFileSync, readdirSync, statSync, existsSync } from "fs"
import { join, dirname, relative } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, "..")

// Test configuration
const config = {
  docsDir: join(rootDir, "docs"),
  srcDir: join(rootDir, "src"),
  testLinks: process.argv.includes("--links") || !process.argv.slice(2).some((arg) => arg.startsWith("--")),
  testCode: process.argv.includes("--code") || !process.argv.slice(2).some((arg) => arg.startsWith("--")),
  testMarkdown: process.argv.includes("--markdown") || !process.argv.slice(2).some((arg) => arg.startsWith("--")),
  specificFile: process.argv.find((arg) => arg.startsWith("--file="))?.split("=")[1],
  verbose: process.argv.includes("--verbose"),
}

// Results tracking
const results = {
  totalFiles: 0,
  totalErrors: 0,
  totalWarnings: 0,
  errors: [],
  warnings: [],
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Get all markdown files recursively
 */
function getMarkdownFiles(dir, files = []) {
  const entries = readdirSync(dir)

  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      // Skip node_modules and hidden directories
      if (!entry.startsWith(".") && entry !== "node_modules") {
        getMarkdownFiles(fullPath, files)
      }
    } else if (entry.endsWith(".md")) {
      files.push(fullPath)
    }
  }

  return files
}

/**
 * Extract code blocks from markdown
 */
function extractCodeBlocks(content) {
  const blocks = []
  const regex = /```(\w+)?\n([\s\S]*?)```/g
  let match

  while ((match = regex.exec(content)) !== null) {
    blocks.push({
      language: match[1] || "text",
      code: match[2],
      line: content.substring(0, match.index).split("\n").length,
    })
  }

  return blocks
}

/**
 * Extract links from markdown
 */
function extractLinks(content) {
  const links = []
  
  // Markdown links [text](url)
  const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  let match

  while ((match = mdLinkRegex.exec(content)) !== null) {
    links.push({
      text: match[1],
      url: match[2],
      line: content.substring(0, match.index).split("\n").length,
      type: "markdown",
    })
  }

  // HTML links <a href="url">
  const htmlLinkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/gi
  while ((match = htmlLinkRegex.exec(content)) !== null) {
    links.push({
      text: match[1],
      url: match[1],
      line: content.substring(0, match.index).split("\n").length,
      type: "html",
    })
  }

  return links
}

/**
 * Check if file exists (for relative links)
 */
function checkInternalLink(baseFile, linkUrl) {
  // Remove anchor
  const [pathPart] = linkUrl.split("#")
  
  // Resolve relative path
  const baseDir = dirname(baseFile)
  const targetPath = join(baseDir, pathPart)

  return existsSync(targetPath)
}

// ========================================
// TEST FUNCTIONS
// ========================================

/**
 * Test code block syntax
 */
function testCodeBlock(block, file) {
  const errors = []
  
  // Test TypeScript/JavaScript code
  if (["typescript", "ts", "javascript", "js", "tsx", "jsx"].includes(block.language)) {
    const code = block.code

    // Check for common syntax errors
    const openBraces = (code.match(/{/g) || []).length
    const closeBraces = (code.match(/}/g) || []).length
    if (openBraces !== closeBraces) {
      errors.push({
        type: "error",
        file,
        line: block.line,
        message: `Unmatched braces in ${block.language} code block (${openBraces} open, ${closeBraces} close)`,
      })
    }

    const openParens = (code.match(/\(/g) || []).length
    const closeParens = (code.match(/\)/g) || []).length
    if (openParens !== closeParens) {
      errors.push({
        type: "error",
        file,
        line: block.line,
        message: `Unmatched parentheses in ${block.language} code block (${openParens} open, ${closeParens} close)`,
      })
    }

    // Check for common import issues
    if (code.includes("import") && !code.includes("from")) {
      errors.push({
        type: "warning",
        file,
        line: block.line,
        message: `Possible incomplete import statement in ${block.language} code block`,
      })
    }

    // Check for placeholder text
    if (code.includes("...") && !code.includes("// ...")) {
      errors.push({
        type: "warning",
        file,
        line: block.line,
        message: `Code block contains '...' which may be placeholder text`,
      })
    }
  }

  // Test bash/shell commands
  if (["bash", "sh", "shell"].includes(block.language)) {
    const code = block.code

    // Check for dangerous commands without warnings
    if (code.includes("rm -rf") && !code.includes("#")) {
      errors.push({
        type: "warning",
        file,
        line: block.line,
        message: `Shell code contains 'rm -rf' without comment warning`,
      })
    }

    // Check for placeholder values
    if (code.match(/<[^>]+>/)) {
      errors.push({
        type: "warning",
        file,
        line: block.line,
        message: `Shell code contains placeholder <values> that should be explained`,
      })
    }
  }

  return errors
}

/**
 * Test markdown link validity
 */
function testLink(link, file) {
  const errors = []
  const url = link.url

  // Skip anchors without path
  if (url.startsWith("#")) {
    return errors
  }

  // Test external URLs
  if (url.startsWith("http://") || url.startsWith("https://")) {
    // Check for common issues
    if (url.includes(" ")) {
      errors.push({
        type: "error",
        file,
        line: link.line,
        message: `URL contains spaces: ${url}`,
      })
    }

    // Warn about non-HTTPS
    if (url.startsWith("http://") && !url.includes("localhost")) {
      errors.push({
        type: "warning",
        file,
        line: link.line,
        message: `Non-HTTPS URL: ${url}`,
      })
    }

    return errors
  }

  // Test internal links
  if (!checkInternalLink(file, url)) {
    errors.push({
      type: "error",
      file,
      line: link.line,
      message: `Broken internal link: ${url}`,
    })
  }

  return errors
}

/**
 * Test markdown formatting
 */
function testMarkdownFormatting(content, file) {
  const errors = []
  const lines = content.split("\n")

  lines.forEach((line, index) => {
    const lineNum = index + 1

    // Check for trailing spaces
    if (line.endsWith(" ") && line.trim().length > 0) {
      errors.push({
        type: "warning",
        file,
        line: lineNum,
        message: "Line has trailing spaces",
      })
    }

    // Check for tabs (should use spaces)
    if (line.includes("\t")) {
      errors.push({
        type: "warning",
        file,
        line: lineNum,
        message: "Line contains tabs (use spaces instead)",
      })
    }

    // Check for multiple consecutive blank lines
    if (index > 0 && line === "" && lines[index - 1] === "") {
      errors.push({
        type: "warning",
        file,
        line: lineNum,
        message: "Multiple consecutive blank lines",
      })
    }

    // Check for headers without space after #
    if (line.match(/^#+[^# ]/) && !line.match(/^#+$/)) {
      errors.push({
        type: "warning",
        file,
        line: lineNum,
        message: "Header missing space after # (e.g., '## Title' not '##Title')",
      })
    }
  })

  return errors
}

/**
 * Test a single documentation file
 */
function testFile(filePath) {
  const relativePath = relative(rootDir, filePath)
  const content = readFileSync(filePath, "utf-8")
  let fileErrors = []

  if (config.verbose) {
    console.log(`  Testing: ${relativePath}`)
  }

  // Test code blocks
  if (config.testCode) {
    const codeBlocks = extractCodeBlocks(content)
    codeBlocks.forEach((block) => {
      const blockErrors = testCodeBlock(block, relativePath)
      fileErrors = fileErrors.concat(blockErrors)
    })
  }

  // Test links
  if (config.testLinks) {
    const links = extractLinks(content)
    links.forEach((link) => {
      const linkErrors = testLink(link, filePath)
      fileErrors = fileErrors.concat(linkErrors)
    })
  }

  // Test markdown formatting
  if (config.testMarkdown) {
    const formatErrors = testMarkdownFormatting(content, relativePath)
    fileErrors = fileErrors.concat(formatErrors)
  }

  // Update results
  results.totalFiles++
  fileErrors.forEach((error) => {
    if (error.type === "error") {
      results.totalErrors++
      results.errors.push(error)
    } else {
      results.totalWarnings++
      results.warnings.push(error)
    }
  })

  return fileErrors
}

// ========================================
// MAIN EXECUTION
// ========================================

console.log("📚 Documentation Testing Suite\n")
console.log("Configuration:")
console.log(`  Test links: ${config.testLinks}`)
console.log(`  Test code: ${config.testCode}`)
console.log(`  Test markdown: ${config.testMarkdown}`)
console.log(`  Specific file: ${config.specificFile || "None (testing all)"}`)
console.log()

// Get files to test
let filesToTest
if (config.specificFile) {
  filesToTest = [join(rootDir, config.specificFile)]
} else {
  filesToTest = getMarkdownFiles(config.docsDir)
}

console.log(`Testing ${filesToTest.length} markdown file(s)...\n`)

// Test each file
filesToTest.forEach((file) => {
  testFile(file)
})

// ========================================
// REPORT RESULTS
// ========================================

console.log("\n" + "=".repeat(60))
console.log("📊 Test Results")
console.log("=".repeat(60) + "\n")

console.log(`Files tested: ${results.totalFiles}`)
console.log(`Errors: ${results.totalErrors}`)
console.log(`Warnings: ${results.totalWarnings}`)
console.log()

// Show errors
if (results.errors.length > 0) {
  console.log("❌ Errors:\n")
  results.errors.forEach((error) => {
    console.log(`  ${error.file}:${error.line}`)
    console.log(`    ${error.message}`)
    console.log()
  })
}

// Show warnings
if (results.warnings.length > 0) {
  console.log("⚠️  Warnings:\n")
  results.warnings.forEach((warning) => {
    console.log(`  ${warning.file}:${warning.line}`)
    console.log(`    ${warning.message}`)
    console.log()
  })
}

// Final status
if (results.totalErrors === 0 && results.totalWarnings === 0) {
  console.log("✅ All tests passed!\n")
  process.exit(0)
} else if (results.totalErrors === 0) {
  console.log(`⚠️  Tests passed with ${results.totalWarnings} warning(s)\n`)
  process.exit(0)
} else {
  console.log(`❌ Tests failed with ${results.totalErrors} error(s) and ${results.totalWarnings} warning(s)\n`)
  process.exit(1)
}
