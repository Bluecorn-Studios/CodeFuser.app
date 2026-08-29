import fs from 'fs';
import path from 'path';
import { BLOG_POSTS, BlogPost } from '../src/data/blogPosts';

const BASE_URL = 'https://codefuser.in';

// Static public routes with their priority and change frequency
const STATIC_PAGES = [
  { path: '', changefreq: 'weekly', priority: '1.0' },
  { path: 'story', changefreq: 'monthly', priority: '0.8' },
  { path: 'process', changefreq: 'monthly', priority: '0.8' },
  { path: 'portfolio', changefreq: 'weekly', priority: '0.9' },
  { path: 'pricing', changefreq: 'monthly', priority: '0.9' },
  { path: 'faq', changefreq: 'monthly', priority: '0.7' },
  { path: 'contact', changefreq: 'monthly', priority: '0.8' },
  { path: 'blog', changefreq: 'weekly', priority: '0.9' },
];

function formatDate(dateStr?: string): string {
  if (!dateStr) return '2026-08-28';
  
  // Try parsing ISO date or standard formatted date (e.g., "August 28, 2026")
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Fallback default
  return '2026-08-28';
}

export function generateSitemap(): string {
  const seenUrls = new Set<string>();
  const entries: { loc: string; lastmod: string; changefreq: string; priority: string }[] = [];

  // 1. Add static public pages
  for (const page of STATIC_PAGES) {
    const loc = page.path === '' ? `${BASE_URL}/` : `${BASE_URL}/${page.path}`;
    
    if (seenUrls.has(loc)) {
      throw new Error(`Duplicate static URL detected in sitemap generation: ${loc}`);
    }
    seenUrls.add(loc);

    entries.push({
      loc,
      lastmod: '2026-08-28',
      changefreq: page.changefreq,
      priority: page.priority,
    });
  }

  // 2. Add published blog articles (strictly exclude drafts)
  const publishedArticles = BLOG_POSTS.filter((post) => post.status !== 'draft');

  for (const post of publishedArticles) {
    if (!post.slug) {
      throw new Error(`Article with ID "${post.id}" is missing a slug.`);
    }

    const expectedCanonical = `${BASE_URL}/blog/${post.slug}`;
    const loc = post.canonicalUrl || expectedCanonical;

    // Safety checks
    if (!loc.startsWith(BASE_URL)) {
      throw new Error(`Invalid URL for article "${post.title}": URL must start with "${BASE_URL}". Found "${loc}"`);
    }

    if (loc.includes('localhost') || loc.includes('127.0.0.1') || loc.includes('ais-dev') || loc.includes('ais-pre')) {
      throw new Error(`Development/preview URL detected for article "${post.title}": "${loc}"`);
    }

    if (seenUrls.has(loc)) {
      throw new Error(`Duplicate article URL in sitemap: ${loc}`);
    }
    seenUrls.add(loc);

    const articleLastMod = formatDate(post.lastUpdatedDate || post.publishedDate);

    entries.push({
      loc,
      lastmod: articleLastMod,
      changefreq: 'monthly',
      priority: post.featured ? '0.9' : '0.8',
    });
  }

  // 3. Build XML
  const xmlLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  for (const entry of entries) {
    xmlLines.push('  <url>');
    xmlLines.push(`    <loc>${entry.loc}</loc>`);
    xmlLines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
    xmlLines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
    xmlLines.push(`    <priority>${entry.priority}</priority>`);
    xmlLines.push('  </url>');
  }

  xmlLines.push('</urlset>');
  xmlLines.push('');

  return xmlLines.join('\n');
}

export function syncAdsTxt(): void {
  const adsTxtPath = path.resolve(process.cwd(), 'public/ads.txt');
  const rawPublisherId = process.env.VITE_ADSENSE_PUBLISHER_ID || '';
  
  if (rawPublisherId && rawPublisherId.trim() !== '' && !rawPublisherId.includes('XXXX')) {
    const cleanedId = rawPublisherId.replace(/^(ca-)?pub-/, '').trim();
    const content = [
      '# CodeFuser (https://codefuser.in) Google AdSense Authorized Digital Sellers (ads.txt)',
      `google.com, pub-${cleanedId}, DIRECT, f08c47fec0942fa0`,
      '',
    ].join('\n');
    fs.writeFileSync(adsTxtPath, content, 'utf-8');
    console.log(`✅ Synced public/ads.txt with Publisher ID: pub-${cleanedId.slice(-4)}`);
  } else if (!fs.existsSync(adsTxtPath)) {
    const defaultContent = [
      '# CodeFuser (https://codefuser.in) Google AdSense Authorized Digital Sellers (ads.txt)',
      '# Google AdSense standard ads.txt entry format:',
      '# google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0',
      '#',
      '# Note: Real Publisher ID will be automatically inserted here upon production configuration.',
      '',
    ].join('\n');
    fs.writeFileSync(adsTxtPath, defaultContent, 'utf-8');
    console.log('✅ Generated baseline public/ads.txt');
  }
}

function run() {
  try {
    console.log('🔄 Generating public/sitemap.xml from master blog registry...');
    const sitemapContent = generateSitemap();
    const outputPath = path.resolve(process.cwd(), 'public/sitemap.xml');

    fs.writeFileSync(outputPath, sitemapContent, 'utf-8');
    console.log(`✅ Successfully generated ${outputPath}`);

    // Sync ads.txt
    syncAdsTxt();
  } catch (error) {
    console.error('❌ Sitemap Generation Failed:', error);
    process.exit(1);
  }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  run();
}
