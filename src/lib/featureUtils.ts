export interface FormattedFeature {
  prefix?: string;
  title: string;
  description: string;
}

const FEATURE_DICTIONARY: Record<string, string> = {
  "whatsapp chat": "Customers can message you directly from your website.",
  "whatsapp orders": "Customers can send order details directly via WhatsApp.",
  "whatsapp booking": "Customers can request appointment bookings via WhatsApp.",
  "whatsapp reminder": "Automatically remind customers about upcoming appointments via WhatsApp.",
  "whatsapp enquiry": "Allow property buyers to inquire instantly via WhatsApp.",
  "whatsapp direct inquiry": "Receive instant customer messages directly on your WhatsApp.",
  "click-to-call & whatsapp": "Allow visitors to call or message you with a single tap.",
  "online booking": "Customers can book appointments anytime.",
  "online appointment": "Patients can schedule medical appointments 24/7.",
  "online payments": "Customers can pay securely on your website.",
  "payment gateway": "Accept secure online payments directly on your website.",
  "online ordering": "Customers can view your menu and order online.",
  "photo gallery": "Show your best work to potential customers.",
  "wedding gallery": "Showcase your beautiful wedding photo albums to future clients.",
  "event gallery": "Display photos from recent events and photoshoots clearly.",
  "image gallery": "Organize photos into beautiful albums for visitors.",
  "before & after gallery": "Show transformation results to demonstrate your expertise.",
  "customer reviews": "Display happy customer reviews to build trust.",
  "patient reviews": "Show feedback from satisfied patients to build credibility.",
  "student reviews": "Display success stories and reviews from past students.",
  "review showcase": "Display happy customer reviews prominently to build trust.",
  "google maps": "Help customers find your business location easily.",
  "google maps location": "Help customers find your business location easily.",
  "google search setup": "Help nearby customers discover your business on Google Search.",
  "service list": "Show all your services in one place.",
  "price list": "Let customers see your prices before contacting you.",
  "service price list": "Let customers see your service prices before contacting you.",
  "package pricing": "Display clear pricing packages so clients know what to expect.",
  "appointment calendar": "View and manage all bookings in one place.",
  "admin dashboard": "Manage your website without technical knowledge.",
  "client login": "Give customers their own secure account.",
  "client portal access": "Give customers their own secure login account.",
  "email notifications": "Automatically notify customers about bookings and enquiries.",
  "ai assistant": "Answer customer questions 24/7.",
  "ai chatbot": "Answer customer questions 24/7 automatically.",
  "lead management": "Keep all customer enquiries organized in one place.",
  "crm": "Keep all customer details and enquiries organized in one place.",
  "analytics": "See how many people visit your website.",
  "analytics dashboard": "See how many people visit your website and where they come from.",
  "newsletter": "Collect customer emails for future special offers.",
  "mobile friendly design": "Looks great and loads fast on all mobile phones.",
  "mobile friendly": "Ensure your website loads fast and looks great on mobile.",
  "multi-page website": "Showcase your entire business with clean dedicated pages.",
  "contact form": "Let visitors send messages to your inbox instantly.",
  "business info & hours": "Display your operating hours and contact details clearly.",
  "table booking": "Customers can reserve dining tables directly online.",
  "digital menu": "Display your full food and drink menu with prices.",
  "loyalty program": "Reward repeat customers to keep them coming back.",
  "doctor profiles": "Show doctor qualifications and specialties to build patient trust.",
  "treatment pages": "Explain medical treatments and health procedures clearly.",
  "health packages": "Offer comprehensive health checkup packages to patients.",
  "trial registration": "Let local fitness seekers sign up for free trial passes.",
  "free trial pass": "Let prospective members sign up for a free trial class.",
  "membership plans": "Display flexible monthly and yearly membership options.",
  "trainer profiles": "Highlight certified fitness trainers and their expertise.",
  "workout timetable": "Show weekly class schedules and session times.",
  "class schedule": "Show weekly class schedules and session times clearly.",
  "progress tracker": "Help members track their fitness gains and milestones.",
  "nutrition plans": "Provide healthy diet and meal guidance to members.",
  "gift cards": "Sell digital gift certificates for treatments and services.",
  "membership system": "Offer VIP memberships and recurring client perks.",
  "download photos": "Allow clients to view and download high-resolution photos.",
  "property listings": "Display available homes and properties with photos.",
  "property search": "Let buyers filter properties by price and location.",
  "site visit booking": "Allow serious buyers to schedule on-site property tours.",
  "schedule site visit": "Allow serious property buyers to schedule on-site tours.",
  "emi calculator": "Help buyers calculate monthly home loan installments easily.",
  "virtual tour": "Show interactive 360-degree walkthroughs of properties.",
  "course list": "Display all training courses and educational programs.",
  "demo class booking": "Let prospective students register for a free demo session.",
  "free demo class": "Let prospective students sign up for a free demo session.",
  "batch timings": "Show upcoming batch schedules and seat availability.",
  "download brochure": "Let visitors download complete course syllabus details.",
  "online admission": "Allow students to submit admission applications online.",
  "special offers": "Highlight seasonal discounts and special promotions.",
  "automated follow-ups": "Automatically send WhatsApp and email reminders to save time.",
  "priority support": "Get fast direct support whenever you need assistance.",
  "services showcase": "Display all your main business services clearly to visitors.",
  "emergency call": "Let urgent patients tap to call your emergency helpline directly."
};

