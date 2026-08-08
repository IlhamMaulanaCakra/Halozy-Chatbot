import React from "react";
import { Info, X, ShieldAlert, Heart, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface GuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GuidelinesModal({ isOpen, onClose }: GuidelinesModalProps) {
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
                <Info className="w-5 h-5" />
                <h2 className="font-bold text-lg">Panduan Pengguna</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto">
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                Selamat datang di Halozy! Untuk menjaga ruang ini tetap aman dan nyaman sebagai tempat curhat, mohon ikuti panduan berikut:
              </p>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="shrink-0 mt-0.5">
                    <Heart className="w-5 h-5 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Bersikap Baik pada Ozy</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Meskipun Ozy adalah teman AI, berinteraksilah dengan sopan. Ozy hadir untuk mendengarkan dan mendukungmu.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="shrink-0 mt-0.5">
                    <MessageCircle className="w-5 h-5 text-teal-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Hindari Kata Kasar</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Kurangi penggunaan kata-kata kasar atau umpatan. Mari ciptakan suasana ngobrol yang positif dan menenangkan.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Bukan Pengganti Psikolog</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Ozy adalah pendengar yang baik, tetapi bukan pengganti tenaga medis profesional. Jika kamu merasa sangat tertekan, gunakan menu "Kontak Konseling".
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl transition-colors active:scale-95"
              >
                Saya Mengerti
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
