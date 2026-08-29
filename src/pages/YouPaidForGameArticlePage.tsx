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
  Lock, 
  Unlock, 
  ServerOff, 
  Server, 
  HardDrive, 
  FileWarning, 
  Flame, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import { AdSenseSlot } from '../components/ads/AdSenseSlot';

interface ArticlePageProps {
  onNavigate?: (path: string) => void;
}

export const YouPaidForGameArticlePage: React.FC<ArticlePageProps> = ({ onNavigate }) => {
  const currentArticle = BLOG_POSTS.find(
    (p) => p.slug === 'you-paid-for-the-game-why-cant-you-play-it-anymore'
  );

  const relatedPosts = BLOG_POSTS.filter(
    (p) => p.slug !== 'you-paid-for-the-game-why-cant-you-play-it-anymore'
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = "You Paid for the Game. Why Can't You Play It Anymore? | CodeFuser Journal";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        "What happens when you legally buy a game and later lose access because an activation server is shut down, a storefront disappears, or the publisher changes the rules? An investigation into digital ownership, DRM, always-online requirements, consumer rights, piracy and why some gamers say the legal copy feels less permanent than the pirate one."
      );
    }
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "You Paid for the Game. Why Can't You Play It Anymore?",
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
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
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
              Digital Ownership & Consumer Rights
            </span>
            <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
              The DRM Decay Crisis
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-xs font-mono">
              Level 1 — Pillar
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-white leading-[1.15]">
            You Paid for the Game. Why Can’t You Play It Anymore?
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed font-sans font-normal border-l-2 border-amber-400/80 pl-4 py-1">
            What happens when you legally purchase software, only to lose access when an activation server shuts down, a storefront sunsets, or an always-online handshake fails? An investigation into how digital rights management transformed durable ownership into fragile, revocable rental streams.
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
        <AdSenseSlot slotId="you-paid-for-game-top" format="auto" responsive={true} showDisclaimer={true} />

        {/* Article Body */}
        <div className="prose prose-invert max-w-none space-y-7 text-zinc-300 text-base sm:text-lg leading-relaxed font-sans mt-8">
          
          <p className="text-lg sm:text-xl text-white font-medium">
            You bought the game. You entered your credit card information. You downloaded the files. You beat the campaign.
          </p>

          <p>
            Years later, nostalgia strikes. You open your game launcher, navigate to your library, and click <strong>Install</strong>.
          </p>

          <p>
            The game boots to a splash screen, attempts a network handshake, and halts:
          </p>

          <div className="p-4 rounded-xl bg-zinc-900 border border-rose-500/40 font-mono text-rose-300 text-sm my-4 flex items-center gap-3">
            <ServerOff size={20} className="shrink-0 text-rose-400" />
            <div>
              <span className="font-bold">Error 0x80040154:</span> Activation server unreachable. Please verify your internet connection or contact the publisher.
            </div>
          </div>

          <p>
            You check your router—your internet is blazing fast. The problem isn't your connection.
          </p>

          <p>
            The publisher decommissioned the authentication cluster three years ago. The server that grants cryptographic permission to execute the software on your machine no longer exists on Earth.
          </p>

          <p>
            Meanwhile, two clicks away on an archival forum, a community-cracked copy of that exact same game—stripped of its authentication check—installs in sixty seconds and runs flawlessly.
          </p>

          <p className="text-xl font-display font-bold text-white">
            How did the version you paid for become less durable and less functional than the version you didn't?
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 01: Physical vs Digital Ownership */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <HardDrive size={15} />
              <span>The Ownership Paradigm Shift</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The Strange Illusion of the “BUY” Button
            </h2>
          </div>

          <p>
            For the first thirty years of commercial gaming, the transaction was mechanically straightforward:
          </p>

          {/* Evolution Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 font-mono text-xs">
            <div className="p-5 bg-zinc-900 border border-emerald-500/20 rounded-xl space-y-3">
              <div className="text-emerald-400 font-bold uppercase flex items-center gap-2">
                <CheckCircle2 size={16} /> Physical Era (1980–2005)
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                You purchased a cartridge or CD-ROM. The binary executable resided entirely on local media. Even if the publisher went bankrupt or the studio dissolved, the plastic disc in your drawer functioned identically twenty years later.
              </p>
              <div className="text-emerald-300 font-mono text-xs">Model: Permanent Physical Possession</div>
            </div>

            <div className="p-5 bg-zinc-900 border border-rose-500/20 rounded-xl space-y-3">
              <div className="text-rose-400 font-bold uppercase flex items-center gap-2">
                <AlertTriangle size={16} /> The Modern DRM Era (2005–Present)
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                You click "BUY $69.99", but legally you acquire a revocable, conditional software license tethered to remote master accounts, proprietary telemetry daemons, and live authentication handshakes.
              </p>
              <div className="text-rose-300 font-mono text-xs">Model: Conditional Service Stream</div>
            </div>
          </div>

          <p>
            This shift created an immense psychological dissonance. When a consumer clicks a prominent gold button reading <strong>“BUY”</strong>, their intuitive expectation is asset acquisition. Under modern End User License Agreements (EULAs), however, they are paying full purchase price for a temporary, revocable lease.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 02: The DRM Architecture */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Lock size={15} />
              <span>Technical Mechanics</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              DRM Was Supposed to Protect the Game. Why Does It Kill It?
            </h2>
          </div>

          <p>
            Digital Rights Management (DRM) was developed to prevent day-one copying during the critical commercial launch window. But the architecture of modern DRM introduces points of irreversible decay:
          </p>

          {/* Diagram of DRM Failure Points */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-white/10 space-y-4 my-6 font-mono text-xs sm:text-sm">
            <div className="text-amber-400 font-bold uppercase">The DRM Dependency Fragility Chain:</div>
            <div className="space-y-2 text-zinc-300 font-sans">
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-mono">1. Activation Limits:</span>
                <span>Early DRM suites (like SecuROM and StarForce) limited installations to 3 or 5 machines. Upgrade your GPU twice, and your legitimate key was permanently burned.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-mono">2. Periodic Online Handshakes:</span>
                <span>Systems like Denuvo require regular cryptographic ticket renewals. If you take your laptop offline on a remote trip after a ticket expires, the game refuses to launch.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-mono">3. Storefront Closure & Delisting:</span>
                <span>When Games for Windows Live (GFWL), Ubisoft Connect legacy servers, or defunct DRM nodes sunset, single-player titles become collateral damage.</span>
              </div>
            </div>
          </div>

          <p>
            When a publisher decides it is no longer cost-effective to pay $500 a month to maintain legacy authentication servers, they rarely release a final offline patch. Instead, the game silently dies for every person who bought it.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 03: The Legal Copy vs Pirated Copy Paradox */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Scale size={15} />
              <span>The Quality Paradox</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Why the Pirate Copy Becomes the Superior Product
            </h2>
          </div>

          <p>
            The ultimate irony of digital rights management is that it creates an incentive inversion: the paying customer receives the degraded product, while the pirate receives the definitive edition.
          </p>

          {/* Comparison Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 font-mono text-xs">
            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-3">
              <div className="text-rose-400 font-bold uppercase">The Legitimate Retail Version</div>
              <ul className="space-y-1.5 text-zinc-300 font-sans text-xs">
                <li>• Requires background launcher running and eating RAM.</li>
                <li>• CPU overhead from constant DRM decryption loops.</li>
                <li>• Unskippable splash screens, ads, and telemetry daemons.</li>
                <li>• Dies forever the moment the login server shuts down.</li>
              </ul>
            </div>

            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-3">
              <div className="text-emerald-400 font-bold uppercase">The Community Cracked Version</div>
              <ul className="space-y-1.5 text-zinc-300 font-sans text-xs">
                <li>• Zero launchers; standalone executable boots instantly.</li>
                <li>• Stripped of background telemetry and DRM polling loops.</li>
                <li>• 100% offline portability on external hard drives.</li>
                <li>• Immune to corporate bankruptcy, delisting, and server shutdowns.</li>
              </ul>
            </div>
          </div>

          <p>
            When Ubisoft delisted <em>The Crew</em> in 2024 and revoked licenses from players' accounts, it sparked a global consumer revolt—giving birth to the European <strong>“Stop Killing Games”</strong> initiative, demanding that publishers leave games in a playable, offline state before abandoning them.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Strategic Conclusion Box */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-white/10 space-y-4 my-10">
            <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              The Fundamental Lesson
            </h3>
            <p className="text-xl sm:text-2xl font-display font-black text-amber-300 leading-snug">
              If buying isn't owning, then copying isn't stealing.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              This famous internet aphorism isn't just a witty comeback; it represents a profound breakdown in the digital social contract. Until publishers treat paid software as a durable cultural product rather than a fragile, remote-controlled kill-switched service, community cracking and piracy will remain the only functional preservation system gaming has left.
            </p>
          </div>

        </div>

        {/* AdSense In-Article / Bottom Placement */}
        <AdSenseSlot slotId="you-paid-for-game-bottom" format="auto" responsive={true} showDisclaimer={true} className="my-12" />

        {/* Sources & Citations */}
        <div className="mt-14 p-6 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <Bookmark size={14} className="text-amber-400" />
            <span>Academic & Legal Citations</span>
          </h3>
          <ul className="space-y-2 text-xs font-mono text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">1.</span>
              <span>European Citizens' Initiative (ECI): "Stop Killing Games: Preserving Access to Discontinued Video Games" (2024–2026).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">2.</span>
              <span>Electronic Frontier Foundation (EFF): "DRM and the Erosion of First-Sale Rights in the Digital Age."</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">3.</span>
              <span>Harvard Law Review: "From Ownership to Access: The Shrinking Rights of the Digital Consumer."</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">4.</span>
              <span>Game Developers Conference (GDC): "Post-Mortem of Always-Online Single Player Infrastructure and Sunset Strategies."</span>
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
export default YouPaidForGameArticlePage;
