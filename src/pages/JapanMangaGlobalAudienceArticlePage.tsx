import React, { useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Bookmark, 
  ChevronRight, 
  Bot, 
  Scale, 
  HelpCircle, 
  Layers, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  Globe, 
  BookOpen, 
  Tv, 
  Languages, 
  Flame, 
  TrendingUp, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import { AdSenseSlot } from '../components/ads/AdSenseSlot';

interface ArticlePageProps {
  onNavigate?: (path: string) => void;
}

export const JapanMangaGlobalAudienceArticlePage: React.FC<ArticlePageProps> = ({ onNavigate }) => {
  const currentArticle = BLOG_POSTS.find(
    (p) => p.slug === 'japan-built-the-manga-the-internet-built-the-global-audience'
  );

  const relatedPosts = BLOG_POSTS.filter(
    (p) => p.slug !== 'japan-built-the-manga-the-internet-built-the-global-audience'
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = "Japan Built the Manga. The Internet Built the Global Audience. | CodeFuser Journal";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        "Japan's manga industry is confronting a strange problem: enormous international demand exists, but fans say legal access has often been slow, fragmented, expensive, or nonexistent. Did piracy simply steal that audience—or did it help create it?"
      );
    }
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Japan Built the Manga. The Internet Built the Global Audience.",
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Article URL copied to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-amber-400/20 selection:text-amber-200">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
      </div>

      <article className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <button
            onClick={() => onNavigate ? onNavigate('/blog') : (window.location.href = '/blog')}
            className="group inline-flex items-center gap-2 text-xs sm:text-sm font-mono text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-amber-400" />
            <span>Back to Journal</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-xs font-mono text-zinc-300 hover:text-white transition-all"
              title="Share article"
            >
              <Share2 size={13} className="text-amber-400" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        {/* Badges & Header Title */}
        <div className="space-y-4 mb-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-medium tracking-wide">
              Global Media & Cultural Distribution
            </span>
            <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-mono">
              The Localization Lag Paradox
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-xs font-mono">
              Level 1 — Pillar
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-white leading-[1.15]">
            Japan Built the Manga. The Internet Built the Global Audience.
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed font-sans font-normal border-l-2 border-amber-400/80 pl-4 py-1">
            Japan's publishing titans are confronting a historic paradox: unprecedented international hunger for manga, coupled with complaints that official distribution has for decades been sluggish, fragmented, and regionalized. Did piracy merely steal that global audience—or did it build it from scratch?
          </p>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm font-mono text-zinc-400 pt-2 border-b border-white/10 pb-6">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-amber-400" />
              August 28, 2026
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-amber-400" />
              13 min read
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Bot size={14} className="text-amber-400" />
              By CodeFuser Tech & Media Research
            </span>
          </div>
        </div>

        {/* AdSense Top Placement */}
        <AdSenseSlot slotId="japan-manga-global-audience-top" format="auto" responsive={true} showDisclaimer={true} />

        {/* Article Body */}
        <div className="prose prose-invert max-w-none space-y-7 text-zinc-300 text-base sm:text-lg leading-relaxed font-sans mt-8">
          
          <p className="text-lg sm:text-xl text-white font-medium">
            There is something almost absurd about this story.
          </p>

          <p>
            A nation’s creative ecosystem produces some of the most captivating, artfully constructed graphic fiction on planet Earth. Across the Americas, Europe, Southeast Asia, and Africa, millions of readers fall passionately in love with these stories.
          </p>

          <p>
            Fans want translations. They want to read the chapter that released in Tokyo three hours ago. They want obscure cult classics that mainstream corporate publishers never bothered to license.
          </p>

          <p>
            And for twenty-five years, the internet answered: <strong>“Here you go.”</strong>
          </p>

          <p>
            Today, Japanese lawmakers look at the hundreds of millions of unauthorized monthly pageviews and ask in alarm: <em>“How did this underground ecosystem get so massive?”</em>
          </p>

          <p>
            The response from international readers is uniform, immediate, and uncomfortable:
          </p>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-amber-500/30 text-amber-300 font-mono text-center text-lg sm:text-xl font-bold my-4">
            “Because you left the door wide open.”
          </div>

          <p>
            This clash highlights two irreconcilable narratives:
          </p>

          <ul className="space-y-2 list-disc pl-6 text-zinc-300 font-sans text-sm sm:text-base">
            <li><strong>The Industry Perspective:</strong> Unlicensed scanlations and unauthorized aggregators are economic parasites siphoning billions of yen away from hardworking mangaka and editorial houses.</li>
            <li><strong>The Global Fan Perspective:</strong> The official publishing industry treated international markets as an afterthought for decades, leaving grassroots scanlators to single-handedly construct the global fanbase that now fuels billion-dollar franchise sales.</li>
          </ul>

          <p className="text-xl font-display font-bold text-white">
            The truth is that both statements are historically accurate.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 01: The Localization Funnel Breakdown */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Tv size={15} />
              <span>The Anime-to-Manga Disconnect</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              When Demand Dramatically Outran Distribution
            </h2>
          </div>

          <p>
            To understand how global manga piracy exploded, one must examine the typical discovery pipeline:
          </p>

          {/* Pipeline Flowchart */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-white/10 space-y-3 font-mono text-xs sm:text-sm my-6">
            <div className="text-amber-400 font-bold uppercase">The Broken Commercial Pipeline (1998–2018):</div>
            <div className="space-y-2 text-zinc-300 font-sans text-xs">
              <div className="p-3 bg-zinc-950 rounded-lg flex items-center justify-between">
                <span>1. Anime Airs (Global Broadcast / Streaming)</span>
                <span className="font-mono text-emerald-400">Instant Global Hit</span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-lg flex items-center justify-between">
                <span>2. Fan Wants To Read What Happens Next</span>
                <span className="font-mono text-blue-400">Peak Purchase Intent</span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-lg flex items-center justify-between">
                <span>3. Official English Manga Release Status</span>
                <span className="font-mono text-rose-400">Unlicensed or 2 Years Behind</span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-lg flex items-center justify-between">
                <span>4. Unofficial Fan Scanlation Status</span>
                <span className="font-mono text-amber-400">Available in 12 Languages Within 24h</span>
              </div>
            </div>
          </div>

          <p>
            When a consumer is at peak emotional excitement and willingness to pay, corporate distribution failure creates a vacuum. In the digital age, vacuums are filled instantaneously by the internet.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 02: The Scanlation Heritage */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Languages size={15} />
              <span>Cultural History</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The Volunteer Army That Built a Western Market
            </h2>
          </div>

          <p>
            Before major publishers like VIZ Media, Yen Press, or Kodansha Comics had extensive digital operations, early Western manga fandom was built entirely by volunteer scanlation groups (such as <em>Toriyama's World</em>, <em>SnoopyCool</em>, and <em>MangaStream</em>).
          </p>

          {/* 3 Pillars of Grassroots Growth */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6 font-mono text-xs">
            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="text-amber-400 font-bold uppercase">1. Translation Notes</div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                Early fan groups didn't just translate words; they included margin notes explaining Japanese honorifics, cultural idioms, and puns, educating a whole generation of international readers.
              </p>
            </div>

            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="text-blue-400 font-bold uppercase">2. Niche Preservation</div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                Publishers only risked licensing guaranteed shonen blockbusters. Scanlators brought psychological seinen, josei, and experimental indie works to global awareness.
              </p>
            </div>

            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="text-emerald-400 font-bold uppercase">3. Proof of Market</div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                Western publishers routinely monitored scanlation reader charts to decide which series were commercially safe enough to license and print in physical English volumes.
              </p>
            </div>
          </div>

          <hr className="border-white/10 my-10" />

          {/* Section 03: The Modern Shift */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Zap size={15} />
              <span>The Simulpub Era</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The Solution Was Never Lawsuits. It Was Speed.
            </h2>
          </div>

          <p>
            The turning point in the manga wars came when publishers finally embraced the digital reality. Platforms like Shueisha’s <strong>MANGA Plus</strong>, <strong>Shonen Jump</strong>, and Kodansha's <strong>K Manga</strong> proved that when official chapters drop simultaneously with Tokyo—for free or under a minimal $2.99/mo subscription—readers migrate to official channels en masse.
          </p>

          <p>
            When legitimate services match the speed, convenience, and catalogue depth of unauthorized sites, the pirate advantage evaporates.
          </p>

          {/* Strategic Conclusion Box */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-white/10 space-y-4 my-10">
            <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              The Definitive Conclusion
            </h3>
            <p className="text-xl sm:text-2xl font-display font-black text-amber-300 leading-snug">
              Piracy didn't just siphon revenue from the manga industry—it built the global cathedral that the industry now monetizes.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              Japanese manga is currently experiencing its greatest global economic boom in history. Box offices, bookstores, and streaming services outside Japan generate record billions. That reality would not exist if millions of international fans hadn't spent decades keeping the cultural flame alive across an open internet while traditional publishers slept.
            </p>
          </div>

        </div>

        {/* AdSense In-Article / Bottom Placement */}
        <AdSenseSlot slotId="japan-manga-global-audience-bottom" format="auto" responsive={true} showDisclaimer={true} className="my-12" />

        {/* Sources & Citations */}
        <div className="mt-14 p-6 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <Bookmark size={14} className="text-amber-400" />
            <span>Academic & Industry Citations</span>
          </h3>
          <ul className="space-y-2 text-xs font-mono text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">1.</span>
              <span>Japan External Trade Organization (JETRO): "Global Expansion and Localization Strategies for Japanese Content."</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">2.</span>
              <span>Association of Japanese Animations (AJA): Anime Industry Report — Overseas Market Share Growth (2015–2025).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">3.</span>
              <span>Media, Culture & Society: "Scanlation Communities and the Transnational Diffusion of Japanese Popular Culture."</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">4.</span>
              <span>Publishers Weekly: "Graphic Novels & Manga: The Anatomy of a Western Market Boom."</span>
            </li>
          </ul>
        </div>

        {/* Related Articles */}
        <div className="mt-16 border-t border-white/10 pt-12 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display font-bold text-white tracking-tight">
              Related Investigations & Tech Insights
            </h3>
            <button
              onClick={() => onNavigate ? onNavigate('/blog') : (window.location.href = '/blog')}
              className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedPosts.slice(0, 2).map((post) => (
              <div
                key={post.id}
                onClick={() => onNavigate ? onNavigate(`/blog/${post.slug}`) : (window.location.href = `/blog/${post.slug}`)}
                className="group p-5 rounded-xl bg-zinc-900/60 border border-white/10 hover:border-amber-400/40 transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <span className="text-amber-400">{post.category}</span>
                  <span>•</span>
                  <span>{post.readingTime}</span>
                </div>
                <h4 className="text-base font-display font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                  {post.title}
                </h4>
                <p className="text-xs text-zinc-400 line-clamp-2">
                  {post.metaDescription}
                </p>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
};
export default JapanMangaGlobalAudienceArticlePage;
