#!/usr/bin/env node

/**
 * SEO Validation Script for Leader Leap Assessment Tool
 * 
 * This script checks for common SEO issues in the codebase.
 * Run with: node scripts/seo-check.js
 */

import fs from 'fs';
import path from 'path';

// SEO checklist items
const seoChecks = [
  {
    name: 'Meta Title',
    check: (content) => content.includes('<title>') && !content.includes('leader-leap-dashboard'),
    message: '✅ Meta title is properly set and descriptive'
  },
  {
    name: 'Meta Description',
    check: (content) => content.includes('meta name="description"') && content.includes('leadership'),
    message: '✅ Meta description includes relevant keywords'
  },
  {
    name: 'Open Graph Tags',
    check: (content) => content.includes('og:title') && content.includes('og:description'),
    message: '✅ Open Graph tags are present'
  },
  {
    name: 'Twitter Cards',
    check: (content) => content.includes('twitter:card') && content.includes('twitter:title'),
    message: '✅ Twitter Card meta tags are present'
  },
  {
    name: 'Structured Data',
    check: (content) => content.includes('application/ld+json'),
    message: '✅ Structured data (JSON-LD) is present'
  },
  {
    name: 'Canonical URL',
    check: (content) => content.includes('rel="canonical"'),
    message: '✅ Canonical URL is set'
  },
  {
    name: 'Viewport Meta Tag',
    check: (content) => content.includes('viewport'),
    message: '✅ Viewport meta tag is present'
  },
  {
    name: 'Charset Declaration',
    check: (content) => content.includes('charset="UTF-8"'),
    message: '✅ UTF-8 charset is declared'
  }
];

// File checks
const fileChecks = [
  {
    name: 'Sitemap',
    path: 'public/sitemap.xml',
    check: (content) => content.includes('<?xml') && content.includes('<urlset'),
    message: '✅ Sitemap.xml exists and is properly formatted'
  },
  {
    name: 'Robots.txt',
    path: 'public/robots.txt',
    check: (content) => content.includes('User-agent') && content.includes('Sitemap'),
    message: '✅ Robots.txt exists and includes sitemap reference'
  },
  {
    name: 'Favicon',
    path: 'public/favicon.ico',
    check: () => fs.existsSync('public/favicon.ico'),
    message: '✅ Favicon exists'
  }
];

// Component checks
const componentChecks = [
  {
    name: 'SEO Component',
    path: 'src/components/SEO.tsx',
    check: (content) => content.includes('react-helmet-async') && content.includes('Helmet'),
    message: '✅ SEO component is implemented'
  }
];

function checkFile(filePath, checks) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  let allPassed = true;

  checks.forEach(check => {
    if (check.check(content)) {
      console.log(check.message);
    } else {
      console.log(`❌ ${check.name} check failed`);
      allPassed = false;
    }
  });

  return allPassed;
}

function checkFileExists(filePath, check) {
  if (check.check()) {
    console.log(check.message);
    return true;
  } else {
    console.log(`❌ ${check.name} check failed`);
    return false;
  }
}

function main() {
  console.log('🔍 SEO Validation Check for Leader Leap Assessment Tool\n');

  // Check index.html
  console.log('📄 Checking index.html...');
  const indexHtmlPassed = checkFile('index.html', seoChecks);

  // Check sitemap and robots
  console.log('\n📄 Checking sitemap and robots...');
  let fileChecksPassed = true;
  fileChecks.forEach(check => {
    if (!checkFileExists(check.path, check)) {
      fileChecksPassed = false;
    }
  });

  // Check SEO component
  console.log('\n📄 Checking SEO component...');
  const componentPassed = checkFile('src/components/SEO.tsx', componentChecks);

  // Summary
  console.log('\n📊 Summary:');
  if (indexHtmlPassed && fileChecksPassed && componentPassed) {
    console.log('✅ All SEO checks passed!');
  } else {
    console.log('❌ Some SEO checks failed. Review the issues above.');
  }

  // Recommendations
  console.log('\n💡 Additional Recommendations:');
  console.log('1. Replace "your-domain.com" with actual domain in all files');
  console.log('2. Create Open Graph images (1200x630px)');
  console.log('3. Set up Google Analytics tracking');
  console.log('4. Submit sitemap to Google Search Console');
  console.log('5. Monitor Core Web Vitals');
}

// Run the main function if this script is executed directly
main(); 