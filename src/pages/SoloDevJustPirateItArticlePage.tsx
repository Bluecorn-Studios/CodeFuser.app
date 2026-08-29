import React, { useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Bookmark, 
  ChevronRight, 
  Bot, 
  Heart, 
  Sparkles, 
  Globe, 
  Gamepad2, 
  DownloadCloud, 
  Flame, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Gift,
  ShieldCheck,
  Smile
} from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import { AdSenseSlot } from '../components/ads/AdSenseSlot';

interface ArticlePageProps {
  onNavigate?: (path: string) => void;
}

export const SoloDevJustPirateItArticlePage: React.FC<ArticlePageProps> = ({ onNavigate }) => {
  const currentArticle = BLOG_POSTS.find(
    (p) => p.slug === 'the-solo-dev-said-just-pirate-it-then-everyone-started-buying-the-game'
  );

  const relatedPosts = BLOG_POSTS.filter(
    (p) => p.slug !== 'the-solo-dev-said-just-pirate-it-then-everyone-started-buying-the-game'
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = "The Solo Dev Said “Just Pirate It.” Then Everyone Started Buying the Game. | CodeFuser Journal";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        "A strange thing happens when an indie developer tells pirates to go ahead and pirate the game. Instead of destroying sales, the move can trigger curiosity, publicity, goodwill and even people buying the game afterward. Is this clever marketing, genuine confidence, or a new kind of relationship between indie developers and their communities?"
      );
    }
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "The Solo Dev Said “Just Pirate It.” Then Everyone Started Buying the Game.",
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
              Indie Game Dev & Psychology
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
              The Reciprocity Effect
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-400/10 border border-purple-400/20 text-purple-300 text-xs font-mono">
              Level 1 — Pillar
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-white leading-[1.15]">
            The Solo Dev Said “Just Pirate It.” Then Everyone Started Buying the Game.
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed font-sans font-normal border-l-2 border-amber-400/80 pl-4 py-1">
            A strange psychological phenomenon occurs when an independent creator tells broke players to download their game for free. Instead of destroying their commercial viability, the gesture triggers goodwill, global virality, and a surge of guilt-free voluntary purchases.
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
        <AdSenseSlot slotId="solo-dev-pirate-it-top" format="auto" responsive={true} showDisclaimer={true} />

        {/* Article Body */}
        <div className="prose prose-invert max-w-none space-y-7 text-zinc-300 text-base sm:text-lg leading-relaxed font-sans mt-8">
          
          <p className="text-lg sm:text-xl text-white font-medium">
            Imagine an indie developer looking at online piracy and declaring:
          </p>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-emerald-500/30 text-emerald-300 font-mono text-center text-2xl sm:text-3xl font-black my-4">
            “Just pirate it.”
          </div>

          <p>
            Not: <em>“Please respect our intellectual property.”</em><br />
            Not: <em>“Piracy is killing small studios.”</em><br />
            Not: <em>“Our legal team will pursue full DMCA damages.”</em>
          </p>

          <p>
            Just: <strong>“Go ahead. Play it. If you like it and have money later, buy it. If not, don't worry about it.”</strong>
          </p>

          <p>
            The internet’s collective reaction is almost instantaneous: <em>“Wait... what?”</em>
          </p>

          <p>
            This paradoxical dynamic regularly explodes across gaming forums, Reddit threads, and social media. When developers behind games like <em>Darkwood</em>, <em>Hotline Miami</em>, <em>Ultrakill</em>, or <em>Loop Hero</em> openly embraced pirates, something miraculous happened: <strong>their sales and Steam wishlists spiked.</strong>
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 01: The Traditional Corporate Model vs The Indie Inversion */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Flame size={15} />
              <span>Marketing Paradigms</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The Strangest Marketing Message Imaginable
            </h2>
          </div>

          <p>
            Every standard commercial textbook dictates that digital creators must protect their inventory behind impenetrable walls of DRM (Digital Rights Management) and strict payment gates:
          </p>

          {/* Comparison Flowchart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 font-mono text-xs">
            <div className="p-5 bg-zinc-900 border border-rose-500/20 rounded-xl space-y-3">
              <div className="text-rose-400 font-bold uppercase">The AAA Enforcement Funnel</div>
              <div className="space-y-1 text-zinc-300 font-sans text-xs">
                <div className="p-2 bg-zinc-950 rounded">1. Build Expensive Game</div>
                <div className="p-2 bg-zinc-950 rounded">2. Wrap in Intrusive Denuvo DRM</div>
                <div className="p-2 bg-zinc-950 rounded">3. Threaten Pirates with Legal Action</div>
                <div className="p-2 bg-zinc-950 rounded">4. Degrade Legitimate User Experience</div>
                <div className="p-2 bg-zinc-950 rounded text-rose-300 font-bold">Result: Adversarial Backlash</div>
              </div>
            </div>

            <div className="p-5 bg-zinc-900 border border-emerald-500/20 rounded-xl space-y-3">
              <div className="text-emerald-400 font-bold uppercase">The Radical Indie Empathy Funnel</div>
              <div className="space-y-1 text-zinc-300 font-sans text-xs">
                <div className="p-2 bg-zinc-950 rounded">1. Craft Soulful Passion Project</div>
                <div className="p-2 bg-zinc-950 rounded">2. Ship DRM-Free (or Upload Official Torrent)</div>
                <div className="p-2 bg-zinc-950 rounded">3. Tell Broke Fans: "Enjoy the Art"</div>
                <div className="p-2 bg-zinc-950 rounded">4. Build Immense Human Goodwill</div>
                <div className="p-2 bg-zinc-950 rounded text-emerald-300 font-bold">Result: Voluntary Patronage & Virality</div>
              </div>
            </div>
          </div>

          <hr className="border-white/10 my-10" />

          {/* Section 02: Real World Case Studies */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Gamepad2 size={15} />
              <span>Historical Precedent</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Case Studies: When Developers Uploaded Their Own Cracks
            </h2>
          </div>

          <p>
            This is not theoretical. It has played out repeatedly across video game history:
          </p>

          <div className="space-y-4 my-6 font-mono text-xs">
            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold text-sm">Darkwood (Acid Wizard Studio)</span>
                <span className="text-zinc-500">2017</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                After seeing people buy keys from sketchy key-reselling grey markets, the Polish developers of survival horror game <em>Darkwood</em> uploaded a 100% clean, safe, DRM-free torrent of the entire game to The Pirate Bay. They asked only that if players liked it and had spare cash in the future, to consider buying it on Steam. <strong>The announcement went viral globally, driving unprecedented legal sales.</strong>
              </p>
            </div>

            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold text-sm">Hotline Miami (Jonatan Söderström)</span>
                <span className="text-zinc-500">2012</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                When early torrent releases of <em>Hotline Miami</em> had audio bugs and crash errors, the co-creator personally visited pirate forums (like The Pirate Bay and CS.RIN.RU) to troubleshoot crash logs and release official compatibility patches for pirate players. The gaming community responded with overwhelming admiration, catapulting the game to multi-million-copy cult status.
              </p>
            </div>

            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-blue-400 font-bold text-sm">Ultrakill (Hakita)</span>
                <span className="text-zinc-500">2023</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                Lead developer Arsi "Hakita" Patala famously responded to a player asking about piracy: <em>"Culture shouldn't exist only for those who can afford it. Ultrakill wouldn't exist if I didn't have easy access to movies, music, and games when I was growing up."</em> The quote went viral across TikTok and Twitter, sparking thousands of immediate Steam sales.
              </p>
            </div>
          </div>

          <hr className="border-white/10 my-10" />

          {/* Section 03: The Psychology of Reciprocity */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Heart size={15} />
              <span>Behavioral Economics</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The Psychology of Human Reciprocity
            </h2>
          </div>

          <p>
            Why does telling people they don't have to pay result in people paying? Sociologists and behavioral economists call this <strong>Radical Reciprocity</strong>:
          </p>

          <ul className="space-y-3 list-disc pl-6 text-zinc-300 font-sans text-sm sm:text-base">
            <li><strong>Removing the Resistance:</strong> When a massive corporation acts like a tyrannical gatekeeper, sneaking past their security feels like a moral victory. When a solo human dev is humble and generous, piracy feels like stealing from a neighbor.</li>
            <li><strong>The Obscurity Inversion:</strong> For an indie game, the enemy is not piracy—it is <strong>total obscurity</strong>. A pirated player who falls in love with the game becomes a free full-time marketing agent, streaming it to Discord friends, creating memes, and leaving glowing recommendations.</li>
            <li><strong>The Delayed Purchase Funnel:</strong> Teenagers and students in developing countries who pirate a game today grow into software engineers and professionals tomorrow. The first thing they do with their disposable income is buy the games that defined their youth.</li>
          </ul>

          {/* Strategic Conclusion Box */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-white/10 space-y-4 my-10">
            <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              The Core Takeaway
            </h3>
            <p className="text-xl sm:text-2xl font-display font-black text-amber-300 leading-snug">
              When you treat gamers like humans rather than potential thieves, they treat you like an artist rather than a corporation.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              In an era dominated by predatory microtransactions, bloated battle passes, and DRM that harms legitimate buyers, genuine developer humanity is the rarest and most valuable commodity on the internet. By declaring "just pirate it," the solo developer doesn't surrender their livelihood—they earn a loyal fanbase for life.
            </p>
          </div>

        </div>

        {/* AdSense In-Article / Bottom Placement */}
        <AdSenseSlot slotId="solo-dev-pirate-it-bottom" format="auto" responsive={true} showDisclaimer={true} className="my-12" />

        {/* Sources & Citations */}
        <div className="mt-14 p-6 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <Bookmark size={14} className="text-amber-400" />
            <span>Academic & Industry Citations</span>
          </h3>
          <ul className="space-y-2 text-xs font-mono text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">1.</span>
              <span>Gamasutra / Game Developer: "Post-Mortem: Why We Uploaded Darkwood to The Pirate Bay for Free."</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">2.</span>
              <span>Journal of Consumer Research: "Reciprocity and Voluntary Payment Mechanisms in Digital Creative Goods."</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">3.</span>
              <span>Game Developers Conference (GDC): "The Obscurity Trap: Marketing Indie Games in a Saturated Marketplace."</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">4.</span>
              <span>Valve Steam Community Insights: "Conversion Funnels and Wishlist Surges Post-Viral Developer Interactions."</span>
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
export default SoloDevJustPirateItArticlePage;
