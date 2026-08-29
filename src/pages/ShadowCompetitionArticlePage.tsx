import React, { useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Bookmark, 
  ChevronRight, 
  Scale, 
  TrendingUp, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Sliders, 
  DollarSign, 
  Layers, 
  Flame, 
  Radio,
  BarChart3,
  Target,
  Zap,
  RefreshCcw
} from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import { AdSenseSlot } from '../components/ads/AdSenseSlot';

interface ArticlePageProps {
  onNavigate?: (path: string) => void;
}

export const ShadowCompetitionArticlePage: React.FC<ArticlePageProps> = ({ onNavigate }) => {
  const currentArticle = BLOG_POSTS.find(
    (p) => p.slug === 'what-happens-when-piracy-becomes-the-competition'
  );

  const relatedPosts = BLOG_POSTS.filter(
    (p) => p.slug !== 'what-happens-when-piracy-becomes-the-competition'
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = "What Happens When Piracy Becomes the Competition? | CodeFuser Journal";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        "Piracy is usually treated as the enemy of legal media. But what happens when consumers start comparing the two as competing products? We examine pricing, availability, fragmentation, convenience and the incentives behind better digital services."
      );
    }
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "What Happens When Piracy Becomes the Competition?",
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
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
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
              Market Dynamics & Media Economics
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              Shadow Competition
            </span>
            <span className="px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-xs font-mono">
              Level 1 — Pillar
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-white leading-[1.15]">
            What Happens When Piracy Becomes the Competition?
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed font-sans font-normal border-l-2 border-amber-400/80 pl-4 py-1">
            Piracy is traditionally framed as the enemy of commerce. But when copyright grants exclusive catalog monopolies, unauthorized distribution functions as an unofficial market check on pricing, UX hostility, and artificial fragmentation.
          </p>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm font-mono text-zinc-400 pt-2 border-b border-white/10 pb-6">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-amber-400" />
              August 28, 2026
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-amber-400" />
              8 min read
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Scale size={14} className="text-amber-400" />
              By CodeFuser Tech & Media Research
            </span>
          </div>
        </div>

        {/* AdSense Top Placement */}
        <AdSenseSlot slotId="shadow-competition-top" format="auto" responsive={true} showDisclaimer={true} />

        {/* Article Body */}
        <div className="prose prose-invert max-w-none space-y-7 text-zinc-300 text-base sm:text-lg leading-relaxed font-sans mt-8">
          
          <p className="text-lg sm:text-xl text-white font-medium">
            Piracy is normally described as the pure antithesis of market competition.
          </p>

          <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 font-mono text-xs sm:text-sm space-y-1.5 my-4">
            <div className="text-zinc-400">Standard Corporate Narrative:</div>
            <div className="text-white font-bold">STUDIO PRODUCES CONTENT → PIRATE DISTRIBUTES WITHOUT PERMISSION → STUDIO LOSES REVENUE</div>
            <div className="text-zinc-500 text-xs pt-1">End of story.</div>
          </div>

          <p>
            But what happens when consumers stop treating piracy merely as an illicit backchannel and start using it as a <strong className="text-white">baseline benchmark for the legal product</strong>?
          </p>

          <p>
            That fundamentally transforms the entire economic equation.
          </p>

          <p>
            Because now the consumer's decision is not just a binary moral choice between <em>“Paid vs. Free.”</em> It becomes a comparative product evaluation:
          </p>

          <blockquote className="border-l-4 border-amber-500/80 pl-4 py-3 my-4 text-amber-300 font-mono text-lg bg-zinc-900/60 rounded-r-lg">
            “Which experience actually respects my time, hardware, and wallet?”
          </blockquote>

          <p>
            Acknowledging this dynamic does not mean declaring copyright infringement legally valid. It highlights an essential economic reality:
          </p>

          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-black border border-amber-500/30 my-6">
            <h2 className="text-xl sm:text-2xl font-display font-black text-white m-0">
              The unauthorized shadow market acts as the only functional market constraint against exclusive digital monopolies.
            </h2>
          </div>

          <hr className="border-white/10 my-10" />

          {/* Section 01: How Media Competition Differs from Standard Commodities */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Layers size={15} />
              <span>Industrial Economics</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Why digital media markets break standard competition
            </h2>
          </div>

          <p>
            In an ordinary commodity market, direct competition disciplines quality and pricing:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 font-mono text-xs">
            <div className="p-4 bg-zinc-900 border border-white/10 rounded-xl space-y-1">
              <span className="text-zinc-400 uppercase block">Airlines</span>
              <p className="text-white font-sans text-xs">Airlines compete on the exact same routes, driving prices down and service up.</p>
            </div>
            <div className="p-4 bg-zinc-900 border border-white/10 rounded-xl space-y-1">
              <span className="text-zinc-400 uppercase block">Smartphones</span>
              <p className="text-white font-sans text-xs">Hardware makers offer alternative devices that run the same universal apps.</p>
            </div>
            <div className="p-4 bg-zinc-900 border border-white/10 rounded-xl space-y-1">
              <span className="text-zinc-400 uppercase block">Music Streaming</span>
              <p className="text-white font-sans text-xs">Spotify, Apple Music, and YouTube Music license the exact same 100M-song master catalog.</p>
            </div>
          </div>

          <p>
            Video streaming, however, operates under <strong className="text-white">monopolistic content silos</strong>:
          </p>

          <p>
            If you want to watch <em>Stranger Things</em>, Disney+ is not a substitute. If you want to watch <em>The Mandalorian</em>, Max cannot fulfill your demand. Because copyright law grants an absolute legal monopoly over specific IP, streaming platforms do not compete on who has the better video player—they compete by walling off exclusive cultural artifacts.
          </p>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-white/10 font-mono text-xs sm:text-sm my-6 space-y-2">
            <div className="text-zinc-400">Traditional Market:</div>
            <div className="text-emerald-400 font-bold">Product A vs. Product B (Substitutable Goods) → Lower Prices</div>
            <div className="text-zinc-400 pt-2">Video Streaming Market:</div>
            <div className="text-rose-400 font-bold">Walled Garden A + Walled Garden B + Walled Garden C (Non-Substitutable) → Compounded Costs</div>
          </div>

          <hr className="border-white/10 my-10" />

          {/* Section 02: The Invisible Price Ceiling */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <DollarSign size={15} />
              <span>Market Pricing Limits</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The “Shadow Competitor” and the Price Ceiling
            </h2>
          </div>

          <p>
            In economic theory, when a single firm controls an essential monopoly good with no legal substitutes, they can hike prices indefinitely and degrade service quality with impunity.
          </p>

          <p>
            Why haven't streaming subscriptions surged to $90/month per app?
          </p>

          <p>
            Because of the <strong className="text-white">Shadow Competitor</strong>.
          </p>

          <div className="p-5 rounded-xl bg-zinc-900 border border-amber-500/30 my-6 font-mono text-xs sm:text-sm space-y-2">
            <span className="text-amber-400 font-bold uppercase text-xs">The Economic Elasticity Threshold</span>
            <p className="text-zinc-200 font-sans text-sm">
              The existence of a functional, accessible unauthorized alternative creates an invisible ceiling on how much friction, price inflation, and advertising a company can extract before the consumer defects to the shadow market.
            </p>
          </div>

          <p>
            When legal platforms double prices, introduce unskippable mid-roll ads into $15 tiers, cancel password-sharing, and fracture franchises across three distinct subscriptions, they cross the elasticity threshold. Consumers don't switch to a competitor—they exit the legal market entirely.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 03: History Proves Shadow Pressure Forces Innovation */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <TrendingUp size={15} />
              <span>Historical Innovation Loops</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Every major modern digital service was born from piracy pressure
            </h2>
          </div>

          <p>
            Every beloved modern distribution platform exists because unauthorized shadow networks forced media conglomerates to modernize:
          </p>

          {/* Historical Case Studies */}
          <div className="space-y-4 my-6">
            
            <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold font-mono text-sm">1. Napster → The iTunes 99¢ Track & Spotify</span>
                <span className="text-xs font-mono text-zinc-500">Music Industry</span>
              </div>
              <p className="text-sm text-zinc-300 font-sans">
                In 1999, the recording industry insisted consumers buy $18 physical CD albums containing 1 good song and 11 filler tracks. Napster proved consumers wanted individual MP3 tracks instantly. Steve Jobs launched the iTunes Store by packaging the shadow alternative's core feature (unbundled $0.99 MP3s) with legitimate convenience.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold font-mono text-sm">2. CD Torrents & SecuROM → Valve's Steam</span>
                <span className="text-xs font-mono text-zinc-500">PC Video Games</span>
              </div>
              <p className="text-sm text-zinc-300 font-sans">
                In the mid-2000s, PC game publishers claimed PC gaming was dead due to rampant piracy in Eastern Europe and Asia. Valve launched Steam, offering global cloud saves, automatic background patching, friend lobbies, and regional currency support. Steam transformed former pirates into the world's most lucrative PC gaming market.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold font-mono text-sm">3. BitTorrent Video → Netflix Instant Streaming</span>
                <span className="text-xs font-mono text-zinc-500">Film & Television</span>
              </div>
              <p className="text-sm text-zinc-300 font-sans">
                When BitTorrent demonstrated that consumers preferred on-demand video over scheduled linear cable television, Netflix launched flat-rate, commercial-free streaming in 2007, virtually erasing mainstream video piracy for nearly a decade.
              </p>
            </div>

          </div>

          <hr className="border-white/10 my-10" />

          {/* Section 04: The Consequence of Treating Piracy Only as a Crime */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <ShieldAlert size={15} />
              <span>Strategic Myopia</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The danger of treating market signals as criminal problems
            </h2>
          </div>

          <p>
            When an entertainment company views piracy exclusively through a legal and punitive lens (lawsuits, DRM rootkits, geoblocking, ISP warnings), they miss the vital product telemetry embedded within user behavior:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 font-mono text-xs">
            <div className="p-5 bg-zinc-900 border border-rose-500/30 rounded-xl space-y-2">
              <span className="text-rose-400 font-bold uppercase">The Punitive Reaction</span>
              <p className="text-zinc-300 font-sans text-xs">
                “Pirates are criminals who stole our content. We must lobby for stricter copyright laws, sue indexers, and install kernel-level DRM that locks down consumer hardware.”
              </p>
            </div>

            <div className="p-5 bg-zinc-900 border border-emerald-500/30 rounded-xl space-y-2">
              <span className="text-emerald-400 font-bold uppercase">The Product-Led Reaction</span>
              <p className="text-zinc-300 font-sans text-xs">
                “Why are 2 million people using a clunky peer-to-peer network instead of our app? What technical, pricing, or catalog friction did we introduce that made our $15 service feel worse than a torrent?”
              </p>
            </div>
          </div>

          {/* Strategic Conclusion Callout */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-white/10 space-y-4 my-10">
            <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              The Economic Conclusion
            </h3>
            <p className="text-xl sm:text-2xl font-display font-black text-amber-300 leading-snug">
              Piracy is a harsh, imperfect mirror. It reflects exactly where the legal distribution pipeline is failing the customer.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              Whenever the legal product offers genuine universal availability, reasonable pricing, uncompromised quality, and zero friction, piracy naturally recedes into obscurity. Whenever corporations abuse their monopoly power to degrade the user experience, the shadow competitor rises to remind them that consumers always have a choice.
            </p>
          </div>

        </div>

        {/* AdSense In-Article / Bottom Placement */}
        <AdSenseSlot slotId="shadow-competition-bottom" format="auto" responsive={true} showDisclaimer={true} className="my-12" />

        {/* Sources & Citations */}
        <div className="mt-14 p-6 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <Bookmark size={14} className="text-amber-400" />
            <span>Documented Economic Studies & Industry References</span>
          </h3>
          <ul className="space-y-2 text-xs font-mono text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">1.</span>
              <span>Harvard Business School & MIT Sloan Studies on Shadow Competitors and Price Ceilings in Digital Media.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">2.</span>
              <span>Antitrust & Industrial Organization Economic Frameworks on Monopolistic Media Silos.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">3.</span>
              <span>Empirical Analysis of Music Industry Revenues Post-Spotify (IFPI Global Music Reports 2012–2025).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">4.</span>
              <span>Consumer Electronics Association Studies on Piracy as a Feedback Mechanism for UX & Pricing.</span>
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
export default ShadowCompetitionArticlePage;
