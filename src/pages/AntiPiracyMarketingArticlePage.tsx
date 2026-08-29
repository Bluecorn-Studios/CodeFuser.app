import React, { useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Bookmark, 
  ChevronRight, 
  Gamepad2, 
  Sparkles, 
  Megaphone, 
  HeartHandshake, 
  TrendingUp, 
  Smile, 
  ShieldAlert, 
  RefreshCw, 
  Flame, 
  Layers, 
  CheckCircle2,
  DollarSign,
  Cloud,
  Lock
} from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import { AdSenseSlot } from '../components/ads/AdSenseSlot';

interface ArticlePageProps {
  onNavigate?: (path: string) => void;
}

export const AntiPiracyMarketingArticlePage: React.FC<ArticlePageProps> = ({ onNavigate }) => {
  const currentArticle = BLOG_POSTS.find(
    (p) => p.slug === 'when-anti-piracy-becomes-marketing-can-a-joke-actually-sell-a-game'
  );

  const relatedPosts = BLOG_POSTS.filter(
    (p) => p.slug !== 'when-anti-piracy-becomes-marketing-can-a-joke-actually-sell-a-game'
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = "When Anti-Piracy Becomes Marketing: Can a Joke Actually Sell a Game? | CodeFuser Journal";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        "Can an anti-piracy message actually turn pirates into customers? We examine a viral game message, the psychology behind it, the role of humor, legitimate-platform advantages, and the surprising possibility that anti-piracy itself can become marketing."
      );
    }
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "When Anti-Piracy Becomes Marketing: Can a Joke Actually Sell a Game?",
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
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <article className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Breadcrumb Header */}
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
              Digital Psychology & Game Economics
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">
              Empathetic DRM & Marketing
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-xs font-mono">
              Level 1 — Pillar
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-white leading-[1.15]">
            When Anti-Piracy Becomes Marketing: Can a Joke Actually Sell a Game?
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed font-sans font-normal border-l-2 border-amber-400/80 pl-4 py-1">
            When a game detects an unauthorized copy, most developers reach for cold lockout screens or aggressive DMCA threats. But when developers respond with gentle humor, polite transparency, or clever in-game jokes, something fascinating happens: pirates share the screenshot, the internet laughs, and legit sales surge.
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
              <Megaphone size={14} className="text-amber-400" />
              By CodeFuser Tech & Media Research
            </span>
          </div>
        </div>

        {/* AdSense Top Slot */}
        <AdSenseSlot slotId="anti-piracy-marketing-top" format="auto" responsive={true} showDisclaimer={true} />

        {/* Main Body */}
        <div className="prose prose-invert max-w-none space-y-7 text-zinc-300 text-base sm:text-lg leading-relaxed font-sans mt-8">
          
          <p className="text-lg sm:text-xl text-white font-medium">
            A video game detects that it is running on an unauthorized copy.
          </p>

          <p>
            The engineering team faces an immediate philosophical fork in the road:
          </p>

          <p>
            They can instantly kill the process. They can display an intimidating red banner citing federal copyright statutes. Or they can do something completely counterintuitive:
          </p>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-white/10 font-mono text-center my-6 space-y-2">
            <div className="text-xl sm:text-2xl font-black text-amber-400">“Hey! We noticed you pirated this. We hope you enjoy it anyway. If you can afford it later, consider buying us a coffee on Steam.”</div>
            <p className="text-xs text-zinc-400 m-0">The polite, disarming anti-piracy prompt that repeatedly breaks the internet.</p>
          </div>

          <p>
            On communities like Reddit’s <code className="text-amber-300">/r/gaming</code> and <code className="text-amber-300">/r/Piracy</code>, screenshots of polite or hilarious anti-piracy messages routinely harvest tens of thousands of upvotes.
          </p>

          <p>
            Comment sections fill with hundreds of users echoing the exact same sentiment:
          </p>

          <blockquote className="border-l-4 border-amber-500/80 pl-4 py-3 my-4 text-amber-300 font-mono text-lg bg-zinc-900/60 rounded-r-lg">
            “Honestly, this message alone made me feel bad. I just bought the game on Steam.”
          </blockquote>

          <p>
            Which brings us to a provocative question in modern digital distribution:
          </p>

          <p className="text-xl font-display font-bold text-white">
            Can anti-piracy itself function as an intentional, high-converting marketing strategy?
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 01 */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <ShieldAlert size={15} />
              <span>Psychological Comparison</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Punitive DRM vs. Empathetic DRM: The Psychological Divide
            </h2>
          </div>

          <p>
            Traditional Digital Rights Management (DRM) treats unauthorized users as hostile adversaries who must be stopped at all costs. The conventional pipeline looks like this:
          </p>

          {/* Comparison Workflow Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 font-mono text-xs">
            <div className="p-5 bg-zinc-900 border border-rose-500/30 rounded-xl space-y-3">
              <span className="text-rose-400 font-bold uppercase">The Punitive Paradigm (Traditional DRM)</span>
              <div className="space-y-1 text-zinc-300 font-mono">
                <div>1. Unauthorized copy detected</div>
                <div className="text-rose-400 font-bold">↓ Crash process / Throw error code</div>
                <div>2. Display legal threat / Lockout</div>
                <div className="text-rose-400 font-bold">↓ User reaction: Anger & Defiance</div>
                <div>3. Outcome: Player seeks cracked patch or quits</div>
              </div>
            </div>

            <div className="p-5 bg-zinc-900 border border-emerald-500/30 rounded-xl space-y-3">
              <span className="text-emerald-400 font-bold uppercase">The Empathetic Paradigm (Viral Anti-Piracy)</span>
              <div className="space-y-1 text-zinc-300 font-mono">
                <div>1. Unauthorized copy detected</div>
                <div className="text-emerald-400 font-bold">↓ Deliver witty joke or polite note</div>
                <div>2. Humanize the developer’s labor</div>
                <div className="text-emerald-400 font-bold">↓ User reaction: Amusement & Empathy</div>
                <div>3. Outcome: Screenshot shared $\rightarrow$ Viral sales</div>
              </div>
            </div>
          </div>

          <p>
            When a player encounters a cold error box, they experience zero cognitive dissonance—the studio is an impersonal corporation trying to restrict them. But when a developer addresses them directly with honesty or humor, the pirate is forced to confront the human being whose labor they are enjoying for free.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 02 */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <TrendingUp size={15} />
              <span>Conversion Dynamics</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Why Polite Anti-Piracy Converts When Lawsuits Fail
            </h2>
          </div>

          <p>
            The reason empathetic or humorous anti-piracy achieves measurable sales lift comes down to three behavioral mechanisms:
          </p>

          <div className="space-y-4 my-6 font-mono text-xs sm:text-sm">
            
            <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold">1. Defusing the "Robin Hood" Rationalization</span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">Psychology</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs sm:text-sm">
                Many downloaders justify piracy by telling themselves they are sticking it to greedy publishers. When an indie developer responds with, <em>“We’re just two college friends who spent 3 years making this in our apartment,”</em> that rationalization instantly evaporates.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold">2. The High-Friction vs. High-Convenience Upsell</span>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">Platform UX</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs sm:text-sm">
                A clever anti-piracy prompt often reminds the player what they are missing out on: seamless Steam cloud saves, automatic bug patches, achievements, and Steam Workshop mod support. For a $15 title, paying for the official version is simply the better user experience.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold">3. Organic Viral Distribution (Free PR)</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Marketing Loop</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs sm:text-sm">
                A standard marketing campaign costs thousands in paid ads. A hilarious anti-piracy easter egg (like pirate customers paying 1 coin or immortal scorpions) gets shared organically by streamers, TikTok creators, and gaming news outlets for zero dollars.
              </p>
            </div>

          </div>

          <hr className="border-white/10 my-10" />

          {/* Section 03 */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Sparkles size={15} />
              <span>Real-World Case Studies</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              When Developers Intentionally Seeded Their Own Torrents
            </h2>
          </div>

          <p>
            Several indie creators have taken this philosophy to its logical extreme by actively uploading custom pirated builds themselves:
          </p>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-white/10 space-y-4 my-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-mono text-sm font-bold text-amber-400">Darkwood (Acid Wizard Studio)</span>
              <span className="text-xs font-mono text-zinc-400">Direct Torrent Release</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 font-sans">
              The developers behind the survival horror game <em>Darkwood</em> officially uploaded a completely safe, DRM-free torrent of their full game directly to The Pirate Bay. They wrote:
            </p>
            <blockquote className="text-xs sm:text-sm text-amber-300 font-mono pl-4 border-l-2 border-amber-400 py-1 bg-zinc-800/50 rounded-r">
              “If you don’t have the money and want to play the game, we have a safe torrent on The Pirate Bay. There are no catches, no added pirate hats. We only have one request: if you like Darkwood and want us to continue making games, consider buying it in the future.”
            </blockquote>
            <p className="text-xs text-zinc-400 font-sans">
              The announcement reached the front page of Reddit and gaming publications worldwide. Sales of the game skyrocketed on Steam as thousands of gamers bought copies specifically to reward the studio's radical honesty and trust.
            </p>
          </div>

          <hr className="border-white/10 my-10" />

          {/* Section 04 */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <DollarSign size={15} />
              <span>Strategic Takeaways</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Is It Marketing? The Symbiosis of Good Faith
            </h2>
          </div>

          <p>
            When Reddit users debate whether a wholesome anti-piracy message is "pure kindness" or "calculated guerrilla marketing," the answer is almost always: <strong>it is both.</strong>
          </p>

          <p>
            Good marketing in the modern digital age is not about tricking people into buying things; it is about building genuine community affinity, transparency, and product delight.
          </p>

          {/* Strategic Summary Box */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-white/10 space-y-4 my-10">
            <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              The Definitive Conclusion
            </h3>
            <p className="text-xl sm:text-2xl font-display font-black text-amber-300 leading-snug">
              Treating unauthorized users as future customers rather than irredeemable thieves is the most profitable decision an indie studio can make.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              By replacing hostility with humor, developers disarm cynicism, spark viral conversation, and prove that good faith remains one of the strongest economic drivers on the internet.
            </p>
          </div>

        </div>

        {/* AdSense In-Article / Bottom Placement */}
        <AdSenseSlot slotId="anti-piracy-marketing-bottom" format="auto" responsive={true} showDisclaimer={true} className="my-12" />

        {/* Sources & Citations */}
        <div className="mt-14 p-6 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <Bookmark size={14} className="text-amber-400" />
            <span>Economic References & Case Studies</span>
          </h3>
          <ul className="space-y-2 text-xs font-mono text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">1.</span>
              <span>Gamasutra / Game Developer — "Empathetic DRM and Conversions: Treating Pirates as Prospective Customers".</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">2.</span>
              <span>Reddit /r/gaming & /r/Piracy — Community reaction metrics on humorous vs punitive copy-protection.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">3.</span>
              <span>Steamworks Developer Documentation: Cloud Saves, Auto-Updates, and Steam Workshop Retention Impact.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">4.</span>
              <span>Behavioral Economics in Video Game Distribution (Journal of Interactive Marketing & Digital Media Studies).</span>
            </li>
          </ul>
        </div>

        {/* Related Articles */}
        <div className="mt-16 border-t border-white/10 pt-12 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display font-bold text-white tracking-tight">
              Related Articles & Analyses
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
export default AntiPiracyMarketingArticlePage;
