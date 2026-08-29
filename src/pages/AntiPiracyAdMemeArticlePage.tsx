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
  Music, 
  Type, 
  Car, 
  Disc, 
  Film, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  FileQuestion,
  Laugh
} from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import { AdSenseSlot } from '../components/ads/AdSenseSlot';

interface ArticlePageProps {
  onNavigate?: (path: string) => void;
}

export const AntiPiracyAdMemeArticlePage: React.FC<ArticlePageProps> = ({ onNavigate }) => {
  const currentArticle = BLOG_POSTS.find(
    (p) => p.slug === 'the-anti-piracy-ad-that-accidentally-became-piracy-material'
  );

  const relatedPosts = BLOG_POSTS.filter(
    (p) => p.slug !== 'the-anti-piracy-ad-that-accidentally-became-piracy-material'
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = "The Anti-Piracy Ad That Accidentally Became Piracy Material | CodeFuser Journal";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        "The famous “You Wouldn’t Steal a Car” anti-piracy campaign became one of the internet’s most mocked copyright messages. Then came the irony: online claims that parts of the campaign used pirated creative assets. What actually happened, what was debunked, and why the story became bigger than the ad itself."
      );
    }
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "The Anti-Piracy Ad That Accidentally Became Piracy Material",
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
              Internet Lore & Copyright History
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">
              The Meme & Fact-Check Investigation
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-xs font-mono">
              Level 1 — Pillar
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-white leading-[1.15]">
            The Anti-Piracy Ad That Accidentally Became Piracy Material
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed font-sans font-normal border-l-2 border-amber-400/80 pl-4 py-1">
            The iconic “You Wouldn’t Steal a Car” campaign was meant to terrify DVD owners into fearing copyright infringement. Instead, it became the internet’s favorite meme—and spawned legendary rumors that the anti-piracy enforcers themselves used pirated music and fonts. What actually happened?
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
        <AdSenseSlot slotId="anti-piracy-meme-top" format="auto" responsive={true} showDisclaimer={true} />

        {/* Article Body */}
        <div className="prose prose-invert max-w-none space-y-7 text-zinc-300 text-base sm:text-lg leading-relaxed font-sans mt-8">
          
          <div className="p-6 rounded-2xl bg-zinc-900 border border-amber-500/20 font-mono text-center space-y-2 my-4">
            <div className="text-amber-400 text-2xl sm:text-3xl font-black uppercase tracking-wider">
              “YOU WOULDN’T STEAL A CAR.”
            </div>
            <div className="text-zinc-400 text-xs sm:text-sm">
              The iconic 2004 FACT / MPAA Anti-Piracy PSA
            </div>
          </div>

          <p className="text-lg sm:text-xl text-white font-medium">
            For years, that booming synthesizer track and jittery, industrial cyberpunk font formed one of the most recognizable warnings in digital media history.
          </p>

          <p>
            You saw it before movies in theatres. You saw it on legally purchased DVDs. You saw it in classrooms.
          </p>

          <p>
            Most absurdly, you saw it on physical discs where the consumer who had just paid <strong>$20 for a genuine movie</strong> was forced to sit through an unskippable 40-second lecture on why stealing movies is a heinous crime, while anyone who downloaded a pirated torrent got the clean film with zero unskippable ads.
          </p>

          <p>
            Then the internet did what the internet does best: it found the supreme irony.
          </p>

          <p className="text-xl font-display font-bold text-white">
            Online forums erupted with a tantalizing claim: <em>“Did the anti-piracy campaign actually pirate its own music and typography?”</em>
          </p>

          <p>
            The story was so hilariously poetic that it spread like wildfire across Reddit, Twitter, YouTube, and Discord. But how much of it is true, how much was misattributed, and what was completely made up?
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 01: The Original Campaign & Meme Evolution */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Film size={15} />
              <span>Origins & Parody</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The Ad Everyone Remembers vs. What It Actually Said
            </h2>
          </div>

          <p>
            Created in July 2004 by the UK’s <strong>Federation Against Copyright Theft (FACT)</strong> and the <strong>Motion Picture Association of America (MPAA)</strong>, the campaign was titled <em>“Piracy: It's a Crime.”</em>
          </p>

          <p>
            The commercial featured rapid-fire sequences of criminal acts set to aggressive big-beat electronica:
          </p>

          {/* Ad Sequence Breakdown */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-white/10 space-y-3 my-6 font-mono text-xs sm:text-sm">
            <div className="text-amber-400 font-bold uppercase">The Original 2004 Script Sequence:</div>
            <div className="space-y-1.5 text-zinc-300 font-sans">
              <div>• “You wouldn't steal a car.” <em>(Shows a thief jimmying a car window)</em></div>
              <div>• “You wouldn't steal a handbag.” <em>(Shows a thief snatching a purse in a cafe)</em></div>
              <div>• “You wouldn't steal a television.” <em>(Shows a burglar hauling a CRT TV)</em></div>
              <div>• “You wouldn't steal a movie.” <em>(Shows someone downloading a movie at a desk)</em></div>
              <div>• “Downloading pirated films is stealing. <strong>PIRACY. IT'S A CRIME.</strong>”</div>
            </div>
          </div>

          <p>
            Notice something crucial? <strong>The ad never said “You wouldn’t download a car.”</strong>
          </p>

          <p>
            The phrase “You wouldn't download a car” was an internet parody—most famously canonized in the 2007 British comedy series <em>The IT Crowd</em> (Episode 2x03), where the sequence escalated absurdly to: <em>“You wouldn’t shoot a policeman and then steal his helmet!”</em>
          </p>

          <p>
            The meme exploded because the physical comparison was inherently flawed. As 3D printers and additive manufacturing advanced in the 2010s, netizens gleefully posted 3D-CAD files of miniature sports cars with the caption: <em>“I literally would download a car if I could.”</em>
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 02: The Music Controversy - Fact Checking the Rumor */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Music size={15} />
              <span>Investigative Audit</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The Music Lawsuit: True Story, Wrong Commercial
            </h2>
          </div>

          <p>
            The viral claim states: <em>“The creators of the ‘You Wouldn’t Steal a Car’ ad got sued because they stole the heavy techno music in the background without paying the composer.”</em>
          </p>

          <p>
            Here is what the historical and legal record actually reveals:
          </p>

          {/* Truth vs Myth Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 font-mono text-xs">
            <div className="p-5 bg-zinc-900 border border-emerald-500/30 rounded-xl space-y-3">
              <div className="text-emerald-400 font-bold uppercase flex items-center gap-2">
                <CheckCircle2 size={16} /> What Is 100% True (The Dutch Case)
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                In 2006, Dutch composer <strong>Melchior Rietveldt</strong> was commissioned by the Dutch anti-piracy organisation <strong>BREIN</strong> to write music for a 30-second anti-piracy promo to be shown <em>exclusively</em> at a local film festival.
              </p>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                Without his permission or extra compensation, BREIN and film distributors placed his track on tens of millions of commercial DVDs (including <em>Harry Potter</em>). Rietveldt sued and won over €1 million in compensation in 2011.
              </p>
            </div>

            <div className="p-5 bg-zinc-900 border border-rose-500/30 rounded-xl space-y-3">
              <div className="text-rose-400 font-bold uppercase flex items-center gap-2">
                <XCircle size={16} /> What Is Internet Myth (The Hollywood Ad)
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                The song in the famous global English <em>“You Wouldn’t Steal a Car”</em> ad was composed specifically for FACT/MPAA and properly licensed.
              </p>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                Internet users conflated the genuine Dutch BREIN lawsuit with the UK/US advertisement because both were unskippable anti-piracy PSAs from the mid-2000s.
              </p>
            </div>
          </div>

          <p>
            While the FACT ad itself did not use stolen audio, the fact that an official anti-piracy body (BREIN) was caught engaging in massive, unlicensed commercial distribution of a musician's work cemented the irony in internet folklore forever.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 03: The Font Controversy */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Type size={15} />
              <span>Typography Analysis</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The “Pirated Font” (Xirod) Controversy
            </h2>
          </div>

          <p>
            A secondary claim frequently posted on design subreddits is that the edgy, stencil-cyberpunk typeface used throughout the commercial—known as <strong>Xirod</strong>, designed by typographer Ray Larabie—was downloaded from a freeware font site without purchasing a commercial license.
          </p>

          <p>
            What does the evidence show?
          </p>

          <ul className="space-y-2 list-disc pl-6 text-sm text-zinc-300 font-sans">
            <li><strong>The Font Identity:</strong> The typeface used in the PSA is indeed <em>Xirod</em> (and variants of <em>Matrix</em> and <em>Eurostile Bold Extended</em>).</li>
            <li><strong>The License Status:</strong> Ray Larabie released basic versions of several 2000s display fonts as free for personal use via Typodermic Fonts, with commercial licenses required for major broadcasts.</li>
            <li><strong>The Resolution:</strong> While internet sleuths pointed out that production studios frequently grabbed fonts from free font directories without checking commercial terms, Larabie later clarified that whether or not an ad agency sloppy-licensed the font, no formal legal action or copyright infringement finding was pursued.</li>
          </ul>

          <hr className="border-white/10 my-10" />

          {/* Section 04: The Backfire Effect */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <AlertTriangle size={15} />
              <span>Consumer Psychology</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Why the Campaign Failed: Punishing the Innocent
            </h2>
          </div>

          <p>
            Beyond the factual corrections, the true failure of <em>“You Wouldn’t Steal a Car”</em> was strategic and psychological:
          </p>

          {/* Strategy Failure Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 font-mono text-xs">
            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="text-amber-400 font-bold uppercase">1. Misaligned Target Audience</div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                The ad only played on legal retail DVDs. The people forced to watch it were the exact people who had just paid full price, while pirates downloading rips had the ad stripped out entirely.
              </p>
            </div>

            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="text-amber-400 font-bold uppercase">2. Categorical Exaggeration</div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                Equating a high schooler downloading an MP3 with a violent mugger snatching an elderly woman's purse damaged the moral credibility of anti-piracy messaging.
              </p>
            </div>
          </div>

          {/* Strategic Conclusion Box */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-white/10 space-y-4 my-10">
            <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              The Definitive Verdict
            </h3>
            <p className="text-xl sm:text-2xl font-display font-black text-amber-300 leading-snug">
              The ad didn't stop piracy—it gave piracy its most recognizable cultural anthem.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              While the global FACT ad didn't pirate its music (that was a separate, real Dutch anti-piracy blunder), the campaign cemented its legacy as the ultimate case study in how hostile digital rights management and patronizing public relations turn a serious intellectual property debate into an enduring internet joke.
            </p>
          </div>

        </div>

        {/* AdSense In-Article / Bottom Placement */}
        <AdSenseSlot slotId="anti-piracy-meme-bottom" format="auto" responsive={true} showDisclaimer={true} className="my-12" />

        {/* Sources & Citations */}
        <div className="mt-14 p-6 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <Bookmark size={14} className="text-amber-400" />
            <span>Historical Sources & Fact-Check Records</span>
          </h3>
          <ul className="space-y-2 text-xs font-mono text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">1.</span>
              <span>Dutch Court of Justice / Buma/Stemra Arbitration: Melchior Rietveldt v. Dutch Film Festival & BREIN (2011).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">2.</span>
              <span>Federation Against Copyright Theft (FACT) & MPAA Campaign Historical Archives (2004–2009).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">3.</span>
              <span>Know Your Meme Archive: "You Wouldn't Download a Car" Linguistic Mutation & The IT Crowd Parody.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">4.</span>
              <span>Electronic Frontier Foundation (EFF): "Unskippable Anti-Piracy Ads and the Alienation of Paying Customers."</span>
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
export default AntiPiracyAdMemeArticlePage;
