import fs from 'fs';
import path from 'path';
import { BLOG_POSTS, BlogPost } from '../src/data/blogPosts';

const BASE_URL = 'https://codefuser.in';

interface VerificationFailure {
  articleTitle?: string;
  articleId?: string;
  problem: string;
  expected: string;
  found: string;
}

export function runSeoVerification(): { passed: boolean; failures: VerificationFailure[] } {
  const failures: VerificationFailure[] = [];

  // Read public/sitemap.xml
  const sitemapPath = path.resolve(process.cwd(), 'public/sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    failures.push({
      problem: 'Missing sitemap file',
      expected: 'public/sitemap.xml to exist on disk',
      found: 'File does not exist',
    });
    return { passed: false, failures };
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
  for (const post of BLOG_POSTS) {
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
  }

  // Audit each article in BLOG_POSTS
  for (const post of BLOG_POSTS) {
    const isPublished = post.status !== 'draft';
    const expectedCanonical = `${BASE_URL}/blog/${post.slug}`;
    const expectedAppRoute = `/blog/${post.slug}`;

    // Check 11: Mandatory metadata fields
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
        expected: 'All mandatory fields populated (id, slug, title, metaDescription, category, primaryTopic, articleType, contentLevel, publishedDate, readingTime, canonicalUrl)',
        found: `Missing fields: [${missingFields.join(', ')}]`,
      });
    }

    // Check 4: Article canonical does not match expected production URL
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
      // Check 1: Published article missing from sitemap
      if (!locMatches.includes(expectedCanonical)) {
        failures.push({
          articleTitle: post.title,
          articleId: post.id,
          problem: 'Published article missing from sitemap',
          expected: `Sitemap to contain ${expectedCanonical}`,
          found: 'Not found in public/sitemap.xml',
        });
      }

      // Check 6: Published article has valid route in App.tsx
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
      // Check 2: Draft article appears in sitemap
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

    // Check related articles references (Phase 5: Internal Discovery & no broken links)
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
  }

  return {
    passed: failures.length === 0,
    failures,
  };
}

function run() {
  console.log('🔍 Running automated SEO & Sitemap verification...');
  const result = runSeoVerification();

  if (!result.passed) {
    console.error('\n========================================');
    console.error('❌ SEO BUILD FAILED');
    console.error('========================================\n');

    for (const f of result.failures) {
      if (f.articleTitle) {
        console.error(`Article:`);
        console.error(`  ${f.articleTitle} (${f.articleId || 'no-id'})`);
      }
      console.error(`Problem:`);
      console.error(`  ${f.problem}`);
      console.error(`Expected:`);
      console.error(`  ${f.expected}`);
      console.error(`Found:`);
      console.error(`  ${f.found}`);
      console.error('----------------------------------------');
    }

    console.error('\nVerification failed. Aborting build.');
    process.exit(1);
  }

  console.log('✅ SEO Verification PASSED (All sitemap, canonical, route, robots, and registry rules verified).');
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  run();
}
