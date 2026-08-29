import fs from 'fs';
import path from 'path';
import { BLOG_POSTS, BlogPost } from '../src/data/blogPosts';
import { getPostSeoTitle, getPostSeoDescription, SEO_CONSTRAINTS } from '../src/utils/seoHelper';

const BASE_URL = 'https://codefuser.in';

export interface VerificationFailure {
  articleTitle?: string;
  articleId?: string;
  problem: string;
  expected: string;
  found: string;
}

export interface SeoAuditRow {
  index: number;
  id: string;
  slug: string;
  headlineH1: string;
  seoTitle: string;
  seoTitleLength: number;
  seoDesc: string;
  seoDescLength: number;
  titleStatus: 'OPTIMAL' | 'TOO_SHORT' | 'TOO_LONG';
  descStatus: 'OPTIMAL' | 'TOO_SHORT' | 'TOO_LONG';
  overallStatus: 'PASS' | 'WARN' | 'FAIL';
}

export function runSeoVerification(): {
  passed: boolean;
  failures: VerificationFailure[];
  adsenseStatus: string;
  auditRows: SeoAuditRow[];
} {
  const failures: VerificationFailure[] = [];
  const auditRows: SeoAuditRow[] = [];

  // Read public/sitemap.xml
  const sitemapPath = path.resolve(process.cwd(), 'public/sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    failures.push({
      problem: 'Missing sitemap file',
      expected: 'public/sitemap.xml to exist on disk',
      found: 'File does not exist',
    });
    return { passed: false, failures, adsenseStatus: 'NOT CONFIGURED', auditRows: [] };
  }

  const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
  const locMatches = [...sitemapContent.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

  // Check 3: Duplicate sitemap URLs
  const sitemapUrlCounts = new Map<string, number>();
  for (const url of locMatches) {
    sitemapUrlCounts.set(url, (sitemapUrlCounts.get(url) || 0) + 1);
  }
  for (const [url, count] of sitemapUrlCounts.entries()) {
    if (count > 1) {
      failures.push({
        problem: 'Duplicate sitemap URL',
        expected: 'Each URL to appear exactly once',
        found: `URL "${url}" appears ${count} times in sitemap.xml`,
      });
    }
  }

  // Check 9 & 10: Invalid or localhost URLs in sitemap
  for (const url of locMatches) {
    if (!url.startsWith('https://codefuser.in')) {
      failures.push({
        problem: 'Invalid or non-HTTPS hostname in sitemap',
        expected: 'URL starting with https://codefuser.in',
        found: url,
      });
    }
    if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('ais-dev') || url.includes('ais-pre')) {
      failures.push({
        problem: 'Localhost / Development URL in sitemap',
        expected: 'Production URL (https://codefuser.in/...)',
        found: url,
      });
    }
  }

  // Read robots.txt
  const robotsPath = path.resolve(process.cwd(), 'public/robots.txt');
  let robotsContent = '';
  if (fs.existsSync(robotsPath)) {
    robotsContent = fs.readFileSync(robotsPath, 'utf-8');
  } else {
    failures.push({
      problem: 'Missing robots.txt file',
      expected: 'public/robots.txt to exist',
      found: 'File does not exist',
    });
  }

  // Check 8: Ensure /blog or /blog/* is not disallowed in robots.txt
  const disallowMatches = [...robotsContent.matchAll(/Disallow:\s*([^\r\n]+)/g)].map((m) => m[1].trim());
  for (const dis of disallowMatches) {
    if (dis === '/blog' || dis === '/blog/' || dis === '/blog/*') {
      failures.push({
        problem: 'Public blog is blocked by robots.txt',
        expected: 'Allow: / or no Disallow for /blog',
        found: `Disallow: ${dis}`,
      });
    }
  }

  // Check sitemap directive in robots.txt
  if (!robotsContent.includes('Sitemap: https://codefuser.in/sitemap.xml')) {
    failures.push({
      problem: 'Robots.txt missing correct Sitemap reference',
      expected: 'Sitemap: https://codefuser.in/sitemap.xml',
      found: 'Missing or incorrect sitemap line in public/robots.txt',
    });
  }

  // Read App.tsx to verify routes
  const appPath = path.resolve(process.cwd(), 'src/App.tsx');
  const appContent = fs.existsSync(appPath) ? fs.readFileSync(appPath, 'utf-8') : '';

  // Check 12: Duplicate article slugs in BLOG_POSTS
  const seenSlugs = new Set<string>();
  const seenSeoTitles = new Map<string, string>();
  const seenSeoDescs = new Map<string, string>();

  let idx = 0;
  for (const post of BLOG_POSTS) {
    idx++;
    if (seenSlugs.has(post.slug)) {
      failures.push({
        articleTitle: post.title,
        articleId: post.id,
        problem: 'Duplicate article slug exists in blogPosts.ts',
        expected: `Unique slug across all articles`,
        found: `Duplicate slug "${post.slug}"`,
      });
    }
    seenSlugs.add(post.slug);

    const isPublished = post.status !== 'draft';
    const expectedCanonical = `${BASE_URL}/blog/${post.slug}`;
    const expectedAppRoute = `/blog/${post.slug}`;

    // Compute active SEO tags using centralized resolver
    const activeSeoTitle = getPostSeoTitle(post);
    const activeSeoDesc = getPostSeoDescription(post);

    const titleLen = activeSeoTitle.length;
    const descLen = activeSeoDesc.length;

    const titleStatus: 'OPTIMAL' | 'TOO_SHORT' | 'TOO_LONG' =
      titleLen < SEO_CONSTRAINTS.TITLE_MIN_LENGTH
        ? 'TOO_SHORT'
        : titleLen > SEO_CONSTRAINTS.TITLE_MAX_LENGTH
        ? 'TOO_LONG'
        : 'OPTIMAL';

    const descStatus: 'OPTIMAL' | 'TOO_SHORT' | 'TOO_LONG' =
      descLen < SEO_CONSTRAINTS.DESC_MIN_LENGTH
        ? 'TOO_SHORT'
        : descLen > SEO_CONSTRAINTS.DESC_MAX_LENGTH
        ? 'TOO_LONG'
        : 'OPTIMAL';

    // Title uniqueness check
    if (seenSeoTitles.has(activeSeoTitle)) {
      failures.push({
        articleTitle: post.title,
        articleId: post.id,
        problem: 'Duplicate SEO Title detected',
        expected: 'Each article to have a unique SEO title',
        found: `Duplicates title of "${seenSeoTitles.get(activeSeoTitle)}" ("${activeSeoTitle}")`,
      });
    } else {
      seenSeoTitles.set(activeSeoTitle, post.title);
    }

    // Description uniqueness check
    if (seenSeoDescs.has(activeSeoDesc)) {
      failures.push({
        articleTitle: post.title,
        articleId: post.id,
        problem: 'Duplicate SEO Description detected',
        expected: 'Each article to have a unique meta description',
        found: `Duplicates description of "${seenSeoDescs.get(activeSeoDesc)}"`,
      });
    } else {
      seenSeoDescs.set(activeSeoDesc, post.title);
    }

    // Title length constraint verification
    if (titleLen < SEO_CONSTRAINTS.TITLE_MIN_LENGTH || titleLen > SEO_CONSTRAINTS.TITLE_MAX_LENGTH) {
      failures.push({
        articleTitle: post.title,
        articleId: post.id,
        problem: `SEO Title length out of range (${titleLen} chars)`,
        expected: `Between ${SEO_CONSTRAINTS.TITLE_MIN_LENGTH} and ${SEO_CONSTRAINTS.TITLE_MAX_LENGTH} characters`,
        found: `"${activeSeoTitle}" (${titleLen} chars)`,
      });
    }

    // Description length constraint verification
    if (descLen < SEO_CONSTRAINTS.DESC_MIN_LENGTH || descLen > SEO_CONSTRAINTS.DESC_MAX_LENGTH) {
      failures.push({
        articleTitle: post.title,
        articleId: post.id,
        problem: `SEO Meta Description length out of range (${descLen} chars)`,
        expected: `Between ${SEO_CONSTRAINTS.DESC_MIN_LENGTH} and ${SEO_CONSTRAINTS.DESC_MAX_LENGTH} characters`,
        found: `"${activeSeoDesc}" (${descLen} chars)`,
      });
    }

    // Check mandatory metadata fields
    const missingFields: string[] = [];
    if (!post.id) missingFields.push('id');
    if (!post.slug) missingFields.push('slug');
    if (!post.title) missingFields.push('title');
    if (!post.metaDescription) missingFields.push('metaDescription');
    if (!post.category) missingFields.push('category');
    if (!post.primaryTopic) missingFields.push('primaryTopic');
    if (!post.articleType) missingFields.push('articleType');
    if (!post.contentLevel) missingFields.push('contentLevel');
    if (!post.publishedDate) missingFields.push('publishedDate');
    if (!post.readingTime) missingFields.push('readingTime');
    if (!post.canonicalUrl) missingFields.push('canonicalUrl');

    if (missingFields.length > 0) {
      failures.push({
        articleTitle: post.title || 'Untitled',
        articleId: post.id || 'unknown',
        problem: 'Required article metadata is missing',
        expected: 'All mandatory fields populated',
        found: `Missing fields: [${missingFields.join(', ')}]`,
      });
    }

    // Check canonical mismatch
    if (post.canonicalUrl !== expectedCanonical) {
      failures.push({
        articleTitle: post.title,
        articleId: post.id,
        problem: 'Canonical mismatch',
        expected: expectedCanonical,
        found: post.canonicalUrl,
      });
    }

    if (isPublished) {
      // Check: Published article missing from sitemap
      if (!locMatches.includes(expectedCanonical)) {
        failures.push({
          articleTitle: post.title,
          articleId: post.id,
          problem: 'Published article missing from sitemap',
          expected: `Sitemap to contain ${expectedCanonical}`,
          found: 'Not found in public/sitemap.xml',
        });
      }

      // Check: Published article has valid route in App.tsx
      if (!appContent.includes(expectedAppRoute)) {
        failures.push({
          articleTitle: post.title,
          articleId: post.id,
          problem: 'Published article has no route in App.tsx',
          expected: `App.tsx to include route '${expectedAppRoute}'`,
          found: 'Route not registered in App.tsx',
        });
      }
    } else {
      // Check: Draft article appears in sitemap
      if (locMatches.includes(expectedCanonical)) {
        failures.push({
          articleTitle: post.title,
          articleId: post.id,
          problem: 'Draft article appears in sitemap',
          expected: 'Draft articles must be excluded from public sitemap.xml',
          found: `Draft URL "${expectedCanonical}" found in sitemap`,
        });
      }
    }

    // Check related articles references
    if (post.relatedArticles && post.relatedArticles.length > 0) {
      for (const relatedSlug of post.relatedArticles) {
        const targetPost = BLOG_POSTS.find((p) => p.slug === relatedSlug);
        if (!targetPost) {
          failures.push({
            articleTitle: post.title,
            articleId: post.id,
            problem: 'Invalid related article reference',
            expected: `Related article slug "${relatedSlug}" to exist in blogPosts.ts`,
            found: `Unknown slug "${relatedSlug}" referenced in relatedArticles`,
          });
        }
      }
    }

    auditRows.push({
      index: idx,
      id: post.id,
      slug: post.slug,
      headlineH1: post.title,
      seoTitle: activeSeoTitle,
      seoTitleLength: titleLen,
      seoDesc: activeSeoDesc,
      seoDescLength: descLen,
      titleStatus,
      descStatus,
      overallStatus: titleStatus === 'OPTIMAL' && descStatus === 'OPTIMAL' ? 'PASS' : 'WARN',
    });
  }

  // Check ads.txt presence
  const adsTxtPath = path.resolve(process.cwd(), 'public/ads.txt');
  if (!fs.existsSync(adsTxtPath)) {
    failures.push({
      problem: 'Missing ads.txt file',
      expected: 'public/ads.txt to exist in public root',
      found: 'File does not exist',
    });
  }

  // Check AdSense Configuration
  const rawPublisherId = process.env.VITE_ADSENSE_PUBLISHER_ID || '';
  const isAdSenseConfigured = Boolean(
    rawPublisherId &&
    rawPublisherId.trim() !== '' &&
    !rawPublisherId.includes('XXXX')
  );

  let adsenseStatus = 'NOT CONFIGURED';
  if (isAdSenseConfigured) {
    const isEnabled = process.env.VITE_ADSENSE_ENABLED === 'true';
    adsenseStatus = isEnabled ? 'ENABLED' : 'CONFIGURED';

    const cleanedId = rawPublisherId.replace(/^(ca-)?pub-/, '');
    if (!/^\d{16}$/.test(cleanedId)) {
      failures.push({
        problem: 'Invalid AdSense Publisher ID format',
        expected: '16-digit numeric publisher ID',
        found: rawPublisherId,
      });
    }

    const adsTxtContent = fs.existsSync(adsTxtPath) ? fs.readFileSync(adsTxtPath, 'utf-8') : '';
    const expectedAdsTxtEntry = `google.com, pub-${cleanedId}, DIRECT, f08c47fec0942fa0`;
    if (!adsTxtContent.includes(`pub-${cleanedId}`)) {
      failures.push({
        problem: 'ads.txt missing configured publisher ID entry',
        expected: `Entry matching: "${expectedAdsTxtEntry}" in public/ads.txt`,
        found: 'Configured publisher ID not present in public/ads.txt',
      });
    }
  }

  return {
    passed: failures.length === 0,
    failures,
    adsenseStatus,
    auditRows,
  };
}

