import React from "react";
import { ShieldCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col p-6 text-center"
          >
            <div className="mx-auto w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            </div>
            
            <h2 className="font-black text-xl text-slate-800 dark:text-slate-100 mb-2">Privasi Terjamin</h2>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Halozy dirancang secara lokal. Seluruh riwayat obrolanmu <strong>tidak akan disimpan di server</strong> dan <strong>akan dihapus otomatis</strong> ketika kamu menutup atau keluar dari aplikasi ini. 
            </p>

            <button
              onClick={onClose}
              className="w-full bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Saya Mengerti
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
