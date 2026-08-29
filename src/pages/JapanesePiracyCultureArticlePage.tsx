import React, { useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Bookmark, 
  ChevronRight, 
  Globe2, 
  ShieldAlert, 
  BookOpen, 
  Sparkles, 
  Lock, 
  Scale, 
  Eye, 
  MessageSquare, 
  Layers, 
  Flame, 
  AlertCircle,
  HelpCircle,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import { AdSenseSlot } from '../components/ads/AdSenseSlot';

interface ArticlePageProps {
  onNavigate?: (path: string) => void;
}

export const JapanesePiracyCultureArticlePage: React.FC<ArticlePageProps> = ({ onNavigate }) => {
  const currentArticle = BLOG_POSTS.find(
    (p) => p.slug === 'do-japanese-people-really-hate-piracy-more-than-everyone-else'
  );

  const relatedPosts = BLOG_POSTS.filter(
    (p) => p.slug !== 'do-japanese-people-really-hate-piracy-more-than-everyone-else'
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = "Do Japanese People Really Hate Piracy More Than Everyone Else? | CodeFuser Journal";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        "Japan is often portrayed online as uniquely hostile to piracy. But is that actually true? We examine Japanese copyright culture, law, anime and manga availability, preservation, and the gap between public attitudes and actual behavior."
      );
    }
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Do Japanese People Really Hate Piracy More Than Everyone Else?",
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
            <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono font-medium tracking-wide">
              Digital Sociology & International Law
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono">
              Japan & Media Culture
            </span>
            <span className="px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-xs font-mono">
              Level 1 — Pillar
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-white leading-[1.15]">
            Do Japanese People Really Hate Piracy More Than Everyone Else?
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed font-sans font-normal border-l-2 border-rose-400/80 pl-4 py-1">
            Japan is widely portrayed across Western online forums as an ethical utopia where nobody pirates out of sheer respect for creators. But is that cultural mythology, or does it mask severe criminal penalties, high domestic convenience, and the social divide between public discourse and private habits?
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
              <Globe2 size={14} className="text-amber-400" />
              By CodeFuser Tech & Media Research
            </span>
          </div>
        </div>

        {/* AdSense Top Placement */}
        <AdSenseSlot slotId="japanese-piracy-top" format="auto" responsive={true} showDisclaimer={true} />

        {/* Article Body */}
        <div className="prose prose-invert max-w-none space-y-7 text-zinc-300 text-base sm:text-lg leading-relaxed font-sans mt-8">
          
          <p className="text-lg sm:text-xl text-white font-medium">
            There is a persistent myth surrounding Japan across the English-speaking internet.
          </p>

          <p>
            Whenever a discussion arises about anime, manga, or video game piracy, someone inevitably chimes in with an absolute claim:
          </p>

          <blockquote className="border-l-4 border-rose-500/80 pl-4 py-3 my-4 text-rose-300 font-mono text-lg bg-zinc-900/60 rounded-r-lg">
            “Japanese people just respect creators too much. They would never pirate because their culture values honor and rule-following above all else.”
          </blockquote>

          <p>
            It sounds clean, romantic, and intuitively plausible.
          </p>

          <p>
            Japan is home to one of the world's most vibrant, concentrated entertainment export economies. Japanese publishers like Shueisha, Kodansha, and Square Enix are legendary for taking uncompromising legal stances against copyright infringement, and Japanese Twitter frequently features outspoken artists pleading with fans not to re-upload their drawings.
          </p>

          <p>
            Yet when you talk to longtime residents, legal scholars, and cybersecurity researchers in Tokyo, an entirely different picture emerges:
          </p>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-white/10 font-mono text-center my-6">
            <div className="text-xl sm:text-2xl font-black text-white">“It is not that Japanese people don't pirate. It is that nobody advertises it in public.”</div>
            <p className="text-xs text-zinc-400 mt-2 m-0">The gap between outward social harmony and private digital behavior.</p>
          </div>

          <p className="text-xl font-bold text-white">
            How did a country with some of the world's highest domestic piracy traffic develop an international reputation for being immune to it?
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 01: The Internet Stereotype vs. Hard Data */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Eye size={15} />
              <span>Statistical Reality</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The Manga Mura Paradox: Billions in Traffic Inside Japan
            </h2>
          </div>

          <p>
            If Japanese citizens possessed an innate cultural aversion to pirated media, unauthorized Japanese websites would struggle to find an audience within Japan's borders.
          </p>

          <p>
            The historical record shows the exact opposite.
          </p>

          <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-zinc-900 to-black border border-rose-500/30 my-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-rose-400 font-bold uppercase">
              <Flame size={15} />
              <span>The Case of Manga Mura (漫画村)</span>
            </div>
            <p className="text-base sm:text-lg text-zinc-200 font-sans leading-relaxed m-0">
              Between 2017 and 2018, the unauthorized Japanese manga indexing website <strong>Manga Mura</strong> became the <strong>31st most visited website in the entire world</strong> and ranked higher in Japanese web traffic than Twitter, Amazon Japan, and Wikipedia.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 font-mono text-xs text-zinc-400 border-t border-white/10">
              <span>• Monthly Active Users: <strong>~100 Million</strong></span>
              <span>• Domestic Japanese Traffic Share: <strong>&gt;90%</strong></span>
              <span>• Estimated Damages Claimed by Publishers: <strong>¥320 Billion (~$2.9B)</strong></span>
            </div>
          </div>

          <p>
            Manga Mura was not an obscure international rip site for English readers with subtitles. It was an all-Japanese platform consumed by high school students, office workers (salarymen) on the Yamanote line, and everyday citizens across Japan on mobile phones.
          </p>

          <p>
            When Japanese police and cybersecurity agencies eventually seized the site and arrested its administrator in the Philippines in 2019, multiple clone sites (Manga Bank, RawQV) immediately rushed in to absorb millions of Japanese visitors.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 02: Tatemae vs. Honne */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <MessageSquare size={15} />
              <span>Sociological Breakdown</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Understanding Tatemae (建前) vs. Honne (本音) in Japanese Tech Discourse
            </h2>
          </div>

          <p>
            To understand why Western observers think Japanese people "hate" piracy, one must understand the foundational Japanese social dynamic of <strong className="text-white">Tatemae (the public face and expected social conformity)</strong> versus <strong className="text-white">Honne (one’s genuine private thoughts and actions)</strong>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 font-mono text-xs">
            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <span className="text-amber-400 font-bold uppercase text-xs">Tatemae (Public Stance)</span>
              <p className="text-zinc-300 font-sans text-xs">
                In public forums, workplace conversations, or on identified social accounts, individuals express unequivocal condemnation for rule-breaking, enthusiastically supporting anti-piracy campaigns like the Content Overseas Distribution Association (CODA).
              </p>
            </div>

            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <span className="text-rose-400 font-bold uppercase text-xs">Honne (Private Behavior)</span>
              <p className="text-zinc-300 font-sans text-xs">
                In private browsing on smartphones, unlinked accounts on 5channel (formerly 2channel), or anonymous message boards, Japanese netizens download, stream, and share files just like consumers in any other industrialized nation.
              </p>
            </div>
          </div>

          <p>
            In Reddit or Western Discord servers, users will openly boast about their 40-terabyte home media servers and explain the best torrent indexers. In Japan, openly boasting about downloading pirated media invites severe social disapproval and immediate peer ostracization.
          </p>

          <blockquote className="border-l-4 border-amber-500/80 pl-4 py-2 my-4 text-amber-300 font-mono text-sm bg-zinc-900/40">
            The anti-piracy voices online are loud and socially rewarded; the consumers of piracy are completely silent.
          </blockquote>

          <hr className="border-white/10 my-10" />

          {/* Section 03: Draconian Legal Consequences */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Scale size={15} />
              <span>Legal Environment</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Criminal Penalties: Why Japanese Netizens Fear the Law
            </h2>
          </div>

          <p>
            Another reason Japanese piracy is quieter is that Japan possesses some of the strictest digital copyright laws on the planet.
          </p>

          <div className="space-y-3 my-6 font-mono text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-zinc-900 border border-rose-500/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-rose-400 font-bold">2012 & 2021 Copyright Revisions</span>
                <span className="text-xs text-zinc-500">Bunkacho Legal Framework</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs">
                In Japan, simply <em>downloading</em> a knowingly pirated manga, magazine, novel, or music file for personal use carries criminal penalties of up to <strong>2 years in prison</strong> and fines up to <strong>¥2,000,000 (~$15,000 USD)</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-rose-500/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-rose-400 font-bold">Leech Site & Fast Cinema Prosecutions</span>
                <span className="text-xs text-zinc-500">Criminal Precedents</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs">
                In 2021, creators of 10-minute recap videos ("Fast Cinema") on YouTube were sentenced to prison and ordered to pay <strong>¥500 Million in damages</strong>. The operator of Manga Mura received a 3-year prison sentence and a ¥72 Million fine alongside a record ¥1.7 Billion civil payout to publishers.
              </p>
            </div>
          </div>

          <p>
            When Japanese citizens refrain from peer-to-peer sharing on public IP addresses, they aren't necessarily acting on moral purism; they are rationally avoiding aggressive state enforcement and career-ending criminal records.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 04: The Domestic Service Superiority */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Smartphone size={15} />
              <span>Distribution Economics</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Domestic Availability: Why Legal Manga Is Unusually Convenient
            </h2>
          </div>

          <p>
            As Valve's Gabe Newell established, piracy drops when the legal product offers zero friction. In Japan, domestic media availability is decades ahead of the West:
          </p>

          <div className="space-y-3 my-6 font-mono text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-zinc-900 border border-emerald-500/30 space-y-1">
              <span className="text-emerald-400 font-bold">1. Fractional Chapter Microtransactions</span>
              <p className="text-zinc-300 font-sans text-xs">
                Apps like <em>Piccoma</em>, <em>LINE Manga</em>, and <em>Shonen Jump+</em> allow readers to read latest chapters for 30–50 yen ($0.25) or unlock free chapters every 23 hours via daily tickets.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-emerald-500/30 space-y-1">
              <span className="text-emerald-400 font-bold">2. Physical Ubiquity</span>
              <p className="text-zinc-300 font-sans text-xs">
                Every single convenience store (7-Eleven, Lawson, FamilyMart) on every city corner stocks physical weekly magazines (Weekly Shonen Jump, Young Jump) for less than the price of a cup of coffee.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-emerald-500/30 space-y-1">
              <span className="text-emerald-400 font-bold">3. Zero Translation Delay</span>
              <p className="text-zinc-300 font-sans text-xs">
                Japanese readers receive chapters the moment they are printed. They never have to wait 6 months for a localized volume or rely on volunteer scanlation teams.
              </p>
            </div>
          </div>

          <p>
            When legitimate media is priced at pocket change, updated in real time, and accessible on every phone app and train station kiosk, the incentive to navigate malware-ridden pirate sites naturally plummets.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 05: The Doujinshi Nuance */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <BookOpen size={15} />
              <span>Cultural Nuance</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The Doujinshi Paradox: Tolerating the Unofficial
            </h2>
          </div>

          <p>
            The idea that Japanese creators hate any unauthorized use of their intellectual property is contradicted by the massive phenomenon of <strong className="text-white">Doujinshi (同人誌)</strong>.
          </p>

          <p>
            Every year, hundreds of thousands of fans and professional artists gather at <em>Comic Market (Comiket)</em> in Tokyo to sell self-published, unauthorized derivative manga featuring famous characters from <em>Gundam</em>, <em>Fate</em>, or <em>Dragon Ball</em>.
          </p>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-white/10 font-mono text-xs sm:text-sm my-6 space-y-2">
            <div className="text-amber-400 font-bold">The Implicit Social Compact (Mokunin / 黙認):</div>
            <p className="text-zinc-300 font-sans text-xs">
              Publishers and authors understand that derivative fan art represents deep audience engagement and acts as a proving ground for future professional talent. They deliberately refrain from suing fan creators as long as it does not directly cannibalize official book sales.
            </p>
          </div>

          <p>
            This shows that Japanese media culture is not dogmatically anti-unauthorized; it makes nuanced distinctions between <strong>creative community engagement</strong> and <strong>parasitic re-uploading for ad profit</strong>.
          </p>

          {/* Strategic Conclusion Callout */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-white/10 space-y-4 my-10">
            <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              The Final Verdict
            </h3>
            <p className="text-xl sm:text-2xl font-display font-black text-amber-300 leading-snug">
              Japan is not immune to piracy; it simply manages it through high convenience, strict laws, and discreet social norms.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              When Western commentators claim Japanese people inherently despise piracy, they are mistaking public politeness and heavy-handed copyright policing for a magical cultural resistance. Give any population friction-free access to content and fair prices, and piracy withers. Add friction and steep prices, and even the most rule-respecting society will seek alternatives.
            </p>
          </div>

        </div>

        {/* AdSense In-Article / Bottom Placement */}
        <AdSenseSlot slotId="japanese-piracy-bottom" format="auto" responsive={true} showDisclaimer={true} className="my-12" />

        {/* Sources & Citations */}
        <div className="mt-14 p-6 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <Bookmark size={14} className="text-amber-400" />
            <span>Academic Research & Government Reports</span>
          </h3>
          <ul className="space-y-2 text-xs font-mono text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">1.</span>
              <span>Agency for Cultural Affairs (Bunkacho) — Survey on the Infringement of Copyright and Unauthorized Digital Content in Japan.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">2.</span>
              <span>Content Overseas Distribution Association (CODA) — Annual Manga & Anime Anti-Piracy Reports (2020–2026).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">3.</span>
              <span>Tokyo District Court Judgments on Manga-Mura Operator Criminal Penalties & Civil Damages.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">4.</span>
              <span>Academic Studies on Honne vs. Tatemae and Online Discourse in Japanese Tech Communities (University of Tokyo / Waseda).</span>
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
export default JapanesePiracyCultureArticlePage;