function run() {
  console.log('🔍 Running automated SEO, Metadata & Sitemap verification...');
  const result = runSeoVerification();

  console.log(`\n========================================================================================`);
  console.log(`📊 CODEFUSER CENTRALIZED BLOG SEO AUDIT (29 ARTICLES)`);
  console.log(`========================================================================================`);
  console.table(
    result.auditRows.map((r) => ({
      '#': r.index,
      'Article Slug': r.slug.length > 32 ? r.slug.slice(0, 29) + '...' : r.slug,
      'SEO Title': r.seoTitle.length > 45 ? r.seoTitle.slice(0, 42) + '...' : r.seoTitle,
      'Title Chars': r.seoTitleLength,
      'Title State': r.titleStatus,
      'Desc Chars': r.seoDescLength,
      'Desc State': r.descStatus,
      'Status': r.overallStatus,
    }))
  );

  if (!result.passed) {
    console.error('\n========================================');
    console.error('❌ SEO VERIFICATION FAILED');
    console.error('========================================\n');

    for (const f of result.failures) {
      if (f.articleTitle) {
        console.error(`Article: ${f.articleTitle} (${f.articleId || 'no-id'})`);
      }
      console.error(`Problem: ${f.problem}`);
      console.error(`Expected: ${f.expected}`);
      console.error(`Found: ${f.found}`);
      console.error('----------------------------------------');
    }

    console.error('\nVerification failed. Aborting build.');
    process.exit(1);
  }

  console.log(`\n✅ SEO Verification PASSED (All 29 articles satisfy length, uniqueness, canonical, routing & robots requirements).`);
  console.log(`ℹ️ ADSENSE STATUS: ${result.adsenseStatus}`);
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  run();
}
