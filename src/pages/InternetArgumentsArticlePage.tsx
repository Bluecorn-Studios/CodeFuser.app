import React, { useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Bookmark, 
  ChevronRight, 
  MessageSquare, 
  Repeat, 
  Shield, 
  Flame, 
  Users, 
  Brain, 
  Eye, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp,
  Scale,
  RefreshCcw,
  Sliders
} from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import { AdSenseSlot } from '../components/ads/AdSenseSlot';

interface ArticlePageProps {
  onNavigate?: (path: string) => void;
}

export const InternetArgumentsArticlePage: React.FC<ArticlePageProps> = ({ onNavigate }) => {
  const currentArticle = BLOG_POSTS.find(
    (p) => p.slug === 'why-internet-arguments-rarely-change-anyones-mind'
  );

  const relatedPosts = BLOG_POSTS.filter(
    (p) => p.slug !== 'why-internet-arguments-rarely-change-anyones-mind'
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = "Why Internet Arguments Rarely Change Anyone's Mind | CodeFuser Journal";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        "Why do people keep arguing online about the same topics when almost nobody changes their mind? Piracy offers a perfect case study in tribalism, identity, confirmation bias and online moral validation."
      );
    }
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Why Internet Arguments Rarely Change Anyone's Mind",
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
            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono font-medium tracking-wide">
              Online Psychology & Digital Discourse
            </span>
            <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
              Identity & Tribalism
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-mono">
              Level 1 — Pillar
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-white leading-[1.15]">
            Why Internet Arguments Rarely Change Anyone's Mind
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed font-sans font-normal border-l-2 border-purple-400/80 pl-4 py-1">
            Why do people keep arguing online about the same topics when almost nobody changes their mind? Piracy offers a perfect case study in tribalism, identity, confirmation bias and online moral validation.
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
              <MessageSquare size={14} className="text-purple-400" />
              By CodeFuser Tech & Media Research
            </span>
          </div>
        </div>

        {/* AdSense Top Placement */}
        <AdSenseSlot slotId="internet-arguments-top" format="auto" responsive={true} showDisclaimer={true} />

        {/* Article Body */}
        <div className="prose prose-invert max-w-none space-y-7 text-zinc-300 text-base sm:text-lg leading-relaxed font-sans mt-8">
          
          <p className="text-lg sm:text-xl text-white font-medium">
            Have you ever watched an online argument that looks exactly like an argument you saw six months ago?
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 font-mono text-xs text-center text-zinc-300">
            <div className="p-3 bg-zinc-900 border border-white/5 rounded-lg">Same claims</div>
            <div className="p-3 bg-zinc-900 border border-white/5 rounded-lg">Same counterarguments</div>
            <div className="p-3 bg-zinc-900 border border-white/5 rounded-lg">Same insults</div>
            <div className="p-3 bg-zinc-900 border border-white/5 rounded-lg">Same defenses</div>
          </div>

          <p>
            And, somehow, <strong className="text-white">400 comments later, almost nobody has changed their mind.</strong>
          </p>

          <p className="text-xl font-bold text-amber-300">
            Why?
          </p>

          <p>
            That question sounds simple. But it exposes something fundamental about how human psychology interfaces with digital networks.
          </p>

          <p>
            A recurring online debate regarding digital copyright and piracy offers a pristine case study. A forum user recently asked a seemingly innocent question:
          </p>

          <blockquote className="border-l-4 border-purple-500/80 pl-4 py-2 my-4 text-purple-200 font-mono text-sm bg-zinc-900/60 rounded-r-lg">
            “Why do online communities keep having massive, emotional arguments about whether piracy is morally acceptable when everyone involved already seems to know exactly what they believe?”
          </blockquote>

          <p>
            That question is worth taking seriously. Because online copyright debates are merely one symptom of a universal internet dynamic:
          </p>

          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 via-zinc-900 to-black border border-purple-500/30 my-6">
            <h2 className="text-xl sm:text-2xl font-display font-black text-white m-0">
              People rarely enter online arguments to update a belief. They enter to defend an identity.
            </h2>
          </div>

          <hr className="border-white/10 my-10" />

          {/* Section 01: The Argument That Never Ends */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Repeat size={15} />
              <span>The Ritual Loop</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The debate that goes in circles
            </h2>
          </div>

          <p>
            Observe the predictable ping-pong mechanics of the standard online thread:
          </p>

          {/* Dialogue Tree Box */}
          <div className="space-y-2.5 my-6 font-mono text-xs sm:text-sm">
            <div className="p-3 bg-zinc-900 border border-white/10 rounded-lg text-rose-300">
              <strong>User A:</strong> “Piracy is stealing.”
            </div>
            <div className="p-3 bg-zinc-900 border border-white/10 rounded-lg text-amber-300">
              <strong>User B:</strong> “What if you can't afford it?”
            </div>
            <div className="p-3 bg-zinc-900 border border-white/10 rounded-lg text-cyan-300">
              <strong>User C:</strong> “What if the product isn't sold in your country?”
            </div>
            <div className="p-3 bg-zinc-900 border border-white/10 rounded-lg text-emerald-300">
              <strong>User D:</strong> “I pirate because legal services are worse.”
            </div>
            <div className="p-3 bg-zinc-900 border border-white/10 rounded-lg text-zinc-300">
              <strong>User A:</strong> “Those are just rationalizations.”
            </div>
            <div className="p-3 bg-zinc-900 border border-white/10 rounded-lg text-purple-300">
              <strong>User E:</strong> “Corporations exploit consumers and abandon games.”
            </div>
            <div className="p-3 bg-zinc-900 border border-white/10 rounded-lg text-zinc-300">
              <strong>User F:</strong> “Then boycott them. Don't steal.”
            </div>
          </div>

          <p>
            Within minutes, the original premise evaporates. Nobody is attempting to establish shared definitions. Nobody is asking: <span className="text-white italic">“What evidence would change my mind?”</span>
          </p>

          <p>
            Instead, participants are defending pre-existing territorial battle lines.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 02: Looking for Validation, Not Answers */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Brain size={15} />
              <span>Cognitive Motivation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              People are looking for validation, not answers
            </h2>
          </div>

          <p>
            A participant in the discussion made a remarkably incisive observation:
          </p>

          <blockquote className="border-l-4 border-amber-500/80 pl-4 py-2 my-4 text-amber-200 font-mono text-sm bg-zinc-900/60 rounded-r-lg">
            “People don't want an objective moral audit. They want others to tell them they did nothing wrong.”
          </blockquote>

          <p>
            This reveals the hidden motivation driving digital comment sections:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 font-mono text-xs sm:text-sm">
            <div className="p-5 rounded-xl bg-zinc-900 border border-emerald-500/30 space-y-2">
              <span className="text-emerald-400 font-bold uppercase block text-xs">Truth-Seeking Goal</span>
              <div className="text-white font-bold text-base">“Am I correct?”</div>
              <p className="text-zinc-400 font-sans text-xs pt-1">
                Contradictory evidence is welcomed as an opportunity to refine understanding and update priors.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900 border border-rose-500/30 space-y-2">
              <span className="text-rose-400 font-bold uppercase block text-xs">Identity-Defense Goal</span>
              <div className="text-white font-bold text-base">“Will people like me agree with me?”</div>
              <p className="text-zinc-400 font-sans text-xs pt-1">
                Contradictory evidence is perceived as a direct personal attack and an existential threat to status.
              </p>
            </div>
          </div>

          <hr className="border-white/10 my-10" />

          {/* Section 03: The Shift from Opinion to Identity */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Shield size={15} />
              <span>Identity Fusion</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The moment an opinion fuses with identity
            </h2>
          </div>

          <p>
            Consider the semantic difference between two statements:
          </p>

          <div className="space-y-3 my-6 font-mono text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-zinc-900 border border-white/10 space-y-1">
              <span className="text-zinc-400 font-bold uppercase text-xs">Statement A (An Empirical Opinion)</span>
              <p className="text-zinc-200 font-sans text-sm">
                “I believe unauthorized copying can be ethically justified when content is commercially unavailable or pricing is severely distorted.”
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-purple-500/30 space-y-1">
              <span className="text-purple-400 font-bold uppercase text-xs">Statement B (A Tribal Identity)</span>
              <p className="text-purple-200 font-sans text-sm">
                “People like us understand why piracy is justified resistance, unlike those corporate bootlickers who defend multi-billion-dollar studios.”
              </p>
            </div>
          </div>

          <p>
            Statement A can be debated, tested against economic data, or modified. Statement B is a tribal banner.
          </p>

          <p>
            Once a belief becomes fused with personal identity, disagreeing with the thesis is processed by the brain as an attack on the self. The debate ceases to be about copyright law or software economics—it becomes a loyalty test: <strong className="text-white font-mono">“Which side are you on?”</strong>
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 04: The Collapse of Nuance */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Sliders size={15} />
              <span>Nuance Decay</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Why the internet destroys nuance
            </h2>
          </div>

          <p>
            In reality, digital access encompasses dozens of completely incompatible consumer profiles:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-4 font-mono text-xs text-zinc-300">
            <div className="p-3 bg-zinc-900 border border-white/10 rounded-lg">• Broke teenagers</div>
            <div className="p-3 bg-zinc-900 border border-white/10 rounded-lg">• Geo-blocked users</div>
            <div className="p-3 bg-zinc-900 border border-white/10 rounded-lg">• Hardware samplers</div>
            <div className="p-3 bg-zinc-900 border border-white/10 rounded-lg">• Anti-DRM activists</div>
            <div className="p-3 bg-zinc-900 border border-white/10 rounded-lg">• Preservationists</div>
            <div className="p-3 bg-zinc-900 border border-white/10 rounded-lg">• Free-riders</div>
          </div>

          <p>
            Yet comment threads relentlessly collapse this complex spectrum into a binary cage match:
          </p>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-white/10 font-mono text-center text-sm my-6 flex justify-center items-center gap-4">
            <span className="text-rose-400 font-bold">PIRACY IS STEALING</span>
            <span className="text-zinc-600 font-bold">VS</span>
            <span className="text-emerald-400 font-bold">PIRACY IS MORAL RIGHT</span>
          </div>

          <p>
            Why does nuance vanish? Because social media engagement algorithms are tuned to amplify conflict. A balanced, conditional thesis receives polite nods; a polarizing slogan triggers hundreds of angry quote-tweets and rebuttal comments.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 05: The Infinite Outrage Loop */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <RefreshCcw size={15} />
              <span>The Feedback Machine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The perpetual cycle of online discourse
            </h2>
          </div>

          <p>
            This produces the closed-circuit loop that powers modern social commentary:
          </p>

          {/* Flow Cycle Box */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-white/10 font-mono text-xs sm:text-sm space-y-2 text-center my-6">
            <div className="p-2.5 rounded bg-zinc-950 border border-white/10 text-white">1. Provocative Opinion Posted</div>
            <div className="text-amber-400">↓</div>
            <div className="p-2.5 rounded bg-zinc-950 border border-white/10 text-zinc-300">2. In-Group Defense & Out-Group Counterattack</div>
            <div className="text-amber-400">↓</div>
            <div className="p-2.5 rounded bg-zinc-950 border border-white/10 text-zinc-300">3. Moral Validation via Upvotes / Likes</div>
            <div className="text-amber-400">↓</div>
            <div className="p-2.5 rounded bg-zinc-950 border border-white/10 text-purple-300 font-bold">4. Deeper Identity Hardening</div>
            <div className="text-amber-400">↓</div>
            <div className="p-2.5 rounded bg-zinc-950 border border-white/10 text-rose-400">5. Meta-Thread Complaining About the Arguments</div>
            <div className="text-amber-400">↓</div>
            <div className="p-2.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold">6. Meta-Thread Becomes the Exact Argument It Criticized</div>
          </div>

          {/* Strategic Conclusion Callout */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-white/10 space-y-4 my-10">
            <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              The Key Insight
            </h3>
            <p className="text-xl sm:text-2xl font-display font-black text-purple-300 leading-snug">
              When an online space values belonging more than discovery, arguments become ceremonies rather than inquiries.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              Understanding this dynamic doesn't mean giving up on digital conversations—it means recognizing when a discussion is a genuine exchange of knowledge versus when it is a ritual performance of tribal loyalty.
            </p>
          </div>

        </div>

        {/* AdSense In-Article / Bottom Placement */}
        <AdSenseSlot slotId="internet-arguments-bottom" format="auto" responsive={true} showDisclaimer={true} className="my-12" />

        {/* Sources & Citations */}
        <div className="mt-14 p-6 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <Bookmark size={14} className="text-amber-400" />
            <span>Documented Research & Theoretical Frameworks</span>
          </h3>
          <ul className="space-y-2 text-xs font-mono text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">1.</span>
              <span>Empirical Social Psychology Studies on Motivated Reasoning and In-Group Social Validation.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">2.</span>
              <span>Public Discourse & Community Synthesis (r/piracy, r/technology, r/theoryofreddit longitudinal analysis).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">3.</span>
              <span>Cognitive Psychology Research on Identity-Protective Cognition and Cultural Cognition Theory (Dan Kahan).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">4.</span>
              <span>Social Media Algorithm Dynamics on Engagement, Outrage Loops, and Nuance Decay.</span>
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
export default InternetArgumentsArticlePage;
