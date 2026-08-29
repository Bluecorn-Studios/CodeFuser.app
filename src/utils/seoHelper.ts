import { useEffect } from 'react';
import { BlogPost } from '../data/blogPosts';

export const SEO_CONSTRAINTS = {
  TITLE_MIN_LENGTH: 35,
  TITLE_MAX_LENGTH: 65,
  TITLE_TARGET: 55,
  DESC_MIN_LENGTH: 120,
  DESC_MAX_LENGTH: 160,
  DESC_TARGET: 145,
};

/**
 * Derives a clean, concise, keyword-accurate SEO <title> tag for a blog post.
 * Respects the strict 35–65 character limit expected by Google & Bing.
 * Falls back to intelligent truncation and brand suffix handling.
 */
export function getPostSeoTitle(post: BlogPost): string {
  // 1. Explicitly curated seoTitle takes precedence if within valid bounds
  if (post.seoTitle && post.seoTitle.trim().length >= SEO_CONSTRAINTS.TITLE_MIN_LENGTH && post.seoTitle.trim().length <= SEO_CONSTRAINTS.TITLE_MAX_LENGTH) {
    return post.seoTitle.trim();
  }

  const candidate = (post.seoTitle || post.title || '').trim();

  // If candidate is within bounds
  if (candidate.length >= SEO_CONSTRAINTS.TITLE_MIN_LENGTH && candidate.length <= SEO_CONSTRAINTS.TITLE_MAX_LENGTH) {
    return candidate;
  }

  // If shorter than minimum, append brand suffix if it fits
  if (candidate.length < SEO_CONSTRAINTS.TITLE_MIN_LENGTH) {
    const withBrand = `${candidate} | CodeFuser`;
    if (withBrand.length <= SEO_CONSTRAINTS.TITLE_MAX_LENGTH) {
      return withBrand;
    }
  }

  // If candidate is too long (> 65 chars), split on natural punctuation (:, —, -, ?)
  const punctuationSplit = candidate.split(/[:—–-]/);
  if (punctuationSplit.length > 1) {
    const firstClause = punctuationSplit[0].trim();
    if (firstClause.length >= SEO_CONSTRAINTS.TITLE_MIN_LENGTH && firstClause.length <= SEO_CONSTRAINTS.TITLE_MAX_LENGTH) {
      return firstClause;
    }
    const withBrand = `${firstClause} | CodeFuser`;
    if (withBrand.length >= SEO_CONSTRAINTS.TITLE_MIN_LENGTH && withBrand.length <= SEO_CONSTRAINTS.TITLE_MAX_LENGTH) {
      return withBrand;
    }
  }

  // Word boundary truncation
  const words = candidate.split(' ');
  let trimmed = '';
  for (const word of words) {
    if ((trimmed + (trimmed ? ' ' : '') + word).length > (SEO_CONSTRAINTS.TITLE_MAX_LENGTH)) {
      break;
    }
    trimmed += (trimmed ? ' ' : '') + word;
  }

  trimmed = trimmed.replace(/[,:;—–-]$/, '').trim();
  if (trimmed.length >= SEO_CONSTRAINTS.TITLE_MIN_LENGTH) {
    return trimmed;
  }

  return candidate.slice(0, SEO_CONSTRAINTS.TITLE_MAX_LENGTH).trim();
}

/**
 * Derives a clean, concise, non-truncated SEO <meta name="description"> for a blog post.
 * Enforces the strict 120–160 character range expected by Google & Bing.
 */
