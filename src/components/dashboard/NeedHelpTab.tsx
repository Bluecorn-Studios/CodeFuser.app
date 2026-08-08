import React from "react";
import { MessageSquare, Mail, Clock, HelpCircle } from "lucide-react";
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
      q: "When will my website draft be ready?",
      a: "Design drafts are ready within 2-3 business days after you submit your business details or domain preference.",
    },
    {
      q: "How do I request changes or edits?",
      a: "Click the WhatsApp button to message us directly. You can request text, photo, or design updates anytime.",
    },
    {
      q: "Can I use my existing domain name?",
      a: "Yes! If you already own a domain (GoDaddy, Namecheap, etc.), enter it in 'My Website' or send us a message.",
    },
    {
      q: "What support is included after launch?",
      a: "We manage hosting, domain connections, and security updates so your website runs smoothly 24/7.",
    },
  ];

  return (
    <div className="space-y-8 py-2">
      {/* SECTION HEADER */}
      <div className="space-y-1">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest block">
          Support
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#EAE5D9] tracking-tight">
          Talk to the CodeFuser Team
        </h1>
        <p className="text-sm text-neutral-300">
          Have questions or need updates? You have direct access to your web design team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN: Contact Channels */}
        <section className="p-6 sm:p-8 bg-neutral-950 border border-neutral-900 rounded-3xl space-y-6">
          <div className="border-b border-neutral-900 pb-4">
            <h2 className="text-base font-bold text-[#EAE5D9]">
              Contact Options
            </h2>
          </div>

          <div className="space-y-4 font-sans">
            {/* WhatsApp */}
            <a
              href={getWhatsAppLink(
                `Hi CodeFuser, I am logged into my dashboard for ${project.businessName || "My Business"} and need help with my website.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-5 bg-black/60 hover:bg-black border border-neutral-900 hover:border-[#EAE5D9]/40 rounded-2xl transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <span className="text-sm font-bold text-[#EAE5D9] group-hover:text-amber-300 transition-colors block">
                    Message Us on WhatsApp (Recommended)
                  </span>
                  <span className="text-xs text-neutral-400 mt-1 block">
                    Chat directly with your project manager. Fast replies within 15 minutes.
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
              className="block p-5 bg-black/60 hover:bg-black border border-neutral-900 hover:border-[#EAE5D9]/40 rounded-2xl transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#EAE5D9] shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <span className="text-sm font-bold text-[#EAE5D9] group-hover:text-amber-300 transition-colors block">
                    Send Us an Email
                  </span>
                  <span className="text-xs text-neutral-400 mt-1 block">
                    aicodefuser@gmail.com • Monday - Saturday (9 AM - 8 PM)
                  </span>
                </div>
              </div>
            </a>
          </div>

          <div className="p-4 bg-black/40 border border-neutral-900 rounded-2xl flex items-center gap-3 text-xs text-neutral-400">
            <Clock size={16} className="text-amber-400 shrink-0" />
            <span>Support hours: Monday to Saturday, 9:00 AM – 8:00 PM IST.</span>
          </div>
        </section>

        {/* RIGHT COLUMN: Frequently Asked Questions */}
        <section className="p-6 sm:p-8 bg-neutral-950 border border-neutral-900 rounded-3xl space-y-6">
          <div className="border-b border-neutral-900 pb-4">
            <h2 className="text-base font-bold text-[#EAE5D9]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4 font-sans">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-4 bg-black/60 border border-neutral-900 rounded-2xl space-y-1.5">
                <h3 className="text-xs font-bold text-[#EAE5D9]">{faq.q}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

