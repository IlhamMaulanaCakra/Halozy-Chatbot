import React, { useState } from "react";
import Chatroom from "./components/Chatroom";
import HelplineSection from "./components/HelplineSection";
import GuidelinesModal from "./components/GuidelinesModal";
import SettingsModal from "./components/SettingsModal";
import PrivacyModal from "./components/PrivacyModal";
import { MessageSquare, Shield, Phone, Info, Settings as SettingsIcon } from "lucide-react";
import { useSettings } from "./utils/SettingsContext";

export default function App() {
  // Navigation View Tabs: "chat" (Default) | "hotlines"
  const [activeTab, setActiveTab] = useState<"chat" | "hotlines">("chat");
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(() => {
    return !sessionStorage.getItem('halozy_privacy_shown');
  });
  const { settings } = useSettings();

  const handleClosePrivacy = () => {
    sessionStorage.setItem('halozy_privacy_shown', 'true');
    setIsPrivacyOpen(false);
  };

  return (
    <div className={`min-h-screen text-slate-800 dark:text-slate-200 antialiased font-sans select-none relative pb-16 transition-colors duration-300 ${
      settings.backgroundAnimation ? 'bg-gradient-to-br from-slate-50 to-teal-50 dark:from-slate-900 dark:to-slate-800' : 'bg-slate-50 dark:bg-slate-900'
    }`}>
      
      {/* Visual Header Ribbon bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 via-teal-600 to-rose-400 z-20" />

      {/* Decorative Background Elements */}
      {settings.backgroundAnimation && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] rounded-full bg-teal-400/5 dark:bg-teal-600/5 blur-[80px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-[20%] -left-[10%] w-[30%] h-[30%] rounded-full bg-rose-400/5 dark:bg-rose-600/5 blur-[80px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
          <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-blue-400/5 dark:bg-blue-600/5 blur-[100px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '1s' }} />
        </div>
      )}
      
      <div className="max-w-6xl mx-auto px-4 pt-5 relative z-10">
        
        {/* Main Application Branding Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-6 border-b border-slate-200/50 dark:border-slate-800 gap-3" id="appHeader">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-teal-700 dark:bg-teal-800 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-teal-700/10 active:scale-95 transition-transform">
              🍃
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-slate-900 dark:text-slate-100 font-sans">Halozy</span>
                <span className="text-[10px] bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold px-1.5 py-0.2 rounded-full font-mono">v1.2</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Teman Curhat & Detektor Tren Psikis Batiniah</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center justify-center w-7 h-7 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-200/50 dark:bg-slate-800 hover:bg-slate-300/50 dark:hover:bg-slate-700 transition-colors rounded-full cursor-pointer"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsGuidelinesOpen(true)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-200/50 dark:bg-slate-800 hover:bg-slate-300/50 dark:hover:bg-slate-700 transition-colors border border-slate-300/50 dark:border-slate-700 px-3 py-1 rounded-full shadow-sm cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Panduan</span>
            </button>
            {/* Secure indicator tag */}
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50/80 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800/50 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors px-3 py-1 rounded-full shadow-sm cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-500" />
              <span>100% Privat</span>
            </button>
          </div>
        </header>

        {/* COMPACT VIEW TABS SWITCHER - Simplified User Navigation */}
        <nav className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-850 p-1 rounded-xl mb-6 max-w-sm mx-auto shadow-inner" id="mainNavigation">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "chat"
                ? "bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-300 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/45 dark:hover:bg-slate-800/50"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Teman Curhat</span>
          </button>

          <button
            onClick={() => setActiveTab("hotlines")}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "hotlines"
                ? "bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-300 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/45 dark:hover:bg-slate-800/50"
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Kontak Konseling</span>
          </button>
        </nav>

        {/* Main Tab Render Space */}
        <main className="min-h-[480px]">
          
          <div className={activeTab === "chat" ? "block max-w-2xl mx-auto" : "hidden"}>
            <Chatroom 
              onNavigateToHotlines={() => setActiveTab("hotlines")}
            />
          </div>

          <div className={activeTab === "hotlines" ? "block max-w-3xl mx-auto" : "hidden"}>
            <HelplineSection />
          </div>

        </main>
        
        {/* Humble, supportive app credit line */}
        <footer className="mt-12 text-center text-[11px] text-slate-400 dark:text-slate-500 select-text">
          <p>© 2026 Halozy. Didukung oleh Gemini AI untuk analisis empati.</p>
          <p className="mt-0.5">Dirancang murni untuk mendukung kesehatan batin secara sederhana dan tanpa gundah.</p>
        </footer>
      </div>

      <GuidelinesModal isOpen={isGuidelinesOpen} onClose={() => setIsGuidelinesOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <PrivacyModal isOpen={isPrivacyOpen} onClose={handleClosePrivacy} />
    </div>
  );
}
