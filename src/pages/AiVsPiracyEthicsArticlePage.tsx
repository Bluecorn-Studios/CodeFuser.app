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
  DollarSign, 
  Cpu, 
  Flame, 
  EyeOff, 
  Split, 
  Building2, 
  User, 
  CheckCircle2, 
  XCircle,
  BarChart3
} from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import { AdSenseSlot } from '../components/ads/AdSenseSlot';

interface ArticlePageProps {
  onNavigate?: (path: string) => void;
}

export const AiVsPiracyEthicsArticlePage: React.FC<ArticlePageProps> = ({ onNavigate }) => {
  const currentArticle = BLOG_POSTS.find(
    (p) => p.slug === 'you-hate-ai-for-taking-content-what-about-piracy'
  );

  const relatedPosts = BLOG_POSTS.filter(
    (p) => p.slug !== 'you-hate-ai-for-taking-content-what-about-piracy'
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = "You Hate AI for Taking Content. What About Piracy? | CodeFuser Journal";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        "Why do people condemn AI for using creators' work while defending piracy and ad blockers? A deep look at the moral rules people apply to AI, copyright, creators, corporations, advertising, automation and consumer freedom."
      );
    }
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "You Hate AI for Taking Content. What About Piracy?",
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
              Digital Ethics & Copyright Philosophy
            </span>
            <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
              The Moral Asymmetry Debate
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-xs font-mono">
              Level 1 — Pillar
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-white leading-[1.15]">
            You Hate AI for Taking Content. What About Piracy?
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed font-sans font-normal border-l-2 border-amber-400/80 pl-4 py-1">
            Why do internet communities fiercely condemn AI companies for harvesting artists' work without permission, while simultaneously normalizing piracy, torrenting, and ad blockers? A deep examination of the implicit moral rules governing copyright, corporations, scale, and consumer autonomy.
          </p>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm font-mono text-zinc-400 pt-2 border-b border-white/10 pb-6">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-amber-400" />
              August 28, 2026
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-amber-400" />
              12 min read
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Bot size={14} className="text-amber-400" />
              By CodeFuser Tech & Media Research
            </span>
          </div>
        </div>

        {/* AdSense Top Placement */}
        <AdSenseSlot slotId="ai-vs-piracy-top" format="auto" responsive={true} showDisclaimer={true} />

        {/* Article Body */}
        <div className="prose prose-invert max-w-none space-y-7 text-zinc-300 text-base sm:text-lg leading-relaxed font-sans mt-8">
          
          <p className="text-lg sm:text-xl text-white font-medium">
            There is a fascinating and often contradictory argument unfolding across internet culture today.
          </p>

          <p>
            When generative AI models are discussed in creative communities, the consensus is fiery and unambiguous:
          </p>

          <div className="p-4 rounded-xl bg-zinc-900 border border-rose-500/30 font-mono text-rose-300 text-sm my-4 space-y-1">
            <div>“AI companies are stealing from living artists.”</div>
            <div>“Training models on copyrighted works without explicit consent is intellectual theft.”</div>
            <div>“It devalues human labour and destroys creative professions.”</div>
          </div>

          <p>
            Yet if you navigate two subreddits over into gaming or tech discussion boards, the conversation abruptly pivots:
          </p>

          <div className="p-4 rounded-xl bg-zinc-900 border border-emerald-500/30 font-mono text-emerald-300 text-sm my-4 space-y-1">
            <div>“Piracy isn't theft because a digital copy deprives nobody of a physical object.”</div>
            <div>“If pricing is unreasonable, pirating is a legitimate service correction.”</div>
            <div>“Ad blockers are basic digital self-defense—nobody is entitled to my attention or bandwidth.”</div>
          </div>

          <p>
            Then, when an independent developer uses an AI-generated background texture in a game, the backlash returns with full force: <em>“Boycott this game—support real human artists!”</em>
          </p>

          <p className="text-xl font-display font-bold text-white">
            Why does the moral calculus of unauthorized digital copying flip so dramatically depending on who is doing the copying, what tool they use, and who stands to profit?
          </p>

          <p>
            The lazy answer is: <em>“People are just hypocrites.”</em> But a closer philosophical analysis reveals that human moral intuitions around digital media are not based on legal copyright at all. They are organized around three unwritten principles: <strong>power asymmetry, consumer autonomy, and economic displacement.</strong>
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 01: Three Distinct Behaviors */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Split size={15} />
              <span>Categorical Distinction</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              First: Piracy, Ad Blocking, and AI Training Are Not Identical
            </h2>
          </div>

          <p>
            Before exploring why people rationalize these behaviors differently, we must acknowledge that they represent fundamentally different technical and legal mechanisms:
          </p>

          {/* Tri-fold Comparative Table */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6 font-mono text-xs">
            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="text-amber-400 font-bold uppercase flex items-center gap-1.5">
                <span>1. Media Piracy</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs">
                <strong>Mechanism:</strong> Unauthorized bit-for-bit duplication of a finished work for direct human consumption.
              </p>
              <div className="text-zinc-400 font-mono text-xs pt-1 border-t border-white/5">
                Output: 1:1 identical reproduction.
              </div>
            </div>

            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="text-amber-400 font-bold uppercase flex items-center gap-1.5">
                <span>2. Ad Blocking</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs">
                <strong>Mechanism:</strong> Client-side filtering of unsolicited network requests, tracking scripts, and display scripts.
              </p>
              <div className="text-zinc-400 font-mono text-xs pt-1 border-t border-white/5">
                Output: Suppresses intrusive telemetry.
              </div>
            </div>

            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="text-amber-400 font-bold uppercase flex items-center gap-1.5">
                <span>3. AI Model Training</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs">
                <strong>Mechanism:</strong> Ingesting billions of works to extract statistical weights and pattern relationships.
              </p>
              <div className="text-zinc-400 font-mono text-xs pt-1 border-t border-white/5">
                Output: Infinite synthetic generative capacity.
              </div>
            </div>
          </div>

          <p>
            The fact that these mechanisms differ technically does not automatically resolve the ethical question. The real friction lies in whether the <strong>underlying moral justifications</strong> people use for one can be consistently applied to the others.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 02: The Power Asymmetry Engine */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Building2 size={15} />
              <span>Moral Frameworks</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              “They’re a Corporation” Does Enormous Moral Work
            </h2>
          </div>

          <p>
            The single most powerful variable determining online moral approval is not the <em>act of copying</em>, but the <em>direction of power</em>:
          </p>

          {/* Vector Diagram */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 font-mono text-xs">
            <div className="p-5 bg-zinc-900 border border-emerald-500/20 rounded-xl space-y-3">
              <div className="text-emerald-400 font-bold uppercase flex items-center gap-2">
                <User size={16} /> Individual User → Multi-Billion Dollar Conglomerate
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                When an individual pirates a game from EA or streams a movie from Disney, public moral intuition views the act as practically harmless: <em>“A trillion-dollar monopoly won’t notice $60.”</em> The power dynamic frames the user as an underdog resisting corporate rent-seeking.
              </p>
            </div>

            <div className="p-5 bg-zinc-900 border border-rose-500/20 rounded-xl space-y-3">
              <div className="text-rose-400 font-bold uppercase flex items-center gap-2">
                <Building2 size={16} /> Multi-Billion AI Lab → Individual Human Creators
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                When a venture-backed AI enterprise scrapes ArtStation, DeviantArt, or independent GitHub repos without compensation to train models that compete with those very creators, the dynamic reverses: <em>“The powerful conglomerate is harvesting the labor of the vulnerable individual.”</em>
              </p>
            </div>
          </div>

          <p>
            In deontological ethics (where rules are absolute), taking without permission is either always wrong or always permissible. But in everyday internet culture, morality is overwhelmingly <strong>consequentialist and relational</strong>: harm is measured by who has leverage and who bears the economic downside.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 03: Consumption vs Replacement */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Cpu size={15} />
              <span>The Scale Paradox</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Personal Consumption vs. Industrial-Scale Replacement
            </h2>
          </div>

          <p>
            Here lies the critical fault line between piracy and AI training: <strong>the nature of the end result.</strong>
          </p>

          <p>
            When a person downloads an unauthorized copy of a video game or an album, they consume it as an end-user. They listen to the tracks, beat the boss battle, and talk about it with friends. That pirate is not using the downloaded code to construct an automated game-generating engine that permanently puts the studio out of business.
          </p>

          <p>
            Generative AI does something fundamentally different:
          </p>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-amber-500/20 space-y-3 my-6 font-mono text-xs sm:text-sm">
            <div className="text-amber-400 font-bold uppercase">The Industrial Synthesis Pipeline:</div>
            <div className="space-y-2 text-zinc-300 font-sans">
              <div>1. Ingest millions of illustrations by living freelance illustrators.</div>
              <div>2. Abstract their stylistic signatures and composition techniques into latent math vectors.</div>
              <div>3. Sell an API to corporations that replaces the need to ever hire those freelance illustrators again.</div>
            </div>
          </div>

          <p>
            This explains why artists who might privately tolerate casual piracy become infuriated by AI scraping: <strong>Piracy is unauthorized consumption; AI training is automated industrial substitution.</strong>
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 04: The Ad Blocker Dilemma */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <EyeOff size={15} />
              <span>The Consent Landscape</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Where Ad Blockers Fit Into the Moral Web
            </h2>
          </div>

          <p>
            Ad blocking introduces another layer of nuance. Opponents argue that blocking ads violates the implicit social contract of the ad-supported web: <em>“You get free content in exchange for viewing ads.”</em>
          </p>

          <p>
            Yet tech communities overwhelmingly defend ad blockers as an essential tool for:
          </p>

          <ul className="space-y-1 list-disc pl-6 text-sm text-zinc-300 font-sans">
            <li><strong>Security:</strong> Defending against malvertising, tracking beacons, and cross-site telemetry.</li>
            <li><strong>Bandwidth & Battery:</strong> Refusing to let third-party JavaScript hijack client hardware.</li>
            <li><strong>Cognitive Autonomy:</strong> Controlling what appears on one's own display hardware.</li>
          </ul>

          <p>
            When AI crawlers scrape the web, they argue a similar form of computational autonomy: <em>“If content is publicly accessible over HTTP without a paywall, any user agent (human browser or scraping bot) has the right to read the bits.”</em>
          </p>

          {/* Strategic Conclusion Box */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-white/10 space-y-4 my-10">
            <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              The Synthesis
            </h3>
            <p className="text-xl sm:text-2xl font-display font-black text-amber-300 leading-snug">
              Morality in the digital age is not about copyright law—it is about labor protection.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              The apparent contradiction between condemning AI scraping while condoning piracy dissolves once you understand the underlying human instinct: society intuitively defends the autonomy and livelihood of individual creators against centralized capital. Piracy feels like an evasion of corporate tollbooths; AI training feels like an expropriation of human creativity to build tools that render that very creativity economically obsolete.
            </p>
          </div>

        </div>

        {/* AdSense In-Article / Bottom Placement */}
        <AdSenseSlot slotId="ai-vs-piracy-bottom" format="auto" responsive={true} showDisclaimer={true} className="my-12" />

        {/* Sources & Citations */}
        <div className="mt-14 p-6 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <Bookmark size={14} className="text-amber-400" />
            <span>Academic & Legal Sources</span>
          </h3>
          <ul className="space-y-2 text-xs font-mono text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">1.</span>
              <span>Stanford Center for Internet and Society: "Copyright, Fair Use, and Generative AI at Scale" (2025).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">2.</span>
              <span>Electronic Frontier Foundation (EFF): "Consumer Autonomy, Ad Blocking, and the Mechanics of Digital Consent."</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">3.</span>
              <span>Harvard Journal of Law & Technology: "The Asymmetry of Digital Copying: Human Consumption vs Machine Synthesis."</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">4.</span>
              <span>Oxford Internet Institute: "Moral Rationalizations in Underground File-Sharing and Open-Source Communities."</span>
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
export default AiVsPiracyEthicsArticlePage;
