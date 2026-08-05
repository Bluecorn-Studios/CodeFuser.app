import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { parseFeature, splitFeaturesForCards } from '../lib/featureUtils';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Building, 
  Target, 
  Shield, 
  ShieldCheck,
  Zap,
  Wrench,
  Globe, 
  Palette, 
  FileText, 
  Send, 
  MessageSquare, 
  Lock, 
  User, 
  Mail,
  Calendar,
  Layers,
  HelpCircle,
  Database,
  ChevronDown,
  Search,
  X,
  AlertTriangle,
  RefreshCw,
  Plus,
  LayoutDashboard,
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Star
} from 'lucide-react';
import { useAppRouter, b as getMailtoLink, w as getWhatsAppLink, cn } from '../components/Reveal';
import { PagePath, PricingPlan } from '../types';
import { pricingPlans } from '../components/Pricing';
import { getAuthUser, getAuthToken, setAuthSession, clearAuthSession } from '../utils/auth';
import { getInitialPlusPackagePrice } from '../utils/pricingUtils';
import { supabase } from '../lib/supabase';
import { safeLocalStorage } from '../utils/safeStorage';
import { PaymentSimulationPanel } from '../components/PaymentSimulationPanel';

interface StartProjectData {
  businessName: string;
  ownerName: string;
  whatsapp: string;
  email: string;
  industry: string;
  customIndustry: string;
  goal: string;
  customGoal: string;
  packageId: string;
  ownership: 'full' | 'managed';
  hasDomain: 'yes' | 'no' | 'help';
  hasLogo: 'yes' | 'no' | 'help';
  contentReady: 'yes' | 'no_help' | 'progress';
  aiPrompt?: string;
}

interface Country {
  name: string;
  code: string;
  flag: string;
  example: string;
  validationRule: {
    pattern: RegExp;
    desc: string;
    maxLength: number;
  };
}

const COUNTRIES: Country[] = [
  {
    name: "India",
    code: "+91",
    flag: "🇮🇳",
    example: "98765 43210",
    validationRule: { pattern: /^\d{10}$/, desc: "must be exactly 10 digits", maxLength: 10 }
  },
  {
    name: "United States",
    code: "+1",
    flag: "🇺🇸",
    example: "201 555 0123",
    validationRule: { pattern: /^\d{10}$/, desc: "must be exactly 10 digits", maxLength: 10 }
  },
  {
    name: "United Kingdom",
    code: "+44",
    flag: "🇬🇧",
    example: "7911 123456",
    validationRule: { pattern: /^\d{10}$/, desc: "must be exactly 10 digits", maxLength: 10 }
  },
  {
    name: "United Arab Emirates",
    code: "+971",
    flag: "🇦🇪",
    example: "50 123 4567",
    validationRule: { pattern: /^\d{9}$/, desc: "must be exactly 9 digits", maxLength: 9 }
  },
  {
    name: "Singapore",
    code: "+65",
    flag: "🇸🇬",
    example: "8123 4567",
    validationRule: { pattern: /^\d{8}$/, desc: "must be exactly 8 digits", maxLength: 8 }
  },
  {
    name: "Saudi Arabia",
    code: "+966",
    flag: "🇸🇦",
    example: "50 123 4567",
    validationRule: { pattern: /^\d{9}$/, desc: "must be exactly 9 digits", maxLength: 9 }
  },
  {
    name: "Qatar",
    code: "+974",
    flag: "🇶🇦",
    example: "5555 1234",
    validationRule: { pattern: /^\d{8}$/, desc: "must be exactly 8 digits", maxLength: 8 }
  },
  {
    name: "Oman",
    code: "+968",
    flag: "🇴🇲",
    example: "9123 4567",
    validationRule: { pattern: /^\d{8}$/, desc: "must be exactly 8 digits", maxLength: 8 }
  },
  {
    name: "Kuwait",
    code: "+965",
    flag: "🇰🇼",
    example: "5123 4567",
    validationRule: { pattern: /^\d{8}$/, desc: "must be exactly 8 digits", maxLength: 8 }
  },
  {
    name: "Bahrain",
    code: "+973",
    flag: "🇧🇭",
    example: "3123 4567",
    validationRule: { pattern: /^\d{8}$/, desc: "must be exactly 8 digits", maxLength: 8 }
  },
  {
    name: "Australia",
    code: "+61",
    flag: "🇦🇺",
    example: "412 345 678",
    validationRule: { pattern: /^\d{9}$/, desc: "must be exactly 9 digits", maxLength: 9 }
  },
  {
    name: "Canada",
    code: "+1",
    flag: "🇨🇦",
    example: "613 555 0192",
    validationRule: { pattern: /^\d{10}$/, desc: "must be exactly 10 digits", maxLength: 10 }
  },
  {
    name: "Germany",
    code: "+49",
    flag: "🇩🇪",
    example: "170 1234567",
    validationRule: { pattern: /^\d{10,11}$/, desc: "must be 10 to 11 digits", maxLength: 11 }
  },
  {
    name: "France",
    code: "+33",
    flag: "🇫🇷",
    example: "612 34 56 78",
    validationRule: { pattern: /^\d{9,10}$/, desc: "must be 9 to 10 digits", maxLength: 10 }
  },
  {
    name: "Malaysia",
    code: "+60",
    flag: "🇲🇾",
    example: "12 345 6789",
    validationRule: { pattern: /^\d{9,10}$/, desc: "must be 9 to 10 digits", maxLength: 10 }
  },
  {
    name: "New Zealand",
    code: "+64",
    flag: "🇳🇿",
    example: "21 123 4567",
    validationRule: { pattern: /^\d{8,10}$/, desc: "must be 8 to 10 digits", maxLength: 10 }
  },
  {
    name: "South Africa",
    code: "+27",
    flag: "🇿🇦",
    example: "82 123 4567",
    validationRule: { pattern: /^\d{9}$/, desc: "must be exactly 9 digits", maxLength: 9 }
  },
  {
    name: "Philippines",
    code: "+63",
    flag: "🇵🇭",
    example: "912 345 6789",
    validationRule: { pattern: /^\d{10}$/, desc: "must be exactly 10 digits", maxLength: 10 }
  }
];

const INDUSTRIES = [
  { id: 'retail', label: 'Retail / Store', icon: Building },
  { id: 'services', label: 'Local Services', icon: Shield },
  { id: 'food', label: 'Restaurant / Cafe', icon: Sparkles },
  { id: 'professional', label: 'Professional / Agency', icon: Layers },
  { id: 'medical', label: 'Wellness / Clinic', icon: HeartLink },
  { id: 'other', label: 'Other Business Type', icon: HelpCircle },
];

// Fallback HeartLink icon
function HeartLink({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

const GOALS = [
  { id: 'leads', label: 'Get new customers & inquiries' },
  { id: 'portfolio', label: 'Showcase my work, menu, or services' },
  { id: 'products', label: 'Sell products online' },
  { id: 'bookings', label: 'Take bookings & appointments' },
  { id: 'profile', label: 'Establish a professional online presence' },
];

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Highly optimized input component wrapped in React.memo with local state buffering to prevent parent re-renders while typing (Part A2 - #26)
interface PerformanceInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onActualChange: (val: string) => void;
  sanitize?: (val: string) => string;
}

const PerformanceInput = React.memo<PerformanceInputProps>(({ value, onActualChange, sanitize, ...props }) => {
  const [localVal, setLocalVal] = React.useState(value);

  React.useEffect(() => {
    setLocalVal(value);
  }, [value]);

  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newVal = e.target.value;
    if (sanitize) {
      newVal = sanitize(newVal);
    }
    setLocalVal(newVal);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      onActualChange(newVal);
    }, 150);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    const finalVal = sanitize ? sanitize(localVal) : localVal;
    onActualChange(finalVal);
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <input
      {...props}
      value={localVal}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
});

PerformanceInput.displayName = 'PerformanceInput';

// Highly optimized textarea component wrapped in React.memo with local state buffering to prevent parent re-renders while typing (Part A2 - #26)
interface PerformanceTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onActualChange: (val: string) => void;
}

const PerformanceTextArea = React.memo<PerformanceTextAreaProps>(({ value, onActualChange, ...props }) => {
  const [localVal, setLocalVal] = React.useState(value);

  React.useEffect(() => {
    setLocalVal(value);
  }, [value]);

  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setLocalVal(newVal);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      onActualChange(newVal);
    }, 150);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onActualChange(localVal);
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <textarea
      {...props}
      value={localVal}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
});

PerformanceTextArea.displayName = 'PerformanceTextArea';

