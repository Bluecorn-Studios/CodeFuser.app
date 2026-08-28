import React, { useState, useEffect, useMemo } from 'react';
import { R as Reveal, E as Eyebrow, G as Button, Link, useAppRouter } from '../components/Reveal';
import { BLOG_POSTS, BlogPost } from '../data/blogPosts';

export default function BlogIndexPage() {
  const { navigate } = useAppRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');

  useEffect(() => {
    document.title = 'CodeFuser Journal & Research — Work Systems, SEO & Automation';
    let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', 'https://codefuser.in/blog');
  }, []);

  // -------------------------------------------------------------
  // Dynamic Statistics Calculations (Single Source of Truth: BLOG_POSTS)
  // -------------------------------------------------------------
  const totalArticles = BLOG_POSTS.length;

  const allTopics = useMemo(() => {
    const topics = new Set<string>();
    BLOG_POSTS.forEach((post) => {
      if (post.primaryTopic) topics.add(post.primaryTopic);
      if (post.secondaryTopics) {
        post.secondaryTopics.forEach((t) => topics.add(t));
      }
    });
    return Array.from(topics);
  }, []);

  const totalTopics = allTopics.length;

  const totalResearchArticles = useMemo(() => {
    return BLOG_POSTS.filter(
      (post) =>
        post.articleType === 'Research' ||
        post.category === 'Research' ||
        post.contentLevel === 'Level 2 — Research'
    ).length;
  }, []);

  const totalFeaturedArticles = useMemo(() => {
    return BLOG_POSTS.filter((post) => Boolean(post.featured)).length;
  }, []);

  // Dynamic Category Counts (Only show categories that actually contain at least 1 article)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    BLOG_POSTS.forEach((post) => {
      counts[post.category] = (counts[post.category] || 0) + 1;
    });
    return counts;
  }, []);

  const activeCategories = useMemo(() => {
    return ['All', ...Object.keys(categoryCounts)];
  }, [categoryCounts]);

  // Dynamic Topic Counts (Only show topics with at least 1 article)
  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    BLOG_POSTS.forEach((post) => {
      if (post.primaryTopic) {
        counts[post.primaryTopic] = (counts[post.primaryTopic] || 0) + 1;
      }
    });
    return counts;
  }, []);

  const activeTopics = useMemo(() => {
    return ['All', ...Object.keys(topicCounts)];
  }, [topicCounts]);

  // Dynamic Article Type Counts (Only show types with at least 1 article)
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    BLOG_POSTS.forEach((post) => {
      if (post.articleType) {
        counts[post.articleType] = (counts[post.articleType] || 0) + 1;
      }
    });
    return counts;
  }, []);

  const activeTypes = useMemo(() => {
    return ['All', ...Object.keys(typeCounts)];
  }, [typeCounts]);

  // Recently Updated Articles (sorted by lastUpdatedDate or publishedDate descending)
  const recentlyUpdatedArticles = useMemo(() => {
    const updated = BLOG_POSTS.filter((post) => Boolean(post.lastUpdatedDate));
    return updated.sort((a, b) => {
      const dateA = new Date(a.lastUpdatedDate || a.publishedDate).getTime();
      const dateB = new Date(b.lastUpdatedDate || b.publishedDate).getTime();
      return dateB - dateA;
    });
  }, []);

  // Filtered Posts based on Search, Category, Topic, and Article Type
  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        post.title.toLowerCase().includes(q) ||
        post.metaDescription.toLowerCase().includes(q) ||
        post.primaryTopic.toLowerCase().includes(q) ||
        (post.secondaryTopics && post.secondaryTopics.some((t) => t.toLowerCase().includes(q))) ||
        (post.author && post.author.toLowerCase().includes(q)) ||
        post.articleType.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === 'All' || post.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesTopic =
        selectedTopic === 'All' ||
        post.primaryTopic.toLowerCase() === selectedTopic.toLowerCase() ||
        (post.secondaryTopics && post.secondaryTopics.some((t) => t.toLowerCase() === selectedTopic.toLowerCase()));

      const matchesType =
        selectedType === 'All' || post.articleType.toLowerCase() === selectedType.toLowerCase();

      return matchesSearch && matchesCategory && matchesTopic && matchesType;
    });
  }, [searchQuery, selectedCategory, selectedTopic, selectedType]);

  return (
    <div className="min-h-screen bg-black text-[#EAE5D9] font-sans antialiased selection:bg-[#F4F1EA] selection:text-black">
      {/* Header Spacer */}
      <div className="h-16 sm:h-20" />

      {/* Hero Section */}
      <section className="relative px-5 py-14 sm:py-20 sm:px-8 max-w-5xl mx-auto border-b border-white/10">
        <Reveal>
          <div className="flex items-center gap-2 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <Eyebrow className="text-amber-400/90 text-xs tracking-[0.25em] uppercase font-mono">
              Research & Insights
            </Eyebrow>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F4F1EA]">
            CodeFuser Journal
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-[#EAE5D9]/70 max-w-2xl leading-relaxed">
            Rigorous analysis, research breakdowns, and actionable perspectives on work systems, incentives, web performance, and modern business operations.
          </p>

          {/* Compact Dynamic Content Statistics Header */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl">
            <div className="p-4 rounded-xl border border-white/10 bg-[#0A0A0A] flex flex-col justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-white/50">Total Articles</span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-display font-bold text-[#F4F1EA]">{totalArticles}</span>
                <span className="text-xs font-mono text-amber-400">ARTICLES</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-[#0A0A0A] flex flex-col justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-white/50">Total Topics</span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-display font-bold text-[#F4F1EA]">{totalTopics}</span>
                <span className="text-xs font-mono text-amber-400">TOPICS</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-[#0A0A0A] flex flex-col justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-white/50">Research Articles</span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-display font-bold text-[#F4F1EA]">{totalResearchArticles}</span>
                <span className="text-xs font-mono text-amber-400">RESEARCH</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-[#0A0A0A] flex flex-col justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-white/50">Featured Articles</span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-display font-bold text-[#F4F1EA]">{totalFeaturedArticles}</span>
                <span className="text-xs font-mono text-amber-400">FEATURED</span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-8 relative max-w-xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, keyword, or title..."
              className="w-full bg-[#0A0A0A] border border-white/15 rounded-xl px-4 py-3.5 pl-10 text-sm text-[#F4F1EA] placeholder-white/40 focus:outline-none focus:border-amber-400/80 transition-colors"
            />
            <svg
              className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-white/40 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Dynamic Search Status */}
          <div className="mt-4 flex items-center justify-between text-xs font-mono text-white/60">
            <span>
              {filteredPosts.length === 0
                ? 'No articles found.'
                : `${filteredPosts.length} article${filteredPosts.length === 1 ? '' : 's'} found`}
            </span>
            {(searchQuery || selectedCategory !== 'All' || selectedTopic !== 'All' || selectedType !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedTopic('All');
                  setSelectedType('All');
                }}
                className="text-amber-400 hover:underline"
              >
                Reset all filters
              </button>
            )}
          </div>

          {/* Category Counts Filter */}
          <div className="mt-6">
            <div className="text-[11px] font-mono uppercase tracking-wider text-white/40 mb-2.5">
              Categories
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {activeCategories.map((cat) => {
                const count = cat === 'All' ? totalArticles : categoryCounts[cat] || 0;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      selectedCategory === cat
                        ? 'bg-amber-400 text-black font-semibold'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      selectedCategory === cat ? 'bg-black/20 text-black' : 'bg-white/10 text-white/60'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Article Type Counts Filter (Only rendered if types exist) */}
          {activeTypes.length > 1 && (
            <div className="mt-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-white/40 mb-2">
                Article Types
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {activeTypes.map((type) => {
                  const count = type === 'All' ? totalArticles : typeCounts[type] || 0;
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        selectedType === type
                          ? 'border border-amber-400 text-amber-300 bg-amber-400/10'
                          : 'border border-white/10 bg-[#0A0A0A] text-white/60 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <span>{type}</span>
                      <span className="text-[10px] text-amber-400/80">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Topic Cluster Counts Filter */}
          {activeTopics.length > 1 && (
            <div className="mt-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-white/40 mb-2">
                Topic Clusters
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {activeTopics.map((topic) => {
                  const count = topic === 'All' ? totalArticles : topicCounts[topic] || 0;
                  return (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(topic)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        selectedTopic === topic
                          ? 'border border-amber-400 text-amber-300 bg-amber-400/10'
                          : 'border border-white/10 bg-[#0A0A0A] text-white/60 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <span>{topic}</span>
                      <span className="text-[10px] text-amber-400/80">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </Reveal>
      </section>

      {/* Recently Updated Section (Rendered dynamically if any article has lastUpdatedDate) */}
      {recentlyUpdatedArticles.length > 0 && searchQuery === '' && selectedCategory === 'All' && selectedTopic === 'All' && selectedType === 'All' && (
        <section className="px-5 py-8 sm:px-8 max-w-5xl mx-auto border-b border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">Recently Updated</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {recentlyUpdatedArticles.map((post) => (
              <Link
                key={`recent-${post.slug}`}
                to={`/blog/${post.slug}`}
                className="p-4 rounded-xl border border-white/10 bg-[#0A0A0A] hover:border-white/25 transition-all group block"
              >
                <div className="flex items-center justify-between text-xs font-mono text-white/50 mb-2">
                  <span className="text-amber-400">{post.category}</span>
                  <span>Updated {post.lastUpdatedDate}</span>
                </div>
                <h4 className="font-display font-semibold text-[#F4F1EA] group-hover:text-white text-base leading-snug">
                  {post.title}
                </h4>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Articles Inventory */}
      <section className="px-5 py-12 sm:py-16 sm:px-8 max-w-5xl mx-auto">
        {filteredPosts.length === 0 ? (
          <div className="py-16 text-center border border-white/10 rounded-2xl bg-[#0A0A0A] p-8">
            <p className="text-white/60 text-base">No articles found matching your query.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedTopic('All');
                setSelectedType('All');
              }}
              className="mt-4 text-xs font-mono text-amber-400 hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid gap-8 sm:gap-10">
            {filteredPosts.map((post: BlogPost) => (
              <article 
                key={post.slug}
                id={`article-card-${post.slug}`}
                className="group relative rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 sm:p-10 transition-all duration-300 hover:border-white/25 hover:bg-[#0f0f0f]"
              >
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-white/50 mb-4">
                  <span className="rounded-full bg-white/5 px-3 py-1 text-amber-300/90 border border-white/10">
                    {post.category}
                  </span>
                  {post.subcategory && (
                    <>
                      <span>/</span>
                      <span className="text-white/70">{post.subcategory}</span>
                    </>
                  )}
                  <span>•</span>
                  <time dateTime="2026-08-28">{post.publishedDate}</time>
                  <span>•</span>
                  <span>{post.readingTime}</span>
                  <span>•</span>
                  <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-white/60 uppercase tracking-wider">
                    {post.articleType}
                  </span>
                </div>

                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#F4F1EA] group-hover:text-white transition-colors leading-snug">
                  <Link to={`/blog/${post.slug}`} className="focus:outline-none">
                    {post.title}
                  </Link>
                </h2>

                <p className="mt-4 text-[#EAE5D9]/75 text-base sm:text-lg leading-relaxed line-clamp-3">
                  {post.metaDescription}
                </p>

                <div className="mt-6 flex items-center justify-between pt-6 border-t border-white/5 flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-white/40 uppercase tracking-wider">
                      Cluster: <span className="text-white/70">{post.primaryTopic}</span>
                    </span>
                  </div>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <span>Read Article</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Footer CTA */}
      <section className="px-5 py-16 sm:px-8 max-w-5xl mx-auto border-t border-white/10 text-center">
        <Reveal>
          <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#F4F1EA]">
            Building high-performance digital systems for modern businesses.
          </h3>
          <p className="mt-3 text-sm text-[#EAE5D9]/60 max-w-xl mx-auto">
            From lightning-fast websites to local search visibility and automated customer workflows.
          </p>
          <div className="mt-8 flex justify-center">
            <Button 
              onClick={() => navigate('/start-project')} 
              className="bg-[#F4F1EA] text-black hover:bg-white px-8 py-3.5 text-sm font-semibold rounded-full"
            >
              Start Your Project
            </Button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
