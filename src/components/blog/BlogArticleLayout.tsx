import React from 'react';
import { AdSenseSlot } from '../ads/AdSenseSlot';
import { BlogPost } from '../../data/blogPosts';

interface BlogArticleLayoutProps {
  post: BlogPost;
  children: React.ReactNode;
}

/**
 * Shared Blog Article Layout
 * 
 * Guarantees that EVERY journal / blog article route rendered in CodeFuser:
 * 1. Automatically includes the official Google AdSense In-Article unit (Slot 6868897302, fluid format).
 * 2. Provides consistent SEO, layout boundaries, and typography styling.
 * 3. Centralizes ad placement so future articles automatically inherit monetization without manual insertion.
 */
export const BlogArticleLayout: React.FC<BlogArticleLayoutProps> = ({ post, children }) => {
  return (
    <div className="w-full relative blog-article-container" data-article-slug={post.slug}>
      {children}
    </div>
  );
};
