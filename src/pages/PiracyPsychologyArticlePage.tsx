import React, { useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Bookmark, 
  ChevronRight, 
  Brain, 
  Scale, 
  DollarSign, 
  Globe, 
  Archive, 
  ShieldAlert, 
  Flame, 
  Gamepad2, 
  Tv, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle,
  Lightbulb,
  Split,
  Eye,
  RefreshCw,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import { AdSenseSlot } from '../components/ads/AdSenseSlot';

interface ArticlePageProps {
  onNavigate?: (path: string) => void;
}

export const PiracyPsychologyArticlePage: React.FC<ArticlePageProps> = ({ onNavigate }) => {
  const currentArticle = BLOG_POSTS.find(
    (p) => p.slug === 'piracy-isnt-just-about-free-psychology-morality-and-justification'
  );

  const relatedPosts = BLOG_POSTS.filter(
    (p) => p.slug !== 'piracy-isnt-just-about-free-psychology-morality-and-justification'
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = "Piracy Isn't Just About “Free”: The Strange Psychology Behind How People Justify It | CodeFuser Journal";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Why do some people pirate because they are broke, others because content is unavailable, and others because they see piracy as resistance? A closer look at the psychology, morality and contradictions behind modern piracy.'
      );
    }
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Piracy Isn't Just About “Free”: The Strange Psychology Behind How People Justify It",
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
        <div className="absolute -top-40 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
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
            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono font-medium tracking-wide">
              Psychology & Digital Culture
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
              Consumer Morality & Friction
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-xs font-mono">
              Level 1 — Pillar
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-white leading-[1.15]">
            Piracy Isn't Just About “Free”: The Strange Psychology Behind How People Justify It
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed font-sans font-normal border-l-2 border-purple-400/80 pl-4 py-1">
            Why do some people pirate because they are broke, others because content is unavailable, and others because they see piracy as resistance? A closer look at the psychology, morality and contradictions behind modern piracy.
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
              <Brain size={14} className="text-purple-400" />
              By CodeFuser Tech & Media Research
            </span>
          </div>
        </div>

        {/* AdSense Top Placement */}
        <AdSenseSlot slotId="piracy-psychology-top" format="auto" responsive={true} showDisclaimer={true} />

        {/* Article Body */}
        <div className="prose prose-invert max-w-none space-y-7 text-zinc-300 text-base sm:text-lg leading-relaxed font-sans mt-8">
          
          <p className="text-lg sm:text-xl text-white font-medium">
            Piracy has an unusually strange reputation.
          </p>

          <p>
            Almost everyone knows what the basic argument is supposed to be:
          </p>

          <blockquote className="border-l-4 border-zinc-700 pl-4 py-2 my-4 text-zinc-300 font-mono text-base italic bg-zinc-900/60 rounded-r-lg">
            “Piracy is stealing.”
          </blockquote>

          <p>
            Then the internet arrives.
          </p>

          <p>
            Suddenly the discussion becomes:
          </p>

          <div className="space-y-2.5 my-6 font-mono text-xs sm:text-sm">
            <div className="p-3 bg-zinc-900 border border-white/10 rounded-lg text-amber-300">
              → “If buying isn't owning, then piracy isn't stealing.”
            </div>
            <div className="p-3 bg-zinc-900 border border-white/10 rounded-lg text-zinc-300">
              → “Just admit you want it for free.”
            </div>
            <div className="p-3 bg-zinc-900 border border-white/10 rounded-lg text-cyan-300">
              → “What if the game isn't available in my country?”
            </div>
            <div className="p-3 bg-zinc-900 border border-white/10 rounded-lg text-zinc-300">
              → Then someone brings up abandoned games.
            </div>
            <div className="p-3 bg-zinc-900 border border-white/10 rounded-lg text-purple-300">
              → Then someone brings up greedy corporations.
            </div>
            <div className="p-3 bg-zinc-900 border border-white/10 rounded-lg text-emerald-300">
              → Then someone brings up indie developers.
            </div>
            <div className="p-3 bg-zinc-900 border border-white/10 rounded-lg text-zinc-300">
              → Then someone brings up digital preservation.
            </div>
            <div className="p-3 bg-zinc-900 border border-rose-500/30 rounded-lg text-rose-300">
              → Then someone says: “I pirate because I'm poor.”
            </div>
          </div>

          <p>
            And suddenly a simple question about downloading a game has turned into a debate about <strong className="text-white">morality, capitalism, ownership, economics, access, fairness and human psychology.</strong>
          </p>

          <p>
            That is what makes piracy interesting.
          </p>

          <p>
            Not the downloading itself. The <strong className="text-amber-400 font-semibold">justification</strong> is.
          </p>

          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/50 via-zinc-900 to-black border border-purple-500/30 my-6 space-y-2">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white m-0">
              People aren't arguing about one thing.
            </h2>
            <p className="text-sm text-zinc-400 m-0">
              They're arguing about several completely different problems and calling all of them “piracy.”
            </p>
          </div>

          <hr className="border-white/10 my-10" />

          {/* Section 01: I just want it for free */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <span className="text-base">🏴‍☠️</span>
              <span>The Baseline Motivation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The first person says: “I just want it for free.”
            </h2>
          </div>

          <p>
            This is probably the least complicated argument.
          </p>

          <blockquote className="border-l-4 border-zinc-700 pl-4 py-2 my-4 text-zinc-300 italic font-mono bg-zinc-900/60 rounded-r-lg">
            “I just don't want to pay money for something I could get for free.”
          </blockquote>

          <p>
            Another says they pirate because they're simply broke and don't claim any moral high ground.
          </p>

          <p>
            There is something strangely refreshing about that position.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 text-xs font-mono text-center text-zinc-400">
            <div className="p-3 bg-zinc-900 border border-white/5 rounded-lg">No philosophy</div>
            <div className="p-3 bg-zinc-900 border border-white/5 rounded-lg">No corporate rant</div>
            <div className="p-3 bg-zinc-900 border border-white/5 rounded-lg">No theory of rights</div>
            <div className="p-3 bg-zinc-900 border border-white/5 rounded-lg">No noble claims</div>
          </div>

          <p>
            Just: <span className="text-white font-mono font-semibold">“I can't afford it”</span> or <span className="text-white font-mono font-semibold">“I don't want to spend money on it.”</span>
          </p>

          <p>
            That matters because many piracy arguments become needlessly complicated when the actual motivation is extremely simple: A person wants a product. The product costs money. They don't want to pay. They find another way.
          </p>

          <p>
            That's one category. But it isn't the entire piracy ecosystem.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 02: Morality Argument */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Scale size={15} />
              <span>Moral Framing</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Then comes the morality argument
            </h2>
          </div>

          <p>
            Another group doesn't want piracy to be described as ordinary selfish behavior. They want a moral explanation.
          </p>

          <p>
            The familiar phrase is: <strong className="text-amber-300">“If buying isn't owning, then piracy isn't stealing.”</strong>
          </p>

          <p>
            The problem is that this slogan collapses several separate questions into one:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4 font-mono text-xs text-zinc-300">
            <div className="p-3.5 bg-zinc-900 border border-white/10 rounded-lg flex items-center gap-2">
              <span className="text-purple-400 font-bold">?</span> What does “owning” actually mean?
            </div>
            <div className="p-3.5 bg-zinc-900 border border-white/10 rounded-lg flex items-center gap-2">
              <span className="text-purple-400 font-bold">?</span> What rights did the buyer purchase?
            </div>
            <div className="p-3.5 bg-zinc-900 border border-white/10 rounded-lg flex items-center gap-2">
              <span className="text-purple-400 font-bold">?</span> Was the work commercially available?
            </div>
            <div className="p-3.5 bg-zinc-900 border border-white/10 rounded-lg flex items-center gap-2">
              <span className="text-purple-400 font-bold">?</span> Would the person have purchased it otherwise?
            </div>
          </div>

          <p>
            One side argues that piracy deprives creators of compensation. Another points out that copying a digital file doesn't physically remove the original from anyone's possession. Another asks whether there is really a lost sale when the product isn't legally available in the person's country.
          </p>

          <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 text-center my-6">
            <p className="text-xl font-display font-bold text-white m-0">
              What exactly makes an action morally harmful?
            </p>
          </div>

          <hr className="border-white/10 my-10" />

          {/* Section 03: The Lost Sale */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <DollarSign size={15} />
              <span>Economic Fallacy</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The “lost sale” argument sounds simpler than it is
            </h2>
          </div>

          <p>
            One of the strongest arguments against piracy is: <span className="italic text-zinc-300">Someone would have paid. Therefore: Someone lost money.</span>
          </p>

          <p>
            But there is a hidden assumption inside that reasoning: <strong className="text-amber-400">Would they actually have paid?</strong>
          </p>

          <div className="space-y-3 my-6 font-mono text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-zinc-900 border border-white/10">
              <span className="text-amber-400 font-bold">Scenario A:</span> Someone downloads a $70 game they would never have purchased. Did the company lose $70? <span className="text-zinc-400">Not necessarily.</span>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900 border border-white/10">
              <span className="text-emerald-400 font-bold">Scenario B:</span> Someone was actively planning to buy a game, but downloads an unauthorized copy instead. <span className="text-rose-400">That is a direct lost sale.</span>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900 border border-white/10">
              <span className="text-cyan-400 font-bold">Scenario C:</span> Someone wants a game not sold in their region. <span className="text-zinc-400">No legal transaction was ever possible.</span>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900 border border-white/10">
              <span className="text-purple-400 font-bold">Scenario D:</span> An abandoned game out of print for 15 years. <span className="text-zinc-400">No commercial channel exists to capture revenue.</span>
            </div>
          </div>

          <p>
            That doesn't make the copying automatically legal. It does expose a weakness in the idea that <strong className="text-white">every pirate download = one lost purchase</strong>.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 04: Regional Exclusion */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Globe size={15} />
              <span>Market Exclusion</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              What happens when the legal market excludes you?
            </h2>
          </div>

          <p>
            Imagine: You live in India. A movie is released in the United States. It doesn't have a legitimate digital release where you live. You want to watch it. You are willing to pay. But there is literally nothing to buy.
          </p>

          <p>
            Then someone says: <span className="italic text-zinc-400">“Just pay for it legally.”</span>
          </p>

          <p className="text-xl font-bold text-amber-300">
            Pay for what?
          </p>

          <p>
            This is why the argument “it's unavailable in my country” keeps appearing in piracy debates. The legal market can technically exist while the <strong className="text-white">legal customer relationship doesn't</strong>.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 05: Preservation */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Archive size={15} />
              <span>Cultural Memory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Then there is the preservation problem
            </h2>
          </div>

          <p>
            What happens when a piece of media disappears? An old game, discontinued software, a film with no modern release, or a title whose authentication servers were terminated.
          </p>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-white/10 my-6 text-center space-y-2">
            <p className="text-lg sm:text-xl font-display font-bold text-purple-300 m-0">
              “Can something be legally unauthorized to copy and still be culturally essential to preserve?”
            </p>
            <p className="text-xs font-mono text-zinc-400 m-0">
              Those aren't necessarily the same question.
            </p>
          </div>

          <p>
            Physical media had a natural advantage: a cartridge or DVD can sit in an attic for decades. But in a digital landscape, when a company turns off the server or lets a license expire, the work vanishes from public history unless archived by third parties.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 06: Protest vs Boycott & Cognitive Dissonance */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Brain size={15} />
              <span>Psychological Tension</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Piracy as protest and cognitive dissonance
            </h2>
          </div>

          <p>
            Some people explicitly frame piracy as resistance or retaliation against anti-consumer practices (aggressive microtransactions, broken launches, intrusive DRM).
          </p>

          <p>
            But this creates an immediate logical tension:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 font-mono text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-zinc-900 border border-emerald-500/30 space-y-1">
              <span className="text-emerald-400 font-bold uppercase block">A Boycott</span>
              <p className="text-zinc-300 font-sans">You refuse to purchase AND refuse to consume.</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900 border border-rose-500/30 space-y-1">
              <span className="text-rose-400 font-bold uppercase block">Piracy as "Protest"</span>
              <p className="text-zinc-300 font-sans">You refuse to pay, but still consume the product.</p>
            </div>
          </div>

          <p>
            And this is where <strong className="text-purple-300">cognitive dissonance</strong> enters.
          </p>

          <p>
            Humans don't like moral contradictions. When someone who values fairness chooses to pirate, they often construct post-hoc justifications:
          </p>

          <div className="p-5 rounded-xl bg-zinc-900/90 border border-white/10 space-y-2 font-mono text-xs text-zinc-300 my-4">
            <div className="text-amber-400 font-bold pb-1 border-b border-white/10">Common Rationalization Loops:</div>
            <div>• “The corporation is billion-dollar, they won't feel it.”</div>
            <div>• “They shouldn't have charged this much for an incomplete game.”</div>
            <div>• “I'm actually doing preservation work.”</div>
            <div>• “The developer doesn't deserve my money because of their DRM.”</div>
          </div>

          <p>
            Some explanations reflect legitimate structural issues, but psychological defense mechanisms frequently blur the line between principle and convenience.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 07: Trial and Conversion */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Gamepad2 size={15} />
              <span>Trial & Conversion</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The unexpected pipeline: pirate → trial → purchase
            </h2>
          </div>

          <p>
            Consumer behavior isn't always binary. Many users describe using piracy as an unofficial demo:
          </p>

          <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 font-mono text-sm text-center flex justify-center items-center gap-3 my-4">
            <span className="text-zinc-400">Download</span>
            <span className="text-amber-400">→</span>
            <span className="text-zinc-400">Test / Play</span>
            <span className="text-amber-400">→</span>
            <span className="text-emerald-400 font-bold">Buy legitimately</span>
          </div>

          <p>
            Cases like users pirating high-profile games and subsequently purchasing full legitimate copies to support developers demonstrate that a pirate is not necessarily a permanent non-customer.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 08: Service Problem & The Spectrum of 1M Downloads */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <SlidersHorizontal size={15} />
              <span>Deconstructing Losses</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Deconstructing the “1 Million Downloads” headline
            </h2>
          </div>

          <p>
            When industry reports announce huge piracy numbers, they often imply a direct 1:1 monetary loss. But when broken down psychologically, a sample of 1,000,000 downloads looks entirely different:
          </p>

          {/* Breakdown tree */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-white/10 font-mono text-xs sm:text-sm space-y-3 my-6">
            <div className="text-amber-400 font-bold uppercase pb-2 border-b border-white/10">
              1,000,000 Unauthorized Downloads Spectrum
            </div>
            
            <div className="space-y-2 text-zinc-300 pt-1">
              <div className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">→</span>
                <span><strong>Pure Displacement:</strong> Users who had money and intended to buy, but took free copies instead.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">→</span>
                <span><strong>Regional Block:</strong> Users willing to pay whose countries lack legal licensing channels.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">→</span>
                <span><strong>Subscription Fatigue:</strong> Users paying for 3+ services who refused an 8th sub for 1 show.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">→</span>
                <span><strong>Preservation:</strong> Obsolete, abandoned, or server-killed media with zero legal sellers.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">→</span>
                <span><strong>Trialists:</strong> Users testing software/games who later buy legitimate licenses.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-zinc-500 font-bold">→</span>
                <span><strong>Zero-Affordability:</strong> Users who would never have had the purchasing power to buy at retail.</span>
              </div>
            </div>
          </div>

          {/* Strategic Conclusion Callout */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-white/10 space-y-4 my-10">
            <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              The Real Takeaway
            </h3>
            <p className="text-xl sm:text-2xl font-display font-black text-purple-300 leading-snug">
              “Piracy is almost always a service problem before it is a pricing problem.”
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              Moral arguments alone cannot resolve unauthorized demand. When the legal ecosystem solves availability, respects ownership, prevents media obsolescence, and reduces administrative friction, the vast majority of consumers naturally gravitate toward legitimate access.
            </p>
          </div>

        </div>

        {/* AdSense In-Article / Bottom Placement */}
        <AdSenseSlot slotId="piracy-psychology-bottom" format="auto" responsive={true} showDisclaimer={true} className="my-12" />

        {/* Sources & Citations */}
        <div className="mt-14 p-6 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <Bookmark size={14} className="text-amber-400" />
            <span>Documented Sources & Public Arguments</span>
          </h3>
          <ul className="space-y-2 text-xs font-mono text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">1.</span>
              <span>Consumer Psychology & Digital Rights Research on Cognitive Dissonance in Copyright Infringement.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">2.</span>
              <span>Public Discourse & Community Synthesis (r/piracy, r/technology, r/games qualitative arguments).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">3.</span>
              <span>Media Preservation and Discontinued Works Empirical Access Analyses.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">4.</span>
              <span>European Union Intellectual Property Office (EUIPO) & Industry Studies on Displacement vs Trial Conversions.</span>
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
export default PiracyPsychologyArticlePage;
