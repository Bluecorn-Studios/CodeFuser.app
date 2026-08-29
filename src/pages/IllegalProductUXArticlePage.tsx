import React, { useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Bookmark, 
  ChevronRight, 
  Tv, 
  Zap, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Sliders, 
  MonitorPlay, 
  Layers, 
  Flame, 
  Film,
  Download,
  Search,
  EyeOff,
  SplitSquareVertical,
  Maximize2
} from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import { AdSenseSlot } from '../components/ads/AdSenseSlot';

interface ArticlePageProps {
  onNavigate?: (path: string) => void;
}

export const IllegalProductUXArticlePage: React.FC<ArticlePageProps> = ({ onNavigate }) => {
  const currentArticle = BLOG_POSTS.find(
    (p) => p.slug === 'when-the-illegal-product-has-the-better-user-experience'
  );

  const relatedPosts = BLOG_POSTS.filter(
    (p) => p.slug !== 'when-the-illegal-product-has-the-better-user-experience'
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = "When the Illegal Product Has the Better User Experience | CodeFuser Journal";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        "Why do some people pirate content they would otherwise pay for? The answer may have less to do with price and more to do with availability, ads, devices, quality, ownership and convenience."
      );
    }
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "When the Illegal Product Has the Better User Experience",
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
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <article className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Breadcrumb Navigation */}
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

        {/* Header Badges & Headline */}
        <div className="space-y-4 mb-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-medium tracking-wide">
              Streaming & Consumer Economics
            </span>
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
              Product UX & Friction
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-xs font-mono">
              Level 1 — Pillar
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-white leading-[1.15]">
            When the Illegal Product Has the Better User Experience
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed font-sans font-normal border-l-2 border-amber-400/80 pl-4 py-1">
            Why do some people pirate content they would otherwise gladly pay for? The answer often has less to do with the $15 subscription fee and far more to do with ads, resolution caps, hardware DRM, and fractured availability.
          </p>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm font-mono text-zinc-400 pt-2 border-b border-white/10 pb-6">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-amber-400" />
              August 28, 2026
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-amber-400" />
              9 min read
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Tv size={14} className="text-amber-400" />
              By CodeFuser Tech & Media Research
            </span>
          </div>
        </div>

        {/* AdSense Top Placement */}
        <AdSenseSlot slotId="illegal-ux-top" format="auto" responsive={true} showDisclaimer={true} />

        {/* Article Body */}
        <div className="prose prose-invert max-w-none space-y-7 text-zinc-300 text-base sm:text-lg leading-relaxed font-sans mt-8">
          
          <p className="text-lg sm:text-xl text-white font-medium">
            There is a single sentence that should keep entertainment executives awake at night:
          </p>

          <blockquote className="border-l-4 border-amber-500/80 pl-4 py-3 my-6 text-amber-300 font-mono text-lg bg-zinc-900/60 rounded-r-lg">
            “I’d pay for it. The legal version is just worse.”
          </blockquote>

          <p>
            At first glance, that statement sounds impossible.
          </p>

          <p>
            The legitimate product has billion-dollar balance sheets behind it. It has global CDN edge caches, native TV apps, enterprise payment gateways, round-the-clock customer support, and multi-million-dollar UX research teams obsessing over button border-radii and color palettes.
          </p>

          <p>
            And yet... millions of tech-literate consumers with disposable income repeatedly report that the unauthorized alternative provides a vastly superior product experience.
          </p>

          <p>
            Not because it costs zero dollars.
          </p>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-white/10 font-mono text-center my-6">
            <div className="text-2xl sm:text-3xl font-black text-white">Because it simply works better.</div>
            <p className="text-xs text-zinc-400 mt-2 m-0">Zero telemetry. Zero unskippable ads. Zero hardware DRM lock-outs. Universal file compatibility.</p>
          </div>

          <p>
            In international tech communities—especially across rapidly digitizing markets like India, Southeast Asia, and Eastern Europe—consumers who already pay for 3 to 4 distinct streaming subscriptions report resorting to self-hosted media servers (Plex, Jellyfin) or direct torrents just to watch a movie they legally pay for.
          </p>

          <p className="text-xl font-bold text-white">
            How did official streaming services turn their paying customers into second-class users?
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 01: The Gabe Newell Service Doctrine */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Zap size={15} />
              <span>Foundational Economic Principle</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The “Price vs. Service” Fallacy
            </h2>
          </div>

          <p>
            The media industry has historically treated copyright infringement as a binary moral failure: consumers are greedy thieves who want luxury goods without paying.
          </p>

          <p>
            Over a decade ago, Valve founder <strong className="text-white">Gabe Newell</strong> disproved this dogma with a single thesis:
          </p>

          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-black border border-amber-500/30 my-6">
            <p className="text-lg sm:text-xl font-display font-bold text-amber-300 italic m-0">
              “Piracy is almost always a service problem and not a pricing problem. If a pirate offers a product anywhere in the world, 24/7, purchasable from the convenience of your personal computer, and the legal provider says the product is region-locked, will come to your country 3 months after the US release, and can only be purchased at a brick and mortar store, then the pirate’s service is more valuable.”
            </p>
          </div>

          <p>
            When Spotify and early Netflix launched, they validated Newell’s law: when legal streaming offered a single, friction-free search bar with instant high-bitrate playback, piracy rates cratered worldwide.
          </p>

          <p>
            Today, however, the streaming market has engineered the exact conditions that resurrected the service problem.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 02: The Six Vectors of UX Friction */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Sliders size={15} />
              <span>Product Breakdown</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              6 Ways Legal Streaming Degraded Below the Alternative
            </h2>
          </div>

          <p>
            When a user evaluates their options on a Friday evening, the legal path is riddled with artificial barriers:
          </p>

          {/* 6 Vectors Cards */}
          <div className="space-y-4 my-6">
            
            {/* Vector 1 */}
            <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold font-mono text-sm">1. Extreme Catalog Splintering & The Search Abyss</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">Discovery Friction</span>
              </div>
              <p className="text-sm text-zinc-300 font-sans">
                A consumer wanting to watch a movie must search across Netflix, Prime Video, Disney+, Apple TV, Max, Paramount+, and JioCinema. Frequently, Season 1 is on one app, Season 2 has moved to another, and the movie finale is only available as an additional $3.99 rental. In contrast, an open indexer has a single search bar that returns the entire franchise in one click.
              </p>
            </div>

            {/* Vector 2 */}
            <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold font-mono text-sm">2. Ad-Creep on Paid Subscriptions</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">Monetization Hostility</span>
              </div>
              <p className="text-sm text-zinc-300 font-sans">
                Nearly every major platform now inserts commercial breaks into standard tiers, while reserving ad-free experiences for premium $20+/month tiers. Users are subjected to unskippable car commercials in the middle of a tense dramatic scene—an experience completely absent from local .MKV video files.
              </p>
            </div>

            {/* Vector 3 */}
            <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold font-mono text-sm">3. Artificial Quality Caps & Widevine DRM Bottlenecks</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">Technical Degradation</span>
              </div>
              <p className="text-sm text-zinc-300 font-sans">
                Paying for a 4K subscription does not guarantee 4K playback. Due to browser-level DRM requirements (Google Widevine L1 vs L3, HDCP 2.2 handshakes), watching Netflix or Prime on Chrome or Firefox on PC/Mac caps the video stream at 720p or 1080p with crushed dynamic range. The pirated release, meanwhile, delivers a flawless 4K Dolby Vision remux at 60Mbps with uncompressed Dolby Atmos audio.
              </p>
            </div>

            {/* Vector 4 */}
            <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold font-mono text-sm">4. Device Lock-In & Playback Hostility</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">Hardware Restrictions</span>
              </div>
              <p className="text-sm text-zinc-300 font-sans">
                Official apps frequently disable external display output, block picture-in-picture mode on mobile, enforce arbitrary password-sharing IP tracking, and delete downloaded offline files after 48 hours. A self-hosted file can be played on an old iPad, streamed to a Chromecast, cast to a projector, or stored on an offline USB thumb drive indefinitely.
              </p>
            </div>

            {/* Vector 5 */}
            <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold font-mono text-sm">5. Vanishing Media & Silent Delistings</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">Ephemeral Access</span>
              </div>
              <p className="text-sm text-zinc-300 font-sans">
                Shows and films disappear overnight as licensing contracts expire or studios execute tax write-offs (e.g. HBO Max removing fully completed originals). Once content is pulled, paying subscribers have no legal recourse. The offline archive remains permanently immune to corporate boardroom maneuvers.
              </p>
            </div>

            {/* Vector 6 */}
            <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold font-mono text-sm">6. Sluggish, Telemetry-Heavy Interfaces</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">UI Bloat</span>
              </div>
              <p className="text-sm text-zinc-300 font-sans">
                Modern smart TV apps are laden with autoplaying trailer videos, un-customizable algorithmic recommendation rows, and memory-heavy web wrappers that lag on standard hardware. Clean local media players like VLC or Infuse launch instantly and provide frame-accurate scrubbing with zero lag.
              </p>
            </div>

          </div>

          <hr className="border-white/10 my-10" />

          {/* Section 03: Feature Comparison Matrix */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <SplitSquareVertical size={15} />
              <span>Direct Comparison</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Feature-for-Feature: Legal vs. Self-Hosted Ecosystems
            </h2>
          </div>

          {/* Responsive Comparison Table */}
          <div className="overflow-x-auto my-6 font-mono text-xs">
            <table className="w-full text-left border-collapse border border-white/10">
              <thead>
                <tr className="bg-zinc-900 text-zinc-300 border-b border-white/10">
                  <th className="p-3 border-r border-white/10 font-bold">Feature Vector</th>
                  <th className="p-3 border-r border-white/10 text-rose-400 font-bold">Paid Streaming Service</th>
                  <th className="p-3 text-emerald-400 font-bold">Self-Hosted / Open Media</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                <tr>
                  <td className="p-3 border-r border-white/10 font-bold text-white">Search Experience</td>
                  <td className="p-3 border-r border-white/10 text-rose-300">App-siloed, fragmented across 5+ apps</td>
                  <td className="p-3 text-emerald-300 font-bold">Unified single search bar (Plex/Stremio)</td>
                </tr>
                <tr>
                  <td className="p-3 border-r border-white/10 font-bold text-white">Advertisements</td>
                  <td className="p-3 border-r border-white/10 text-rose-300">Pre-roll, mid-roll, pop-ups on standard plans</td>
                  <td className="p-3 text-emerald-300 font-bold">Zero commercials, zero branding banners</td>
                </tr>
                <tr>
                  <td className="p-3 border-r border-white/10 font-bold text-white">PC/Browser Resolution</td>
                  <td className="p-3 border-r border-white/10 text-rose-300">Capped at 720p / 1080p via Widevine L3</td>
                  <td className="p-3 text-emerald-300 font-bold">Full Native 4K UHD, HDR10+, Dolby Vision</td>
                </tr>
                <tr>
                  <td className="p-3 border-r border-white/10 font-bold text-white">Audio Formats</td>
                  <td className="p-3 border-r border-white/10 text-rose-300">Compressed stereo or lossy Dolby Digital Plus</td>
                  <td className="p-3 text-emerald-300 font-bold">Lossless TrueHD / DTS-HD Master Audio Atmos</td>
                </tr>
                <tr>
                  <td className="p-3 border-r border-white/10 font-bold text-white">Offline Longevity</td>
                  <td className="p-3 border-r border-white/10 text-rose-300">Expires in 48h; blocked on laptops/PCs</td>
                  <td className="p-3 text-emerald-300 font-bold">Permanent local storage on any drive</td>
                </tr>
                <tr>
                  <td className="p-3 border-r border-white/10 font-bold text-white">Playback Customization</td>
                  <td className="p-3 border-r border-white/10 text-rose-300">Rigid subtitles, no custom audio delay</td>
                  <td className="p-3 text-emerald-300 font-bold">Custom fonts, offsets, shaders, speed controls</td>
                </tr>
              </tbody>
            </table>
          </div>

          <hr className="border-white/10 my-10" />

          {/* Section 04: The Path to Reclaiming Users */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Sparkles size={15} />
              <span>The Industry Blueprint</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              How Legal Services Can Win on Product Quality
            </h2>
          </div>

          <p>
            Lawsuits, website takedowns, and ISP filtering have never permanently eliminated digital alternatives because they treat the symptom while actively exacerbating the root cause.
          </p>

          <p>
            To stop losing high-value, tech-literate subscribers, streaming platforms must compete on user experience:
          </p>

          <div className="space-y-3 my-6 font-mono text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-zinc-900 border border-emerald-500/30 space-y-1">
              <span className="text-emerald-400 font-bold">1. Universal Search & Interoperable Hubs</span>
              <p className="text-zinc-300 font-sans text-xs">
                Allow unified search queries and cross-platform queue management so users don’t have to juggle five slow interfaces.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-emerald-500/30 space-y-1">
              <span className="text-emerald-400 font-bold">2. Remove Punitive PC DRM Throttling</span>
              <p className="text-zinc-300 font-sans text-xs">
                Stop degrading video quality on desktop browsers. If a consumer pays for 4K UHD, render 4K UHD regardless of the operating system.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-emerald-500/30 space-y-1">
              <span className="text-emerald-400 font-bold">3. Clean, Ad-Free Paid Tiers</span>
              <p className="text-zinc-300 font-sans text-xs">
                Restore the foundational contract of subscription video: a paid monthly subscription should mean zero commercial interruptions.
              </p>
            </div>
          </div>

          {/* Strategic Conclusion Callout */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-white/10 space-y-4 my-10">
            <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              The Real Product Lesson
            </h3>
            <p className="text-xl sm:text-2xl font-display font-black text-amber-300 leading-snug">
              Consumers don't want to pirate. They want to press play and have the film work without friction.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              Until legal providers treat paying users with greater technical respect and lower friction than an open-source video player, the service problem will remain the entertainment industry's most potent competitor.
            </p>
          </div>

        </div>

        {/* AdSense In-Article / Bottom Placement */}
        <AdSenseSlot slotId="illegal-ux-bottom" format="auto" responsive={true} showDisclaimer={true} className="my-12" />

        {/* Sources & Citations */}
        <div className="mt-14 p-6 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <Bookmark size={14} className="text-amber-400" />
            <span>Documented Research & Industry Sources</span>
          </h3>
          <ul className="space-y-2 text-xs font-mono text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">1.</span>
              <span>Valve Corporation / Gabe Newell Keynote on Piracy as a Service Problem (Cambridge Union & GDC).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">2.</span>
              <span>Global Streaming Consumer Sentiment & Subscription Churn Benchmark Reports (2024–2026).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">3.</span>
              <span>Consumer Electronics & DRM Compatibility Studies (Widevine L1/L3 limitations on 4K/HDR).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">4.</span>
              <span>Media Industry & Indian Streaming Market Case Studies on Ad Creep and Content Fragmentation.</span>
            </li>
          </ul>
        </div>

        {/* Related Research Articles */}
        <div className="mt-16 border-t border-white/10 pt-12 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display font-bold text-white tracking-tight">
              Related Research & Analyses
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
export default IllegalProductUXArticlePage;
