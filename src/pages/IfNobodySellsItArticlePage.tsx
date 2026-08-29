import React, { useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Bookmark, 
  ChevronRight, 
  Bot, 
  HelpCircle, 
  Archive, 
  ShieldAlert, 
  Scale, 
  DollarSign, 
  Disc, 
  Sparkles, 
  Gamepad2, 
  Layers, 
  AlertTriangle, 
  History, 
  Split, 
  CheckCircle2, 
  XCircle,
  Database
} from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import { AdSenseSlot } from '../components/ads/AdSenseSlot';

interface ArticlePageProps {
  onNavigate?: (path: string) => void;
}

export const IfNobodySellsItArticlePage: React.FC<ArticlePageProps> = ({ onNavigate }) => {
  const currentArticle = BLOG_POSTS.find(
    (p) => p.slug === 'if-nobody-sells-it-who-are-you-stealing-from'
  );

  const relatedPosts = BLOG_POSTS.filter(
    (p) => p.slug !== 'if-nobody-sells-it-who-are-you-stealing-from'
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = "If Nobody Sells It, Who Are You Stealing From? | CodeFuser Journal";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        "A game disappears from every official store, the console is obsolete, the developer is gone, and the original DLC is no longer sold. Is downloading a copy still morally wrong, or does “ethical piracy” expose a gap between copyright law, ownership, access and preservation?"
      );
    }
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "If Nobody Sells It, Who Are You Stealing From?",
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
              Digital Preservation & Copyright Ethics
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
              The Abandonware Conundrum
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-400/10 border border-indigo-400/20 text-indigo-300 text-xs font-mono">
              Level 1 — Pillar
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-white leading-[1.15]">
            If Nobody Sells It, Who Are You Stealing From?
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed font-sans font-normal border-l-2 border-amber-400/80 pl-4 py-1">
            A game disappears from every storefront, its original console is obsolete, the studio is dissolved, and master licensing agreements have expired. When there is no legal register to swipe your credit card, is downloading an unofficial copy a moral theft or the only remaining act of cultural preservation?
          </p>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm font-mono text-zinc-400 pt-2 border-b border-white/10 pb-6">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-amber-400" />
              August 28, 2026
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-amber-400" />
              11 min read
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Bot size={14} className="text-amber-400" />
              By CodeFuser Tech & Media Research
            </span>
          </div>
        </div>

        {/* AdSense Top Placement */}
        <AdSenseSlot slotId="abandonware-preservation-top" format="auto" responsive={true} showDisclaimer={true} />

        {/* Article Body */}
        <div className="prose prose-invert max-w-none space-y-7 text-zinc-300 text-base sm:text-lg leading-relaxed font-sans mt-8">
          
          <p className="text-lg sm:text-xl text-white font-medium">
            There is a question about copyright and unauthorized distribution that sounds almost deliberately provocative:
          </p>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-amber-500/30 text-amber-200 font-display text-xl sm:text-2xl font-bold my-6 shadow-xl">
            “If nobody is selling the product anymore, who exactly are you stealing money from?”
          </div>

          <p>
            Notice what this inquiry is <em>not</em> about:
          </p>

          <ul className="space-y-1 list-disc pl-6 text-zinc-300">
            <li>It is not: <em>“I cannot afford the $70 retail price.”</em></li>
            <li>It is not: <em>“I found a cheaper grey-market key on an unauthorized marketplace.”</em></li>
            <li>It is not: <em>“I simply prefer not paying for software.”</em></li>
          </ul>

          <p>
            The reality under examination is far stranger and increasingly common across modern media:
          </p>

          {/* Exhaustion Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6 font-mono text-xs">
            <div className="p-4 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1">
              <div className="text-rose-400 font-bold flex items-center gap-1.5">
                <XCircle size={14} /> The official digital store doesn't sell it.
              </div>
              <p className="text-zinc-400 font-sans">Servers decommissioned, digital storefronts shuttered.</p>
            </div>

            <div className="p-4 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1">
              <div className="text-rose-400 font-bold flex items-center gap-1.5">
                <XCircle size={14} /> The original publisher doesn't sell it.
              </div>
              <p className="text-zinc-400 font-sans">Catalog purged due to expiring IP, music, or car brand licenses.</p>
            </div>

            <div className="p-4 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1">
              <div className="text-rose-400 font-bold flex items-center gap-1.5">
                <XCircle size={14} /> The development studio is bankrupt.
              </div>
              <p className="text-zinc-400 font-sans">Liquidated in 2008; intellectual property scattered across venture debt holders.</p>
            </div>

            <div className="p-4 bg-zinc-900/80 border border-white/10 rounded-xl space-y-1">
              <div className="text-rose-400 font-bold flex items-center gap-1.5">
                <XCircle size={14} /> The original hardware is extinct.
              </div>
              <p className="text-zinc-400 font-sans">Custom silicon chips, obsolete optical media, and degrading batteries.</p>
            </div>
          </div>

          <p>
            Yet the legal copyright remains intact. Under international treaties like the Berne Convention and domestic laws like the US DMCA or European Copyright Directives, that legal monopoly endures for 70 to 95 years after creation.
          </p>

          <p>
            This produces an unprecedented historical divergence between <strong>legal availability</strong> and <strong>cultural availability</strong>.
          </p>

          <p className="text-xl font-display font-bold text-white">
            A piece of interactive art can be commercially dead, while remaining completely alive in the collective memory of civilization.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 01: The Hypothetical Game That Disappeared */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Gamepad2 size={15} />
              <span>Cultural Case Studies</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The Games History Forgot to Keep on Sale
            </h2>
          </div>

          <p>
            Consider a real-world scenario repeated thousands of times across the gaming ecosystem:
          </p>

          <p>
            Think of games like <em>The Simpsons: Hit & Run</em>, vintage <em>Pokémon HeartGold</em>, <em>Guitar Hero II</em> with its master audio tracks, Konami’s infamous <em>P.T.</em> demo, or <em>Marvel vs. Capcom 2</em> on digital storefronts.
          </p>

          <p>
            A player in 2026 desires to play one of these historic masterpieces. Their first instinct is legitimate:
          </p>

          <div className="p-4 rounded-xl bg-zinc-900 border border-white/10 font-mono text-amber-300 text-sm my-4">
            “Where can I enter my credit card to buy a legitimate copy and support the creators?”
          </div>

          <p>
            They search Steam. Nothing. They search PlayStation Store, Nintendo eShop, and Xbox Marketplace. Nothing. They check the publisher's website. The landing page redirects to a 404 error.
          </p>

          <p>
            Then they ask the inevitable follow-up: <strong>“Who am I supposed to pay?”</strong>
          </p>

          <p>
            If they turn to eBay, they discover a scratched physical disc selling for $280 from an anonymous retro-speculator. Buying that cartridge yields exactly <strong>$0.00</strong> to the programmers, artists, designers, or voice actors who built the experience. The commercial channel has entirely collapsed.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 02: Three Clashing Definitions of Piracy */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Scale size={15} />
              <span>Ethical & Legal Decomposition</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              What Is Piracy Actually Violating?
            </h2>
          </div>

          <p>
            When we strip away public relations slogans, anti-piracy arguments rest on three distinct legal and moral pillars. When applied to abandonware, these pillars fracture completely:
          </p>

          {/* Three Pillars Analysis */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6 font-mono text-xs">
            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase text-xs">
                <DollarSign size={16} /> 1. Lost Revenue
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                The classical economic argument: <em>“You took money from the creator.”</em> In abandonware, this harm is literally zero. There is no transaction to displace.
              </p>
              <div className="text-emerald-400 font-mono text-xs">Economic Loss: $0.00</div>
            </div>

            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase text-xs">
                <ShieldAlert size={16} /> 2. Lost Control
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                The legal property argument: <em>“The copyright holder has the exclusive right to decide who experiences their work, including the right to withdraw it forever.”</em>
              </p>
              <div className="text-amber-300 font-mono text-xs">Monopoly Right Maintained</div>
            </div>

            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase text-xs">
                <Disc size={16} /> 3. Unauthorized Duplication
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                The statutory compliance argument: <em>“The law forbids bit-for-bit copying without an explicit license, regardless of commercial intent.”</em>
              </p>
              <div className="text-rose-400 font-mono text-xs">Statutory Violation</div>
            </div>
          </div>

          <p>
            The core tension is this: <strong>Copyright law was constructed to incentivize active creation by granting a temporary commercial monopoly.</strong> When that monopoly is used not to sell a product, but to lock it in a vault until the digital bits rot into oblivion, the statutory mechanism actively subverts its original constitutional purpose: <em>to promote the progress of science and useful arts</em>.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 03: The 87% Crisis */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Database size={15} />
              <span>Empirical Data</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The 87% Crisis: Video Game Extinction in Numbers
            </h2>
          </div>

          <p>
            This is not a fringe philosophical exercise affecting a handful of obscure titles. In a landmark 2023 study published by the <strong>Video Game History Foundation (VGHF)</strong> in partnership with the Software Preservation Network:
          </p>

          {/* Big Stat Box */}
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900 border border-amber-400/30 my-6 space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-6xl font-display font-black text-amber-400">87%</span>
              <span className="text-sm sm:text-base font-mono text-zinc-300 uppercase tracking-wider">
                of classic video games released before 2010 are commercially extinct.
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
              Only 13% of historical video games are currently available in any commercial storefront. For comparison, pre-World War II silent films—widely considered a cultural disaster of lost preservation—have a survival rate roughly comparable to the commercial availability of video games released in the 1990s and 2000s.
            </p>
          </div>

          <p>
            If libraries, museums, and decentralized internet archivers were forced to comply strictly with commercial storefront availability rules, <strong>nearly nine out of every ten games ever created would vanish from human access entirely.</strong>
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 04: The Pipeline from Abandonment to Archival */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <History size={15} />
              <span>Cultural Dynamics</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Commercial Abandonment vs. Cultural Immortality
            </h2>
          </div>

          <p>
            A corporate board may declare an IP dead because it generated only $40,000 in quarterly revenue against $100,000 in cloud licensing overhead. But human culture does not operate on quarterly earnings reports:
          </p>

          {/* Flow Diagram */}
          <div className="p-6 rounded-2xl bg-zinc-900/90 border border-white/10 font-mono text-xs sm:text-sm my-6 space-y-4">
            <div className="text-amber-400 font-bold uppercase text-xs">The Digital Abandonment Lifecycle:</div>
            
            <div className="space-y-3 text-zinc-300">
              <div className="flex items-start gap-3">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-300 text-xs font-mono">Stage 1</span>
                <span className="text-xs font-sans"><strong>Commercial Sunset:</strong> Publisher delists title; licensing rights expire; storefront closes.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-300 text-xs font-mono">Stage 2</span>
                <span className="text-xs font-sans"><strong>Secondary Market Speculation:</strong> Physical media prices surge on auction sites; zero royalties reach creators.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-300 text-xs font-mono">Stage 3</span>
                <span className="text-xs font-sans"><strong>Media Rot & Hardware Deprecation:</strong> Discs oxidize; flash NAND memory fails; CRT monitors vanish.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono">Stage 4</span>
                <span className="text-xs font-sans text-emerald-300"><strong>Unofficial Digital Preservation:</strong> Emulators, ROM preservation projects, and community reverse-engineering keep cultural memory alive.</span>
              </div>
            </div>
          </div>

          {/* Strategic Conclusion Box */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-white/10 space-y-4 my-10">
            <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              The Definitive Verdict
            </h3>
            <p className="text-xl sm:text-2xl font-display font-black text-amber-300 leading-snug">
              When commerce retreats, preservation becomes a cultural imperative.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              Calling the download of an abandoned, store-less, delisted game "theft" confuses the legal fiction of infinite copyright with the physical reality of human culture. If nobody is willing to sell the art, you are not stealing from a creator—you are rescuing their work from corporate amnesia and digital extinction.
            </p>
          </div>

        </div>

        {/* AdSense In-Article / Bottom Placement */}
        <AdSenseSlot slotId="abandonware-preservation-bottom" format="auto" responsive={true} showDisclaimer={true} className="my-12" />

        {/* Sources & Citations */}
        <div className="mt-14 p-6 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <Bookmark size={14} className="text-amber-400" />
            <span>Preservation & Legal Sources</span>
          </h3>
          <ul className="space-y-2 text-xs font-mono text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">1.</span>
              <span>Library of Congress & US Copyright Office: Section 1201 Exemptions for Video Game Preservation and Server Emulation.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">2.</span>
              <span>Video Game History Foundation (VGHF) — Survey of the Commercial Availability of Classic Video Games (87% Critically Endangered).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">3.</span>
              <span>Electronic Frontier Foundation (EFF) — The Right to Repair and Preserve Orphaned Digital Works.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">4.</span>
              <span>Journal of Cultural Heritage & Digital Rights Management: Legal Lacunae in Abandonware and Post-Storefront Digital Access.</span>
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
export default IfNobodySellsItArticlePage;
