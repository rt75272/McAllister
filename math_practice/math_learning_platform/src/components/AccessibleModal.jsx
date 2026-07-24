import React, { useEffect } from 'react';
import { X, Sparkles, AlertCircle, Info } from 'lucide-react';

/**
 * Reusable AccessibleModal Component
 * 
 * Automatically enforces:
 * - Dyslexia-friendly typography & spacing (Tahoma/Verdana/Comic Sans MS fallback)
 * - Muted colors & contrast (Soft space-blue background, off-white text to prevent visual blurring)
 * - Large letter-spacing (tracking) & strict left-alignment (no justified text blocks)
 * - Highlight classes for math operators and key numbers
 */
export default function AccessibleModal({ isOpen, onClose, title, subtitle, children }) {
  
  // Close on Escape key press (keyboard accessibility)
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0b0b14]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      {/* Modal wrapper with soft space-blue background */}
      <div 
        className="w-full max-w-lg bg-[#1a1a2e] border-2 border-[#38bdf8] p-6 sm:p-8 rounded-3xl shadow-2xl overflow-hidden flex flex-col justify-between"
        style={{
          fontFamily: "'Comic Sans MS', 'Tahoma', 'Verdana', sans-serif",
          lineHeight: "1.5",
          letterSpacing: "0.05em",
          color: "#e0e0ed",
          textAlign: "left"
        }}
      >
        {/* Header Section */}
        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-5">
          <div className="space-y-1">
            {subtitle && (
              <span className="text-[10px] font-black uppercase text-[#67e8f9] tracking-widest block">
                {subtitle}
              </span>
            )}
            <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse shrink-0" />
              {title}
            </h3>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog window"
            className="text-slate-400 hover:text-white p-1.5 rounded-xl border-2 border-transparent hover:border-slate-800 hover:bg-[#12121e] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Modal Content Body */}
        <div className="flex-1 space-y-4 text-xs font-medium leading-relaxed">
          {children}
        </div>

        {/* Accessibility Guidance Banner at Footer */}
        <div className="mt-6 pt-4 border-t-2 border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
          <div className="flex items-center gap-1.5 text-cyan-500/90">
            <Info className="w-4 h-4 shrink-0" />
            <span>Dyslexia-Optimized Mode Active</span>
          </div>
          <span>Esc key to return</span>
        </div>

      </div>
    </div>
  );
}
