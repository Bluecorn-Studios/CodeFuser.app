import React from 'react';
import { Download, ShieldCheck, CheckCircle } from 'lucide-react';
import { R as Reveal, E as Eyebrow, G as Button, b as getMailtoLink } from '../components/Reveal';
import { FinalCta } from '../components/FinalCta';

export default function LogoPage() {
  const handleDirectDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative pt-12 min-h-screen">
      <main className="px-5 sm:px-8 max-w-6xl mx-auto py-16">
        <Reveal className="text-center max-w-3xl mx-auto mb-16">
          <Eyebrow className="mb-3">Brand Assets</Eyebrow>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-foreground text-glow mb-4">
            CodeFuser Official Brand Logos
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Download high-resolution, vector, and transparent logo assets directly to your computer.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* Card 1: HD AI Emblem */}
          <Reveal delay={100} className="card-lift rounded-2xl border border-border bg-card/40 p-6 flex flex-col items-center justify-between">
            <div className="w-full h-64 bg-black/80 rounded-xl overflow-hidden border border-border/50 flex items-center justify-center p-4 relative group">
              <img 
                src="/codefuser-logo-hd.jpg" 
                alt="CodeFuser HD Emblem" 
                className="w-full h-full object-contain rounded-lg transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="w-full mt-6 text-left">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-lg font-semibold text-foreground">HD Brand Emblem</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-foreground/10 text-foreground/80">JPEG / 1024px</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                Glowing platinum luxury fusion mark on deep obsidian background. Ideal for avatars, social media headers, and branding cards.
              </p>
              <button
                onClick={() => handleDirectDownload('/codefuser-logo-hd.jpg', 'CodeFuser-Logo-HD.jpg')}
                className="btn-pressure w-full inline-flex items-center justify-center gap-2 rounded-full py-3 px-5 text-sm font-medium bg-foreground text-background hover:shadow-glow transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download HD Emblem
              </button>
            </div>
          </Reveal>

          {/* Card 2: Vector SVG Logo */}
          <Reveal delay={200} className="card-lift rounded-2xl border border-border bg-card/40 p-6 flex flex-col items-center justify-between">
            <div className="w-full h-64 bg-zinc-950 rounded-xl overflow-hidden border border-border/50 flex items-center justify-center p-8 relative group">
              <img 
                src="/logo.svg" 
                alt="CodeFuser Vector Logo" 
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="w-full mt-6 text-left">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-lg font-semibold text-foreground">Vector SVG Mark</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-foreground/10 text-foreground/80">Vector / Scalable</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                Scalable vector format with precise geometry. Perfect for websites, crisp print materials, and UI integration.
              </p>
              <button
                onClick={() => handleDirectDownload('/logo.svg', 'CodeFuser-Logo-Vector.svg')}
                className="btn-pressure w-full inline-flex items-center justify-center gap-2 rounded-full py-3 px-5 text-sm font-medium border border-border bg-transparent text-foreground hover:border-foreground/40 hover:bg-foreground/[0.04] transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download SVG Vector
              </button>
            </div>
          </Reveal>

          {/* Card 3: PNG Format */}
          <Reveal delay={300} className="card-lift rounded-2xl border border-border bg-card/40 p-6 flex flex-col items-center justify-between">
            <div className="w-full h-64 bg-zinc-900/60 rounded-xl overflow-hidden border border-border/50 flex items-center justify-center p-8 relative group">
              <img 
                src="/logo.png" 
                alt="CodeFuser PNG Logo" 
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="w-full mt-6 text-left">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-lg font-semibold text-foreground">Raster PNG Mark</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-foreground/10 text-foreground/80">PNG / Standard</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                High quality raster image for legacy platforms, email signatures, and mobile app icons.
              </p>
              <button
                onClick={() => handleDirectDownload('/logo.png', 'CodeFuser-Logo.png')}
                className="btn-pressure w-full inline-flex items-center justify-center gap-2 rounded-full py-3 px-5 text-sm font-medium border border-border bg-transparent text-foreground hover:border-foreground/40 hover:bg-foreground/[0.04] transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download PNG
              </button>
            </div>
          </Reveal>
        </div>

        {/* Brand Specs Section */}
        <Reveal delay={400} className="rounded-2xl border border-border/60 bg-card/20 p-8 max-w-4xl mx-auto mb-20 text-left">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-6 h-6 text-foreground" />
            <h2 className="font-display text-xl font-semibold text-foreground">CodeFuser Brand Identity Guidelines</h2>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-foreground/70 shrink-0" />
              <span>Primary Colors: Obsidian (#09090B), Platinum (#F4F1EA)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-foreground/70 shrink-0" />
              <span>Typography: Space Grotesk &amp; Satoshi</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-foreground/70 shrink-0" />
              <span>Aspect Ratio: 1:1 Square Brand Mark</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-foreground/70 shrink-0" />
              <span>Usage: Commercial, Client Documentation &amp; Media</span>
            </li>
          </ul>
        </Reveal>

        <FinalCta />
      </main>
    </div>
  );
}
