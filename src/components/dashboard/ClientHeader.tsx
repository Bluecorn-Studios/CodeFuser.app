import React, { useState } from "react";
import { User, ChevronDown, Coins, MessageSquare, LogOut, Home, Globe, FolderOpen, CreditCard, HelpCircle, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export type TabType = "overview" | "project" | "files" | "payments" | "help";

interface ClientHeaderProps {
  businessName: string;
  clientName: string;
  clientEmail: string;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currentStageIndex: number;
  getCustomerStatusLabel: (index: number) => string;
  isProfileDropdownOpen: boolean;
  setIsProfileDropdownOpen: (open: boolean) => void;
  setActiveWorkspaceModal: React.Dispatch<React.SetStateAction<"settings" | "billing" | "support" | null>>;
  logoutClient: () => void;
}

export const ClientHeader: React.FC<ClientHeaderProps> = ({
  businessName,
  clientName,
  clientEmail,
  activeTab,
  setActiveTab,
  currentStageIndex,
  getCustomerStatusLabel,
  isProfileDropdownOpen,
  setIsProfileDropdownOpen,
  setActiveWorkspaceModal,
  logoutClient,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs: Array<{ id: TabType; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = [
    { id: "overview", label: "Home", icon: Home },
    { id: "project", label: "My Website", icon: Globe },
    { id: "files", label: "My Files", icon: FolderOpen },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "help", label: "Help", icon: HelpCircle },
  ];

  const handleTabClick = (id: TabType) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* MOBILE TOP BAR (< lg screens) */}
      <header className="lg:hidden sticky top-0 z-40 border-b border-neutral-900 bg-black/95 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 rounded-xl cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex items-center gap-2">
            <img
              src="/codefuser-logo-hd.jpg"
              alt="CodeFuser Logo"
              className="h-7 w-7 rounded-lg object-cover border border-neutral-800"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/logo.png";
              }}
            />
            <div>
              <span className="font-display text-sm font-black tracking-widest text-white uppercase block leading-tight">
                CODEFUSER
              </span>
              <span className="text-[10px] text-neutral-400 truncate max-w-[130px] block font-medium">
                {businessName || clientName || "Dashboard"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-800 bg-neutral-900 text-xs text-white"
          >
            <div className="h-5 w-5 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-black">
              {clientName?.charAt(0).toUpperCase() || "C"}
            </div>
            <ChevronDown size={12} className={`text-neutral-400 transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
      </header>

      {/* MOBILE MENU DRAWER (< lg screens) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-black border-r border-neutral-900 p-6 flex flex-col justify-between shadow-2xl"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/codefuser-logo-hd.jpg"
                    alt="CodeFuser Logo"
                    className="h-9 w-9 rounded-xl object-cover border border-neutral-800"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/logo.png";
                    }}
                  />
                  <div>
                    <span className="font-display text-base font-black tracking-widest text-white uppercase block leading-tight">
                      CODEFUSER
                    </span>
                    <span className="text-xs text-neutral-400 font-medium block mt-0.5">
                      {businessName || "Client Portal"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-neutral-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation links */}
              <nav className="space-y-1.5">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-3 block mb-2">
                  Navigation
                </span>
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs transition-all text-left font-bold cursor-pointer ${
                        isActive
                          ? "bg-white text-black shadow-md"
                          : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                      }`}
                    >
                      <Icon size={18} className={isActive ? "text-black" : "text-neutral-400"} />
                      <span className="text-sm">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-neutral-900 space-y-3">
              <div className="px-3 py-2 bg-neutral-950 border border-neutral-900 rounded-2xl flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-xs font-semibold text-neutral-300 truncate">
                  {getCustomerStatusLabel(currentStageIndex)}
                </span>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logoutClient();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all border border-red-500/20"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR NAVIGATION (lg:flex) */}
      <aside className="hidden lg:flex w-64 xl:w-72 fixed top-0 bottom-0 left-0 bg-black border-r border-neutral-900/90 p-6 flex-col justify-between z-30 select-none">
        <div className="space-y-8">
          {/* Logo & Branding Header */}
          <div className="space-y-2 border-b border-neutral-900/80 pb-5">
            <div className="flex items-center gap-3">
              <img
                src="/codefuser-logo-hd.jpg"
                alt="CodeFuser Logo"
                className="h-9 w-9 rounded-xl object-cover border border-neutral-800 shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/logo.png";
                }}
              />
              <div>
                <span className="font-display text-base font-black tracking-widest text-white uppercase block leading-tight">
                  CODEFUSER
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase block mt-0.5">
                  Client Portal
                </span>
              </div>
            </div>

            {/* Business Badge */}
            <div className="pt-2">
              <div className="px-3 py-2 bg-neutral-950 border border-neutral-900 rounded-2xl">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Active Project</span>
                <span className="text-xs font-bold text-[#EAE5D9] truncate block mt-0.5">
                  {businessName || clientName || "Web Project"}
                </span>
              </div>
            </div>
          </div>

          {/* LEFT NAVIGATION LINKS */}
          <nav className="space-y-2">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-3 block mb-2">
              Dashboard Navigation
            </span>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs transition-all cursor-pointer group font-bold ${
                    isActive
                      ? "bg-white text-black shadow-lg shadow-white/5"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? "text-black" : "text-neutral-400 group-hover:text-white"} />
                    <span className="text-xs sm:text-sm font-bold tracking-tight">{tab.label}</span>
                  </div>
                  {isActive && <div className="h-1.5 w-1.5 rounded-full bg-black" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM USER / STATUS CARD */}
        <div className="space-y-3 pt-4 border-t border-neutral-900/80">
          {/* Status Badge */}
          <div className="px-3.5 py-2.5 bg-neutral-950 border border-neutral-900 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-xs font-semibold text-neutral-300 truncate">
                {getCustomerStatusLabel(currentStageIndex)}
              </span>
            </div>
          </div>

          {/* User Account Menu Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="w-full flex items-center justify-between p-3 rounded-2xl border border-neutral-900 bg-neutral-950 hover:bg-neutral-900 transition-all cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-xl bg-neutral-800 text-white flex items-center justify-center font-bold text-xs shrink-0 border border-neutral-700">
                  {clientName?.charAt(0).toUpperCase() || <User size={14} />}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#EAE5D9] block truncate">
                    {clientName || "Client"}
                  </span>
                  <span className="text-[10px] text-neutral-500 block truncate">
                    {clientEmail || "Account"}
                  </span>
                </div>
              </div>
              <ChevronDown size={14} className={`text-neutral-400 shrink-0 transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {isProfileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsProfileDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.12 }}
                    className="absolute bottom-full left-0 right-0 mb-2 rounded-2xl border border-neutral-800 bg-neutral-950 p-2 shadow-2xl z-50 text-left overflow-hidden"
                  >
                    <div className="p-1 space-y-1">
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setActiveWorkspaceModal("settings");
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer text-left"
                      >
                        <User size={14} className="text-neutral-400" />
                        Account Settings
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setActiveWorkspaceModal("billing");
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer text-left"
                      >
                        <Coins size={14} className="text-neutral-400" />
                        Billing Details
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setActiveWorkspaceModal("support");
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer text-left"
                      >
                        <MessageSquare size={14} className="text-neutral-400" />
                        Support Inquiry
                      </button>

                      <div className="h-px bg-neutral-900 my-1" />

                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          logoutClient();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all cursor-pointer text-left"
                      >
                        <LogOut size={14} />
                        Log out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>
    </>
  );
};


