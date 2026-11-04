import React, { useRef } from "react";
import { Settings as SettingsIcon, X, Volume2, VolumeX, Shield, ShieldOff, Type, Maximize, Sparkles, Download, Upload, Moon, Sun, Quote, Lightbulb, LightbulbOff, BarChart2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSettings } from "../utils/SettingsContext";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSetting } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const chatHistory = sessionStorage.getItem("ozy_chat_history") || "[]";
    const appSettings = localStorage.getItem("halozy_settings") || "{}";
    
    const exportData = {
      chat_history: JSON.parse(chatHistory),
      settings: JSON.parse(appSettings),
      export_date: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `halozy_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const importedData = JSON.parse(content);

        // CS-04 FIX: Validate schema before writing to storage.
        // chat_history must be an array; settings must be a plain object (not array/null).
        const KNOWN_SETTING_KEYS: (string)[] = [
          "profanityFilter","soundEffects","largeText","backgroundAnimation",
          "theme","showQuotes","showSuggestions","showInternalAnalysis","version"
        ];

        if (importedData.chat_history !== undefined && !Array.isArray(importedData.chat_history)) {
          alert("Gagal memulihkan: format riwayat obrolan tidak valid.");
          return;
        }

        if (
          importedData.settings !== undefined && (
            typeof importedData.settings !== "object" ||
            importedData.settings === null ||
            Array.isArray(importedData.settings) ||
            Object.keys(importedData.settings).some((k) => !KNOWN_SETTING_KEYS.includes(k))
          )
        ) {
          alert("Gagal memulihkan: format pengaturan tidak valid atau mengandung kunci yang tidak dikenal.");
          return;
        }

        if (Array.isArray(importedData.chat_history)) {
          sessionStorage.setItem("ozy_chat_history", JSON.stringify(importedData.chat_history));
        }

        if (importedData.settings && typeof importedData.settings === "object") {
          localStorage.setItem("halozy_settings", JSON.stringify(importedData.settings));
        }

        alert("Data berhasil dipulihkan! Halaman akan dimuat ulang.");
        window.location.reload();
      } catch (err) {
        alert("Gagal memulihkan data. Pastikan file JSON yang diunggah valid.");
        console.error(err);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-teal-50/50 dark:bg-teal-900/20">
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
                <SettingsIcon className="w-5 h-5" />
                <h2 className="font-bold text-lg">Pengaturan</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-6">
              
              <div className="space-y-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {settings.theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Tema Tampilan</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Pilih tema warna untuk antarmuka
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-1 gap-1">
                    <button
                      onClick={() => updateSetting('theme', 'light')}
                      className={`flex-1 text-xs font-semibold py-1.5 px-3 rounded-md transition-colors ${
                        settings.theme === 'light' ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      Terang
                    </button>
                    <button
                      onClick={() => updateSetting('theme', 'dark')}
                      className={`flex-1 text-xs font-semibold py-1.5 px-3 rounded-md transition-colors ${
                        settings.theme === 'dark' ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      Gelap
                    </button>
                    <button
                      onClick={() => updateSetting('theme', 'system')}
                      className={`flex-1 text-xs font-semibold py-1.5 px-3 rounded-md transition-colors ${
                        settings.theme === 'system' ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      Sistem
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {settings.profanityFilter ? <Shield className="w-5 h-5 text-teal-500" /> : <ShieldOff className="w-5 h-5 text-slate-400" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Filter Kata Kasar</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Menyensor kata-kata kasar atau umpatan dalam obrolan
                      </p>
                    </div>
                  </div>
                  <Toggle active={settings.profanityFilter} onClick={() => updateSetting('profanityFilter', !settings.profanityFilter)} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {settings.soundEffects ? <Volume2 className="w-5 h-5 text-blue-500" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Efek Suara</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Putar suara saat pesan baru diterima
                      </p>
                    </div>
                  </div>
                  <Toggle active={settings.soundEffects} onClick={() => updateSetting('soundEffects', !settings.soundEffects)} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {settings.largeText ? <Maximize className="w-5 h-5 text-amber-500" /> : <Type className="w-5 h-5 text-slate-400" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Teks Besar</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Perbesar ukuran teks agar lebih mudah dibaca
                      </p>
                    </div>
                  </div>
                  <Toggle active={settings.largeText} onClick={() => updateSetting('largeText', !settings.largeText)} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      <Sparkles className={`w-5 h-5 ${settings.backgroundAnimation ? 'text-purple-500' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Animasi Latar</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Tampilkan animasi visual yang menenangkan
                      </p>
                    </div>
                  </div>
                  <Toggle active={settings.backgroundAnimation} onClick={() => updateSetting('backgroundAnimation', !settings.backgroundAnimation)} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      <Quote className={`w-5 h-5 ${settings.showQuotes ? 'text-blue-500' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Kutipan Penyemangat</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Tampilkan kutipan positif atau penyemangat di chat
                      </p>
                    </div>
                  </div>
                  <Toggle active={settings.showQuotes} onClick={() => updateSetting('showQuotes', !settings.showQuotes)} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {settings.showSuggestions ? <Lightbulb className="w-5 h-5 text-amber-500" /> : <LightbulbOff className="w-5 h-5 text-slate-400" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Saran Aktivitas</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Tampilkan saran tindakan atau aktivitas
                      </p>
                    </div>
                  </div>
                  <Toggle active={settings.showSuggestions} onClick={() => updateSetting('showSuggestions', !settings.showSuggestions)} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      <BarChart2 className={`w-5 h-5 ${settings.showInternalAnalysis ? 'text-indigo-500' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Analisis Sentimen (Debug)</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Tampilkan data analisis sentimen dan klasifikasi internal
                      </p>
                    </div>
                  </div>
                  <Toggle active={settings.showInternalAnalysis} onClick={() => updateSetting('showInternalAnalysis', !settings.showInternalAnalysis)} />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Data Lokal</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Data obrolan dan pengaturan hanya disimpan di perangkatmu. Kamu dapat mengunduh atau memulihkan data tersebut secara manual.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExport}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/40 rounded-xl transition-colors text-sm font-bold border border-teal-200 dark:border-teal-800/50"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh Data</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-sm font-bold border border-slate-200 dark:border-slate-700"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Pulihkan Data</span>
                  </button>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImport}
                  />
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Toggle({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
        active ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          active ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}
