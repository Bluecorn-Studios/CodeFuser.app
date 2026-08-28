import React, { useState, useEffect, useMemo } from 'react';
import { R as Reveal, E as Eyebrow, G as Button, Link, useAppRouter } from '../components/Reveal';
import { BLOG_POSTS, BlogPost } from '../data/blogPosts';

export default function BlogIndexPage() {
  const { navigate } = useAppRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
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

  const categories = ['All', 'Productivity', 'Technology', 'AI', 'How-To', 'Research', 'Guides'];

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.metaDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.primaryTopic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.secondaryTopics && post.secondaryTopics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesCategory =
        selectedCategory === 'All' || post.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesType =
        selectedType === 'All' || post.articleType.toLowerCase() === selectedType.toLowerCase();

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [searchQuery, selectedCategory, selectedType]);

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

          {/* Categories Pill Filters */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-amber-400 text-black font-semibold'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Articles Inventory */}
      <section className="px-5 py-12 sm:py-16 sm:px-8 max-w-5xl mx-auto">
        {filteredPosts.length === 0 ? (
          <div className="py-16 text-center border border-white/10 rounded-2xl bg-[#0A0A0A] p-8">
            <p className="text-white/60 text-base">No articles found matching "{searchQuery}".</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-4 text-xs font-mono text-amber-400 hover:underline"
            >
              Reset filters
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