// Self-contained isolated auto-save indicator component to avoid cascading parent re-renders (Part A2 - #30)
const DraftSavedIndicator: React.FC = () => {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    const handleSave = () => {
      setVisible(true);
      clearTimeout(timer);
      timer = setTimeout(() => {
        setVisible(false);
      }, 2000);
    };

    window.addEventListener('fuser-draft-saved', handleSave);
    return () => {
      window.removeEventListener('fuser-draft-saved', handleSave);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          initial={{ opacity: 0, y: -8, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.92 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 tracking-wider uppercase backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
        >
          <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
          Draft Saved
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return "recently";
  try {
    const past = new Date(dateStr).getTime();
    if (isNaN(past)) return "recently";
    const now = Date.now();
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 5) return "just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return "yesterday";
    if (diffDays < 30) return `${diffDays} days ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  } catch {
    return "recently";
  }
}

function getDraftAgeDays(dateStr?: string): number {
  if (!dateStr) return 0;
  try {
    const past = new Date(dateStr).getTime();
    if (isNaN(past)) return 0;
    return Math.floor((Date.now() - past) / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

export const StartProjectPage: React.FC = () => {
  const { navigate, currentPath } = useAppRouter();
  const backgroundStars = React.useMemo(() => {
    return Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 1.5 + 0.8,
      duration: Math.random() * 6 + 4,
      delay: Math.random() * 5,
    }));
  }, []);
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  // Production Validation & Smart Match Notice States
  const [isValidatingStep1, setIsValidatingStep1] = useState(false);
  const [step1Notice, setStep1Notice] = useState<{
    noticeType: string;
    message: string;
    existingCount?: number;
    draftProject?: any;
  } | null>(null);

  const handleLogoutAndSwitch = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Error during logout:", err);
    }
    clearAuthSession();
    setStep1Notice(null);
    window.location.href = "/login";
  };

  // Intelligent Package Recommendation states
  const [recommendationCards, setRecommendationCards] = useState<any[] | null>(null);
  const [tempFetchedCards, setTempFetchedCards] = useState<any[] | null>(null);
  const [aiSummary, setAiSummary] = useState<any | null>(null);
  const [preferredContactTime, setPreferredContactTime] = useState<'morning' | 'afternoon' | 'evening' | 'anytime'>('anytime');
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [loadingFinished, setLoadingFinished] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string>('current');

  // Stages: 'form' | 'ai_loading' | 'recommendations' | 'workspace_signup' | 'payment' | 'calendly' | 'asset_center' | 'success'
  const [onboardingStage, setOnboardingStage] = useState<'form' | 'ai_loading' | 'recommendations' | 'workspace_signup' | 'payment' | 'calendly' | 'asset_center' | 'success'>('form');
  const [selectedPaymentTerm, setSelectedPaymentTerm] = useState<'milestone' | 'upfront'>('milestone');

  // Secure Client Workspace inline auth states
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [showAuthConfirmPassword, setShowAuthConfirmPassword] = useState(false);
  const [authFullName, setAuthFullName] = useState('');
  const [authBusinessName, setAuthBusinessName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const [, setPriceTick] = useState(0);
  useEffect(() => {
    const handlePriceChange = () => setPriceTick(t => t + 1);
    window.addEventListener('codefuser_price_change', handlePriceChange);
    return () => window.removeEventListener('codefuser_price_change', handlePriceChange);
  }, []);

  useEffect(() => {
    if (onboardingStage === 'workspace_signup') {
      setAuthEmail(formData.email || '');
      setAuthFullName(formData.ownerName || '');
      setAuthBusinessName(formData.businessName || '');
      setAuthError(null);
      setAuthSuccess(null);
    }
  }, [onboardingStage]);

  const handleInlineAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!authEmail || !authPassword) {
      setAuthError("Please fill in all requested fields.");
      return;
    }

    if (authPassword.length < 6) {
      setAuthError("Password must be at least 6 characters long.");
      return;
    }

    if (authMode === 'signup') {
      if (!authFullName) {
        setAuthError("Full Name is required.");
        return;
      }
      if (!authBusinessName) {
        setAuthError("Business Name is required.");
        return;
      }
      if (authPassword !== authConfirmPassword) {
        setAuthError("Passwords do not match.");
        return;
      }
    }

    setAuthLoading(true);

    try {
      const endpoint = authMode === 'signup' ? "/api/auth/signup" : "/api/auth/login";
      const payload: any = { email: authEmail, password: authPassword };
      
      if (authMode === 'signup') {
        payload.fullName = authFullName;
        payload.businessName = authBusinessName;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Authentication failed. Please check details.");
      }

      const userObj = {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.fullName || authFullName || data.user.user_metadata?.full_name,
        businessName: data.user.businessName || authBusinessName || data.user.user_metadata?.business_name,
        role: data.user.role || "client",
        user_metadata: data.user.user_metadata || {
          full_name: authFullName,
          business_name: authBusinessName
        }
      };
      
      const sessionToken = data.session?.access_token;
      if (!sessionToken) {
        throw new Error("Authentication succeeded but no active session was returned. Please try signing in.");
      }
      setAuthSession(userObj, sessionToken);

      // Sync formData with registered/logged in info
      setFormData(prev => ({
        ...prev,
        email: authEmail,
        ownerName: userObj.fullName || prev.ownerName,
        businessName: userObj.businessName || prev.businessName
      }));

      // Trigger the backend's automatic lazy-migration/linking by requesting a protected resource
      const projId = createdProjectId || safeLocalStorage.getItem('fuser_client_project_id');
      if (projId) {
        await fetch(`/api/projects/${projId}/extra`, {
          headers: {
            "Authorization": `Bearer ${sessionToken}`
          }
        });
      }

      setAuthSuccess(authMode === 'signup' ? "Client Workspace created successfully!" : "Logged in successfully!");
      
      setTimeout(() => {
        setOnboardingStage('payment');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1500);

    } catch (err: any) {
      setAuthError(err.message || "Authentication aborted.");
    } finally {
      setAuthLoading(false);
    }
  };
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentErrorMsg, setPaymentErrorMsg] = useState<string | null>(null);
  const [showSandboxFallback, setShowSandboxFallback] = useState(false);

  const finalSelCardForPayment = (recommendationCards)
    ? (recommendationCards.find(c => c.id === selectedCardId) || { name: 'Fusion Baseline', price: '₹19,999' })
    : { name: 'Fusion Baseline', price: '₹19,999' };
  const numericPriceForPayment = parseInt((finalSelCardForPayment.price || "").replace(/[^\d]/g, ""), 10) || 19999;
  const partPayment = Math.round(numericPriceForPayment * 0.5);
  const discountVal = Math.round(numericPriceForPayment * 0.1);
  const upfrontTotal = Math.round(numericPriceForPayment * 0.9);

  useEffect(() => {
    setMaxStep(prev => Math.max(prev, step));
  }, [step]);

  // Premium Progressive AI Analysis state coordinator
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (onboardingStage === 'ai_loading') {
      setActiveStepIndex(0);
      setLoadingFinished(false);

      // 1.5 seconds cinematic abstract animation transition
      timer = setTimeout(() => {
        setLoadingFinished(true);
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [onboardingStage]);

  // Once steps have reached completion AND cards are loaded, complete the loader and transition
  useEffect(() => {
    if (onboardingStage === 'ai_loading' && loadingFinished && tempFetchedCards) {
      setRecommendationCards(tempFetchedCards);
      setOnboardingStage('recommendations');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [onboardingStage, loadingFinished, tempFetchedCards]);

  // Form State
  const [formData, setFormData] = useState<StartProjectData>({
    businessName: '',
    ownerName: '',
    whatsapp: '',
    email: '',
    industry: '',
    customIndustry: '',
    goal: '',
    customGoal: '',
    packageId: 'growth', // default package: Fusion
    ownership: 'managed',
    hasDomain: 'help',
    hasLogo: 'help',
    contentReady: 'no_help',
    aiPrompt: ''
  });

  const [isPlanLocked, setIsPlanLocked] = useState(false);
  const [triggerValidation, setTriggerValidation] = useState(false);

  // International Country phone selection states
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [localPhone, setLocalPhone] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  // Sync state cleanly into the overarching formData.whatsapp field (which preserving API boundary)
  useEffect(() => {
    const cleanNum = localPhone.trim();
    if (cleanNum) {
      setFormData(prev => ({
        ...prev,
        whatsapp: `${selectedCountry.code} ${cleanNum}`
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        whatsapp: ''
      }));
    }
  }, [localPhone, selectedCountry]);

  // Restore state cleanly on component mount if a pre-existing value is there
  useEffect(() => {
    if (formData.whatsapp) {
      const parts = formData.whatsapp.trim().split(' ');
      if (parts.length >= 2) {
        const potentialCode = parts[0];
        const match = COUNTRIES.find(c => c.code === potentialCode);
        if (match) {
          setSelectedCountry(match);
          setLocalPhone(parts.slice(1).join(''));
          return;
        }
      }
      const matchStart = COUNTRIES.find(c => formData.whatsapp.startsWith(c.code));
      if (matchStart) {
        setSelectedCountry(matchStart);
        setLocalPhone(formData.whatsapp.slice(matchStart.code.length).replace(/\s+/g, ''));
        return;
      }
      setLocalPhone(formData.whatsapp);
    }
  }, []);

  // Save project draft automatically to Supabase as single source of truth
  const saveDraftToSupabase = useCallback(async (extraData?: any) => {
    try {
      const authUser = getAuthUser();
      const payload = {
        projectId: createdProjectId || safeLocalStorage.getItem('fuser_client_project_id') || undefined,
        userId: authUser?.id || undefined,
        ownerName: formData.ownerName,
        businessName: formData.businessName,
        email: formData.email,
        whatsapp: formData.whatsapp,
        packageId: formData.packageId,
        ownership: formData.ownership,
        industry: formData.industry,
        customIndustry: formData.customIndustry,
        goal: formData.goal,
        customGoal: formData.customGoal,
        hasDomain: formData.hasDomain,
        hasLogo: formData.hasLogo,
        contentReady: formData.contentReady,
        aiPrompt: formData.aiPrompt,
        currentStep: step,
        onboardingStage: onboardingStage,
        recommendationCards: recommendationCards,
        aiSummary: aiSummary,
        selectedCardId: selectedCardId,
        selectedPaymentTerm: selectedPaymentTerm,
        localPhone: localPhone,
        selectedCountryCode: selectedCountry.code,
        ...(extraData || {})
      };

      const res = await fetch("/api/projects/save-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getAuthToken() || ""}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.project?.id) {
          setCreatedProjectId(data.project.id);
          safeLocalStorage.setItem('fuser_client_project_id', data.project.id);
        }
        window.dispatchEvent(new CustomEvent('fuser-draft-saved'));
      }
    } catch (err) {
      console.warn("Auto-save to Supabase error:", err);
    }
  }, [createdProjectId, formData, step, onboardingStage, recommendationCards, aiSummary, selectedCardId, selectedPaymentTerm, localPhone, selectedCountry]);

  // Restore active project state from Supabase on mount
  useEffect(() => {
    const restoreFromSupabase = async () => {
      const authUser = getAuthUser();
      if (authUser) {
        setFormData(prev => ({
          ...prev,
          email: authUser.email || prev.email,
          ownerName: authUser.user_metadata?.full_name || authUser.fullName || prev.ownerName || "",
          businessName: authUser.user_metadata?.business_name || authUser.businessName || prev.businessName || ""
        }));
      }

      try {
        const token = getAuthToken();
        const emailVal = authUser?.email || formData.email;
        const emailParam = emailVal ? `?email=${encodeURIComponent(emailVal)}` : '';
        const userParam = authUser?.id ? `${emailParam ? '&' : '?'}userId=${authUser.id}` : '';
        const url = `/api/projects/active${emailParam || userParam ? `${emailParam}${userParam.replace('?', '&')}` : ''}`;

        const res = await fetch(url, {
          headers: token ? { "Authorization": `Bearer ${token}` } : {}
        });

        if (res.ok) {
          const data = await res.json();
          const activeProj = data.project;

          if (activeProj) {
            setCreatedProjectId(activeProj.id);
            safeLocalStorage.setItem('fuser_client_project_id', activeProj.id);

            setFormData(prev => ({
              ...prev,
              businessName: activeProj.businessName || prev.businessName,
              ownerName: activeProj.clientName || prev.ownerName,
              email: activeProj.email || prev.email,
              whatsapp: activeProj.whatsapp || prev.whatsapp,
              packageId: activeProj.selectedPackage || prev.packageId,
              ownership: activeProj.ownershipChoice || prev.ownership,
              industry: activeProj.industry || prev.industry,
              customIndustry: activeProj.customIndustry || prev.customIndustry,
              goal: activeProj.goal || prev.goal,
              customGoal: activeProj.customGoal || prev.customGoal,
              hasDomain: activeProj.hasDomain || prev.hasDomain,
              hasLogo: activeProj.hasLogo || prev.hasLogo,
              contentReady: activeProj.contentReady || prev.contentReady,
              aiPrompt: activeProj.aiPrompt || activeProj.quote?.aiPrompt || prev.aiPrompt
            }));

            const quote = activeProj.quote || {};

            if (quote.localPhone) {
              setLocalPhone(quote.localPhone);
            }
            if (quote.selectedCountryCode) {
              const match = COUNTRIES.find(c => c.code === quote.selectedCountryCode);
              if (match) setSelectedCountry(match);
            }
            if (quote.currentStep) {
              setStep(quote.currentStep);
            }
            if (quote.onboardingStage) {
              setOnboardingStage(quote.onboardingStage);
            }
            if (quote.selectedCardId) {
              setSelectedCardId(quote.selectedCardId);
            }
            if (quote.selectedPaymentTerm) {
              setSelectedPaymentTerm(quote.selectedPaymentTerm);
            }

            // Restore FROZEN AI recommendations directly from Supabase
            if (quote.recommendationCards && Array.isArray(quote.recommendationCards) && quote.recommendationCards.length > 0) {
              const formattedCards = splitFeaturesForCards(quote.recommendationCards, quote.aiSummary?.ourRecommendation?.recommendedFeatures);
              setRecommendationCards(formattedCards);
              setTempFetchedCards(formattedCards);
              if (quote.aiSummary) {
                setAiSummary(quote.aiSummary);
              }
              setIsSubmitted(true);
              setLoadingFinished(true);
            }
            return;
          }
        }
      } catch (err) {
        console.warn("Supabase draft restoration query failed:", err);
      }

      // Fallback local draft restoration if offline
      const savedDraft = safeLocalStorage.getItem("codefuser_start_project_draft");
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (parsed.formData) {
            setFormData(prev => ({ ...prev, ...parsed.formData }));
          }
          if (parsed.step) {
            setStep(parsed.step);
          }
          if (parsed.localPhone) {
            setLocalPhone(parsed.localPhone);
          }
          if (parsed.selectedCountryCode) {
            const match = COUNTRIES.find(c => c.code === parsed.selectedCountryCode);
            if (match) {
              setSelectedCountry(match);
            }
          }
        } catch (err) {
          console.warn("Fuser draft restoration failed:", err);
        }
      }
    };

    restoreFromSupabase();
  }, []);

  // Save changes automatically to Supabase with 800ms debouncing
  useEffect(() => {
    if (formData.businessName || formData.ownerName || localPhone || step > 1 || onboardingStage !== 'form') {
      const saveTimer = setTimeout(() => {
        saveDraftToSupabase();
      }, 800);
      return () => clearTimeout(saveTimer);
    }
  }, [formData, step, onboardingStage, selectedCardId, selectedPaymentTerm, localPhone, selectedCountry, recommendationCards, aiSummary, saveDraftToSupabase]);

  // Memoized Validation Error Helper
  const validationErrors = React.useMemo(() => {
    const errs: Record<string, string> = {};
    
    // Business Name
    if (!formData.businessName.trim()) {
      errs.businessName = "Business Name is required.";
    } else if (formData.businessName.trim().length < 3) {
      errs.businessName = "Business Name must be at least 3 characters.";
    }

    // Representative Name
    const cleanOwnerName = formData.ownerName.trim();
    if (!cleanOwnerName) {
      errs.ownerName = "Representative Name is required.";
    } else if (cleanOwnerName.length < 2) {
      errs.ownerName = "Representative Name must be at least 2 characters.";
    } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/.test(cleanOwnerName)) {
      errs.ownerName = "Name can only contain alphabetic letters, spaces, hyphens, and apostrophes.";
    }

    // WhatsApp: Required, digits only, country expected digit count
    const cleanWhatsapp = localPhone.trim();
    if (!cleanWhatsapp) {
      errs.whatsapp = "WhatsApp number is required.";
    } else if (!/^\d+$/.test(cleanWhatsapp)) {
      errs.whatsapp = "WhatsApp number must contain digits only.";
    } else if (!selectedCountry.validationRule.pattern.test(cleanWhatsapp)) {
      errs.whatsapp = `WhatsApp number ${selectedCountry.validationRule.desc}.`;
    }

    // Email: Must be a valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = formData.email.trim();
    if (!cleanEmail) {
      errs.email = "Business Email is required.";
    } else if (!emailRegex.test(cleanEmail)) {
      errs.email = "Please enter a valid email format (e.g. name@domain.com).";
    }

    return errs;
  }, [formData.businessName, formData.ownerName, formData.email, localPhone, selectedCountry]);

  // Memoized Country Search Filter
  const filteredCountries = React.useMemo(() => {
    const query = countrySearch.toLowerCase();
    return COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.code.includes(countrySearch)
    );
  }, [countrySearch]);

  // Reset scroll layout to top on mount to ensure every onboarding session begins at the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle Query Param for Pre-filled Package
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get('plan');
    if (planParam) {
      const match = pricingPlans.find(p => p.id === planParam || p.name.toLowerCase() === planParam.toLowerCase());
      if (match) {
        setFormData(prev => ({ ...prev, packageId: match.id }));
        setIsPlanLocked(true);
      }
    }
  }, [currentPath]);

  const selectedPlan = pricingPlans.find(p => p.id === formData.packageId) || pricingPlans[1];

  const handleChipClick = (category: string) => {
    let template = '';
    switch (category) {
      case 'Design Style':
        template = '### Design Style:\n- [e.g. Minimalist, bold, luxury black theme, generous white margins...]\n\n';
        break;
      case 'Competitors':
        template = '### Competitors:\n- [e.g. competitor-brand.com, what they lack vs. what you want...]\n\n';
        break;
      case 'Target Audience':
        template = '### Target Audience:\n- [e.g. High-net-worth clients, young families, local community...]\n\n';
        break;
      case 'Colors':
        template = '### Preferred Colors:\n- [e.g. Gold & Matte Black, Charcoal & White, Emerald & Sand...]\n\n';
        break;
      case 'Features':
        template = '### Key Features Wishlist:\n- [e.g. Live booking calendar, seamless WhatsApp floating contact...]\n\n';
        break;
      case 'References':
        template = '### Reference Sites We Like:\n- [e.g. Apple.com, Stripe.com clean aesthetics...]\n\n';
        break;
      default:
        break;
    }
    
    setFormData(prev => ({
      ...prev,
      aiPrompt: (prev.aiPrompt || '') + template
    }));
  };

  const toggleSuggestionChip = (chipText: string) => {
    const currentPrompt = formData.aiPrompt || '';
    const trimmedChipText = chipText.trim();
    
    if (currentPrompt.includes(trimmedChipText)) {
      // It is already in the prompt; remove it
      let newPrompt = currentPrompt;
      // Replace with exact chip text (with trailing \n)
      newPrompt = newPrompt.replace(chipText, '');
      // If still present due to manual editing or variations, replace the trimmed text
      newPrompt = newPrompt.replace(trimmedChipText, '');
      
      // Clean up multiple sequential newlines and extra spacing
      newPrompt = newPrompt.replace(/\n\s*\n/g, '\n').trim();
      
      setFormData(prev => ({
        ...prev,
        aiPrompt: newPrompt
      }));
    } else {
      // Add the text cleanly, ensuring no duplicates can be generated
      const separator = currentPrompt.trim() ? '\n' : '';
      setFormData(prev => ({
        ...prev,
        aiPrompt: currentPrompt.trim() + separator + chipText
      }));
    }
  };

  const updateField = (field: keyof StartProjectData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    // Basic validation
    if (step === 1) {
      setTriggerValidation(true);
      if (Object.keys(validationErrors).length > 0) {
        return; // Prevent progression
      }

      setIsValidatingStep1(true);
      // If a notice is already visible and user clicks Next again, dismiss notice and allow progression to Step 2
      if (step1Notice) {
        setStep1Notice(null);
        setIsValidatingStep1(false);
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      try {
        const response = await fetch("/api/projects/validate-step1", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: formData.email,
            whatsapp: formData.whatsapp,
            userId: getAuthUser()?.id || "",
            currentProjectId: createdProjectId || safeLocalStorage.getItem('fuser_client_project_id') || ""
          })
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.hasMatch && resData.noticeType) {
            setStep1Notice({
              noticeType: resData.noticeType,
              message: resData.message,
              existingCount: resData.existingCount,
              draftProject: resData.draftProject
            });
            setIsValidatingStep1(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return; // Show actionable choices on Step 1
          }
        }
      } catch (err) {
        console.error("Step 1 validation error:", err);
      } finally {
        setIsValidatingStep1(false);
      }
    }
    if (step === 2) {
      if (!formData.customIndustry.trim()) {
        alert('Please specify what kind of business you run.');
        return;
      }
      if (!formData.goal) {
        alert('Please select what you would like your website to help you achieve.');
        return;
      }
    }

    setStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate request clicks

    // Validate required contact details dynamically
    const errors = validationErrors;
    if (Object.keys(errors).length > 0) {
      setStep(1);
      setTriggerValidation(true);
      setSubmitError("Please correct the validation errors on Step 1 before submitting the blueprint.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      console.log("Transmitting proposal packet to database system...");
      const authUser = getAuthUser();
      const payload = {
        ...formData,
        userId: authUser?.id || ""
      };

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getAuthToken() || ""}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const resJson = await response.json();
      const savedProject = resJson.data;
      if (savedProject && savedProject.id) {
        setCreatedProjectId(savedProject.id);
      }

      // Clear automatic draft persistence (Part 1 requirement)
      safeLocalStorage.removeItem("codefuser_start_project_draft");

      // Save submission locally for future dashboard lookup & offline redundancy
      const savedRequests = JSON.parse(safeLocalStorage.getItem('codefuser_requests') || '[]');
      const newRequest = {
        ...formData,
        id: savedProject?.id || `REQ-${Date.now()}`,
        timestamp: savedProject?.timestamp || new Date().toISOString(),
        status: savedProject?.status || 'Assets Pending'
      };
      savedRequests.push(newRequest);
      safeLocalStorage.setItem('codefuser_requests', JSON.stringify(savedRequests));
      safeLocalStorage.setItem('codefuser_current_project', JSON.stringify(newRequest));
      safeLocalStorage.setItem('fuser_client_project_id', newRequest.id);

      // 1. Transition into full AI Loading screen immediately
      setOnboardingStage('ai_loading');
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // If recommendations are ALREADY frozen in Supabase, preserve them completely
      if (recommendationCards && recommendationCards.length > 0) {
        setTempFetchedCards(recommendationCards);
        setIsSubmitting(false);
        saveDraftToSupabase({ onboardingStage: 'recommendations' });
        return;
      }

      // 2. Load intelligent package recommendations if not generated yet
      setLoadingRecommendations(true);
      setRecommendationError(null);
      
      let fetchedCards = null;

      try {
        const recResponse = await fetch("/api/start-project/package-upgrade-options", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            packageId: formData.packageId,
            businessName: formData.businessName,
            ownerName: formData.ownerName,
            industry: formData.industry === 'other' ? formData.customIndustry : formData.industry,
            goal: formData.goal === 'other' ? formData.customGoal : formData.goal,
            aiPrompt: formData.aiPrompt
          })
        });
        if (recResponse.ok) {
          const contentType = recResponse.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const recData = await recResponse.json();
            if (recData && recData.options && recData.options.length === 2) {
              fetchedCards = recData.options;
              if (recData.summary) {
                setAiSummary(recData.summary);
              }
            } else {
              throw new Error("Incorrect cards count in JSON response");
            }
          } else {
            throw new Error("Received non-JSON content from recommendation API");
          }
        } else {
          throw new Error(`HTTP failure loading recommendations: Status ${recResponse.status}`);
        }
      } catch (recErr) {
        console.error("Local fallback used due to recommendation fetch issue:", recErr);
        // Direct local frontend fallback in case backend is down or errors
        const fallbackOptions = getOnboardingFallbackUpgrades(
          formData.packageId, 
          formData.businessName, 
          formData.ownerName, 
          formData.industry === 'other' ? formData.customIndustry : formData.industry, 
          formData.goal === 'other' ? formData.customGoal : formData.goal
        );
        fetchedCards = fallbackOptions;

        const fallbackSummary = getOnboardingFallbackSummary(
          formData.packageId,
          formData.businessName,
          formData.industry === 'other' ? formData.customIndustry : formData.industry,
          formData.goal === 'other' ? formData.customGoal : formData.goal,
          formData.aiPrompt
        );
        setAiSummary(fallbackSummary);
      }

      if (fetchedCards) {
        const splitCards = splitFeaturesForCards(fetchedCards, aiSummary?.ourRecommendation?.recommendedFeatures);
        const processedCards = splitCards.map((c: any) => {
          if (c.id !== 'current') {
            const initialPrice = getInitialPlusPackagePrice(formData.packageId, c.price);
            return { ...c, price: initialPrice };
          }
          return c;
        });
        setTempFetchedCards(processedCards);
        setRecommendationCards(processedCards);
        // Save and freeze generated AI recommendations into Supabase
        saveDraftToSupabase({
          recommendationCards: processedCards,
          aiSummary: aiSummary,
          onboardingStage: 'recommendations'
        });
      }
      setLoadingRecommendations(false);

    } catch (err: any) {
      console.error("Submission failed:", err);
      // Friendly retry message, and never lose the client's entered data.
      setSubmitError(err.message || "Failed to establish database transmission. Please check your network and retry.");
      setIsSubmitting(false);
      setOnboardingStage('form');
    }
  };

  // Pre-filled custom mailto link after onboarding submission
  const getPrefilledComposeMail = (cardName?: string, cardPrice?: string) => {
    const activeIndustry = formData.industry === 'other' ? formData.customIndustry : formData.industry;
    const activeGoal = formData.goal === 'other' ? formData.customGoal : formData.goal;
    
    const chosenPackageText = cardName ? `${cardName} (${cardPrice})` : `${selectedPlan.name} (${selectedPlan.price})`;
    const subject = `New Project Request — ${formData.businessName}`;
    const body = encodeURIComponent(`Hi CodeFuser Team,

I have completed the Start Project onboarding on your platform! Here is a summary of my business request:

• Business Identity: ${formData.businessName} (Owner: ${formData.ownerName})
• Contact Details: ${formData.whatsapp} (WhatsApp) / ${formData.email}
• Industry Field: ${activeIndustry}
• Primary Objective: ${activeGoal}
• Configuration Package: ${chosenPackageText}
• Selected Model: ${formData.ownership === 'full' ? 'Full Control (Files Transferred)' : 'Managed Partnership (Host & Secure)'}
• Asset Readiness:
  - Domain Registry: ${formData.hasDomain === 'yes' ? 'Registered' : formData.hasDomain === 'no' ? 'Not registered' : 'Need select assistance'}    
  - Logo & Brand Assets: ${formData.hasLogo === 'yes' ? 'Provided' : formData.hasLogo === 'no' ? 'Not ready' : 'Need brand designs'}
  - Text & Media: ${formData.contentReady === 'yes' ? 'I have copywriting ready' : formData.contentReady === 'progress' ? 'In progress' : 'Need CodeFuser to write'}

I'd like to proceed with the project setup to finalize details and map out the growth tracks.

Warm regards,
${formData.ownerName}
`);
    return `https://mail.google.com/mail/?view=cm&fs=1&to=aicodefuser@gmail.com&su=${encodeURIComponent(subject)}&body=${body}`;
  };

  // Custom Step Progress Bar Component
  const renderProgress = () => {
    if (step >= 6) return null;
    const totalSteps = 5;
    const pct = Math.round(((step - 1) / (totalSteps - 1)) * 100);
    return (
      <div className="mb-8 sm:mb-10 space-y-2.5">
        <div className="flex justify-between items-center text-xs font-mono tracking-wider">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.9)]" />
            <span className="tracking-widest uppercase text-purple-300 font-bold [text-shadow:0_0_10px_rgba(168,85,247,0.5)]">
              STAGE 0{step} OF 0{totalSteps}
            </span>
          </div>
          <span className="text-purple-300 font-bold tracking-widest uppercase [text-shadow:0_0_10px_rgba(168,85,247,0.5)]">
            {pct}% COMPLETE
          </span>
        </div>
        <div className="relative h-2.5 w-full bg-black/90 rounded-full p-0.5 border border-purple-500/35 shadow-[inset_0_1px_3px_rgba(0,0,0,0.9),0_0_15px_rgba(168,85,247,0.2)] overflow-hidden">
          <motion.div 
            className="h-full rounded-full bg-gradient-to-r from-purple-700 via-purple-500 to-indigo-300 shadow-[0_0_12px_rgba(168,85,247,0.9),0_0_20px_rgba(168,85,247,0.5)] relative" 
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(pct, 5)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Pulsing leading flare */}
            <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/90 rounded-full blur-[1px] shadow-[0_0_10px_#fff]" />
          </motion.div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-[85vh] py-14 sm:py-20 px-4 sm:px-6 md:px-8 text-foreground font-sans overflow-hidden">
      {/* Pure solid black background with no viewport-spanning gradients */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-[#000000]" id="ambient-fixed-background" />

      {/* Cinematic Light Sweep Wave */}
      <motion.div
        initial={{ x: "-100%", opacity: 0 }}
        animate={{ x: "250%", opacity: [0, 0.5, 0.5, 0] }}
        transition={{ duration: 1.6, ease: "easeInOut", delay: 0.2 }}
        className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent skew-x-12 pointer-events-none z-20"
      />

      <div className={`relative z-10 mx-auto transition-all duration-500 ${onboardingStage !== 'form' && onboardingStage !== 'ai_loading' ? 'max-w-6xl' : 'max-w-2xl'}`}>
        <AnimatePresence mode="wait">
          {onboardingStage === 'form' ? (
            <div className="relative">
              {/* PREMIUM CELESTIAL CONTAINER GLOWS (Treating the container itself as the ambient lighting source) */}
              
              {/* Soft Electric Purple Blurred Aura Spotlight (Breathing & Shifting) */}
              <motion.div
                animate={{
                  opacity: [0.04, 0.08, 0.04],
                  scale: [0.95, 1.05, 0.95],
                  x: [-15, 15, -15],
                  y: [-10, 10, -10],
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ filter: "blur(180px)" }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full pointer-events-none -z-20"
              />

              {/* Luxury Inner High-contrast Edge Reflection Ring */}
              <div className="absolute inset-0 rounded-3xl border border-white/[0.08] bg-white/[0.01] pointer-events-none -z-10" />

              <motion.div
                key="form-container"
                initial={{ opacity: 0, y: 25, filter: "blur(20px)" }}
                animate={{ 
                  opacity: 1, 
                  y: [25, 0, -4, 0],
                  filter: "blur(0px)" 
                }}
                exit={{ opacity: 0, y: -25, filter: "blur(10px)" }}
                transition={{ 
                  opacity: { duration: 1.4, delay: 0.2, ease: "easeOut" },
                  filter: { duration: 1.4, delay: 0.2, ease: "easeOut" },
                  y: {
                    times: [0, 0.7, 0.85, 1],
                    duration: 1.8,
                    ease: "easeOut"
                  }
                }}
                className="relative rounded-3xl overflow-hidden transition-all duration-500 backdrop-blur-3xl border border-white/25 bg-black/85 shadow-[0_35px_100px_rgba(0,0,0,0.98),inset_0_1px_2px_rgba(255,255,255,0.15)] p-6 sm:p-10"
                id="start-project-card"
              >
              {/* Hairline glass light reflection decoration */}
              <div className="absolute inset-x-0 top-0 h-px bg-white/5" />

              {/* Global Draft auto save indicator (Absolute, layout-stable, high-end, Part A2 - #30) */}
              <DraftSavedIndicator />

              {/* Onboarding Form Header */}
              {step !== 5 && (
                <>
                  <div className="mb-8">
                    {step === 6 ? (
                      <div className="space-y-4 text-center sm:text-left">
                        {/* 1. "Welcome," on line 1, full name indented on line 2 */}
                        {(() => {
                          const formattedFullName = formData.ownerName && formData.ownerName.trim()
                            ? formData.ownerName.trim().split(/\s+/).filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ")
                            : "Partner";

                          return (
                            <motion.h1 
                              initial={{ opacity: 0, y: 25, filter: "blur(12px)" }}
                              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                              transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                              className="font-display text-[36px] sm:text-[54px] font-black tracking-tight text-[#f5f5f0] leading-[1.15] [text-shadow:0_0_35px_rgba(255,255,255,0.22),0_0_10px_rgba(255,255,255,0.15)] select-none"
                            >
                              <div>Welcome,</div>
                              <div className="pl-6 sm:pl-12 bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400 font-black mt-1">
                                {formattedFullName}.
                              </div>
                            </motion.h1>
                          );
                        })()}
                        
                        {/* 2. "Your Digital Journey Begins." after delay with premium blur reveal */}
                        <motion.h2 
                          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          transition={{ duration: 1.2, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                          className="text-sm sm:text-lg font-bold text-zinc-400 tracking-[0.2em] font-sans uppercase leading-relaxed select-none pt-2"
                        >
                          Your Digital Journey Begins.
                        </motion.h2>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs sm:text-sm font-mono uppercase tracking-[0.25em] text-purple-300 font-extrabold mb-2.5 [text-shadow:0_0_22px_rgba(168,85,247,0.85)]">
                          {step === 1 ? "01 — Contact Details" : 
                           step === 2 ? "02 — Your Business" : 
                           step === 3 ? "03 — Package Confirmed" : 
                           step === 4 ? "04 — Domain & Logo" : 
                           "05 — Review Blueprint"}
                        </p>
                        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug [text-shadow:0_0_26px_rgba(168,85,247,0.60)] uppercase">
                          {step === 1 ? "START YOUR BUSINESS SETUP" :
                           step === 2 ? "Tell Us About Your Business" :
                           step === 3 ? "Your Website Package" :
                           step === 4 ? "Domain, Logo & Content Status" :
                           "YOUR BUSINESS BLUEPRINT"}
                        </h1>

                        <p className="text-xs sm:text-sm text-zinc-300 mt-2.5 leading-relaxed font-medium">
                          {step === 1 ? "Fill in your basic contact details in 2 minutes so we know who we're building for." :
                           step === 2 ? "Tell us what industry you're in and what you want your website to achieve for your business." :
                           step === 3 ? "Your selected package is ready. We'll now customize it for your business." :
                           step === 4 ? "Let us know if you already have a domain name, logo, or website photos ready." :
                           "Your custom project blueprint is ready for final review."}
                        </p>
                      </>
                    )}
                  </div>

                  {renderProgress()}
                </>
              )}

              {/* Step 1: Contact Identity */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, filter: "blur(12px)", scale: 0.98 }}
                  animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-4"
                >
                  {step1Notice && (
                    <div className="mb-6 p-5 sm:p-6 rounded-2xl border border-purple-500/30 bg-[#0d0a14]/95 backdrop-blur-xl shadow-[0_0_40px_rgba(168,85,247,0.12)] text-left animate-in fade-in zoom-in-95 duration-300">
                      <div className="flex gap-4 items-start">
                        <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 shrink-0">
                          <Sparkles size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                            <h4 className="text-sm sm:text-base font-bold text-white tracking-wide">
                              {step1Notice.noticeType === 'unfinished_draft' && (
                                getDraftAgeDays(step1Notice.draftProject?.createdAt) >= 30
                                  ? "Welcome Back!"
                                  : "Looks like you started a project earlier"
                              )}
                              {step1Notice.noticeType === 'registered_client' && "Welcome Back!"}
                              {step1Notice.noticeType === 'existing_projects' && "Welcome Back!"}
                            </h4>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {step1Notice.noticeType === 'unfinished_draft' ? "Saved Draft" : "Welcome Back"}
                            </span>
                          </div>

                          {/* Specific draft context card if available */}
                          {step1Notice.noticeType === 'unfinished_draft' && step1Notice.draftProject && (
                            <div className="my-3 p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs">
                              <p className="text-zinc-200 font-medium">
                                Project: <span className="text-white font-bold">{step1Notice.draftProject.businessName || "Untitled Website"}</span>
                              </p>
                              <p className="text-[11px] text-zinc-400 mt-0.5">
                                Last edited: <span className="text-purple-300 font-medium">{formatRelativeTime(step1Notice.draftProject.createdAt)}</span>
                              </p>
                            </div>
                          )}

                          <p className="text-xs text-zinc-300 leading-relaxed mt-1">
                            {step1Notice.noticeType === 'unfinished_draft' && (
                              getDraftAgeDays(step1Notice.draftProject?.createdAt) >= 30
                                ? "We found an older project draft linked to this contact detail. You can continue it or start fresh."
                                : "Would you like to continue where you left off or start a brand new project?"
                            )}
                            {step1Notice.noticeType === 'registered_client' && (
                              "You already have an active CodeFuser project in your account. You can manage your project in the dashboard or start a new project."
                            )}
                            {step1Notice.noticeType === 'existing_projects' && (
                              "We've seen this contact information before. You can start a new project or sign in to your client portal."
                            )}
                          </p>

                          {/* Action Buttons */}
                          <div className="mt-5 flex flex-wrap gap-3">
                            {step1Notice.noticeType === 'unfinished_draft' && (
                              <>
                                {getDraftAgeDays(step1Notice.draftProject?.createdAt) < 30 ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (step1Notice.draftProject) {
                                          setFormData(prev => ({
                                            ...prev,
                                            businessName: step1Notice.draftProject.businessName || prev.businessName,
                                            ownerName: step1Notice.draftProject.clientName || prev.ownerName,
                                            email: step1Notice.draftProject.email || prev.email,
                                            whatsapp: step1Notice.draftProject.whatsapp || prev.whatsapp,
                                            packageId: step1Notice.draftProject.selectedPackage || prev.packageId,
                                            industry: step1Notice.draftProject.industry || prev.industry,
                                            goal: step1Notice.draftProject.goal || prev.goal,
                                            aiPrompt: step1Notice.draftProject.aiPrompt || prev.aiPrompt
                                          }));
                                        }
                                        setStep1Notice(null);
                                        setStep(2);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                      }}
                                      className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center gap-2 cursor-pointer"
                                    >
                                      <RefreshCw size={14} /> Continue Project
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCreatedProjectId(null);
                                        safeLocalStorage.removeItem('fuser_client_project_id');
                                        setStep1Notice(null);
                                        setStep(2);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                      }}
                                      className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider transition-all border border-zinc-700 flex items-center gap-2 cursor-pointer"
                                    >
                                      <Plus size={14} /> Start New Project
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setStep1Notice(null);
                                        setStep(2);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                      }}
                                      className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center gap-2 cursor-pointer"
                                    >
                                      <Plus size={14} /> Start New Project
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (step1Notice.draftProject) {
                                          setFormData(prev => ({
                                            ...prev,
                                            businessName: step1Notice.draftProject.businessName || prev.businessName,
                                            ownerName: step1Notice.draftProject.clientName || prev.ownerName,
                                            email: step1Notice.draftProject.email || prev.email,
                                            whatsapp: step1Notice.draftProject.whatsapp || prev.whatsapp,
                                            packageId: step1Notice.draftProject.selectedPackage || prev.packageId,
                                            industry: step1Notice.draftProject.industry || prev.industry,
                                            goal: step1Notice.draftProject.goal || prev.goal,
                                            aiPrompt: step1Notice.draftProject.aiPrompt || prev.aiPrompt
                                          }));
                                        }
                                        setStep1Notice(null);
                                        setStep(2);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                      }}
                                      className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider transition-all border border-zinc-700 flex items-center gap-2 cursor-pointer"
                                    >
                                      <RefreshCw size={14} /> Continue Old Project
                                    </button>
                                  </>
                                )}
                              </>
                            )}

                            {step1Notice.noticeType === 'registered_client' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setStep1Notice(null);
                                    setStep(2);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center gap-2 cursor-pointer"
                                >
                                  <Plus size={14} /> Start New Project
                                </button>

                                <button
                                  type="button"
                                  onClick={() => navigate('/dashboard')}
                                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider transition-all border border-zinc-700 flex items-center gap-2 cursor-pointer"
                                >
                                  <LayoutDashboard size={14} /> Go to Dashboard
                                </button>
                              </>
                            )}

                            {step1Notice.noticeType === 'existing_projects' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setStep1Notice(null);
                                    setStep(2);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center gap-2 cursor-pointer"
                                >
                                  <Plus size={14} /> Start New Project
                                </button>

                                <button
                                  type="button"
                                  onClick={() => navigate('/login')}
                                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider transition-all border border-zinc-700 flex items-center gap-2 cursor-pointer"
                                >
                                  <LogIn size={14} /> Sign In to Portal
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="group space-y-1.5">
                      <label htmlFor="businessName" className="block text-sm sm:text-base font-mono uppercase tracking-[0.15em] text-white font-extrabold flex justify-between [text-shadow:0_0_18px_rgba(168,85,247,0.60)]">
                        <span>Business Name <span className="text-amber-500/80">*</span></span>
                        {triggerValidation && validationErrors.businessName && (
                          <span className="text-red-400 text-xs font-normal uppercase tracking-wider">Required (Min 3 chars)</span>
                        )}
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-purple-400 transition-colors duration-300">
                          <Building size={16} strokeWidth={1.5} />
                        </span>
                        <PerformanceInput
                          id="businessName"
                          type="text"
                          required
                          value={formData.businessName}
                          onActualChange={(val) => updateField('businessName', val)}
                          placeholder="e.g. Blue Horizon Dental"
                          className={`pl-11 pr-5 border bg-black/60 rounded-xl text-sm text-foreground focus:outline-none transition-all font-sans placeholder-zinc-600 h-[48px] w-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] backdrop-blur-md ${
                            triggerValidation && validationErrors.businessName
                              ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
                              : 'border-white/30 hover:border-white/60 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30'
                          }`}
                        />
                      </div>
                      {triggerValidation && validationErrors.businessName && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-xs font-sans"
                        >
                          {validationErrors.businessName}
                        </motion.p>
                      )}
                    </div>

                    <div className="group space-y-1.5">
                      <label htmlFor="ownerName" className="block text-sm sm:text-base font-mono uppercase tracking-[0.15em] text-white font-extrabold flex justify-between [text-shadow:0_0_18px_rgba(168,85,247,0.60)]">
                        <span>Your Name <span className="text-amber-500/80">*</span></span>
                        {triggerValidation && validationErrors.ownerName && (
                          <span className="text-red-400 text-xs font-normal uppercase tracking-wider">
                            {formData.ownerName.trim() ? "Invalid Format" : "Required"}
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-purple-400 transition-colors duration-300">
                          <User size={16} strokeWidth={1.5} />
                        </span>
                        <PerformanceInput
                          id="ownerName"
                          type="text"
                          required
                          value={formData.ownerName}
                          onActualChange={(val) => updateField('ownerName', val)}
                          placeholder="First and last name"
                          className={`pl-11 pr-5 border bg-black/60 rounded-xl text-sm text-foreground focus:outline-none transition-all font-sans placeholder-zinc-600 h-[48px] w-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] backdrop-blur-md ${
                            triggerValidation && validationErrors.ownerName
                              ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
                              : 'border-white/30 hover:border-white/60 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30'
                          }`}
                        />
                      </div>
                      {triggerValidation && validationErrors.ownerName && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-xs font-sans"
                        >
                          {validationErrors.ownerName}
                        </motion.p>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="group space-y-1.5">
                        <label htmlFor="whatsapp" className="block text-sm sm:text-base font-mono uppercase tracking-[0.15em] text-white font-extrabold flex justify-between select-none [text-shadow:0_0_18px_rgba(168,85,247,0.60)]">
                          <span>WhatsApp Number <span className="text-amber-500/80">*</span></span>
                          {triggerValidation && validationErrors.whatsapp && (
                            <span className="text-red-400 text-xs font-normal uppercase tracking-wider">
                              {localPhone.trim() ? `Invalid format` : 'Required'}
                            </span>
                          )}
                        </label>
                        <div className="relative">
                          <div className={`relative flex items-stretch h-[48px] w-full rounded-xl border bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all ${
                            triggerValidation && validationErrors.whatsapp
                              ? 'border-red-500/50 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500/30'
                              : 'border-white/30 hover:border-white/60 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500/30'
                          }`}>
                            {/* Trigger Button with Code */}
                            <button
                              type="button"
                              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                              className="flex items-center gap-1.5 pl-3.5 pr-2 bg-transparent hover:bg-white/[0.03] border-r border-white/20 transition-colors text-xs font-sans text-neutral-300 select-none h-full shrink-0 outline-none rounded-l-xl"
                            >
                              <span className="font-mono text-xs text-neutral-300 font-semibold">{selectedCountry.code}</span>
                              <ChevronDown size={11} className="text-neutral-500 shrink-0" />
                            </button>

                            {/* Local telephone input */}
                            <PerformanceInput
                              id="whatsapp"
                              type="tel"
                              inputMode="tel"
                              pattern="[0-9]*"
                              required
                              value={localPhone}
                              sanitize={(val) => val.replace(/\D/g, '').slice(0, selectedCountry.validationRule.maxLength)}
                              onActualChange={(val) => setLocalPhone(val)}
                              placeholder={`e.g. ${selectedCountry.example}`}
                              className="flex-1 bg-transparent px-3.5 text-sm text-foreground focus:outline-none font-sans placeholder-zinc-600 h-full w-full"
                            />
                          </div>

                          {/* Searchable Dropdown Overlay Card */}
                          {isDropdownOpen && (
                            <>
                              {/* Backdrop guard */}
                              <div className="fixed inset-0 z-40" onClick={() => {
                                setIsDropdownOpen(false);
                                setCountrySearch('');
                              }} />
                              
                              {/* Floating Dropdown Frame */}
                              <div className="absolute left-0 right-0 mt-2 top-full z-50 rounded-xl border border-white/[0.08] bg-[#070707]/98 backdrop-blur-2xl p-2 shadow-2xl max-h-[240px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                                
                                {/* Search box */}
                                <div className="relative mb-2 shrink-0">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                                    <Search size={12} />
                                  </span>
                                  <input
                                    type="text"
                                    value={countrySearch}
                                    onChange={(e) => setCountrySearch(e.target.value)}
                                    placeholder="Search country..."
                                    className="w-full bg-[#050505] border border-white/[0.08] rounded-xl pl-8 pr-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-purple-500 placeholder-zinc-700 font-sans"
                                    autoFocus
                                  />
                                  {countrySearch && (
                                    <button
                                      type="button"
                                      onClick={() => setCountrySearch('')}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                                    >
                                      <X size={10} />
                                    </button>
                                  )}
                                </div>

                                {/* Menu scroll list */}
                                <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin scrollbar-thumb-neutral-800 text-xs">
                                  {filteredCountries.length > 0 ? (
                                    filteredCountries.map((country) => (
                                      <button
                                        key={country.name}
                                        type="button"
                                        onClick={() => {
                                          setSelectedCountry(country);
                                          setLocalPhone('');
                                          setIsDropdownOpen(false);
                                          setCountrySearch('');
                                        }}
                                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all ${
                                          selectedCountry.name === country.name
                                            ? 'bg-purple-500/10 text-purple-400 font-medium border border-purple-500/20'
                                            : 'text-neutral-400 hover:bg-neutral-900 border border-transparent'
                                        }`}
                                      >
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-sm select-none">{country.flag}</span>
                                          <span className="text-[11px] font-sans tracking-wide truncate max-w-[110px]">{country.name}</span>
                                        </div>
                                        <span className="text-[10px] font-mono font-medium text-neutral-500">{country.code}</span>
                                      </button>
                                    ))
                                  ) : (
                                    <div className="py-4 text-center text-[10px] text-neutral-500 font-sans">
                                      No matches found
                                    </div>
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                        {triggerValidation && validationErrors.whatsapp ? (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-400 text-[11px] font-sans"
                          >
                            {validationErrors.whatsapp}
                          </motion.p>
                        ) : (
                          <p className="text-[10px] text-zinc-500 leading-relaxed mt-1.5 pl-0.5 tracking-wide">
                            We'll use WhatsApp to share project updates and drafts.
                          </p>
                        )}
                      </div>

                      <div className="group space-y-1.5">
                        <label htmlFor="email" className="block text-sm sm:text-base font-mono uppercase tracking-[0.15em] text-white font-extrabold flex justify-between [text-shadow:0_0_18px_rgba(168,85,247,0.60)]">
                          <span>Email Address <span className="text-amber-500/80">*</span></span>
                          {triggerValidation && validationErrors.email && (
                            <span className="text-red-400 text-xs font-normal uppercase tracking-wider">Invalid email</span>
                          )}
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-purple-400 transition-colors duration-300">
                            <Mail size={16} strokeWidth={1.5} />
                          </span>
                          <PerformanceInput
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onActualChange={(val) => updateField('email', val)}
                            placeholder="you@company.com"
                            className={`pl-11 pr-5 border bg-black/60 rounded-xl text-sm text-foreground focus:outline-none transition-all font-sans placeholder-zinc-600 h-[48px] w-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] backdrop-blur-md ${
                              triggerValidation && validationErrors.email
                                ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
                                : 'border-white/30 hover:border-white/60 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30'
                            }`}
                          />
                        </div>
                        {triggerValidation && validationErrors.email && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-400 text-xs font-sans"
                          >
                            {validationErrors.email}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Industry & Objectives */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, filter: "blur(12px)", scale: 0.98 }}
                  animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="block text-base sm:text-lg font-mono uppercase tracking-wider text-white font-extrabold [text-shadow:0_0_20px_rgba(168,85,247,0.65)]">
                      What kind of business do you run? *
                    </label>
                    <PerformanceInput
                      type="text"
                      required
                      value={formData.customIndustry}
                      onActualChange={(val) => {
                        updateField('customIndustry', val);
                        updateField('industry', 'other');
                      }}
                      placeholder="e.g. Restaurant, Salon, Gym, Clinic, Real Estate, Interior Designer, Tuition Centre, etc."
                      className="border border-white/20 bg-[#050505] hover:border-white/35 rounded-xl px-4 py-3.5 text-base text-white focus:outline-none focus:ring-1 focus:ring-purple-500/40 focus:border-purple-500/60 transition-all font-sans placeholder-neutral-500 h-13 w-full mt-1.5 shadow-[0_0_28px_rgba(168,85,247,0.22)]"
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="block text-base sm:text-lg font-mono uppercase tracking-wider text-white font-extrabold [text-shadow:0_0_20px_rgba(168,85,247,0.65)]">
                      What would you like your website to help you achieve? *
                    </label>
                    <div className="space-y-2.5">
                      {GOALS.map(goal => {
                        const isSelected = formData.goal === goal.id;
                        return (
                          <button
                            key={goal.id}
                            type="button"
                            onClick={() => updateField('goal', goal.id)}
                            className={`flex items-center gap-3.5 w-full p-4 rounded-xl border text-left transition-all select-none active:scale-[0.99] cursor-pointer relative overflow-hidden ${
                              isSelected 
                                ? 'bg-neutral-900/85 border-white/50 text-white shadow-[0_0_25px_rgba(255,255,255,0.1),0_0_20px_rgba(168,85,247,0.04),inset_0_1px_1.5px_rgba(255,255,255,0.15)] [text-shadow:0_0_8px_rgba(255,255,255,0.1)]' 
                                : 'bg-[#050505] border-white/[0.06] text-zinc-400 hover:border-white/20 hover:text-zinc-200 hover:bg-white/[0.02]'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
                            )}
                            <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                              isSelected ? 'border-white bg-white/10' : 'border-neutral-800'
                            }`}>
                              {isSelected && <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />}
                            </div>
                            <span className="text-xs sm:text-sm font-medium tracking-wide">{goal.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Package Choice & Care Plan */}
              {step === 3 && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.15
                      }
                    }
                  }}
                  className="space-y-8"
                >
                  {/* Section 1: Your Package */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 15, filter: "blur(6px)" },
                      visible: { opacity: 1, y: 0, filter: "blur(0px)" }
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <h3 className="font-display text-lg sm:text-[22px] font-bold tracking-tight text-[#f5f5f0] mb-4 pb-3 border-b border-zinc-800 flex items-center justify-between gap-4">
                      <span className="tracking-wide">Your Website Package</span>
                      <span className="text-xs sm:text-sm font-mono tracking-wider text-purple-300/90 font-bold uppercase shrink-0">01 / Selected Plan</span>
                    </h3>
                    
                    {isPlanLocked ? (
                      <div className="relative overflow-hidden p-6 sm:p-8 rounded-2xl border border-purple-500/35 bg-gradient-to-r from-[#0d0a1a] via-[#140f2a] to-[#0a0815] shadow-[0_0_30px_rgba(168,85,247,0.18)] hover:border-purple-500/50 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-6 font-sans">
                        <div className="flex items-center gap-4">
                          <div className="p-3.5 rounded-2xl bg-purple-950/80 border border-purple-500/40 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)] shrink-0">
                            <Lock size={22} className="text-purple-300" />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[11px] font-mono text-purple-300 font-bold uppercase tracking-wider block">
                              SELECTED WEBSITE PLAN
                            </span>
                            <h4 className="font-display text-xl sm:text-2xl font-bold text-white">
                              {selectedPlan.name.replace(/[⚡✦⬢]/g, '').trim()} Tier
                            </h4>
                            <p className="text-xs text-zinc-300">One-time custom website design & setup</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/10 shrink-0">
                          <span className="text-3xl sm:text-4xl font-extrabold text-amber-400 [text-shadow:0_0_18px_rgba(251,191,36,0.6)] block font-display leading-none">
                            {selectedPlan.price}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300 uppercase bg-amber-500/15 border border-amber-500/40 px-3.5 py-1 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                            🔒 Locked for Setup
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-3 font-sans">
                        {pricingPlans.map(plan => {
                          const isSelected = formData.packageId === plan.id;
                          return (
                            <button
                              key={plan.id}
                              type="button"
                              onClick={() => updateField('packageId', plan.id)}
                              className={`relative flex flex-col justify-between p-5 rounded-2xl border text-left transition-all duration-300 select-none active:scale-95 cursor-pointer ${
                                isSelected 
                                  ? 'bg-gradient-to-b from-purple-950/60 via-[#0f0d1b] to-[#080710] border-purple-500/60 text-white shadow-[0_0_30px_rgba(168,85,247,0.25)] ring-1 ring-purple-500/40' 
                                  : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-purple-500/40 hover:text-white'
                              }`}
                            >
                              {plan.highlight && (
                                <span className="absolute -top-3 right-3 bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono font-bold tracking-wider text-amber-300 px-2.5 py-0.5 rounded-full uppercase">
                                  Most Popular
                                </span>
                              )}
                              <div className="space-y-1">
                                <span className="text-[11px] text-purple-300/80 font-mono font-semibold block">{plan.tagline}</span>
                                <span className="text-base font-bold text-white block">
                                  {plan.name.replace(/[⚡✦⬢]/g, '').trim()}
                                </span>
                                <span className="text-xs text-zinc-400 block">One-time setup</span>
                              </div>
                              <span className="text-2xl font-bold mt-4 block font-display text-amber-400 [text-shadow:0_0_15px_rgba(251,191,36,0.5)]">
                                {plan.price}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <p className="text-xs text-zinc-400 mt-3 font-sans">
                      * One-time website setup. You can adjust or upgrade package options later during your design consultation.
                    </p>
                  </motion.div>

                  {/* Section 2: Continuous Care & Cloud Management */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 15, filter: "blur(6px)" },
                      visible: { opacity: 1, y: 0, filter: "blur(0px)" }
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <h3 className="font-display text-lg sm:text-[22px] font-bold tracking-tight text-[#f5f5f0] mt-10 mb-4 pb-3 border-b border-zinc-800 flex items-center justify-between gap-4">
                      <span className="tracking-wide">Continuous Care & Cloud Management</span>
                      <span className="text-xs sm:text-sm font-mono tracking-wider text-purple-300/90 font-bold uppercase shrink-0">02 / Monthly Maintenance</span>
                    </h3>
                    
                    <div className="p-6 sm:p-7 rounded-2xl border border-purple-500/35 bg-gradient-to-r from-[#0d0a1a] via-[#140f2a] to-[#0a0815] shadow-[0_0_30px_rgba(168,85,247,0.18)] font-sans space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                            <span className="text-sm font-bold text-white uppercase font-mono tracking-wider text-emerald-300">Active Care Plan</span>
                          </div>
                          <p className="text-xs text-zinc-300 mt-1">First month included • Pause or adjust anytime</p>
                        </div>
                        
                        <div className="font-display text-2xl sm:text-3xl font-extrabold text-amber-400 [text-shadow:0_0_18px_rgba(251,191,36,0.6)]">
                          {formData.packageId === 'foundation' ? '₹499' : formData.packageId === 'dominance' ? '₹1,499' : '₹999'} <span className="text-xs font-normal text-zinc-300">/ month</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-950/40 border border-purple-500/25 text-xs text-purple-100 font-medium">
                          <div className="p-2 rounded-lg bg-purple-900/50 text-purple-300 shrink-0">
                            <ShieldCheck size={18} />
                          </div>
                          <span className="font-semibold text-zinc-200">Secure Cloud Hosting</span>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-950/40 border border-purple-500/25 text-xs text-purple-100 font-medium">
                          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                            <Zap size={18} />
                          </div>
                          <span className="font-semibold text-zinc-200">Speed & Security Updates</span>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-950/40 border border-purple-500/25 text-xs text-purple-100 font-medium">
                          <div className="p-2 rounded-lg bg-purple-900/50 text-purple-300 shrink-0">
                            <Wrench size={18} />
                          </div>
                          <span className="font-semibold text-zinc-200">Technical Maintenance</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Section 3: Premium Client Workspace / Exclusive Client Gift */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 15, filter: "blur(6px)" },
                      visible: { opacity: 1, y: 0, filter: "blur(0px)" }
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <h3 className="font-display text-lg sm:text-[22px] font-bold tracking-tight text-[#f5f5f0] mt-10 mb-4 pb-3 border-b border-zinc-800 flex items-center justify-between gap-4">
                      <span className="tracking-wide">Premium Client Workspace</span>
                      <span className="text-xs sm:text-sm font-mono tracking-wider text-purple-300/90 font-bold uppercase shrink-0">03 / Exclusive Client Gift</span>
                    </h3>

                    <div className="relative p-8 sm:p-10 rounded-3xl border border-purple-500/30 bg-gradient-to-b from-[#181528]/95 to-[#0d0b18]/98 backdrop-blur-3xl overflow-hidden group hover:border-purple-500/45 transition-all duration-500 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_35px_rgba(168,85,247,0.15)]">
                      <div className="mb-8 text-left">
                        <span className="inline-block text-xs font-mono tracking-wider font-bold text-purple-300 uppercase bg-purple-500/15 border border-purple-500/30 px-4 py-1.5 rounded-full mb-3 shadow-[0_0_12px_rgba(168,85,247,0.15)]">
                          Exclusive Client Gift
                        </span>
                        <h4 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight mb-2">
                          🎁 Crafted For Your Business
                        </h4>
                        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans max-w-2xl font-medium">
                          We've prepared a few premium extras to make your digital journey effortless.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-8">
                        {[
                          "Dedicated Client Workspace",
                          "Project Progress Tracking",
                          "Unlimited Revisions During Development",
                          "Asset Uploads & Management",
                          "Team Collaboration Access",
                          "Priority Project Updates"
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3.5 group/item">
                            <div className="h-6 w-6 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                              <Check size={12} className="text-purple-300" strokeWidth={3} />
                            </div>
                            <span className="text-xs sm:text-sm text-zinc-200 font-sans tracking-wide font-medium group-hover/item:text-white transition-colors">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-6 border-t border-white/10 flex flex-col items-center text-center">
                        <p className="text-xs sm:text-sm font-sans text-zinc-300 tracking-wide font-medium italic mb-2">
                          "Because every great business deserves a premium digital experience."
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="h-px w-8 bg-gradient-to-r from-transparent to-purple-500/40" />
                          <span className="text-[9px] font-mono tracking-[0.2em] text-zinc-400 uppercase font-semibold">
                            Welcome to the CodeFuser Client Circle
                          </span>
                          <div className="h-px w-8 bg-gradient-to-l from-transparent to-purple-500/40" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* Step 4: Asset Center Readiness */}
              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0, filter: "blur(12px)", scale: 0.98 }}
                  animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-8"
                >
                  {/* Card 1: Website Address */}
                  <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Globe size={18} className="text-zinc-400 shrink-0" />
                        <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                          Website Address
                        </span>
                      </div>
                      <h4 className="text-lg sm:text-xl font-bold text-white font-sans tracking-tight">
                        Do you already own a website name?
                      </h4>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        { id: 'yes', label: 'I HAVE ONE' },
                        { id: 'no', label: 'I NEED ONE' },
                        { id: 'help', label: 'HELP ME DECIDE' }
                      ].map(opt => {
                        const isSelected = formData.hasDomain === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => updateField('hasDomain', opt.id)}
                            className={`px-4 py-3.5 rounded-xl border text-xs font-semibold tracking-wider text-center uppercase select-none transition-all active:scale-[0.98] cursor-pointer ${
                              isSelected
                                ? 'bg-zinc-800 border-zinc-500 text-white shadow-sm font-bold'
                                : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card 2: Brand Identity */}
                  <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Palette size={18} className="text-zinc-400 shrink-0" />
                        <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                          Your Brand Identity
                        </span>
                      </div>
                      <h4 className="text-lg sm:text-xl font-bold text-white font-sans tracking-tight">
                        Do you already have your business logo ready?
                      </h4>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        { id: 'yes', label: 'LOGO READY' },
                        { id: 'no', label: 'NOT READY YET' },
                        { id: 'help', label: 'DESIGN MY BRAND' }
                      ].map(opt => {
                        const isSelected = formData.hasLogo === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => updateField('hasLogo', opt.id)}
                            className={`px-4 py-3.5 rounded-xl border text-xs font-semibold tracking-wider text-center uppercase select-none transition-all active:scale-[0.98] cursor-pointer ${
                              isSelected
                                ? 'bg-zinc-800 border-zinc-500 text-white shadow-sm font-bold'
                                : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card 3: Website Content */}
                  <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-zinc-400 shrink-0" />
                        <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                          Your Website Content
                        </span>
                      </div>
                      <h4 className="text-lg sm:text-xl font-bold text-white font-sans tracking-tight">
                        Do you already have your photos and business information ready?
                      </h4>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        { id: 'yes', label: 'EVERYTHING READY' },
                        { id: 'progress', label: 'WORKING ON IT' },
                        { id: 'no_help', label: 'GUIDE ME THROUGH IT' }
                      ].map(opt => {
                        const isSelected = formData.contentReady === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => updateField('contentReady', opt.id)}
                            className={`px-4 py-3.5 rounded-xl border text-xs font-semibold tracking-wider text-center uppercase select-none transition-all active:scale-[0.98] cursor-pointer ${
                              isSelected
                                ? 'bg-zinc-800 border-zinc-500 text-white shadow-sm font-bold'
                                : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Client Reassurance Message */}
                  <div className="relative rounded-2xl p-6 sm:p-8 border border-purple-500/10 bg-purple-500/[0.01] backdrop-blur-md max-w-xl mx-auto mt-10 text-center shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_25px_rgba(168,85,247,0.02)]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-purple-500/35 to-transparent" />
                    <p className="text-base sm:text-lg font-bold text-white tracking-tight">
                      Not sure where to start?
                    </p>
                    <p className="text-xs sm:text-[13px] text-zinc-300 mt-2 leading-relaxed font-medium">
                      Don't worry. We'll guide you through everything and recommend what's best for your business.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 5: Business Information Experience */}
              {step === 5 && (
                <motion.div
                  initial={{ opacity: 0, filter: "blur(12px)", scale: 0.98 }}
                  animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6 text-left"
                >
                  {/* Step 5 Title and Subtitle Header block */}
                  <div className="space-y-3">
                    <p className="text-xs font-mono uppercase tracking-[0.25em] text-purple-400 font-bold [text-shadow:0_0_10px_rgba(168,85,247,0.3)]">
                      05 — Your Business Details
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight [text-shadow:0_0_15px_rgba(255,255,255,0.15)]">
                        Tell Us About Your Business
                      </h1>
                      
                      {/* Premium Optional Badge */}
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/[0.08] border border-purple-500/15 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.06)] self-start sm:self-auto shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                        <span className="text-[9px] font-mono tracking-widest font-bold uppercase">
                          OPTIONAL (Highly Recommended)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Render Localized Progress Bar */}
                  {renderProgress()}

                  {/* Question Heading */}
                  <div className="space-y-2 mt-6 mb-2">
                    <h3 className="font-display text-lg sm:text-[22px] font-bold tracking-tight text-[#f5f5f0] [text-shadow:0_0_15px_rgba(255,255,255,0.15)] pb-2 border-b border-white/[0.08] flex items-center justify-between">
                      <span className="tracking-wide">What do you want your website to do?</span>
                      <span className="text-[9px] font-mono tracking-[0.25em] text-purple-400/80 font-semibold uppercase">05 / Business Overview</span>
                    </h3>
                  </div>

                  {/* 1. HERO TEXTBOX (The primary focus of the page) */}
                  <motion.div 
                    animate={{
                      boxShadow: [
                        "0 15px 45px rgba(0,0,0,0.85), 0 0 22px rgba(168,85,247,0.08), inset 0 1px 2px rgba(255,255,255,0.06)",
                        "0 15px 45px rgba(0,0,0,0.85), 0 0 38px rgba(168,85,247,0.2), inset 0 1px 3px rgba(255,255,255,0.12)",
                        "0 15px 45px rgba(0,0,0,0.85), 0 0 22px rgba(168,85,247,0.08), inset 0 1px 2px rgba(255,255,255,0.06)"
                      ]
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="relative rounded-2xl overflow-hidden p-[1.5px] bg-[#050505] border border-purple-500/40 backdrop-blur-xl group transition-all duration-500 focus-within:border-purple-400/80 shadow-[0_0_30px_rgba(168,85,247,0.15)]"
                  >
                    {/* Soft Ambient Glow */}
                    <div className="absolute -inset-10 bg-purple-600/[0.06] group-hover:bg-purple-600/[0.12] rounded-3xl blur-2xl pointer-events-none transition-all duration-700 -z-10 animate-pulse" />
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
                    
                    <PerformanceTextArea
                      value={formData.aiPrompt || ''}
                      onActualChange={(val) => setFormData(prev => ({ ...prev, aiPrompt: val }))}
                      rows={8}
                      placeholder={`Tell us anything about your business.

Examples:
• I'm a restaurant owner.
• I want more customers.
• I need online appointments.
• I want a professional website.
• I don't know what I need yet.

That's enough. We'll help with the rest.`}
                      className="w-full text-sm sm:text-base font-sans rounded-xl bg-[#030303]/95 p-5 sm:p-7 text-[#f5f5f0] placeholder-zinc-500/90 focus:outline-none focus:ring-0 border-0 outline-none leading-relaxed resize-none transition-all duration-300"
                    />
                    
                    <div className="absolute right-5 bottom-4 flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 select-none">
                      <Sparkles size={12} className="text-purple-400 animate-pulse" />
                      <span className="text-[#eae5d9]/60 font-semibold tracking-wider uppercase">Direct Consult Input</span>
                    </div>
                  </motion.div>

                  {/* 2. SUGGESTION CHIPS (Optional & Secondary) */}
                  <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-purple-300 uppercase tracking-widest block font-bold">
                        Need Ideas? Tap Any Suggestion Below <span className="text-zinc-500 font-normal">(Optional)</span>
                      </span>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      {/* Category 1: Business Goals */}
                      <div className="p-3 rounded-xl bg-[#030303]/40 border border-white/[0.04] hover:border-white/[0.08] transition-all space-y-2">
                        <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider block font-bold flex items-center gap-1">
                          🎯 Goals
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { label: 'More Customers', text: '• Goal: Reach more local clients and get new inquiries\n' },
                            { label: 'More Bookings', text: '• Goal: Take bookings & appointments\n' },
                            { label: 'More Trust', text: '• Goal: Showcase customer reviews & professional trust\n' },
                            { label: 'Premium Look', text: '• Goal: Establish a premium & professional online presence\n' },
                            { label: 'Showcase My Work', text: '• Goal: Beautiful photo gallery to showcase past work\n' }
                          ].map(chip => {
                            const isActive = (formData.aiPrompt || '').includes(chip.text.trim());
                            return (
                              <button
                                key={chip.label}
                                type="button"
                                onClick={() => toggleSuggestionChip(chip.text)}
                                className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all duration-300 cursor-pointer flex items-center justify-center shrink-0 border ${
                                  isActive
                                    ? "bg-purple-950/80 text-purple-200 border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                                    : "bg-black/80 text-zinc-400 border-white/[0.06] hover:border-white/[0.15] hover:text-zinc-200"
                                }`}
                              >
                                <span className="inline-flex items-center justify-center w-3 h-3 mr-1 shrink-0 select-none">
                                  {isActive ? (
                                    <svg className="w-2.5 h-2.5 text-purple-300" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    <span className="text-zinc-500 font-bold text-[10px]">+</span>
                                  )}
                                </span>
                                {chip.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Category 2: Website Style */}
                      <div className="p-3 rounded-xl bg-[#030303]/40 border border-white/[0.04] hover:border-white/[0.08] transition-all space-y-2">
                        <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider block font-bold flex items-center gap-1">
                          ✨ Style
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { label: 'Luxury & Premium', text: '• Style: High-end luxury, clean and sleek\n' },
                            { label: 'Modern & Professional', text: '• Style: Trustworthy, established, and modern\n' },
                            { label: 'Minimal & Clean', text: '• Style: Clean, simple, with lots of breathing room\n' },
                            { label: 'Creative & Unique', text: '• Style: Creative & unique branding accents\n' },
                            { label: 'Elegant & Simple', text: '• Style: Soft warm background, classic friendly elegance\n' }
                          ].map(chip => {
                            const isActive = (formData.aiPrompt || '').includes(chip.text.trim());
                            return (
                              <button
                                key={chip.label}
                                type="button"
                                onClick={() => toggleSuggestionChip(chip.text)}
                                className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all duration-300 cursor-pointer flex items-center justify-center shrink-0 border ${
                                  isActive
                                    ? "bg-purple-950/80 text-purple-200 border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                                    : "bg-black/80 text-zinc-400 border-white/[0.06] hover:border-white/[0.15] hover:text-zinc-200"
                                }`}
                              >
                                <span className="inline-flex items-center justify-center w-3 h-3 mr-1 shrink-0 select-none">
                                  {isActive ? (
                                    <svg className="w-2.5 h-2.5 text-purple-300" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    <span className="text-zinc-500 font-bold text-[10px]">+</span>
                                  )}
                                </span>
                                {chip.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Category 3: Features I Like */}
                      <div className="p-3 rounded-xl bg-[#030303]/40 border border-white/[0.04] hover:border-white/[0.08] transition-all space-y-2">
                        <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider block font-bold flex items-center gap-1">
                          ⚙️ Features
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { label: 'Online Booking', text: '• Feature: Clean appointment booking calendar\n' },
                            { label: 'WhatsApp Chat', text: '• Feature: Simple WhatsApp floating chat button\n' },
                            { label: 'Photo Gallery', text: '• Feature: Beautiful project gallery for photos\n' },
                            { label: 'Google Maps', text: '• Feature: Clear Google Maps location for direction\n' },
                            { label: 'Online Payments', text: '• Feature: Safe online payment integration\n' },
                            { label: 'Customer Reviews', text: '• Feature: Customer reviews and testimonials showcase\n' }
                          ].map(chip => {
                            const isActive = (formData.aiPrompt || '').includes(chip.text.trim());
                            return (
                              <button
                                key={chip.label}
                                type="button"
                                onClick={() => toggleSuggestionChip(chip.text)}
                                className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all duration-300 cursor-pointer flex items-center justify-center shrink-0 border ${
                                  isActive
                                    ? "bg-purple-950/80 text-purple-200 border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                                    : "bg-black/80 text-zinc-400 border-white/[0.06] hover:border-white/[0.15] hover:text-zinc-200"
                                }`}
                              >
                                <span className="inline-flex items-center justify-center w-3 h-3 mr-1 shrink-0 select-none">
                                  {isActive ? (
                                    <svg className="w-2.5 h-2.5 text-purple-300" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    <span className="text-zinc-500 font-bold text-[10px]">+</span>
                                  )}
                                </span>
                                {chip.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. SIMPLIFIED HELPFUL MESSAGE */}
                  <div className="text-center pt-5 pb-2 border-t border-white/[0.06] mt-5 space-y-1 max-w-md mx-auto">
                    <p className="text-sm text-[#f4efe6] font-bold leading-relaxed [text-shadow:0_0_8px_rgba(244,239,230,0.15)]">
                      Don't worry.
                    </p>
                    <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                      Even a few words are enough. We'll help you with all the technical details.
                    </p>
                  </div>

                  {/* Local Step 5 Navigation Button Row */}
                  <div className="pt-6 border-t border-neutral-900 mt-6 flex justify-between gap-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="btn-pressure flex items-center justify-center gap-2 border border-border/40 text-muted-foreground hover:border-border hover:text-white px-5 sm:px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider select-none active:scale-95 transition-all"
                    >
                      <ArrowLeft size={14} /> Back
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="btn-pressure flex items-center justify-center gap-2 bg-white text-black hover:shadow-glow-soft hover:-translate-y-0.5 rounded-full text-xs font-bold uppercase tracking-wider select-none ml-auto active:scale-95 cursor-pointer transition-all px-6 sm:px-7 py-3"
                    >
                      {formData.aiPrompt && formData.aiPrompt.trim() ? (
                        <>
                          Next Step <ArrowRight size={14} />
                        </>
                      ) : (
                        <>
                          Skip / Continue <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 6: Final Review */}
              {step === 6 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-10"
                >
                  {/* CARD 01: YOUR BUSINESS */}
                  <motion.div
                    initial={{ opacity: 0, y: 35, filter: "blur(16px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative rounded-2xl overflow-hidden p-6 sm:p-8 bg-black/60 border border-white/[0.06] backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.02)]"
                  >
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
                    
                    <div className="mb-8">
                      <h3 className="font-display text-lg sm:text-[22px] font-bold tracking-tight text-[#f5f5f0] [text-shadow:0_0_15px_rgba(255,255,255,0.15)] pb-3 border-b border-white/[0.08] flex items-center justify-between">
                        <span className="tracking-wide">Your Business</span>
                        <span className="text-[9px] font-mono tracking-[0.25em] text-purple-400/80 font-semibold uppercase">01 / Profile Summary</span>
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                      <div>
                        <span className="text-zinc-400 block text-xs sm:text-sm font-semibold tracking-wide uppercase font-mono">Business Name</span>
                        <span className="text-[#f5efe4] font-semibold text-base sm:text-lg mt-1 block tracking-tight break-words">{formData.businessName}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-xs sm:text-sm font-semibold tracking-wide uppercase font-mono">Business Type</span>
                        <span className="text-[#f5efe4] font-semibold text-base sm:text-lg mt-1 block tracking-tight capitalize break-words">
                          {formData.industry === 'other' ? formData.customIndustry : (INDUSTRIES.find(i => i.id === formData.industry)?.label || formData.industry)}
                        </span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-zinc-400 block text-xs sm:text-sm font-semibold tracking-wide uppercase font-mono">Main Goal</span>
                        <span className="text-[#f5efe4] font-medium text-base sm:text-lg mt-1 block leading-relaxed break-words">
                          {GOALS.find(g => g.id === formData.goal)?.label || formData.goal}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-xs sm:text-sm font-semibold tracking-wide uppercase font-mono">WhatsApp</span>
                        <span className="text-[#f5efe4] font-medium text-base sm:text-lg mt-1 block break-words">💬 {formData.whatsapp}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-zinc-400 block text-xs sm:text-sm font-semibold tracking-wide uppercase font-mono">Email Address</span>
                        <span className="text-[#f5efe4] font-medium text-base sm:text-lg mt-1 block break-words">{formData.email}</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* CARD 02: YOUR DIGITAL INVESTMENT (HERO CARD) */}
                  <motion.div
                    initial={{ opacity: 0, y: 35, filter: "blur(16px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 1.2, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
                    className="relative rounded-2xl overflow-hidden p-8 sm:p-12 bg-black/85 border border-white/10 backdrop-blur-3xl shadow-[0_30px_80px_rgba(0,0,0,0.9),0_0_40px_rgba(168,85,247,0.05),inset_0_1px_1.5px_rgba(255,255,255,0.08)] group hover:border-white/15 transition-all duration-500"
                  >
                    {/* Soft purple spotlight */}
                    <div className="absolute -inset-10 bg-purple-600/[0.02] rounded-3xl blur-3xl pointer-events-none -z-10 transition-opacity duration-1000" />
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                    
                    <div className="mb-8">
                      <h3 className="font-display text-lg sm:text-[22px] font-bold tracking-tight text-[#f5f5f0] [text-shadow:0_0_15px_rgba(255,255,255,0.15)] pb-3 border-b border-white/[0.08] flex items-center justify-between">
                        <span className="tracking-wide">💎 Your Digital Investment</span>
                        <span className="text-[9px] font-mono tracking-[0.25em] text-purple-400/80 font-semibold uppercase">02 / Investment Blueprint</span>
                      </h3>
                    </div>

                    <div className="flex flex-col gap-10">
                      {/* Top Row: Package Name & Pricing */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start md:items-end">
                        <div className="md:col-span-6 space-y-3">
                          <h2 className="font-display text-4xl sm:text-[48px] font-black text-white tracking-wide uppercase leading-none [text-shadow:0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-3">
                            {selectedPlan.id === 'foundation' && <span className="text-amber-400 [text-shadow:0_0_15px_rgba(251,191,36,0.6)]">⚡</span>}
                            {selectedPlan.id === 'growth' && <span className="text-[#EBC351] [text-shadow:0_0_15px_rgba(235,195,81,0.6)]">✦</span>}
                            {selectedPlan.id === 'dominance' && <span className="text-red-500 [text-shadow:0_0_15px_rgba(239,68,68,0.6)]">⬢</span>}
                            <span>{selectedPlan.name.replace(/[⚡✦⬢]/g, '').trim()} TIER</span>
                          </h2>
                          <p className="text-sm sm:text-[15px] text-zinc-400 leading-relaxed font-medium">
                            {selectedPlan.tagline}
                          </p>
                        </div>

                        <div className="md:col-span-6 flex flex-col justify-end text-left md:text-right">
                          <span className="text-zinc-400 text-sm sm:text-[15px] font-semibold tracking-wide">Website Setup Investment</span>
                          <span className="text-amber-500 text-5xl sm:text-[64px] font-black font-display tracking-tight mt-1 block [text-shadow:0_0_25px_rgba(245,158,11,0.3)]">
                            {selectedPlan.price}
                          </span>
                          <span className="text-xs sm:text-[12px] text-zinc-500 font-medium">One-Time Investment</span>
                        </div>
                      </div>

                      {/* Premium Divider */}
                      <div className="h-px bg-white/[0.08]" />

                      {/* Bottom Row: Care Subscription & Included workspace privileges */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-6 sm:p-8 rounded-xl border border-white/[0.04] bg-white/[0.01] flex flex-col justify-center">
                          <span className="text-zinc-400 text-sm sm:text-[15px] font-semibold tracking-wide block">Premium Care Subscription</span>
                          <span className="text-white text-3xl sm:text-[36px] font-bold font-display mt-3 block tracking-tight leading-none">
                            {formData.packageId === 'foundation' ? '₹499' : formData.packageId === 'dominance' ? '₹1,499' : '₹999'}<span className="text-zinc-400 text-base sm:text-[18px] font-medium font-sans"> / month</span>
                          </span>
                          <span className="text-xs sm:text-[12px] text-zinc-500 mt-2 block">Ongoing security, hosting & priority operations support</span>
                        </div>

                        {/* COMPLIMENTARY WORKSPACE SECTION */}
                        <div className="p-6 sm:p-8 rounded-xl border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/[0.04] to-neutral-950/90 flex flex-col justify-center relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(168,85,247,0.05),inset_0_1px_1px_rgba(255,255,255,0.08)]">
                          <span className="text-purple-400 text-sm sm:text-[15px] font-bold tracking-wide block mb-3">🎁 Free Bonus</span>
                          <span className="text-white text-base sm:text-[18px] font-bold block mb-3 tracking-tight">
                            {formData.packageId === 'foundation' ? 'Free Project Workspace' : 'Free Client Dashboard'}
                          </span>
                          <ul className="space-y-1.5 text-xs sm:text-[12px] text-zinc-300 font-medium leading-relaxed">
                            <li className="flex items-center gap-2">
                              <span className="text-purple-400 font-bold">✓</span> Unlimited revisions
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-purple-400 font-bold">✓</span> 24/7 support
                            </li>
                            {formData.packageId !== 'foundation' && (
                              <li className="flex items-center gap-2">
                                <span className="text-purple-400 font-bold">✓</span> Project collaboration portal
                              </li>
                            )}
                            <li className="flex items-center gap-2">
                              <span className="text-purple-400 font-bold">✓</span> Asset uploads and management
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* CARD 03: YOUR PROJECT */}
                  <motion.div
                    initial={{ opacity: 0, y: 35, filter: "blur(16px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 1.2, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="relative rounded-2xl overflow-hidden p-6 sm:p-8 bg-black/60 border border-white/[0.06] backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.02)]"
                  >
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
                    
                    <div className="mb-8">
                      <h3 className="font-display text-lg sm:text-[22px] font-bold tracking-tight text-[#f5f5f0] [text-shadow:0_0_15px_rgba(255,255,255,0.15)] pb-3 border-b border-white/[0.08] flex items-center justify-between">
                        <span className="tracking-wide">Your Project</span>
                        <span className="text-[9px] font-mono tracking-[0.25em] text-purple-400/80 font-semibold uppercase">03 / Specifications</span>
                      </h3>
                    </div>

                    {/* Premium Checklist Styling with subtle electric purple accents */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                      {/* Logo assistance status */}
                      <div className="p-4 rounded-xl bg-purple-500/[0.02] border border-purple-500/10 flex flex-col justify-between">
                        <span className="text-xs sm:text-[12px] text-zinc-500 font-semibold tracking-wide block mb-2 uppercase">Brand Identity</span>
                        <div className="flex items-center gap-2">
                          <span className="text-purple-400 font-bold text-lg">✓</span>
                          <span className="text-zinc-200 font-medium text-sm sm:text-[15px]">
                            {formData.hasLogo === 'help' ? 'Logo Design Support' : 'Logo Design Included'}
                          </span>
                        </div>
                      </div>

                      {/* Content readiness status */}
                      <div className="p-4 rounded-xl bg-purple-500/[0.02] border border-purple-500/10 flex flex-col justify-between">
                        <span className="text-xs sm:text-[12px] text-zinc-500 font-semibold tracking-wide block mb-2 uppercase">Copywriting</span>
                        <div className="flex items-center gap-2">
                          <span className="text-purple-400 font-bold text-lg">✓</span>
                          <span className="text-zinc-200 font-medium text-sm sm:text-[15px]">
                            Website Content Assistance
                          </span>
                        </div>
                      </div>

                      {/* Domain assistance status */}
                      <div className="p-4 rounded-xl bg-purple-500/[0.02] border border-purple-500/10 flex flex-col justify-between">
                        <span className="text-xs sm:text-[12px] text-zinc-500 font-semibold tracking-wide block mb-2 uppercase">Launch Operations</span>
                        <div className="flex items-center gap-2">
                          <span className="text-purple-400 font-bold text-lg">✓</span>
                          <span className="text-zinc-200 font-medium text-sm sm:text-[15px]">
                            Domain Setup Assistance
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-white/[0.08] my-6" />

                    {/* YOUR VISION section with soft purple ambient glow */}
                    <div className="space-y-3 relative">
                      <span className="text-zinc-500 block text-xs sm:text-[12px] font-semibold tracking-wide uppercase">Your Vision Blueprint</span>
                      
                      {/* Soft purple accent glow inside */}
                      <div className="absolute -left-10 top-0 w-32 h-32 bg-purple-500/[0.02] rounded-full blur-2xl pointer-events-none" />

                      <div className="relative rounded-xl overflow-hidden p-6 bg-purple-500/[0.01] border border-purple-500/10 backdrop-blur-sm">
                        {formData.aiPrompt && formData.aiPrompt.trim() ? (
                          <p className="text-purple-100/90 italic leading-relaxed text-sm sm:text-[15px] whitespace-pre-wrap font-sans font-medium">
                            "{formData.aiPrompt.trim()}"
                          </p>
                        ) : (
                          <p className="text-purple-300/60 italic leading-relaxed text-sm sm:text-[15px] font-sans font-medium">
                            "I want my business to attract more customers and look premium online."
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* CARD 04: NEXT STEPS */}
                  <motion.div
                    initial={{ opacity: 0, y: 35, filter: "blur(16px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 1.2, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
                    className="relative rounded-2xl overflow-hidden p-6 sm:p-8 bg-black/60 border border-white/[0.06] backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.02)]"
                  >
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
                    
                    <div className="mb-8">
                      <h3 className="font-display text-lg sm:text-[22px] font-bold tracking-tight text-[#f5f5f0] [text-shadow:0_0_15px_rgba(255,255,255,0.15)] pb-3 border-b border-white/[0.08] flex items-center justify-between">
                        <span className="tracking-wide">Next Steps</span>
                        <span className="text-[9px] font-mono tracking-[0.25em] text-purple-400/80 font-semibold uppercase">04 / Onboarding Journey</span>
                      </h3>
                    </div>

                    <div className="relative pl-8 sm:pl-10 border-l border-white/[0.08] space-y-12 py-4">
                      {/* Vertical line indicator */}
                      <div className="absolute top-4 bottom-4 left-0 w-[1px] bg-gradient-to-b from-purple-500/40 via-purple-500/20 to-white/10" />

                      {/* Milestone 1 */}
                      <div className="relative group">
                        {/* Animated premium timeline dot */}
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0.5 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                          className="absolute -left-[39px] sm:-left-[47px] top-1.5 h-4 w-4 rounded-full border border-purple-500/40 bg-black flex items-center justify-center shadow-[0_0_8px_rgba(168,85,247,0.15)]"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                        </motion.div>
                        <div className="space-y-1">
                          <span className="text-purple-400 font-mono font-medium text-[10px] sm:text-[11px] tracking-widest uppercase block leading-none">
                            Within 24 Hours
                          </span>
                          <h4 className="text-base sm:text-[18px] font-bold text-white tracking-tight">Project Review</h4>
                          <p className="text-sm sm:text-[15px] text-zinc-400 leading-relaxed font-medium">
                            Our engineering leaders review your blueprints & requirements to map your custom design architecture.
                          </p>
                        </div>
                      </div>

                      {/* Milestone 2 */}
                      <div className="relative group">
                        {/* Animated premium timeline dot */}
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0.5 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
                          className="absolute -left-[39px] sm:-left-[47px] top-1.5 h-4 w-4 rounded-full border border-purple-500/30 bg-black flex items-center justify-center shadow-[0_0_8px_rgba(168,85,247,0.15)]"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-purple-500/60" />
                        </motion.div>
                        <div className="space-y-1">
                          <span className="text-purple-400 font-mono font-medium text-[10px] sm:text-[11px] tracking-widest uppercase block leading-none">
                            Within 48 Hours
                          </span>
                          <h4 className="text-base sm:text-[18px] font-bold text-white tracking-tight">Workspace Activation</h4>
                          <p className="text-sm sm:text-[15px] text-zinc-400 leading-relaxed font-medium">
                            Your premium client workspace is fully provisioned and activated for real-time asset submission and collaboration.
                          </p>
                        </div>
                      </div>

                      {/* Milestone 3 */}
                      <div className="relative group">
                        {/* Animated premium timeline dot */}
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0.5 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 2, delay: 1, repeat: Infinity, repeatType: "reverse" }}
                          className="absolute -left-[39px] sm:-left-[47px] top-1.5 h-4 w-4 rounded-full border border-zinc-500/20 bg-black flex items-center justify-center"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-zinc-500/40" />
                        </motion.div>
                        <div className="space-y-1">
                          <span className="text-zinc-500 font-mono font-medium text-[10px] sm:text-[11px] tracking-widest uppercase block leading-none">
                            Within 72 Hours
                          </span>
                          <h4 className="text-base sm:text-[18px] font-bold text-white tracking-tight">Creative Planning</h4>
                          <p className="text-sm sm:text-[15px] text-zinc-400 leading-relaxed font-medium">
                            Our designers lay out specific layout maps, wireframe concepts, and user-flow trajectories tailored to your goals.
                          </p>
                        </div>
                      </div>

                      {/* Milestone 4 */}
                      <div className="relative group">
                        {/* Animated premium timeline dot with strongest platinum-white glow */}
                        <motion.div 
                          initial={{ scale: 0.9 }}
                          animate={{ 
                            scale: [1, 1.2, 1],
                            boxShadow: [
                              "0 0 10px rgba(255, 255, 255, 0.2)",
                              "0 0 25px rgba(255, 255, 255, 0.6)",
                              "0 0 10px rgba(255, 255, 255, 0.2)"
                            ]
                          }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute -left-[39px] sm:-left-[47px] top-1.5 h-4 w-4 rounded-full border border-white bg-white flex items-center justify-center z-10"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-black animate-ping" />
                        </motion.div>
                        <div className="space-y-1">
                          <span className="text-white font-mono font-medium text-[10px] sm:text-[11px] tracking-widest uppercase block leading-none">
                            Project Kickoff
                          </span>
                          <h4 className="text-base sm:text-[18px] font-bold text-white tracking-tight font-sans">Welcome to CodeFuser</h4>
                          <p className="text-sm sm:text-[15px] text-zinc-400 leading-relaxed font-medium">
                            The full-stack development team initializes active build environments to bring your digital flagship store online.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* Navigation Back-Next Buttons */}
              {submitError && (
                <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs leading-relaxed flex items-start gap-2.5">
                  <span className="text-red-400 font-bold block shrink-0">⚠️ Error:</span>
                  <div>
                    <span className="font-semibold block">{submitError}</span>
                    <span className="text-red-400/80 block mt-1 font-mono">Your entered details are completely safe. Please review and click Submit to retry.</span>
                  </div>
                </div>
              )}

              {step !== 5 && (
                <div className={`mt-10 flex justify-between gap-4 transition-all duration-300 ${
                  step === 1 ? "pt-4" : "pt-6 border-t border-neutral-900"
                }`}>
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="btn-pressure flex items-center justify-center gap-2 border border-border/40 text-muted-foreground hover:border-border hover:text-white px-5 sm:px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider select-none active:scale-95"
                    >
                      <ArrowLeft size={14} /> Back
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate('/')}
                      className="btn-pressure flex items-center justify-center gap-2 border border-border/20 text-muted-foreground/60 hover:text-foreground hover:border-border/60 px-7 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider select-none active:scale-95 h-[48px]"
                    >
                      Cancel
                    </button>
                  )}

                  {step < 6 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={isValidatingStep1}
                      className={`btn-pressure flex items-center justify-center gap-2 bg-white text-black hover:shadow-glow-soft hover:-translate-y-0.5 rounded-full text-xs font-bold uppercase tracking-wider select-none ml-auto active:scale-95 cursor-pointer disabled:opacity-60 ${
                        step === 1 ? "px-9 py-3.5 h-[48px]" : "px-6 sm:px-7 py-3"
                      }`}
                    >
                      {step === 1 && isValidatingStep1 ? (
                        <>
                          <div className="h-3 w-3 rounded-full border-2 border-black/35 border-t-black animate-spin" />
                          Verifying your details...
                        </>
                      ) : (
                        <>
                          Next Step <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  ) : (
                    <motion.button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      animate={{
                        boxShadow: [
                          "0 4px 25px rgba(0, 0, 0, 0.7), 0 0 15px rgba(255, 255, 255, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
                          "0 4px 25px rgba(0, 0, 0, 0.7), 0 0 30px rgba(255, 255, 255, 0.22), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
                          "0 4px 25px rgba(0, 0, 0, 0.7), 0 0 15px rgba(255, 255, 255, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.1)"
                        ],
                        borderColor: [
                          "rgba(244, 239, 230, 0.2)",
                          "rgba(255, 255, 255, 0.45)",
                          "rgba(244, 239, 230, 0.2)"
                        ]
                      }}
                      transition={{
                        boxShadow: {
                          duration: 3.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        },
                        borderColor: {
                          duration: 3.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }
                      }}
                      className="relative group flex items-center justify-center gap-3 bg-neutral-950/90 hover:bg-black border text-white px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest select-none ml-auto transition-all duration-500 ease-out cursor-pointer disabled:opacity-50 backdrop-blur-xl"
                    >
                      {/* Subtle Electric Purple Reflection Overlay */}
                      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.18)_0%,transparent_75%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      
                      {/* White Hover Glow & Blur Transition */}
                      <div className="absolute -inset-1 rounded-full bg-white/[0.03] group-hover:bg-white/[0.08] blur-md transition-all duration-500 opacity-0 group-hover:opacity-100 -z-10" />

                      {isSubmitting ? (
                        <div className="relative z-10 flex items-center gap-2">
                          <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Establishing Workspace...
                        </div>
                      ) : (
                        <span className="relative z-10 flex items-center gap-2">
                          START MY PROJECT <Send size={13} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </motion.button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
          ) : onboardingStage === 'ai_loading' ? (
            <motion.div
              key="ai-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: "blur(20px)" }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020202]/90 backdrop-blur-3xl overflow-hidden"
            >
              {/* Expanding deep purple background aura */}
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ 
                  scale: [0.4, 1.8, 2.5],
                  opacity: [0, 0.85, 0.45],
                }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-purple-600/40 via-fuchsia-500/20 to-transparent blur-[120px] pointer-events-none"
              />

              {/* Streams of glowing fuchsia/purple & white particles shooting outwards */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 30 }).map((_, i) => {
                  const angle = (i / 30) * Math.PI * 2;
                  const distance = 350 + Math.random() * 250;
                  const size = Math.random() * 2.5 + 1;
                  return (
                    <motion.div
                      key={i}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: `${size}px`,
                        height: `${size}px`,
                        backgroundColor: i % 2 === 0 ? '#a855f7' : '#ffffff',
                        borderRadius: '50%',
                        boxShadow: i % 2 === 0 ? '0 0 10px rgba(168,85,247,0.8)' : '0 0 8px rgba(255,255,255,0.8)',
                      }}
                      initial={{ x: 0, y: 0, opacity: 0 }}
                      animate={{
                        x: Math.cos(angle) * distance,
                        y: Math.sin(angle) * distance,
                        opacity: [0, 1, 1, 0],
                        scale: [1, 2, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        ease: [0.1, 0.8, 0.2, 1],
                      }}
                    />
                  );
                })}
              </div>

              {/* Chosen package card emitting glowing border expansion */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 30, filter: "blur(15px)" }}
                animate={{ 
                  scale: [0.85, 1.03, 1],
                  opacity: 1, 
                  y: 0,
                  filter: "blur(0px)",
                }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative rounded-3xl border border-white/20 bg-black/80 p-8 sm:p-10 shadow-[0_0_80px_rgba(168,85,247,0.15)] max-w-sm w-full text-center z-10 overflow-hidden backdrop-blur-2xl"
              >
                {/* Diagonal sweep cutting across card */}
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{ duration: 1.2, ease: "easeInOut", delay: 0.3 }}
                  className="absolute inset-y-0 w-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent skew-x-12 pointer-events-none"
                />

                {/* Glowing halo behind card */}
                <div className="absolute inset-0 bg-purple-500/[0.01] rounded-3xl" />
                
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/5 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto mb-6 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                  <Sparkles size={22} className="animate-pulse" />
                </div>

                <div className="text-[10px] font-mono tracking-[0.25em] text-purple-400 uppercase font-black mb-2">
                  CODEFUSER PARTNERSHIP
                </div>

                <h3 className="font-display text-2xl font-black text-white tracking-wide uppercase flex items-center justify-center gap-2">
                  {selectedPlan.id === 'foundation' && <span className="text-amber-400 [text-shadow:0_0_12px_rgba(251,191,36,0.5)]">⚡</span>}
                  {selectedPlan.id === 'growth' && <span className="text-[#EBC351] [text-shadow:0_0_12px_rgba(235,195,81,0.5)]">✦</span>}
                  {selectedPlan.id === 'dominance' && <span className="text-red-500 [text-shadow:0_0_12px_rgba(239,68,68,0.5)]">⬢</span>}
                  <span>{selectedPlan.name.replace(/[⚡✦⬢]/g, '').trim()} Tier</span>
                </h3>
                
                <p className="text-[11px] font-mono text-[#EAE5D9]/70 mt-3 tracking-widest">
                  {selectedPlan.price}
                </p>

                {/* Micro flowing lines inside card */}
                <div className="mt-8 flex justify-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500/80 shadow-[0_0_6px_rgba(168,85,247,0.8)] animate-ping" />
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500/50" />
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500/30" />
                </div>
              </motion.div>

              {/* Viewport sweep of light */}
              <motion.div
                initial={{ x: "-150%", opacity: 0 }}
                animate={{ x: "250%", opacity: [0, 0.7, 0.7, 0] }}
                transition={{ duration: 1.4, ease: "easeInOut", delay: 0.1 }}
                className="absolute inset-y-0 w-2/3 bg-gradient-to-r from-transparent via-purple-500/[0.15] to-transparent skew-x-12 pointer-events-none"
              />
            </motion.div>
          ) : onboardingStage === 'recommendations' ? (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-white/[0.08] bg-[#050505] p-6 sm:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.95)] relative overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-purple-500/[0.02] blur-[160px] pointer-events-none" />

              {/* Header */}
              <div className="text-center mb-10 space-y-3">
                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-[10px] font-mono font-bold tracking-[0.2em] text-purple-300 uppercase">
                  <Sparkles size={11} className="text-purple-400 animate-pulse" /> Website Consultation Report
                </span>
                
                <h2 className="font-display text-2xl sm:text-4xl font-black text-white tracking-tight leading-snug">
                  AI Business Consultation
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed font-sans font-medium">
                  Here is our honest, consultant-level analysis and recommendations tailored for {formData.businessName || "your business"}.
                </p>
              </div>

              {/* Dynamic 4-Question AI Consultation Report */}
              {aiSummary && (
                <div className="mb-12 space-y-5 max-w-4xl mx-auto font-sans">
                  
                  {/* 1. ABOUT YOUR BUSINESS */}
                  <div className="rounded-2xl border border-white/[0.08] bg-[#080808]/90 p-6 sm:p-7 shadow-lg relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono text-xs font-bold">
                        01
                      </span>
                      <h3 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
                        1. About Your Business
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal pl-10">
                      {aiSummary.aboutYourBusiness || `We evaluated ${formData.businessName || 'your business'} (${aiSummary.specificBusinessType || 'Local Business'}). ${aiSummary.primaryBusinessGoal || 'Focused on building trust and attracting local clients online.'}`}
                    </p>
                  </div>

                  {/* 2. BIGGEST OPPORTUNITY */}
                  <div className="rounded-2xl border border-purple-500/25 bg-gradient-to-br from-purple-500/[0.05] to-transparent p-6 sm:p-7 shadow-lg relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 font-mono text-xs font-bold">
                        02
                      </span>
                      <h3 className="font-display text-lg sm:text-xl font-bold text-purple-200 tracking-tight flex items-center gap-2">
                        2. Biggest Opportunity
                        <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed font-normal pl-10">
                      {aiSummary.biggestOpportunity || "Creating a clean, welcoming website where new visitors can immediately trust your brand and contact you in one click."}
                    </p>
                  </div>

                  {/* 3. OUR RECOMMENDATION (TALKS ONLY ABOUT THE BUSINESS) */}
                  <div className="rounded-2xl border border-white/[0.08] bg-[#080808]/90 p-6 sm:p-7 shadow-lg relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs font-bold">
                        03
                      </span>
                      <h3 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
                        3. Our Recommendation
                      </h3>
                    </div>

                    <div className="pl-10 space-y-4">
                      {/* Recommended Features */}
                      {aiSummary.ourRecommendation?.recommendedFeatures && aiSummary.ourRecommendation.recommendedFeatures.length > 0 && (
                        <div>
                          <span className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2 font-bold">
                            Recommended Features for Your Business:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {aiSummary.ourRecommendation.recommendedFeatures.map((feat: string, fIdx: number) => (
                              <span key={fIdx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-zinc-200">
                                <Check className="h-3 w-3 text-purple-400" />
                                {feat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Advice */}
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                        {aiSummary.ourRecommendation?.advice || aiSummary.recommendationReason || "Focus on clear messaging and direct contact pathways to convert visitors into clients."}
                      </p>
                    </div>
                  </div>

                  {/* 4. YOUR PACKAGE (TALKS ONLY ABOUT PACKAGES) */}
                  <div className="rounded-2xl border border-white/[0.08] bg-[#080808]/90 p-6 sm:p-7 shadow-lg relative overflow-hidden">
                    <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-xs font-bold">
                          04
                        </span>
                        <h3 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
                          4. Your Package
                        </h3>
                      </div>

                      {/* Status Badge */}
                      {(() => {
                        const evalStatus = aiSummary.yourPackageEvaluation?.status || "perfect";
                        if (evalStatus === "upgrade_recommended") {
                          return (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-[10px] font-mono font-bold text-purple-300 uppercase tracking-wider">
                              ⚡ Upgrade Suggested
                            </span>
                          );
                        }
                        if (evalStatus === "downgrade_recommended") {
                          return (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                              💡 Better Value Plan Available
                            </span>
                          );
                        }
                        if (evalStatus === "different_recommended") {
                          return (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-[10px] font-mono font-bold text-blue-300 uppercase tracking-wider">
                              🎯 Alternative Recommended
                            </span>
                          );
                        }
                        return (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-wider">
                            ✓ Perfect Match
                          </span>
                        );
                      })()}
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal pl-10">
                      {aiSummary.yourPackageEvaluation?.evaluationText || aiSummary.recommendationReason || `${selectedPlan.name} is a great choice for your business goals.`}
                    </p>
                  </div>

                  {/* OPTIONAL RECOMMENDATIONS */}
                  {aiSummary.optionalRecommendations && aiSummary.optionalRecommendations.length > 0 && (
                    <div className="p-5 rounded-xl border border-white/[0.05] bg-white/[0.02]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-widest">
                          Optional Future Growth Ideas
                        </span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-zinc-400">
                          Optional
                        </span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-zinc-400 list-disc pl-5">
                        {aiSummary.optionalRecommendations.map((opt: string, oIdx: number) => (
                          <li key={oIdx}>{opt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              )}

              {/* Subtitle for cards section */}
              <div className="text-center mt-10 mb-6">
                <h3 className="font-display text-xl font-bold text-white mb-1">
                  Choose Your Final Configuration
                </h3>
                <p className="text-xs text-zinc-400 font-sans">
                  Select your base package or include the popular optional add-on to get started.
                </p>
              </div>

              {/* Grid of Recommendation Cards */}
              <div className="mt-8 mb-10">
                {recommendationCards && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {splitFeaturesForCards(recommendationCards, aiSummary?.ourRecommendation?.recommendedFeatures).map((card) => {
                      const isSelected = selectedCardId === card.id;
                      const currentCard = recommendationCards.find(c => c.id === 'current');
                      
                      const getDiffText = (item: any) => {
                        if (item.id === 'current') return null;
                        const currPriceStr = currentCard?.price || "";
                        const thisPriceStr = item.price || "";
                        const currVal = parseInt(currPriceStr.replace(/[^\d]/g, ""), 10);
                        const thisVal = parseInt(thisPriceStr.replace(/[^\d]/g, ""), 10);
                        if (!isNaN(currVal) && !isNaN(thisVal)) {
                          const diff = thisVal - currVal;
                          if (diff > 0) {
                            return `+₹${diff.toLocaleString('en-IN')}`;
                          }
                        }
                        return null;
                      };

                      let badge = "Selected Package";
                      let badgeStyle = "bg-zinc-800 text-zinc-300 border-zinc-700";
                      
                      if (card.id === 'upgrade_1' || card.id === 'upgrade_2') {
                        badge = "Recommended AI Upgrade";
                        badgeStyle = "bg-purple-500/15 text-purple-300 border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.15)]";
                      }

                      return (
                        <motion.div
                          key={card.id}
                          onClick={() => setSelectedCardId(card.id)}
                          whileHover={{ y: -4 }}
                          className={`relative select-none cursor-pointer p-6 sm:p-7 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                            isSelected 
                              ? 'border-purple-400 bg-[#0a0a0a] shadow-[0_0_35px_rgba(168,85,247,0.18)]' 
                              : 'border-white/[0.08] bg-[#060606] hover:border-white/[0.18] hover:bg-[#080808]'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute -inset-px rounded-2xl border-2 border-purple-400 pointer-events-none" />
                          )}

                          <div>
                            {/* Badging & Checkbox */}
                            <div className="flex items-center justify-between gap-2 mb-4">
                              <span className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-md inline-block tracking-wider uppercase ${badgeStyle}`}>
                                {badge}
                              </span>
                              <div className={`h-6 w-6 rounded-full border flex items-center justify-center transition-all ${
                                isSelected 
                                  ? 'border-purple-400 bg-purple-500 text-black shadow-[0_0_10px_rgba(168,85,247,0.5)]' 
                                  : 'border-white/20 bg-transparent'
                              }`}>
                                {isSelected && <Check className="h-4 w-4 stroke-[3]" />}
                              </div>
                            </div>

                            {/* Package Details */}
                            <div className="mb-4">
                              {card.id === 'current' ? (
                                <p className="text-[10px] font-mono font-bold tracking-[0.12em] text-zinc-500 mb-0.5 uppercase">
                                  Base Configuration
                                </p>
                              ) : (
                                <p className="text-[10px] font-mono font-bold tracking-[0.12em] text-purple-400 mb-0.5 uppercase flex items-center gap-1">
                                  <Sparkles className="h-3 w-3" /> Recommended AI Upgrade
                                </p>
                              )}
                              <h4 className="font-display text-2xl font-black text-white tracking-tight">
                                {card.name}
                              </h4>
                              
                              <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                                <span className="font-display text-3xl font-black text-amber-400 [text-shadow:0_0_15px_rgba(245,158,11,0.25)]">
                                  {card.price}
                                </span>
                                {card.id !== 'current' && (
                                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/25 animate-pulse">
                                    {getDiffText(card) || "+₹5,000 Complete Pack Upgrade"}
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="text-xs font-sans font-medium text-zinc-300 leading-relaxed min-h-[36px] mb-2">
                              {card.headline}
                            </p>

                             <div className="border-t border-white/[0.08] my-4" />

                            {/* Section Checklist */}
                            <p className="text-[9px] font-mono text-purple-300/90 uppercase tracking-widest block mb-3 font-bold">
                              {card.id === 'current' ? 'Included In Base Package' : 'Included In This Upgrade'}
                            </p>
                            
                            <ul className="space-y-2 text-xs mb-5 font-sans">
                              {card.benefits && card.benefits.map((benefit: string, bIdx: number) => {
                                const isHero = benefit.startsWith("⭐") || (card.id !== 'current' && bIdx === 0 && !benefit.startsWith("✓"));
                                const text = benefit.replace(/^[⭐✓]\s*/, "");

                                if (isHero) {
                                  return (
                                    <li key={bIdx} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-200 font-semibold shadow-sm">
                                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-amber-300">
                                        <Star className="h-3.5 w-3.5 fill-amber-300" />
                                      </span>
                                      <span className="text-sm tracking-tight text-white">{text}</span>
                                    </li>
                                  );
                                }

                                return (
                                  <li key={bIdx} className="flex items-center gap-2.5 px-1.5 py-1 text-zinc-300">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">
                                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                                    </span>
                                    <span className="font-medium text-xs text-zinc-200">{text}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>

                          {/* Why We Recommend This */}
                          <div className="mt-auto border-t border-white/[0.08] pt-4">
                            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-300 mb-1.5">
                              {card.id === 'current' ? 'Package Focus' : 'Why We Recommend This'}
                            </p>
                            <p className="text-xs leading-relaxed text-zinc-300 font-sans">
                              {card.rationale}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Progress CTA */}
              <div className="mt-10 flex flex-col items-center justify-center border-t border-white/[0.08] pt-8 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    if (getAuthUser()) {
                      setOnboardingStage('payment');
                    } else {
                      setOnboardingStage('workspace_signup');
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="btn-pressure inline-flex items-center justify-center gap-2 bg-white text-black hover:bg-[#eae5d9] font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-full w-full h-12 shadow-[0_12px_24px_rgba(255,255,255,0.08)] hover:-translate-y-0.5 cursor-pointer leading-none active:scale-95 transition-all"
                >
                  Confirm Selection & Proceed <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          ) : onboardingStage === 'workspace_signup' ? (
            <motion.div
              key="workspace_signup"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-neutral-900 bg-[#050505] p-6 sm:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.9)] relative overflow-hidden max-w-xl mx-auto"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-amber-500/[0.015] blur-[120px] pointer-events-none" />

              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase mb-4">
                  🔒 Secure Client Portal Registration
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                  Create Your Client Workspace
                </h2>
                <p className="text-xs text-neutral-400 max-w-md mx-auto mt-2 leading-relaxed font-sans">
                  Establish your secure credentials to link this blueprint, access the billing portal, and start collaborating on your build.
                </p>
              </div>

              {/* Tabs for Sign Up / Sign In */}
              <div className="flex border-b border-neutral-950 mb-6 font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setAuthError(null);
                  }}
                  className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
                    authMode === 'signup'
                      ? 'text-amber-400 border-amber-500'
                      : 'text-neutral-500 border-transparent hover:text-neutral-300'
                  }`}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError(null);
                  }}
                  className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'text-amber-400 border-amber-500'
                      : 'text-neutral-500 border-transparent hover:text-neutral-300'
                  }`}
                >
                  Sign In
                </button>
              </div>

              <form onSubmit={handleInlineAuthSubmit} className="space-y-4 text-left font-sans">
                {authError && (
                  <div className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-xs font-medium">
                    {authError}
                  </div>
                )}
                
                {authSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
                    <div className="h-3.5 w-3.5 rounded-full border border-t-transparent border-emerald-400 animate-spin" />
                    <span>{authSuccess}</span>
                  </div>
                )}

                {authMode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1.5 font-bold">Full Name</label>
                      <input
                        type="text"
                        value={authFullName}
                        onChange={(e) => setAuthFullName(e.target.value)}
                        placeholder="e.g. Jonathan Doe"
                        className="w-full bg-[#080808] border border-neutral-900 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-neutral-700 transition-all"
                        disabled={authLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1.5 font-bold">Business / Brand Name</label>
                      <input
                        type="text"
                        value={authBusinessName}
                        onChange={(e) => setAuthBusinessName(e.target.value)}
                        placeholder="e.g. Acme Corp"
                        className="w-full bg-[#080808] border border-neutral-900 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-neutral-700 transition-all"
                        disabled={authLoading}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1.5 font-bold">Email Address</label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#080808] border border-neutral-900 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-neutral-700 transition-all"
                    disabled={authLoading}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1.5 font-bold">Password</label>
                  <div className="relative">
                    <input
                      type={showAuthPassword ? "text" : "password"}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full bg-[#080808] border border-neutral-900 rounded-xl px-4 py-3 pr-10 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-neutral-700 transition-all"
                      disabled={authLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAuthPassword(!showAuthPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-amber-400 transition-colors focus:outline-none cursor-pointer"
                      tabIndex={-1}
                      aria-label={showAuthPassword ? "Hide password" : "Show password"}
                    >
                      {showAuthPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {authMode === 'signup' && (
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1.5 font-bold">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showAuthConfirmPassword ? "text" : "password"}
                        value={authConfirmPassword}
                        onChange={(e) => setAuthConfirmPassword(e.target.value)}
                        placeholder="Repeat your password"
                        className="w-full bg-[#080808] border border-neutral-900 rounded-xl px-4 py-3 pr-10 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-neutral-700 transition-all"
                        disabled={authLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowAuthConfirmPassword(!showAuthConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-amber-400 transition-colors focus:outline-none cursor-pointer"
                        tabIndex={-1}
                        aria-label={showAuthConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showAuthConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="btn-pressure flex items-center justify-center gap-2 bg-white text-black hover:bg-[#eae5d9] font-black text-xs uppercase tracking-wider px-8 py-3.5 rounded-full w-full h-12 shadow-lg active:scale-95 transition-all cursor-pointer leading-none disabled:opacity-50 font-sans"
                  >
                    {authLoading ? (
                      <>
                        <div className="h-3 w-3 rounded-full border border-t-transparent border-black animate-spin" />
                        <span>Synchronizing Client Portal...</span>
                      </>
                    ) : authMode === 'signup' ? (
                      <>
                        Register & Sync Workspace <ArrowRight size={13} />
                      </>
                    ) : (
                      <>
                        Sign In & Access Project <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setOnboardingStage('recommendations');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-xs text-neutral-500 hover:text-white underline cursor-pointer"
                  disabled={authLoading}
                >
                  ← Back to Recommendations
                </button>
              </div>
            </motion.div>
          ) : onboardingStage === 'payment' ? (
            <motion.div
              key="payment"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl border border-zinc-800/80 bg-[#09090b] p-5 sm:p-8 shadow-2xl relative overflow-hidden max-w-2xl mx-auto font-sans space-y-5"
            >
              {/* Header: Title & Minimal Package Pill */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-5 text-left">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
                    Book Your Website Service
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    Simple, transparent pricing for local business owners.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 shrink-0">
                  <span className="text-zinc-500 font-medium">Selected:</span>
                  <span className="font-semibold text-amber-400">{finalSelCardForPayment.name}</span>
                  <span className="text-zinc-400 font-normal">· {finalSelCardForPayment.price}</span>
                </div>
              </div>

              {/* Prominent Trust Guarantee Banner */}
              <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-left flex items-start sm:items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5 sm:mt-0">
                  <ShieldCheck size={22} strokeWidth={2.5} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    Zero Risk Guarantee
                  </h4>
                  <p className="text-xs sm:text-sm text-amber-200/90 leading-snug font-medium">
                    You pay the remaining balance only after you approve your website.
                  </p>
                </div>
              </div>

              {/* Compact 4-Step Process Timeline */}
              <div className="space-y-2 text-left">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono block">
                  How it works
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/70 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-zinc-800 text-amber-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                    <span className="text-zinc-200 font-medium text-xs leading-tight">Tell us about your business</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/70 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-zinc-800 text-amber-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                    <span className="text-zinc-200 font-medium text-xs leading-tight">We build your website</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/70 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-zinc-800 text-amber-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                    <span className="text-zinc-200 font-medium text-xs leading-tight">You check it</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/70 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-zinc-800 text-amber-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">4</span>
                    <span className="text-zinc-200 font-medium text-xs leading-tight">Website goes live</span>
                  </div>
                </div>
              </div>

              {/* Payment Options */}
              <div className="space-y-2.5 text-left pt-1">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Choose Payment Option
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Option 1: 50% Now */}
                  <div 
                    onClick={() => setSelectedPaymentTerm('milestone')}
                    className={`select-none cursor-pointer p-5 rounded-2xl border transition-all duration-200 text-left relative overflow-hidden flex flex-col justify-between ${
                      selectedPaymentTerm === 'milestone' 
                        ? 'border-purple-500/40 bg-[#0f0d1b] shadow-lg ring-1 ring-purple-500/25' 
                        : 'border-zinc-800/80 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-900/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-base font-bold text-white block">50% Now</span>
                          <p className="text-2xl sm:text-3xl font-extrabold mt-1 font-display text-amber-400 tracking-tight">
                            ₹{partPayment.toLocaleString('en-IN')} <span className="text-xs font-normal text-zinc-400 font-sans">today</span>
                          </p>
                        </div>
                        <div className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition-all mt-0.5 ${
                          selectedPaymentTerm === 'milestone' 
                            ? 'border-purple-400 bg-purple-500 text-white' 
                            : 'border-zinc-700 bg-transparent'
                        }`}>
                          {selectedPaymentTerm === 'milestone' && <Check className="h-3 w-3" strokeWidth={3} />}
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-xs text-zinc-200">
                        <div className="flex items-center gap-2">
                          <Check size={14} className={selectedPaymentTerm === 'milestone' ? "text-purple-400" : "text-emerald-400"} />
                          <span className="font-medium">Work starts today</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check size={14} className={`${selectedPaymentTerm === 'milestone' ? "text-purple-400" : "text-emerald-400"} shrink-0 mt-0.5`} />
                          <span className="font-medium">Pay the balance after you approve your website</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Full Payment */}
                  <div 
                    onClick={() => setSelectedPaymentTerm('upfront')}
                    className={`select-none cursor-pointer p-5 rounded-2xl border transition-all duration-200 text-left relative overflow-hidden flex flex-col justify-between ${
                      selectedPaymentTerm === 'upfront' 
                        ? 'border-purple-500/40 bg-[#0f0d1b] shadow-lg ring-1 ring-purple-500/25' 
                        : 'border-zinc-800/80 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-900/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-white block">Full Payment</span>
                            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Save 10%
                            </span>
                          </div>
                          <p className="text-2xl sm:text-3xl font-extrabold mt-1 font-display text-amber-400 tracking-tight">
                            ₹{upfrontTotal.toLocaleString('en-IN')} <span className="text-xs font-normal text-zinc-400 font-sans">today</span>
                          </p>
                        </div>
                        <div className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition-all mt-0.5 ${
                          selectedPaymentTerm === 'upfront' 
                            ? 'border-purple-400 bg-purple-500 text-white' 
                            : 'border-zinc-700 bg-transparent'
                        }`}>
                          {selectedPaymentTerm === 'upfront' && <Check className="h-3 w-3" strokeWidth={3} />}
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-xs text-zinc-200">
                        <div className="flex items-center gap-2">
                          <Check size={14} className={selectedPaymentTerm === 'upfront' ? "text-purple-400" : "text-emerald-400"} />
                          <span className="font-medium">One-time payment</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check size={14} className={selectedPaymentTerm === 'upfront' ? "text-purple-400" : "text-emerald-400"} />
                          <span className="font-medium">Extra savings (Save ₹{discountVal.toLocaleString('en-IN')})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Loading or Error Panel */}
              {(paymentLoading || paymentErrorMsg) && (
                <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950/80 font-sans text-xs space-y-4">
                  {paymentLoading && (
                    <div className="flex items-center gap-3 text-zinc-300 animate-pulse">
                      <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-amber-500 animate-spin" />
                      <span className="font-mono tracking-wide uppercase text-[10px]">Processing Secure Order Request...</span>
                    </div>
                  )}

                  {paymentErrorMsg && (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                        <div className="font-bold flex items-center gap-2">
                          <X size={14} className="cursor-pointer" onClick={() => setPaymentErrorMsg(null)} /> Payment Alert
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed opacity-90">{paymentErrorMsg}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-neutral-900/70 pt-6">
                <button
                  type="button"
                  onClick={() => setOnboardingStage('recommendations')}
                  className="text-xs text-neutral-400 hover:text-white underline cursor-pointer"
                  disabled={paymentLoading}
                >
                  ← Back to Recommendations
                </button>
                <button
                  type="button"
                  disabled={paymentLoading}
                  onClick={async () => {
                    const projId = createdProjectId || safeLocalStorage.getItem('fuser_client_project_id');
                    if (!projId) {
                      alert("Registration session has expired. Please restart the form.");
                      return;
                    }

                    setPaymentLoading(true);
                    setPaymentErrorMsg(null);
                    setShowSandboxFallback(false);

                    // 1. Lock/freeze quote price on backend
                    const finalPrice = selectedPaymentTerm === 'upfront' ? upfrontTotal : numericPriceForPayment;
                    const discount = selectedPaymentTerm === 'upfront' ? discountVal : 0;
                    
                    try {
                      const quoteRes = await fetch(`/api/projects/${projId}/quote`, {
                        method: "POST",
                        headers: { 
                          "Content-Type": "application/json",
                          "Authorization": `Bearer ${getAuthToken() || ""}`
                        },
                        body: JSON.stringify({
                          packageName: finalSelCardForPayment.name || "Selected Package",
                          price: finalPrice,
                          discount: discount,
                          features: finalSelCardForPayment.features || [],
                          summary: aiSummary?.recommendationReason || "Custom engineered web application."
                        })
                      });
                      if (!quoteRes.ok) {
                        throw new Error("Failed to lock quotation on server.");
                      }
                    } catch (err: any) {
                      console.warn("Quotation lock error:", err);
                      setPaymentErrorMsg("Failed to lock project details on backend server.");
                      setPaymentLoading(false);
                      return;
                    }

                    // 2. Load Razorpay Checkout Script
                    try {
                      const scriptLoaded = await loadRazorpayScript();
                      if (!scriptLoaded) {
                        throw new Error("Razorpay SDK script failed to load. Check internet connectivity.");
                      }
                    } catch (err: any) {
                      setPaymentErrorMsg(err.message || "Failed to load payment gateways.");
                      setPaymentLoading(false);
                      return;
                    }

                    // 3. Request Razorpay Order from Backend
                    let orderData: any;
                    try {
                      const orderRes = await fetch(`/api/projects/${projId}/razorpay-order`, {
                        method: "POST",
                        headers: { 
                          "Content-Type": "application/json",
                          "Authorization": `Bearer ${getAuthToken() || ""}`
                        },
                        body: JSON.stringify({ term: selectedPaymentTerm })
                      });
                      orderData = await orderRes.json();
                    } catch (err: any) {
                      setPaymentErrorMsg("Network failure connecting to payment servers.");
                      setPaymentLoading(false);
                      return;
                    }

                    if (!orderData || !orderData.success) {
                      const errMsg = orderData?.error || "Payment order creation failed.";
                      setPaymentErrorMsg(errMsg);
                      // If keys are not set, enable sandbox fallback option
                      if (errMsg.includes("API Key ID") || errMsg.includes("Secret") || errMsg.includes("configured") || errMsg.includes("missing")) {
                        setShowSandboxFallback(true);
                      }
                      setPaymentLoading(false);
                      return;
                    }

                    const { order, term } = orderData;

                    // 4. Fetch Razorpay Public Config ID
                    let keyId = "";
                    try {
                      const configRes = await fetch("/api/config/razorpay");
                      const configData = await configRes.json();
                      keyId = configData.keyId;
                    } catch (err) {
                      console.warn("Could not load public key configuration.");
                    }

                    // 5. Open Checkout Modal
                    try {
                      const options = {
                        key: keyId || "rzp_test_placeholder",
                        amount: order.amount,
                        currency: order.currency,
                        name: "CodeFuser",
                        description: `${finalSelCardForPayment.name} (${selectedPaymentTerm === 'upfront' ? '100% Upfront' : '50% Milestone'})`,
                        order_id: order.id,
                        prefill: {
                          name: formData.ownerName || "",
                          email: formData.email || "",
                          contact: formData.whatsapp || ""
                        },
                        theme: {
                          color: "#F59E0B"
                        },
                        handler: async function (response: any) {
                          setPaymentLoading(true);
                          try {
                            const verifyRes = await fetch(`/api/projects/${projId}/verify-payment`, {
                              method: "POST",
                              headers: { 
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${getAuthToken() || ""}`
                              },
                              body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                term: selectedPaymentTerm
                              })
                            });
                            const verifyData = await verifyRes.json();
                            if (verifyData.success) {
                              setOnboardingStage('calendly');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            } else {
                              setPaymentErrorMsg("Payment verification failed: " + (verifyData.error || "Please contact support."));
                            }
                          } catch (err) {
                            setPaymentErrorMsg("Could not verify transaction signature.");
                          } finally {
                            setPaymentLoading(false);
                          }
                        },
                        modal: {
                          ondismiss: function () {
                            setPaymentLoading(false);
                            setPaymentErrorMsg("Payment cancelled by customer.");
                          }
                        }
                      };

                      const rzp = new (window as any).Razorpay(options);
                      rzp.on("payment.failed", function (resp: any) {
                        setPaymentErrorMsg(`Transaction failed: ${resp.error.description || "Action rejected"}`);
                        setPaymentLoading(false);
                      });
                      rzp.open();
                    } catch (err: any) {
                      setPaymentErrorMsg("Failed to open payment sheet modal: " + err.message);
                      setPaymentLoading(false);
                    }
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200 font-semibold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-lg active:scale-95 transition-all cursor-pointer leading-none disabled:opacity-50"
                >
                  {paymentLoading ? (
                    <>
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-t-transparent border-black animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>

              {/* Dev Simulation Panel */}
              <PaymentSimulationPanel
                projectId={createdProjectId || safeLocalStorage.getItem('fuser_client_project_id') || ''}
                term={selectedPaymentTerm}
                getAuthToken={getAuthToken}
                onSuccess={(updatedProject) => {
                  setOnboardingStage('calendly');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onStatusChange={(status, msg) => {
                  if (status === 'failed' || status === 'cancelled') {
                    setPaymentErrorMsg(msg);
                  } else {
                    setPaymentErrorMsg(null);
                  }
                }}
              />
            </motion.div>
          ) : onboardingStage === 'calendly' ? (
            <motion.div
              key="calendly"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-neutral-900 bg-[#050505] p-6 sm:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.9)] relative overflow-hidden max-w-xl mx-auto text-center font-sans"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-amber-500/[0.015] blur-[120px] pointer-events-none" />

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/5 border border-amber-500/25 text-[10px] font-mono font-bold tracking-widest text-amber-500 uppercase mb-4">
                🚀 NEXT PHASE PREPARATION
              </span>

              <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
                What Happens Next
              </h2>
              <p className="text-xs text-neutral-400 mt-2 max-w-md mx-auto leading-relaxed">
                Your project details are successfully saved. Our team will begin preparing your business website.
              </p>

              {/* Status Roadmap Steps */}
              <div className="my-8 rounded-2xl border border-neutral-900 bg-[#0a0a0a]/60 p-5 text-left text-xs space-y-4 font-sans">
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 font-mono text-[10px] font-black">1</div>
                  <div>
                    <h4 className="font-bold text-white leading-normal">Deep Project Review</h4>
                    <p className="text-neutral-400 mt-0.5 leading-normal">Our team reviews your selected package terms, design preferences, and vision inputs.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 font-mono text-[10px] font-black">2</div>
                  <div>
                    <h4 className="font-bold text-white leading-normal">Communication Sprints</h4>
                    <p className="text-neutral-400 mt-0.5 leading-relaxed">
                      We will contact you directly to confirm setup schedules. Please keep a close eye on your channels:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase font-mono font-bold tracking-wider">
                      <span className="px-2.5 py-1 rounded bg-[#020202] border border-neutral-900 text-amber-400">📧 Email Messages</span>
                      <span className="px-2.5 py-1 rounded bg-[#020202] border border-neutral-900 text-amber-400">📱 WhatsApp Chat</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferred Contact Selector */}
              <div className="mb-8 text-left bg-[#050505] border border-neutral-900 p-4 rounded-2xl">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-extrabold mb-3">
                  ⏰ PREFERRED CONTACT TIME WINDOW (OPTIONAL):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'morning', label: 'Morning', time: '9 AM - 12 PM' },
                    { id: 'afternoon', label: 'Afternoon', time: '12 PM - 5 PM' },
                    { id: 'evening', label: 'Evening', time: '5 PM - 8 PM' },
                    { id: 'anytime', label: 'Anytime', time: 'Standard Hours' }
                  ].map(slot => {
                    const isSelected = preferredContactTime === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setPreferredContactTime(slot.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer select-none active:scale-95 ${
                          isSelected 
                            ? 'bg-amber-500/10 border-amber-500 text-white' 
                            : 'bg-black border-neutral-900 text-neutral-400 hover:border-neutral-800'
                        }`}
                      >
                        <span className="block text-xs font-bold leading-none">{slot.label}</span>
                        <span className="block text-[9px] font-mono text-neutral-500 leading-none mt-1">{slot.time}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scheduling Actions */}
              <div className="space-y-3 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    setOnboardingStage('asset_center');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="btn-pressure inline-flex items-center justify-center gap-2 bg-white text-black font-extrabold text-xs uppercase tracking-wider px-6 py-4 rounded-full w-full h-12 shadow-[0_12px_24px_rgba(255,255,255,0.06)] hover:-translate-y-0.5 transition-all cursor-pointer select-none leading-none"
                >
                  Confirm Window & Continue <ArrowRight size={13} />
                </button>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => setOnboardingStage('payment')}
                  className="text-xs text-neutral-500 hover:text-white underline"
                >
                  ← Back to Payment Setup
                </button>
              </div>
            </motion.div>
          ) : onboardingStage === 'asset_center' ? (
            <motion.div
              key="asset_center"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-neutral-900 bg-[#050505] p-6 sm:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.9)] relative overflow-hidden max-w-2xl mx-auto"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/[0.015] blur-[150px] pointer-events-none" />

              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase mb-4 animate-pulse">
                  📁 Digital Asset Center Ready
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Queue Your Onboarding Assets
                </h2>
                <p className="text-sm text-neutral-400 max-w-md mx-auto mt-2 leading-relaxed font-sans">
                  Pre-arrange your digital resources to enable our senior builders to launch early layout stages.
                </p>
              </div>

              <div className="space-y-4 mb-8 font-sans">
                {/* Domain choice */}
                <div className="p-4 rounded-xl border border-neutral-900 bg-black/40 text-left text-xs">
                  <span className="text-neutral-500 font-mono block text-[9px] font-bold tracking-wider uppercase mb-1">Website Address (Domain Setup)</span>
                  <p className="text-white font-semibold flex items-center gap-2">
                    <Check size={12} className="text-amber-500" />
                    {formData.hasDomain === 'yes' ? "Registered Domain identified" : formData.hasDomain === 'no' ? "Not set — assisted registration chosen" : "Assisted domain brainstorm chosen"}
                  </p>
                  <p className="text-neutral-400 mt-1 leading-normal text-[11px]">
                    {formData.hasDomain === 'yes' ? "We will configure cloud DNS pointers directly to your registrar settings on our sync video conference." : "We will brainstorm clean, high-conformance branding domains and complete registration directly on our call."}
                  </p>
                </div>

                {/* Brand Visual Logo */}
                <div className="p-4 rounded-xl border border-neutral-900 bg-black/40 text-left text-xs">
                  <span className="text-neutral-500 font-mono block text-[9px] font-bold tracking-wider uppercase mb-1">Brand Identity Assets</span>
                  <p className="text-white font-semibold flex items-center gap-2">
                    <Check size={12} className="text-amber-500" />
                    {formData.hasLogo === 'yes' ? "Branding assets ready" : formData.hasLogo === 'no' ? "Not set — design drafts requested" : "Branding vectors requested"}
                  </p>
                  <p className="text-neutral-400 mt-1 leading-normal text-[11px]">
                    {formData.hasLogo === 'yes' ? "Excellent. Please pre-compile transparent layers (.png .svg vector formats) to streamline page layout integrations." : "Our visual layout directors are pre-scheduled to help design palette definitions and alignment during project sync."}
                  </p>
                </div>

                {/* Media and texts content */}
                <div className="p-4 rounded-xl border border-neutral-900 bg-black/40 text-left text-xs">
                  <span className="text-neutral-500 font-mono block text-[9px] font-bold tracking-wider uppercase mb-1">Media, Copywriting & Content</span>
                  <p className="text-white font-semibold flex items-center gap-2">
                    <Check size={12} className="text-amber-500" />
                    {formData.contentReady === 'yes' ? "Structured copy packages prepared" : formData.contentReady === 'progress' ? "Onboarding copy packages in progress" : "Integrated copywriting services requested"}
                  </p>
                  <p className="text-neutral-400 mt-1 leading-normal text-[11px]">
                    {formData.contentReady === 'yes' ? "We will match your copy layout and text files to speed up delivery timelines." : "No worries. CodeFuser's copywriting directors are scheduled to draft headers, benefit structures, and descriptions with you on video."}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-neutral-900 pt-6">
                <button
                  type="button"
                  onClick={() => setOnboardingStage('calendly')}
                  className="text-xs text-neutral-400 hover:text-white underline"
                >
                  ← Back to Calendly
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (getAuthUser()) {
                      navigate('/dashboard');
                    } else {
                      setOnboardingStage('success');
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="btn-pressure flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-black hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] font-black text-xs uppercase tracking-wider px-8 py-3.5 rounded-full shadow-lg active:scale-95 transition-all cursor-pointer leading-none"
                >
                  Complete Blueprint Setup <Check size={14} strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success-container"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-neutral-900 bg-[#050505] p-6 sm:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.9)] relative overflow-hidden text-center max-w-xl mx-auto"
              id="start-project-success"
            >
              {/* Decorative glows */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/[0.015] blur-[150px] pointer-events-none" />

              <div className="text-center mb-8 font-sans">
                {/* Status Indicator */}
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase mb-5 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-sans">
                  🎉 Payment Successful
                </span>
                
                <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                  Thank you for choosing CodeFuser.
                </h2>
                <p className="text-xs text-neutral-400 max-w-md mx-auto mt-3 leading-relaxed font-sans">
                  Your payment has been received successfully. Your secure client workspace is now ready. 
                  Choose an option below to secure your client credentials and access your premium Client Portal.
                </p>
              </div>

              {/* Locked details spec block */}
              <div className="rounded-2xl border border-neutral-900 bg-[#070707] p-5 space-y-4 text-xs tracking-wide text-left mb-8 max-w-sm mx-auto">
                <span className="text-neutral-500 block font-mono text-[9px] font-bold uppercase tracking-wider border-b border-neutral-950 pb-2 mb-2">Workspace Configuration</span>
                <div className="grid grid-cols-2 gap-y-3 font-sans">
                  <div>
                    <span className="text-neutral-500 block text-[9px] font-mono uppercase">BUSINESS MODEL</span>
                    <span className="text-white font-bold text-xs mt-1 block">
                      {formData.businessName || "Your Brand"}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[9px] font-mono uppercase">BUILD PACKAGE</span>
                    <span className="text-amber-400 font-bold text-xs mt-1 block">
                      {recommendationCards?.find(c => c.id === selectedCardId)?.name || selectedPlan.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col items-center justify-center gap-3.5 max-w-md mx-auto font-sans">
                {getAuthUser() ? (
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/dashboard');
                    }}
                    className="btn-pressure inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-black hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] font-black text-xs uppercase tracking-wider px-6 py-4 rounded-xl w-full shadow-lg active:scale-95 transition-all cursor-pointer leading-none h-12"
                  >
                    Enter Client Workspace <ArrowRight size={14} />
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        navigate('/login?signup=true');
                      }}
                      className="btn-pressure inline-flex items-center justify-center gap-2 bg-white text-black hover:bg-neutral-100 font-bold text-xs uppercase tracking-wider px-6 py-4 rounded-xl w-full shadow-lg active:scale-95 transition-all cursor-pointer leading-none h-12"
                    >
                      Create Client Account <ArrowRight size={14} />
                    </button>

                    <div className="relative flex py-1 w-full items-center">
                      <div className="flex-grow border-t border-neutral-900/65"></div>
                      <span className="flex-shrink mx-3 text-[9px] text-neutral-600 uppercase font-mono tracking-widest">or</span>
                      <div className="flex-grow border-t border-neutral-900/65"></div>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const rUri = `${window.location.origin}/login`;
                          const { error } = await supabase.auth.signInWithOAuth({
                            provider: "google",
                            options: {
                              redirectTo: rUri,
                            },
                          });
                          if (error) throw error;
                        } catch (e: any) {
                          console.warn("OAuth sign in failed:", e);
                          navigate('/login');
                        }
                      }}
                      className="inline-flex items-center justify-center gap-2 bg-neutral-950 hover:bg-neutral-900 text-white font-semibold text-xs border border-neutral-800 py-3.5 rounded-xl w-full transition-all h-12 cursor-pointer"
                    >
                      <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24">
                        <path
                          fill="white"
                          d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.71 0 3.27.61 4.5 1.643l2.425-2.424C17.275 1.682 14.89 1 12.24 1 6.58 1 2 5.58 2 11.24s4.58 10.24 10.24 10.24c5.915 0 9.83-4.16 9.83-10 0-.673-.06-1.196-.184-1.196h-9.646z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                  </>
                )}
              </div>

              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-xs text-neutral-500 hover:text-white underline underline-offset-4 cursor-pointer transition-all"
                >
                  Return Home
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

function getOnboardingFallbackUpgrades(
  packageId: string,
  businessName: string = "Your Business",
  ownerName: string = "",
  industry: string = "",
  goal: string = ""
) {
  const bName = businessName || "Your Business";
  const ind = (industry || "").toLowerCase();

  const PLUS_PREDEFINED_PRICES: Record<string, string[]> = {
    foundation: ["₹10,450", "₹11,250", "₹11,999", "₹12,250", "₹13,500"],
    growth: ["₹20,250", "₹20,999", "₹21,500", "₹22,250", "₹22,900"],
    dominance: ["₹41,500", "₹43,250", "₹44,999", "₹46,800", "₹48,250"]
  };

  let baseName = "✦ Fusion";
  let basePrice = "₹19,999";
  const pkgKey = packageId === "foundation" ? "foundation" : packageId === "dominance" ? "dominance" : "growth";
  const allowedPrices = PLUS_PREDEFINED_PRICES[pkgKey];
  const upgradePrice = allowedPrices[Math.floor(Math.random() * allowedPrices.length)];

  if (packageId === "foundation") {
    baseName = "⚡ Ignite";
    basePrice = "₹9,999";
  } else if (packageId === "dominance") {
    baseName = "⬢ Catalyst";
    basePrice = "₹39,999";
  }

  // Base card configuration
  const baseCard = {
    id: "current",
    name: baseName,
    price: basePrice,
    headline: `Clean, modern website setup designed to establish ${bName}'s online business presence.`,
    benefits: [
      "✓ Mobile Friendly Design",
      "✓ Contact Form",
      "✓ Google Maps Location",
      "✓ Business Info & Hours"
    ],
    rationale: `${baseName} provides the baseline website foundation for local business visibility.`
  };

  // Determine Micro Solution Pack based on industry category (EXACTLY 6 SPECIAL BUSINESS FEATURES EACH)
  let packTitle = "Client Growth Pack";
  let headline = `24/7 online booking, direct WhatsApp ordering, and price catalog for ${bName}.`;
  let benefits = [
    "⭐ Online Booking",
    "✓ WhatsApp Orders",
    "✓ Customer Reviews",
    "✓ Service Price List",
    "✓ Special Offers",
    "✓ Client Login"
  ];
  let rationale = `Makes it easy for customers to explore your service prices, send direct WhatsApp inquiries, and book appointments 24/7 without waiting for business hours.`;

  if (ind.includes("photo") || ind.includes("studio") || ind.includes("photography") || ind.includes("designer")) {
    packTitle = "Premium Booking Pack";
    headline = `Direct photoshoot booking, photo gallery, and event package showcase for ${bName}.`;
    benefits = [
      "⭐ Wedding Gallery",
      "✓ Event Gallery",
      "✓ Online Booking",
      "✓ Package Pricing",
      "✓ Customer Reviews",
      "✓ Download Photos"
    ];
    rationale = `You're a photo studio. Most customers first want to check availability before calling. This upgrade lets visitors book sessions instantly and helps reduce missed inquiries.`;
  } else if (ind.includes("food") || ind.includes("restaurant") || ind.includes("cafe") || ind.includes("bakery") || ind.includes("dining")) {
    packTitle = "Online Ordering Pack";
    headline = `Digital menu ordering, table reservations, and WhatsApp chat ordering for ${bName}.`;
    benefits = [
      "⭐ Online Ordering",
      "✓ Table Booking",
      "✓ Digital Menu",
      "✓ WhatsApp Orders",
      "✓ Customer Reviews",
      "✓ Loyalty Program"
    ];
    rationale = `Allows customers to view your digital menu and place orders directly on WhatsApp. Helps manage customer table bookings and keeps customers coming back with a loyalty program.`;
  } else if (ind.includes("medical") || ind.includes("clinic") || ind.includes("doctor") || ind.includes("dental") || ind.includes("hospital") || ind.includes("health")) {
    packTitle = "Patient Booking Pack";
    headline = `24/7 automated patient appointment scheduling and WhatsApp reminders for ${bName}.`;
    benefits = [
      "⭐ Online Appointment",
      "✓ Doctor Profiles",
      "✓ Patient Reviews",
      "✓ Treatment Pages",
      "✓ WhatsApp Reminder",
      "✓ Health Packages"
    ];
    rationale = `Gives patients a fast 24/7 online appointment booking system with automated WhatsApp reminders. Cuts down on phone calls at your reception desk and stops missed appointments.`;
  } else if (ind.includes("gym") || ind.includes("fitness") || ind.includes("yoga") || ind.includes("crossfit") || ind.includes("workout")) {
    packTitle = "Membership Growth Pack";
    headline = `Free trial pass registration, trainer profiles, and class scheduling for ${bName}.`;
    benefits = [
      "⭐ Trial Registration",
      "✓ Membership Plans",
      "✓ Trainer Profiles",
      "✓ Workout Timetable",
      "✓ Progress Tracker",
      "✓ Nutrition Plans"
    ];
    rationale = `Local fitness seekers prefer trying a class first. This upgrade captures free trial pass registrations directly from your website and converts them into active monthly members.`;
  } else if (ind.includes("salon") || ind.includes("spa") || ind.includes("beauty") || ind.includes("parlour") || ind.includes("hair")) {
    packTitle = "Smart Booking Pack";
    headline = `One-click WhatsApp booking, treatment price list, and style showcase for ${bName}.`;
    benefits = [
      "⭐ Online Booking",
      "✓ Before & After Gallery",
      "✓ WhatsApp Booking",
      "✓ Service Price List",
      "✓ Gift Cards",
      "✓ Membership System"
    ];
    rationale = `Clients love checking service prices and seeing before-and-after results before booking. This upgrade lets visitors choose a treatment and book their appointment in one click.`;
  } else if (ind.includes("estate") || ind.includes("real") || ind.includes("property") || ind.includes("realty") || ind.includes("builder")) {
    packTitle = "Site Visit Pack";
    headline = `Property listings showcase, site visit scheduler, and loan calculator for ${bName}.`;
    benefits = [
      "⭐ Property Listings",
      "✓ Property Search",
      "✓ Site Visit Booking",
      "✓ EMI Calculator",
      "✓ WhatsApp Enquiry",
      "✓ Virtual Tour"
    ];
    rationale = `Serious property buyers want to view listings and schedule site visits quickly. This upgrade lets buyers calculate EMI options and book property visits directly.`;
  } else if (ind.includes("coaching") || ind.includes("education") || ind.includes("school") || ind.includes("academy") || ind.includes("tuition") || ind.includes("course")) {
    packTitle = "Student Enrollment Pack";
    headline = `Free demo class registration, course catalog, and batch seat booking for ${bName}.`;
    benefits = [
      "⭐ Course List",
      "✓ Demo Class Booking",
      "✓ Student Reviews",
      "✓ Batch Timings",
      "✓ Download Brochure",
      "✓ Online Admission"
    ];
    rationale = `Parents and students prefer registering for a demo class before enrolling. This upgrade makes it easy for prospective students to check batch timings and sign up for demo classes.`;
  }

  const upgradeCard = {
    id: "upgrade_1",
    name: `${baseName} + ${packTitle}`,
    price: upgradePrice,
    headline,
    benefits,
    rationale
  };

  return splitFeaturesForCards([baseCard, upgradeCard], benefits);
}

function getOnboardingFallbackSummary(
  packageId: string,
  businessName: string,
  industry: string,
  goal: string,
  aiPrompt: string
) {
  const bName = businessName || "Your Business";
  const normalized = (industry || "").toLowerCase() + " " + (businessName || "").toLowerCase() + " " + (aiPrompt || "").toLowerCase();
  const promptLower = (aiPrompt || "").toLowerCase();

  // Plan escalation check (>2 complex features requested)
  const complexKeywords = ["crm", "chatbot", "payment", "portal", "dashboard", "multi-language", "analytics", "api"];
  const complexCount = complexKeywords.filter(kw => promptLower.includes(kw)).length;

  let currentPkgName = "Fusion";
  if (packageId === "foundation") currentPkgName = "Ignite";
  if (packageId === "dominance") currentPkgName = "Catalyst";

  let recPkgName = currentPkgName;
  let status = "perfect";
  let evalText = `${currentPkgName} is a great fit for your business goals.`;

  if (complexCount > 2 && packageId === "foundation") {
    recPkgName = "Fusion";
    status = "upgrade_recommended";
    evalText = "Because your project requires multiple complex integrations, Fusion is the recommended starting foundation.";
  }

  // Custom requirement check
  const customKeywords = ["virtual tour", "ai assistant", "custom workflow", "special integration", "3d", "vr"];
  const isCustomDetected = customKeywords.some(kw => promptLower.includes(kw));

  let specificType = "Local Business";
  let businessCat = "General Business";
  let opportunity = `Helping local customers discover ${bName} and convert into paying clients effortlessly.`;
  let recFeatures = [
    "Online Booking",
    "WhatsApp Orders",
    "Customer Reviews",
    "Service Price List",
    "Special Offers",
    "Client Login"
  ];
  let advice = `These features make it effortless for local customers to discover ${bName}, explore your services, and contact you directly.`;
  let optionalRecommendations = [
    `Set up a Google Business Profile to show up in local searches for ${bName}.`,
    "Actively ask satisfied customers for digital reviews to build local trust.",
    "Share special offers and customer testimonials on WhatsApp & social media."
  ];

  if (normalized.includes("dental") || normalized.includes("clinic") || normalized.includes("doctor") || normalized.includes("medical") || normalized.includes("hospital") || normalized.includes("health")) {
    specificType = "Dental / Medical Clinic";
    businessCat = "Health & Wellness";
    opportunity = "Building immediate patient trust and making appointment bookings effortless.";
    recFeatures = [
      "Online Appointment",
      "Doctor Profiles",
      "Patient Reviews",
      "Treatment Pages",
      "WhatsApp Reminder",
      "Health Packages"
    ];
    advice = "These features help patients learn about your treatments and book appointments online.";
    optionalRecommendations = [
      "Allow patients to book appointments online.",
      "Show patient reviews to build trust.",
      "Make it easy for patients to find your clinic location."
    ];
  } else if (normalized.includes("food") || normalized.includes("restaurant") || normalized.includes("cafe") || normalized.includes("bakery") || normalized.includes("dining")) {
    specificType = "Restaurant / Cafe";
    businessCat = "Food & Beverage";
    opportunity = "Displaying your digital menu and table reservations so local diners can reach you instantly.";
    recFeatures = [
      "Online Ordering",
      "Table Booking",
      "Digital Menu",
      "WhatsApp Orders",
      "Customer Reviews",
      "Loyalty Program"
    ];
    advice = "These features help local diners explore your digital menu and reserve a table quickly.";
    optionalRecommendations = [
      "Let customers see your menu before visiting.",
      "Allow table reservations online.",
      "Make weekend offers easy to share on WhatsApp."
    ];
  } else if (normalized.includes("gym") || normalized.includes("fitness") || normalized.includes("yoga") || normalized.includes("crossfit") || normalized.includes("workout")) {
    specificType = "Gym / Fitness Studio";
    businessCat = "Sports & Fitness";
    opportunity = "Helping members view class schedules, check trainer expertise, and join instantly.";
    recFeatures = [
      "Trial Registration",
      "Membership Plans",
      "Trainer Profiles",
      "Workout Timetable",
      "Progress Tracker",
      "Nutrition Plans"
    ];
    advice = "These features help fitness enthusiasts check class schedules, see trainer profiles, and claim trial passes.";
    optionalRecommendations = [
      "Allow members to check class schedules easily.",
      "Offer a free trial pass to attract new members.",
      "Show trainer profiles and member transformation stories."
    ];
  } else if (normalized.includes("photo") || normalized.includes("studio") || normalized.includes("photography") || normalized.includes("designer")) {
    specificType = "Photo Studio";
    businessCat = "Photography & Creative";
    opportunity = "Showcasing your photo portfolio and letting clients book sessions effortlessly.";
    recFeatures = [
      "Wedding Gallery",
      "Event Gallery",
      "Online Booking",
      "Package Pricing",
      "Customer Reviews",
      "Download Photos"
    ];
    advice = "These features help showcase your photography work and make it easy for customers to book a photoshoot.";
    optionalRecommendations = [
      "Make your best work easy to showcase.",
      "Allow customers to enquire in one click.",
      "Display your photography packages clearly."
    ];
  } else if (normalized.includes("salon") || normalized.includes("spa") || normalized.includes("beauty") || normalized.includes("parlour") || normalized.includes("hair")) {
    specificType = "Salon / Spa";
    businessCat = "Beauty & Personal Care";
    opportunity = "Showcasing your style gallery and letting clients book appointments easily.";
    recFeatures = [
      "Online Booking",
      "Before & After Gallery",
      "WhatsApp Booking",
      "Service Price List",
      "Gift Cards",
      "Membership System"
    ];
    advice = "These features help clients explore your beauty treatments, see past results, and book appointments instantly.";
    optionalRecommendations = [
      "Allow clients to book appointments via WhatsApp easily.",
      "Show before-and-after style photos to build confidence.",
      "Display clear treatment pricing packages."
    ];
  } else if (normalized.includes("real estate") || normalized.includes("property") || normalized.includes("builder") || normalized.includes("realty")) {
    specificType = "Real Estate Agency";
    businessCat = "Real Estate";
    opportunity = "Helping property seekers explore featured listings and schedule site visits.";
    recFeatures = [
      "Property Listings",
      "Property Search",
      "Site Visit Booking",
      "EMI Calculator",
      "WhatsApp Enquiry",
      "Virtual Tour"
    ];
    advice = "These features help home buyers explore listings, take video tours, and schedule site visits effortlessly.";
    optionalRecommendations = [
      "Allow buyers to request site visits in one click.",
      "Show featured property photos and video tours.",
      "Provide an easy EMI calculator for buyers."
    ];
  } else if (normalized.includes("coaching") || normalized.includes("education") || normalized.includes("school") || normalized.includes("academy") || normalized.includes("tuition") || normalized.includes("course")) {
    specificType = "Coaching / Academy";
    businessCat = "Education & Learning";
    opportunity = "Building academic credibility and driving free demo class enrollments.";
    recFeatures = [
      "Course List",
      "Demo Class Booking",
      "Student Reviews",
      "Batch Timings",
      "Download Brochure",
      "Online Admission"
    ];
    advice = "These features help prospective students explore your courses, build trust, and sign up for demo classes easily.";
    optionalRecommendations = [
      "Allow students and parents to sign up for free demo classes.",
      "Display student exam results and testimonials.",
      "Provide clear course details and fee structures."
    ];
  }

  if (isCustomDetected) {
    advice += " Custom Requirement Detected: Our team will review this to suggest the best tailored solution.";
  }

  return {
    aboutYourBusiness: `${bName} is a ${specificType.toLowerCase()} looking to expand local reach and make client inquiries effortless.`,
    biggestOpportunity: opportunity,
    ourRecommendation: {
      recommendedPackage: recPkgName,
      recommendedFeatures: recFeatures,
      advice
    },
    yourPackageEvaluation: {
      status,
      evaluationText: evalText
    },
    optionalRecommendations,
    businessCategory: businessCat,
    specificBusinessType: specificType,
    primaryBusinessGoal: goal || "Helping your business build trust and gain new customers.",
    customerVision: aiPrompt || "Create a clean, welcoming online presence for your business.",
    recommendedStartingPackage: recPkgName,
    recommendationReason: `${recPkgName} fits your current business stage perfectly.`
  };
}

export default StartProjectPage;
