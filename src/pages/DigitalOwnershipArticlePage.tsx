import React, { useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Bookmark, 
  ChevronRight, 
  Key, 
  Lock, 
  Server, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Database, 
  Gamepad2, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle,
  Scale,
  CloudOff,
  Radio,
  History
} from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import { AdSenseSlot } from '../components/ads/AdSenseSlot';

interface ArticlePageProps {
  onNavigate?: (path: string) => void;
}

export const DigitalOwnershipArticlePage: React.FC<ArticlePageProps> = ({ onNavigate }) => {
  const currentArticle = BLOG_POSTS.find(
    (p) => p.slug === 'you-paid-for-it-why-can-they-still-take-it-away'
  );

  const relatedPosts = BLOG_POSTS.filter(
    (p) => p.slug !== 'you-paid-for-it-why-can-they-still-take-it-away'
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = "You Paid for It. Why Can They Still Take It Away? | CodeFuser Journal";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'You clicked “Buy” on a digital game. So why might your access still depend on a license, DRM, servers, an account, or a platform? We investigate what digital game ownership actually means.'
      );
    }
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "You Paid for It. Why Can They Still Take It Away?",
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
              Digital Ownership & Rights
            </span>
            <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
              DRM & Consumer Law
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-xs font-mono">
              Level 1 — Pillar
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-white leading-[1.15]">
            You Paid for It. Why Can They Still Take It Away?
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed font-sans font-normal border-l-2 border-amber-400/80 pl-4 py-1">
            You clicked “Buy” on a digital game. So why might your access still depend on a license, DRM, servers, an account, or a platform? We investigate what digital game ownership actually means.
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
              <Key size={14} className="text-amber-400" />
              By CodeFuser Tech & Media Research
            </span>
          </div>
        </div>

        {/* AdSense Top Placement */}
        <AdSenseSlot slotId="digital-ownership-top" format="auto" responsive={true} showDisclaimer={true} />

        {/* Article Body */}
        <div className="prose prose-invert max-w-none space-y-7 text-zinc-300 text-base sm:text-lg leading-relaxed font-sans mt-8">
          
          <p className="text-lg sm:text-xl text-white font-medium">
            You see a game.
          </p>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-white/10 font-mono text-center my-6 space-y-3">
            <div className="text-3xl font-black text-white tracking-tight">$59.99</div>
            <button className="px-8 py-3 rounded-xl bg-amber-400 text-zinc-950 font-bold text-sm tracking-wider uppercase shadow-lg shadow-amber-400/10 pointer-events-none">
              BUY NOW
            </button>
            <p className="text-xs text-zinc-400 pt-2 m-0">The button that defines modern digital commerce.</p>
          </div>

          <p>
            You pay. The game appears in your library.
          </p>

          <p>
            So naturally, you think:
          </p>

          <blockquote className="border-l-4 border-emerald-500/80 pl-4 py-2 my-4 text-emerald-300 font-mono text-base bg-zinc-900/60 rounded-r-lg">
            “I bought it. It's mine.”
          </blockquote>

          <p>
            That sounds completely reasonable. It aligns with thousands of years of human property exchange: you hand over currency, the merchant hands over the good, and the transaction is closed.
          </p>

          <p>
            But digital software has engineered a strange new possibility:
          </p>

          <div className="p-5 rounded-xl bg-zinc-900/80 border border-rose-500/30 text-rose-300 font-mono text-sm my-4">
            You can pay full retail price for something today... and still have zero legal guarantee that you can execute that file five years from now.
          </div>

          <p>
            Regulators like the <strong className="text-white">Federal Trade Commission (FTC)</strong> and newly enacted state statutes (such as California AB 2426) have warned consumers that clicking “Buy” on digital storefronts frequently grants a revocable, non-transferable license rather than traditional ownership—with ongoing access tethered to authentication servers, account standing, third-party DRM, and corporate solvency.
          </p>

          <p>
            And suddenly the word <strong className="text-amber-400">“BUY”</strong> starts looking very interesting.
          </p>

          <p className="text-xl font-bold text-white">
            Because what exactly did you purchase?
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 01: The Button Says "BUY" */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Key size={15} />
              <span>Semantic Disconnect</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The button says “BUY” — but the contract says “LICENSE”
            </h2>
          </div>

          <p>
            This is where the entire consumer debate begins.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 font-mono text-xs sm:text-sm">
            <div className="p-5 rounded-xl bg-zinc-900 border border-emerald-500/30 space-y-2">
              <span className="text-emerald-400 font-bold uppercase block text-xs">Human Intuition</span>
              <div className="text-white text-base font-bold">BUY → PAY → OWN</div>
              <p className="text-zinc-400 font-sans text-xs pt-1">
                Perpetual possession. Physical permanence. Complete independence from the seller.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900 border border-amber-500/30 space-y-2">
              <span className="text-amber-400 font-bold uppercase block text-xs">Digital Contract Reality</span>
              <div className="text-white text-base font-bold">BUY → PAY → LICENSE → CONDITIONAL ACCESS</div>
              <p className="text-zinc-400 font-sans text-xs pt-1">
                Revocable permissions. Ongoing server checks. Subject to EULA modifications and store shutdowns.
              </p>
            </div>
          </div>

          <p>
            A digital purchase does not make you the copyright holder, nor does it give you the studio's source code or commercial distribution rights.
          </p>

          <p>
            But there is a much more practical question hiding underneath the legalese:
          </p>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-white/10 text-center my-6">
            <p className="text-lg sm:text-xl font-display font-bold text-amber-300 m-0">
              “How much operational control should a consumer reasonably expect after paying full retail price?”
            </p>
          </div>

          <hr className="border-white/10 my-10" />

          {/* Section 02: Three Models */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Layers size={15} />
              <span>Property Taxonomies</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Subscription vs. License vs. Physical Ownership
            </h2>
          </div>

          <p>
            Online discussions often collapse all non-physical media into “renting.” But that oversimplification ignores the critical legal and operational tiers:
          </p>

          {/* Three Tiers Matrix */}
          <div className="space-y-3 my-6 font-mono text-xs sm:text-sm">
            
            <div className="p-4 rounded-xl bg-zinc-900 border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-cyan-400 font-bold uppercase">1. The Subscription Model (Game Pass, PS Plus)</span>
                <span className="text-zinc-400 text-xs">Temporary Stream</span>
              </div>
              <p className="text-zinc-300 font-sans">
                You pay a recurring fee for rotating catalog access. You expect zero permanence once the billing cycle stops or the title departs the library.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-amber-500/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold uppercase">2. The Digital Storefront License (Steam, PlayStation Store)</span>
                <span className="text-zinc-400 text-xs">One-Time Fee, Conditional</span>
              </div>
              <p className="text-zinc-300 font-sans">
                You pay full retail ($70) upfront for indefinite personal use under specific technical constraints (DRM, account standing, authentication availability).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-emerald-500/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold uppercase">3. Physical / DRM-Free Ownership (Discs, GOG Installers)</span>
                <span className="text-zinc-400 text-xs">Permanent Artifact</span>
              </div>
              <p className="text-zinc-300 font-sans">
                You hold the physical medium or offline standalone installer. The file executes without contacting any central server. Protected under the First Sale Doctrine for physical redistribution.
              </p>
            </div>

          </div>

          <hr className="border-white/10 my-10" />

          {/* Section 03: The Fragility Chain */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Server size={15} />
              <span>Technical Dependency</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The fragile 7-step chain between you and your game
            </h2>
          </div>

          <p>
            When you purchase a game protected by online DRM, your access is not a single local file. It is a fragile, multi-layered handshake:
          </p>

          {/* Dependency Chain Visual */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-white/10 my-6 font-mono text-xs sm:text-sm space-y-2">
            <div className="p-2.5 rounded bg-zinc-950 border border-white/10 text-white flex items-center justify-between">
              <span>1. YOU</span>
              <span className="text-zinc-500">The Purchaser</span>
            </div>
            <div className="text-center text-amber-400">↓</div>
            <div className="p-2.5 rounded bg-zinc-950 border border-white/10 text-zinc-300 flex items-center justify-between">
              <span>2. DIGITAL STOREFRONT</span>
              <span className="text-zinc-500">Steam, Epic, PSN, Xbox, Nintendo eShop</span>
            </div>
            <div className="text-center text-amber-400">↓</div>
            <div className="p-2.5 rounded bg-zinc-950 border border-white/10 text-zinc-300 flex items-center justify-between">
              <span>3. USER ACCOUNT</span>
              <span className="text-zinc-500">Can be banned, locked, or regionalized</span>
            </div>
            <div className="text-center text-amber-400">↓</div>
            <div className="p-2.5 rounded bg-zinc-950 border border-white/10 text-zinc-300 flex items-center justify-between">
              <span>4. EULA & LICENSE ENTITLEMENT</span>
              <span className="text-zinc-500">Subject to terms of service updates</span>
            </div>
            <div className="text-center text-amber-400">↓</div>
            <div className="p-2.5 rounded bg-zinc-950 border border-white/10 text-zinc-300 flex items-center justify-between">
              <span>5. DRM WRAPPER</span>
              <span className="text-zinc-500">Denuvo, SecuROM, custom wrappers</span>
            </div>
            <div className="text-center text-amber-400">↓</div>
            <div className="p-2.5 rounded bg-zinc-950 border border-white/10 text-zinc-300 flex items-center justify-between">
              <span>6. AUTHENTICATION SERVER</span>
              <span className="text-zinc-500">Requires periodic internet “phone-home”</span>
            </div>
            <div className="text-center text-amber-400">↓</div>
            <div className="p-2.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-between">
              <span>7. LOCAL GAME BINARY</span>
              <span className="text-emerald-400">Executes only if Steps 1-6 succeed</span>
            </div>
          </div>

          <p>
            If any single node in that chain fails—if the publisher shuts down the activation server, if your account is locked, or if licensing rights lapse—the local file on your hard drive is rendered unusable.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 04: The Single-Player Server Shutdown Dilemma */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <CloudOff size={15} />
              <span>Real-World Precedents</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              When single-player games go dark
            </h2>
          </div>

          <p>
            This is not hypothetical paranoia. The gaming industry has already experienced high-profile cases where full-priced retail purchases were completely wiped out:
          </p>

          <div className="space-y-3 my-6 font-mono text-xs">
            <div className="p-4 rounded-xl bg-zinc-900 border border-rose-500/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-rose-400 font-bold">The Crew (Ubisoft)</span>
                <span className="text-zinc-400">Shutdown April 2024</span>
              </div>
              <p className="text-zinc-300 font-sans">
                Despite thousands of players having paid full price for the campaign mode, Ubisoft shut down the master servers and actively revoked user license entitlements from Ubisoft Connect libraries, rendering the game completely unplayable.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-amber-500/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold">Nintendo 3DS & Wii U eShop Closures</span>
                <span className="text-zinc-400">Shutdown 2023</span>
              </div>
              <p className="text-zinc-300 font-sans">
                Hundreds of digital-only indie titles and classic Virtual Console games became permanently unpurchasable, leaving hardware failure as an existential threat to existing digital libraries.
              </p>
            </div>
          </div>

          <hr className="border-white/10 my-10" />

          {/* Section 05: The Legislative & Technical Fixes */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Scale size={15} />
              <span>The Path Forward</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              How digital rights are beginning to fight back
            </h2>
          </div>

          <p>
            In response to growing consumer backlash, legal frameworks and digital distribution models are evolving:
          </p>

          <div className="space-y-4 my-6">
            
            <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <CheckCircle2 size={16} />
                <span>1. Mandatory Truth-in-Advertising Disclosures (California AB 2426)</span>
              </div>
              <p className="text-sm text-zinc-300 font-sans">
                Signed into law in late 2024, digital storefronts operating in California are now prohibited from using terms like "buy," "purchase," or any term that a reasonable person would interpret as conferring ownership unless they explicitly disclose that the transaction is merely a revocable license.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 size={16} />
                <span>2. The GOG Preservation Program & Offline Installers</span>
              </div>
              <p className="text-sm text-zinc-300 font-sans">
                CD Projekt's GOG storefront provides DRM-free offline backup installers. Once downloaded, you own the standalone executable. Even if GOG were to cease operations tomorrow, your local installer runs indefinitely without needing server authorization.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <CheckCircle2 size={16} />
                <span>3. End-of-Life Server Patching Mandates (Stop Killing Games Initiative)</span>
              </div>
              <p className="text-sm text-zinc-300 font-sans">
                European citizens' initiatives are petitioning for legal mandates requiring publishers to release an offline patch or peer-to-peer server binary when they terminate commercial support for a video game.
              </p>
            </div>

          </div>

          {/* Strategic Conclusion Callout */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-white/10 space-y-4 my-10">
            <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              The Real Question
            </h3>
            <p className="text-xl sm:text-2xl font-display font-black text-amber-300 leading-snug">
              If an item requires another machine's continuous permission to work, you didn't buy a product—you bought an audience.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              As digital transactions become the default for all cultural media, redefining the boundary between conditional licensing and consumer permanence is the definitive digital rights challenge of our decade.
            </p>
          </div>

        </div>

        {/* AdSense In-Article / Bottom Placement */}
        <AdSenseSlot slotId="digital-ownership-bottom" format="auto" responsive={true} showDisclaimer={true} className="my-12" />

        {/* Sources & Citations */}
        <div className="mt-14 p-6 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <Bookmark size={14} className="text-amber-400" />
            <span>Documented Sources & Regulatory Frameworks</span>
          </h3>
          <ul className="space-y-2 text-xs font-mono text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">1.</span>
              <span>Federal Trade Commission (FTC) Consumer Guidance on Digital Goods vs Perpetual Licenses.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">2.</span>
              <span>Electronic Frontier Foundation (EFF) Whitepapers on DRM, EULAs, and the First Sale Doctrine.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">3.</span>
              <span>California AB 2426 (Digital Goods Labeling and Consumer Disclosures Law).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">4.</span>
              <span>Video Game History Foundation (VGHF) Studies on Classic Game Availability and Commercial Delisting.</span>
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
export default DigitalOwnershipArticlePage;
