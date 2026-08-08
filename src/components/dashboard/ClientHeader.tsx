import React from "react";
import { User, ChevronDown, Coins, MessageSquare, LogOut, LayoutDashboard, FolderGit2, FolderArchive, CreditCard, LifeBuoy } from "lucide-react";
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
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "project", label: "My Project", icon: FolderGit2 },
    { id: "files", label: "Files", icon: FolderArchive },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "help", label: "Need Help", icon: LifeBuoy },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-900 bg-black/90 backdrop-blur-md px-4 sm:px-6 py-3.5">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Top Row / Branding */}
        <div className="w-full sm:w-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="font-display text-base font-black tracking-widest text-white uppercase select-none font-mono">
              CODEFUSER
            </span>
            <span className="text-[10px] font-bold text-neutral-600 font-mono select-none">×</span>
            <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 max-w-[150px] sm:max-w-[200px] truncate">
              {businessName || clientName || "Client Portal"}
            </span>
          </div>

          {/* Mobile Profile Trigger */}
          <div className="sm:hidden relative">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neutral-800 bg-neutral-900/60 text-xs text-neutral-300"
            >
              <div className="h-4.5 w-4.5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-[10px] font-black font-mono">
                {clientName?.charAt(0).toUpperCase() || <User size={10} />}
              </div>
              <ChevronDown size={12} className={`text-neutral-500 transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center gap-1 bg-neutral-950 p-1 rounded-2xl border border-neutral-900 w-full sm:w-auto overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-neutral-800 text-white font-bold shadow-sm"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900/50"
                }`}
              >
                <Icon size={14} className={isActive ? "text-amber-500" : "text-neutral-500"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Desktop Profile Menu */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900/80 border border-neutral-800 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-neutral-300">
              {getCustomerStatusLabel(currentStageIndex)}
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 hover:border-neutral-700 transition-all cursor-pointer focus:outline-none"
            >
              <div className="h-5 w-5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono text-xs font-black">
                {clientName?.charAt(0).toUpperCase() || <User size={12} />}
              </div>
              <span className="text-xs font-sans font-medium text-neutral-300 max-w-[110px] truncate">
                {clientName || "Client"}
              </span>
              <ChevronDown size={12} className={`text-neutral-500 transition-transform duration-200 ${isProfileDropdownOpen ? "rotate-180" : ""}`} />
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
                    <div className="px-3.5 py-2 border-b border-neutral-900">
                      <p className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest">Signed in as</p>
                      <p className="text-xs font-bold text-white truncate mt-0.5">{clientEmail || "Client"}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setActiveWorkspaceModal("settings");
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer text-left focus:outline-none"
                      >
                        <User size={13} className="text-amber-500/80" />
                        Workspace Settings
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setActiveWorkspaceModal("billing");
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer text-left focus:outline-none"
                      >
                        <Coins size={13} className="text-amber-500/80" />
                        Billing Details
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setActiveWorkspaceModal("support");
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer text-left focus:outline-none"
                      >
                        <MessageSquare size={13} className="text-amber-500/80" />
                        Need Help / Support
                      </button>
                    </div>

                    <div className="h-px bg-neutral-900 my-1" />

                    <div className="p-1">
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          logoutClient();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer text-left focus:outline-none uppercase font-mono"
                      >
                        <LogOut size={13} />
                        Logout
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
