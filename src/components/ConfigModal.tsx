import React, { useState } from 'react';
import { X, Key, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveKey: (key: string) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveKey,
}) => {
  const [keyInput, setKeyInput] = useState(apiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveKey(keyInput.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-teal-950 border border-teal-500/30 text-teal-400">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Engine Configuration</h3>
              <p className="text-[11px] text-slate-400">LLM Provider & Sandbox Mode</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-slate-300">
          <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-[11px] leading-relaxed text-emerald-300">
            <span className="font-semibold block text-emerald-200 mb-0.5">💡 Zero-Key Demo Ready:</span>
            RepoMedic includes built-in real-world benchmark traces. Anyone viewing your deployed Netlify link can run the autonomous repair loops and inspect the full AST/Docker traces without needing an API key!
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 text-xs">
              Gemini API Key (Optional for Live Inference)
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Keys are stored strictly in your browser session memory and never sent to any external telemetry server.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 flex items-center justify-between">
          <button
            onClick={() => {
              setKeyInput('');
              onSaveKey('');
            }}
            className="text-xs text-slate-500 hover:text-slate-300 underline"
          >
            Clear Key
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs"
            >
              {savedSuccess ? 'Saved!' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
