import React, { useState } from 'react';
import { R as Reveal, E as Eyebrow, Link } from './Reveal';
import { FAQItem } from '../types';

export const faqItems: FAQItem[] = [
  {
    question: "What is CodeFuser?",
    answer: "CodeFuser is a growth-focused digital agency that builds digital growth foundations—helping local businesses break their invisible ceiling, establish customer trust, and drive sustainable growth."
  },
  {
    question: "Who is CodeFuser built for?",
    answer: "CodeFuser primarily serves local and growing businesses across Chennai, Tamil Nadu, and India—including restaurants, cafes, dental & medical clinics, salons, spas, gyms, fitness studios, photo studios, architects, lawyers, real estate agencies, coaching centres, and local service providers."
  },
  {
    question: "Why does CodeFuser exist?",
    answer: "CodeFuser exists because thousands of great local businesses remain invisible online. We believe: 'The problem isn't that your business is small. The problem is that people can't find it.' Our mission is to make your business easy to discover, easy to trust, and effortless to choose."
  },
  {
    question: "What makes CodeFuser different from traditional web agencies?",
    answer: "Traditional agencies build static websites. CodeFuser builds real online growth for your business. We focus on real business outcomes: helping local customers find you on Google, build trust, and call or book appointments directly with you."
  },
  {
    question: "How do CodeFuser's growth packages work?",
    answer: "Our packages match your business growth: ⚡ Ignite gets your business online and builds trust, ✦ Fusion brings in more customers and grows your business, and ⬢ Catalyst automates your business for long-term growth."
  },
  {
    question: "How long does delivery take and what is the payment process?",
    answer: "Most projects launch within 5-12 days once initial details are shared. We operate with a 100% trust policy: Pay only 50% to start, and the remaining 50% only after website handover."
  },
  {
    question: "Do I own my website and code?",
    answer: "Yes, 100%. You retain full ownership of all code, assets, and design files, or you can opt for a fully managed plan where we take care of hosting, updates, and maintenance."
  }
];

interface FAQAccordionItemProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQAccordionItem: React.FC<FAQAccordionItemProps> = ({ item, isOpen, onToggle }) => {
  return (
    <div className="border-b border-border/80">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left focus:outline-none focus-visible:text-platinum group"
        aria-expanded={isOpen}
      >
        <span className="font-display text-base text-foreground/90 transition-colors group-hover:text-foreground sm:text-lg">
          {item.question}
        </span>
        <span className="ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/60 transition-colors group-hover:border-foreground/30">
          <svg
            className={`h-3 w-3 text-foreground/60 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12M6 12h12" />
            )}
          </svg>
        </span>
      </button>
      
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] pb-6 opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
        style={{ contentVisibility: isOpen ? 'visible' : 'hidden' }}
      >
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed text-muted-foreground max-w-2xl">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export const Faq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="lazy-section relative overflow-hidden px-5 py-[clamp(4.5rem,10vw,8rem)] sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr]">
          <Reveal>
            <Eyebrow>10 — FAQ</Eyebrow>
            <h2 className="font-display mt-8 text-balance text-3.5xl leading-[1.05] text-foreground text-glow sm:text-4.5xl md:text-5.5xl font-bold">
              Quiet Answers<br />
              <span className="text-platinum">To Loud Questions.</span>
            </h2>
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
              Answers to the basic questions every founder asks before starting.
            </p>
          </Reveal>

          <Reveal delay={120} className="space-y-1">
            {faqItems.map((item, index) => (
              <FAQAccordionItem
                key={index}
                item={item}
                isOpen={openIndex === index}
                onToggle={() => handleToggle(index)}
              />
            ))}

            {/* FAQ Bottom CTAs */}
            <div className="pt-8 mt-8 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground/70">Still have questions?</p>
                <p className="text-sm text-foreground/80 mt-1">Speak directly with our team or start your journey.</p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium shrink-0">
                <Link to="/contact" className="text-foreground hover:text-glow underline underline-offset-4 decoration-border hover:decoration-foreground transition-all">
                  Contact Us →
                </Link>
                <span className="text-muted-foreground/40">•</span>
                <Link to="/start-project" className="text-foreground hover:text-glow underline underline-offset-4 decoration-border hover:decoration-foreground transition-all">
                  Start Your Project →
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Faq;
