import React from "react";
import { User, ChevronDown, Coins, MessageSquare, LogOut, Home, Globe, FolderOpen, CreditCard, HelpCircle } from "lucide-react";
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
  const tabs: Array<{ id: TabType; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = [
    { id: "overview", label: "Home", icon: Home },
    { id: "project", label: "My Website", icon: Globe },
    { id: "files", label: "My Files", icon: FolderOpen },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "help", label: "Help", icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-900 bg-black/90 backdrop-blur-md px-4 sm:px-6 py-3.5">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Top Row / Branding */}
        <div className="w-full sm:w-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-display text-base font-bold tracking-wider text-[#EAE5D9] select-none">
              CODEFUSER
            </span>
            <span className="text-xs text-neutral-600 font-sans select-none">•</span>
            <span className="text-xs font-sans font-medium text-neutral-300 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800/80 max-w-[160px] sm:max-w-[220px] truncate">
              {businessName || clientName || "Client Portal"}
            </span>
          </div>

          {/* Mobile Profile Trigger */}
          <div className="sm:hidden relative">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900 text-xs text-[#EAE5D9]"
            >
              <div className="h-5 w-5 rounded-full bg-neutral-800 flex items-center justify-center text-[#EAE5D9] text-[10px] font-bold">
                {clientName?.charAt(0).toUpperCase() || <User size={10} />}
              </div>
              <ChevronDown size={12} className={`text-neutral-400 transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center gap-1 bg-neutral-950 p-1 rounded-full border border-neutral-900 w-full sm:w-auto overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[#EAE5D9] text-black font-semibold shadow-sm"
                    : "text-neutral-400 hover:text-[#EAE5D9] hover:bg-neutral-900/60"
                }`}
              >
                <Icon size={14} className={isActive ? "text-black" : "text-neutral-500"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Desktop Profile Menu */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-neutral-900/60 border border-neutral-800 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-sans font-medium text-neutral-300">
              {getCustomerStatusLabel(currentStageIndex)}
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-900 hover:border-neutral-700 transition-all cursor-pointer focus:outline-none"
            >
              <div className="h-5 w-5 rounded-full bg-neutral-800 flex items-center justify-center text-[#EAE5D9] text-xs font-bold">
                {clientName?.charAt(0).toUpperCase() || <User size={12} />}
              </div>
              <span className="text-xs font-sans font-medium text-[#EAE5D9] max-w-[110px] truncate">
                {clientName || "Client"}
              </span>
              <ChevronDown size={12} className={`text-neutral-400 transition-transform duration-200 ${isProfileDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {isProfileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsProfileDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 mt-2 w-56 rounded-2xl border border-neutral-800 bg-neutral-950 p-2 shadow-2xl z-50 text-left overflow-hidden"
                  >
                    <div className="px-3.5 py-2.5 border-b border-neutral-900">
                      <p className="text-[11px] text-neutral-500 font-medium">Signed in as</p>
                      <p className="text-xs font-bold text-[#EAE5D9] truncate mt-0.5">{clientEmail || "Client"}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setActiveWorkspaceModal("settings");
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer text-left focus:outline-none"
                      >
                        <User size={14} className="text-neutral-400" />
                        Account Settings
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setActiveWorkspaceModal("billing");
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer text-left focus:outline-none"
                      >
                        <Coins size={14} className="text-neutral-400" />
                        Billing Details
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setActiveWorkspaceModal("support");
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer text-left focus:outline-none"
                      >
                        <MessageSquare size={14} className="text-neutral-400" />
                        CodeFuser Support
                      </button>
                    </div>

                    <div className="h-px bg-neutral-900 my-1" />

                    <div className="p-1">
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          logoutClient();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer text-left focus:outline-none"
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
      </div>
    </header>
  );
};

