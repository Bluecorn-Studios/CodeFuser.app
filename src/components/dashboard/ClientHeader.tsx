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
    <header className="fixed top-0 inset-x-0 z-40 border-b border-neutral-900 bg-black/95 backdrop-blur-xl h-16 px-4 sm:px-8 flex items-center justify-between select-none">
      {/* LEFT: CodeFuser Official Logo + Mobile Hamburger */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 rounded-xl cursor-pointer"
          aria-label="Toggle Navigation"
        >
          {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <button
          onClick={() => setActiveTab("overview")}
          className="flex items-center cursor-pointer transition-opacity hover:opacity-85"
        >
          <img
            src="/logo.svg"
            alt="CodeFuser"
            className="h-[20px] sm:h-[22px] w-auto block select-none"
          />
        </button>
      </div>

      {/* CENTER: Navigation Tabs (Desktop) */}
      <nav className="hidden lg:flex items-center gap-1 bg-neutral-950/90 border border-neutral-900 p-1.5 rounded-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all cursor-pointer ${
                isActive
                  ? "bg-white text-black shadow-lg shadow-white/10 font-extrabold scale-[1.02]"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900/80 font-semibold"
              }`}
            >
              <Icon size={15} className={isActive ? "text-black" : "text-neutral-400"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* RIGHT: Status Badge & Client Profile */}
      <div className="flex items-center gap-3">
        {/* Project Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-full text-xs">
          <span className="h-2 w-2 rounded-full bg-white animate-pulse shrink-0" />
          <span className="text-[11px] font-semibold text-neutral-300 truncate max-w-[140px]">
            {getCustomerStatusLabel(currentStageIndex)}
          </span>
        </div>

        {/* Client Profile Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-xs text-white cursor-pointer transition-all"
          >
            <div className="h-6 w-6 rounded-full bg-white text-black flex items-center justify-center text-[11px] font-black shrink-0">
              {clientName?.charAt(0).toUpperCase() || "C"}
            </div>
            <span className="hidden md:inline text-xs font-bold text-white truncate max-w-[120px]">
              {clientName || businessName || "Client"}
            </span>
            <ChevronDown size={12} className={`text-neutral-400 transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Profile Dropdown Menu */}
          <AnimatePresence>
            {isProfileDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsProfileDropdownOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-neutral-800 bg-neutral-950 p-2 shadow-2xl z-50 text-left overflow-hidden"
                >
                  <div className="p-2 border-b border-neutral-900 mb-1">
                    <span className="text-xs font-bold text-[#EAE5D9] block truncate">
                      {clientName || "Client"}
                    </span>
                    <span className="text-[10px] text-neutral-500 block truncate">
                      {clientEmail || "Account"}
                    </span>
                    {businessName && (
                      <span className="text-[10px] text-amber-500/90 font-medium block truncate mt-0.5">
                        {businessName}
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5">
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
                <img
                  src="/logo.svg"
                  alt="CodeFuser"
                  className="h-[20px] w-auto block select-none"
                />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-neutral-400 hover:text-white cursor-pointer"
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
                          ? "bg-white text-black shadow-lg shadow-white/10 font-extrabold"
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
              <div className="px-3.5 py-2.5 bg-neutral-950 border border-neutral-900 rounded-2xl flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span className="text-xs font-semibold text-neutral-300 truncate">
                  {getCustomerStatusLabel(currentStageIndex)}
                </span>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logoutClient();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all border border-red-500/20 cursor-pointer"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};



