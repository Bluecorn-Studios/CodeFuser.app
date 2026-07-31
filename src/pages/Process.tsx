import React from 'react';
import { R as Reveal, E as Eyebrow, Link } from '../components/Reveal';
import { S as SectionHeader } from '../components/SectionHeader';
import { FinalCta } from '../components/FinalCta';

const processCards = [
  {
    index: "01",
    title: "Understand Your Business",
    description: "We start by understanding your customers, your offer, and the gap between how you're perceived and how you should be perceived."
  },
  {
    index: "02",
    title: "Build Visibility",
    description: "We design a presence that earns attention the moment a potential customer encounters your brand online."
  },
  {
    index: "03",
    title: "Convert Attention",
    description: "Visibility means nothing without trust. We build the structure that turns visitors into qualified inquiries."
  },
  {
    index: "04",
    title: "Create Growth",
    description: "Predictable inquiries. Stronger positioning. A system that compounds — quietly, consistently, every month."
  }
];

const trustEngineSteps = ["Visibility", "Trust", "Attention", "Leads", "Growth"];

function WorkMethodSection() {
  return (
    <section className="relative px-5 py-24 sm:px-8 sm:py-28">
      <SectionHeader 
        eyebrow="How CodeFuser Works" 
        title="A quiet, deliberate process — designed to compound." 
      />
      
      <div className="mx-auto mt-12 sm:mt-14 grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-4">
        {processCards.map((card, index) => (
          <Reveal key={card.index} delay={index * 80}>
            <article className="card-lift h-full rounded-2xl border border-border bg-card/40 p-7 flex flex-col">
              <span className="font-display text-3xl text-platinum font-bold">
                {card.index}
              </span>
              <h3 className="font-display mt-5 text-xl text-foreground font-semibold">
                {card.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                {card.description}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function TrustEngineSection() {
  return (
    <section className="relative px-5 py-24 sm:px-8 sm:py-28">
      <SectionHeader 
        eyebrow="The Trust Engine" 
        title="Trust is built before the first conversation." 
        description="Every step of the journey compounds the next. Visibility earns attention. Attention earns trust. Trust earns growth."
      />

      <Reveal className="mx-auto mt-12 sm:mt-14 max-w-md">
        <ol className="relative space-y-3">
          {trustEngineSteps.map((step, index) => (
            <li 
              key={step} 
              className="card-lift relative flex items-center justify-between rounded-xl border border-border bg-card/40 px-5 py-4"
            >
              <span className="text-eyebrow">
                Step {String(index + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-xl text-foreground font-semibold">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </Reveal>

      {/* Internal Navigation Section */}
      <Reveal className="mx-auto mt-20 max-w-4xl pt-10 border-t border-border/40">
        <Eyebrow>Next Steps</Eyebrow>
        <h3 className="font-display text-2xl font-bold text-foreground mt-2 mb-8">Ready to bring this delivery process to your business?</h3>
        <div className="grid gap-6 sm:grid-cols-2 text-left">
          <Link to="/pricing" className="group block p-6 rounded-2xl border border-border/60 bg-card/30 hover:bg-card/60 transition-all">
            <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground/60">01 — Select Tier</p>
            <h4 className="font-display font-semibold text-foreground text-base mt-2 group-hover:text-glow">Choose Your Package →</h4>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">Review capacity tiers and fixed investment options.</p>
          </Link>

          <Link to="/start-project" className="group block p-6 rounded-2xl border border-border/60 bg-card/30 hover:bg-card/60 transition-all">
            <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground/60">02 — Get Started</p>
            <h4 className="font-display font-semibold text-foreground text-base mt-2 group-hover:text-glow">Start Your Project →</h4>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">Submit your project details and initiate discovery.</p>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

export const Process: React.FC = () => {
  return (
    <div className="pt-12">
      <WorkMethodSection />
      <TrustEngineSection />
      <FinalCta />
    </div>
  );
};

export default Process;