export function getPostSeoDescription(post: BlogPost): string {
  // 1. Explicitly curated seoDescription takes precedence if valid
  if (post.seoDescription && post.seoDescription.trim().length >= SEO_CONSTRAINTS.DESC_MIN_LENGTH && post.seoDescription.trim().length <= SEO_CONSTRAINTS.DESC_MAX_LENGTH) {
    return post.seoDescription.trim();
  }

  const raw = (post.seoDescription || post.metaDescription || '').trim();

  // If already in target range
  if (raw.length >= SEO_CONSTRAINTS.DESC_MIN_LENGTH && raw.length <= SEO_CONSTRAINTS.DESC_MAX_LENGTH) {
    return raw;
  }

  // If too long (> 160 chars), split by sentences first
  if (raw.length > SEO_CONSTRAINTS.DESC_MAX_LENGTH) {
    const sentences = raw.split(/(?<=[.!?])\s+/);
    let accum = '';
    for (const s of sentences) {
      if ((accum + (accum ? ' ' : '') + s).length <= SEO_CONSTRAINTS.DESC_MAX_LENGTH) {
        accum += (accum ? ' ' : '') + s;
      } else {
        break;
      }
    }

    if (accum.length >= SEO_CONSTRAINTS.DESC_MIN_LENGTH) {
      return accum.trim();
    }

    // Word boundary fallback
    const words = raw.split(' ');
    let wordAccum = '';
    for (const w of words) {
      if ((wordAccum + (wordAccum ? ' ' : '') + w).length > (SEO_CONSTRAINTS.DESC_MAX_LENGTH - 1)) {
        break;
      }
      wordAccum += (wordAccum ? ' ' : '') + w;
    }
    wordAccum = wordAccum.replace(/[,;—–-]$/, '').trim();
    if (!/[.!?]$/.test(wordAccum)) {
      wordAccum += '.';
    }
    return wordAccum;
  }

  // If too short (< 120 chars), append contextual summary
  if (raw.length < SEO_CONSTRAINTS.DESC_MIN_LENGTH) {
    const suffix = post.primaryTopic ? ` Comprehensive analysis on ${post.primaryTopic.toLowerCase()} by CodeFuser.` : ' In-depth technology and software research on CodeFuser.';
    const expanded = (raw.replace(/\.?$/, '.') + suffix).trim();
    if (expanded.length <= SEO_CONSTRAINTS.DESC_MAX_LENGTH && expanded.length >= SEO_CONSTRAINTS.DESC_MIN_LENGTH) {
      return expanded;
    }
  }

  return raw;
}

/**
 * Custom React hook that sets all dynamic SEO meta tags, title, canonical link,
 * OpenGraph, Twitter Cards, and Article JSON-LD for the current article page.
 */
export function useArticleSEO(post: BlogPost | undefined) {
  useEffect(() => {
    if (!post) return;

    const seoTitle = getPostSeoTitle(post);
    const seoDesc = getPostSeoDescription(post);

    // 1. Document Title
    document.title = seoTitle;

    // Helper for meta tags
    const setMeta = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let tag = document.querySelector<HTMLMetaElement>(selector);
      if (!tag) {
        tag = document.createElement('meta');
        if (isProperty) {
          tag.setAttribute('property', name);
        } else {
          tag.setAttribute('name', name);
        }
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    // 2. Standard & Search Engine Meta Tags
    setMeta('description', seoDesc);
    
    // 3. Canonical Tag
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = post.canonicalUrl;

    // 4. OpenGraph Metadata
    setMeta('og:title', seoTitle, true);
    setMeta('og:description', seoDesc, true);
    setMeta('og:url', post.canonicalUrl, true);
    setMeta('og:type', 'article', true);
    setMeta('og:site_name', 'CodeFuser', true);

    // 5. Twitter Card Metadata
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', seoTitle);
    setMeta('twitter:description', seoDesc);

    // 6. Structured JSON-LD Article Schema
    const scriptId = `json-ld-article-${post.id}`;
    let schemaScript = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = scriptId;
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }
    schemaScript.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': post.title,
      'description': seoDesc,
      'author': {
        '@type': 'Organization',
        'name': post.author || 'CodeFuser',
        'url': 'https://codefuser.in'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'CodeFuser',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://codefuser.in/logo.svg'
        }
      },
      'datePublished': post.publishedDate,
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': post.canonicalUrl
      }
    });

    return () => {
      const scriptToRemove = document.getElementById(scriptId);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [post]);
}
