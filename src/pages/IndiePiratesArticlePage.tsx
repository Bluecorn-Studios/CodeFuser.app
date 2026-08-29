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
  Coins, 
  Skull, 
  Music, 
  Laugh, 
  TrendingUp, 
  ShieldCheck, 
  Heart, 
  Flame,
  CheckCircle2,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import { AdSenseSlot } from '../components/ads/AdSenseSlot';

interface ArticlePageProps {
  onNavigate?: (path: string) => void;
}

export const IndiePiratesArticlePage: React.FC<ArticlePageProps> = ({ onNavigate }) => {
  const currentArticle = BLOG_POSTS.find(
    (p) => p.slug === 'he-couldnt-stop-pirates-so-he-made-them-part-of-the-game'
  );

  const relatedPosts = BLOG_POSTS.filter(
    (p) => p.slug !== 'he-couldnt-stop-pirates-so-he-made-them-part-of-the-game'
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = "He Couldn't Stop Pirates — So He Made Them Part of the Game | CodeFuser Journal";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        "One indie developer couldn't realistically stop piracy, so he turned pirates into part of the game's experience. Then something unexpected happened: the joke spread, and sales exploded."
      );
    }
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "He Couldn't Stop Pirates — So He Made Them Part of the Game",
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Article URL copied to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-amber-400/20 selection:text-amber-200">
      {/* Ambient background lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 right-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
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

        {/* Title and Metadata */}
        <div className="space-y-4 mb-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-medium tracking-wide">
              Game Design & Creative Anti-Piracy
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              Indie Dev Case Study
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">
              Viral Dynamics
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-white leading-[1.15]">
            He Couldn't Stop Pirates — So He Made Them Part of the Game
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed font-sans font-normal border-l-2 border-amber-400/80 pl-4 py-1">
            One indie developer couldn't realistically stop piracy on his burger restaurant simulator, so he turned pirates into an in-game mechanic. Then something unexpected happened: the joke spread across the internet, and legit sales exploded.
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
              <Gamepad2 size={14} className="text-amber-400" />
              By CodeFuser Tech & Media Research
            </span>
          </div>
        </div>

        {/* AdSense Top Slot */}
        <AdSenseSlot slotId="indie-pirates-top" format="auto" responsive={true} showDisclaimer={true} />

        {/* Body Content */}
        <div className="prose prose-invert max-w-none space-y-7 text-zinc-300 text-base sm:text-lg leading-relaxed font-sans mt-8">
          
          <p className="text-lg sm:text-xl text-white font-medium">
            Most indie game developers share the exact same recurring nightmare.
          </p>

          <p>
            You spend months—or often grueling years—programming, animating, playtesting, and polishing a passion project all by yourself. You finally launch it on Steam or itch.io.
          </p>

          <p>
            And within six hours, an unauthorized cracked build is uploaded to file-sharing forums.
          </p>

          <p>
            For a billion-dollar AAA publisher with dedicated anti-tamper budgets and Denuvo subscriptions, digital piracy is already an uphill battle. For a solo developer operating out of a bedroom with zero legal budget? It can feel completely devastating.
          </p>

          <p>
            One indie developer decided not to fight a war he already knew he couldn't win. Instead, he engineered something far more clever:
          </p>

          <blockquote className="border-l-4 border-amber-500/80 pl-4 py-3 my-4 text-amber-300 font-mono text-lg bg-zinc-900/60 rounded-r-lg">
            He made piracy a literal gameplay mechanic.
          </blockquote>

          <p>
            And then the strange part happened: the joke went viral, generating waves of mainstream gaming press and social media shares that ended up propelling legitimate sales through the roof.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 01 */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Gamepad2 size={15} />
              <span>The Core Philosophy</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Accepting Reality: "Don't Make It Impossible. Make It Interesting."
            </h2>
          </div>

          <p>
            The developer behind a cozy idle-management game about running a burger bistro faced a stark realization during early development:
          </p>

          <p>
            If multi-million dollar DRM suites are cracked within days (or hours), a lone developer's custom authentication check will be bypassed almost immediately. Invasive anti-tamper measures also notoriously degrade frame rates, alienate paying customers, and require expensive server upkeep.
          </p>

          <p>
            So instead of constructing a fortress, he asked a radical design question:
          </p>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-white/10 font-mono text-center my-6 space-y-2">
            <div className="text-xl sm:text-2xl font-black text-amber-400">“What if the game acknowledges it was pirated in the funniest way possible?”</div>
            <p className="text-xs text-zinc-400 m-0">Rather than refusing to launch, let the player continue—with customized chaos.</p>
          </div>

          <hr className="border-white/10 my-10" />

          {/* Section 02 */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Skull size={15} />
              <span>The Trap Activates</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The Pirates Became the Customers
            </h2>
          </div>

          <p>
            Under normal circumstances, the game tasks players with grilling patties, preparing milkshakes, satisfying restaurant patrons, and reinvesting profits into kitchen upgrades.
          </p>

          <p>
            When the game’s subtle background integrity check identified that the copy was running without valid platform ownership, it didn't throw an error code or crash to desktop.
          </p>

          <p>
            For the first hour of gameplay, everything ran flawlessly. The player got invested. They expanded their dining room and learned the basic recipes.
          </p>

          <p>
            Then, the pirate event triggered:
          </p>

          {/* Feature Grid of the In-Game Trolling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 font-mono text-xs">
            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Skull size={16} />
                <span>Pirate Cosplay Patrons</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs">
                Every single regular customer was replaced by characters wearing tricorn hats, eye patches, and peg legs.
              </p>
            </div>

            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Coins size={16} />
                <span>The One-Coin Payment</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs">
                Regardless of how complex or expensive the custom triple-bacon burger was, pirate customers stubbornly paid exactly 1 single coin.
              </p>
            </div>

            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Music size={16} />
                <span>Unmutable Accordion Sea Shanties</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs">
                The soothing background lo-fi music transformed into a boisterous accordion sea shanty. The in-game volume slider allowed turning it down, but never to zero.
              </p>
            </div>

            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <MessageSquare size={16} />
                <span>Hilarious In-Game Yelp Reviews</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs">
                Patrons left dialogue bubbles and restaurant reviews like <em>“Pirates don’t leave tips”</em> and <em>“The pirate code forbids paying full price.”</em>
              </p>
            </div>
          </div>

          <p>
            Because progressing in the game requires substantial capital to unlock advanced kitchen equipment and ingredients, the one-coin restriction caused the player's economic progression to crawl to a near-complete standstill.
          </p>

          <p>
            The developer didn't say <strong className="text-white">“You are a criminal.”</strong> He said: <strong className="text-amber-300">“Fine, you can run a pirate burger shack. Good luck making rent.”</strong>
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 03 */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Sparkles size={15} />
              <span>A Rich Gaming Tradition</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The Legacy of Interactive Anti-Piracy Trolling
            </h2>
          </div>

          <p>
            This burger simulation is part of a storied, beloved tradition of game designers using irony rather than encryption to confront unauthorized players:
          </p>

          <div className="space-y-4 my-6 font-mono text-xs sm:text-sm">
            
            <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold">Game Dev Tycoon (Greenheart Games, 2013)</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">The Classic</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs sm:text-sm">
                The developers intentionally leaked a cracked version to torrent trackers themselves. In this pirated build, as players built their virtual game studio and released hit titles, their in-game games were heavily pirated, driving their virtual studio into unavoidable bankruptcy. Confused pirates went to forums asking: <em>"Why are all my games getting stolen? Can I research DRM?"</em>
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold">Serious Sam 3: BFE (Croteam, 2011)</span>
                <span className="text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono">The Immortal Scorpion</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs sm:text-sm">
                In pirated copies, an invincible, ultra-fast bright pink giant scorpion spawned in the very first level, relentlessly hunting the player down with dual miniguns until they died.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold">EarthBound (Nintendo / Ape Inc., 1994)</span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">The Cruelest Trap</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs sm:text-sm">
                If the SNES cartridge detected it was a bootleg ROM, it flooded the world with impossible monster encounter rates. If the player somehow persevered all the way to the final boss battle against Giygas, the game abruptly froze and deleted all save files.
              </p>
            </div>

          </div>

          <hr className="border-white/10 my-10" />

          {/* Section 04 */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <TrendingUp size={15} />
              <span>Economics & Conversion</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Why Humor Converts Pirates Into Paying Customers
            </h2>
          </div>

          <p>
            When an anti-piracy measure is cold, aggressive, or punishing, it often provokes defiance: crackers treat breaking the DRM as a competitive sport, and users feel justified in avoiding payment.
          </p>

          <p>
            When an anti-piracy measure is self-aware and genuinely funny, the psychology flips entirely:
          </p>

          {/* Psychology comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 font-mono text-xs">
            <div className="p-5 bg-zinc-900/60 border border-rose-500/30 rounded-xl space-y-2">
              <span className="text-rose-400 font-bold uppercase">Aggressive DRM (Crash / Lockout)</span>
              <ul className="text-zinc-400 font-sans text-xs space-y-1.5 list-disc pl-4">
                <li>Player feels insulted or annoyed.</li>
                <li>Looks for a crack fix or bypass patch.</li>
                <li>Zero positive viral discussion.</li>
                <li>Negative reviews regarding CPU bloat.</li>
              </ul>
            </div>

            <div className="p-5 bg-zinc-900/60 border border-emerald-500/30 rounded-xl space-y-2">
              <span className="text-emerald-400 font-bold uppercase">Creative In-Game Trolling</span>
              <ul className="text-zinc-300 font-sans text-xs space-y-1.5 list-disc pl-4">
                <li>Player laughs and screenshots the scene.</li>
                <li>Posts to Reddit, TikTok, and YouTube.</li>
                <li>Gaming outlets write free feature articles.</li>
                <li>Community respects the developer and buys the game on Steam.</li>
              </ul>
            </div>
          </div>

          <p>
            In the case of this burger sim, clips of the accordion-blasting pirate customers flooded social feeds. Players who had downloaded the unauthorized build admitted they felt caught red-handed in the most delightful way possible—and promptly bought legitimate copies on Steam to support the dev and actually beat the campaign.
          </p>

          {/* Strategic Conclusion Callout */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-white/10 space-y-4 my-10">
            <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              The Indie Takeaway
            </h3>
            <p className="text-xl sm:text-2xl font-display font-black text-amber-300 leading-snug">
              You cannot stop digital copying with code, but you can disarm it with personality.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              For indie creators operating without legal departments or enterprise budgets, goodwill and storytelling remain the most potent marketing assets in existence. By turning an uncomfortable reality into an unforgettable punchline, one developer proved that even pirates appreciate good game design.
            </p>
          </div>

        </div>

        {/* AdSense In-Article / Bottom Placement */}
        <AdSenseSlot slotId="indie-pirates-bottom" format="auto" responsive={true} showDisclaimer={true} className="my-12" />

        {/* Sources & Citations */}
        <div className="mt-14 p-6 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <Bookmark size={14} className="text-amber-400" />
            <span>Case Study References & Developer Talks</span>
          </h3>
          <ul className="space-y-2 text-xs font-mono text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">1.</span>
              <span>Greenheart Games — "What happens when pirates steal your game about game development" Case Study.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">2.</span>
              <span>Indie Game Developer Post-Mortems & Anti-Piracy Mechanics (Game Dev Tycoon, Serious Sam 3, EarthBound).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">3.</span>
              <span>Steam Community Hub & Reddit IndieGaming Viral Dynamics Analysis.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">4.</span>
              <span>GDC Talk: Creative Anti-Piracy, DRM Alternatives, and Player Psychology in Indie Publishing.</span>
            </li>
          </ul>
        </div>

        {/* Related Research Articles */}
        <div className="mt-16 border-t border-white/10 pt-12 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display font-bold text-white tracking-tight">
              Related Articles & Case Studies
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
export default IndiePiratesArticlePage;