/**
 * Parses any feature string into title + description format following the strict rule:
 * Feature Name
 * One short sentence explaining exactly what it allows customers or the business owner to do.
 */
export function parseFeature(raw: string): FormattedFeature {
  if (!raw) {
    return { title: "Custom Feature", description: "Enhances your website with tailored capability." };
  }

  let text = raw.trim();
  let prefix: string | undefined;

  // Extract ⭐ or ✓
  if (text.startsWith("⭐")) {
    prefix = "⭐";
    text = text.replace(/^⭐\s*/, "");
  } else if (text.startsWith("✓")) {
    prefix = "✓";
    text = text.replace(/^✓\s*/, "");
  }

  // Handle format "Description (Feature Name)" e.g. "Look professional with a modern website (Multi-Page Website)"
  const parenMatch = text.match(/^(.*?)\s*\((.*?)\)$/);
  if (parenMatch) {
    const descPart = parenMatch[1].trim();
    const namePart = parenMatch[2].trim();
    return {
      prefix,
      title: namePart,
      description: descPart.endsWith(".") ? descPart : descPart + "."
    };
  }

  // Handle format "Feature Name — Description" or "Feature Name: Description"
  const sepMatch = text.match(/^([^:—-]+)\s*[:—-]\s*(.+)$/);
  if (sepMatch) {
    const title = sepMatch[1].trim();
    let description = sepMatch[2].trim();
    if (!description.endsWith(".")) description += ".";
    return { prefix, title, description };
  }

  // Lookup in dictionary
  const key = text.toLowerCase();
  if (FEATURE_DICTIONARY[key]) {
    return { prefix, title: text, description: FEATURE_DICTIONARY[key] };
  }

  // Check partial key match
  for (const [dictKey, desc] of Object.entries(FEATURE_DICTIONARY)) {
    if (key.includes(dictKey) || dictKey.includes(key)) {
      return { prefix, title: text, description: desc };
    }
  }

  // Default fallback description (8-15 words plain English)
  return {
    prefix,
    title: text,
    description: `Helps your business showcase ${text.toLowerCase()} directly to local customers.`
  };
}

/**
 * Ensures feature strings generated or stored in plain string arrays are formatted as:
 * "Feature Name — Description"
 */
export function formatFeatureString(raw: string): string {
  const { prefix, title, description } = parseFeature(raw);
  const p = prefix ? `${prefix} ` : "";
  return `${p}${title} — ${description}`;
}
