import React from "react";
import { MessageSquare, Mail, Clock, ShieldCheck, Sparkles, HelpCircle } from "lucide-react";
import { ProjectRecord } from "./dashboardTypes";

interface NeedHelpTabProps {
  project: ProjectRecord;
  getWhatsAppLink: (msg: string) => string;
  getComposeEmailLink: (sub: string, body: string) => string;
}

export const NeedHelpTab: React.FC<NeedHelpTabProps> = ({
  project,
  getWhatsAppLink,
  getComposeEmailLink,
}) => {
  const faqs = [
    {
      q: "When will my first design draft be ready?",
      a: "Design drafts are prepared within 2-3 business days after you submit your basic business assets or domain preference.",
    },
    {
      q: "How do I request revisions or changes?",
      a: "Simply click the WhatsApp button or message us directly. You can request design adjustments, text changes, or layout updates.",
    },
    {
      q: "Can I connect my existing custom domain?",
      a: "Yes! If you already own a domain name (like GoDaddy or Namecheap), simply provide the domain name in the 'My Project' tab or message us.",
    },
    {
      q: "What happens after my website goes live?",
      a: "We hand over your website, activate your free domain & hosting, and remain available for ongoing updates and support.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* SECTION HEADER */}
      <div className="bg-black border border-neutral-900 rounded-3xl p-6">
        <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-bold block mb-1">
          Concierge Support
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight uppercase">
          Need Help? Talk to CodeFuser
        </h2>
        <p className="text-xs text-neutral-400 mt-1 font-sans">
          You have direct, dedicated access to our lead web developers and design team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT COLUMN: Direct Support Actions */}
        <section className="bg-[#050505] border border-neutral-900 rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Sparkles size={15} className="text-amber-500" />
              Direct Support Channels
            </h3>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-bold">
              Active Concierge
            </span>
          </div>

          <div className="space-y-3 font-sans">
            {/* WhatsApp */}
            <a
              href={getWhatsAppLink(
                `Hi CodeFuser, I am logged into my dashboard for ${project.businessName || "My Business"} and need help with my website project.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-neutral-950 hover:bg-neutral-900 border border-neutral-900 hover:border-amber-500/40 rounded-2xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <span className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors block">
                    Chat on WhatsApp (Fastest)
                  </span>
                  <span className="text-xs text-neutral-400 mt-0.5 block">
                    Direct message with our team leads. Typical response: &lt; 15 mins.
                  </span>
                </div>
              </div>
            </a>

            {/* Email */}
            <a
              href={getComposeEmailLink(
                `Support Request: ${project.businessName || "My Business"}`,
                `Hi CodeFuser Team,\n\nI need support with my website project:\n\nBusiness Name: ${project.businessName}\nProject ID: ${project.id}`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-neutral-950 hover:bg-neutral-900 border border-neutral-900 hover:border-amber-500/40 rounded-2xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Mail size={18} />
                </div>
                <div>
                  <span className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors block">
                    Send Email Inquiry
                  </span>
                  <span className="text-xs text-neutral-400 mt-0.5 block">
                    aicodefuser@gmail.com • Mon-Sat (9 AM - 8 PM IST)
                  </span>
                </div>
              </div>
            </a>
          </div>

          <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-2xl flex items-center gap-3 text-xs text-neutral-400 font-sans">
            <Clock size={16} className="text-amber-500 shrink-0" />
            <span>Support Hours: Monday to Saturday, 9:00 AM – 8:00 PM IST. Emergency launch support available 24/7.</span>
          </div>
        </section>

        {/* RIGHT COLUMN: Frequently Asked Questions */}
        <section className="bg-[#050505] border border-neutral-900 rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <HelpCircle size={15} className="text-neutral-400" />
              Frequently Asked Questions
            </h3>
            <span className="text-[9px] font-mono text-neutral-500 uppercase font-bold">Client Knowledge</span>
          </div>

          <div className="space-y-3 font-sans">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-4 bg-neutral-950 border border-neutral-900 rounded-2xl space-y-1">
                <h4 className="text-xs font-bold text-white leading-snug">{faq.q}</h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
