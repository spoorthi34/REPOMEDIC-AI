import React from 'react';
import { GitPullRequest, Cpu, ShieldCheck, BookOpen, Key, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenArchitecture: () => void;
  onOpenConfig: () => void;
  isCustomKeySet: boolean;
  isRunning: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenArchitecture,
  onOpenConfig,
  isCustomKeySet,
  isRunning,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/40">
            <Cpu className="h-5 w-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                RepoMedic <span className="text-emerald-400 font-mono text-xs px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/30">AI 2.0</span>
              </h1>
              {isRunning ? (
                <span className="flex items-center gap-1 text-[11px] font-medium text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                  Agent Execution Active
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  LangGraph Engine Ready
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Autonomous Closed-Loop Software Engineer • AST Symbol Explorer • Ephemeral Sandbox Verification
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenArchitecture}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 rounded-lg transition-all shadow-sm"
            title="View Technical Architecture & Resume Guide"
          >
            <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Architecture & Resume Guide</span>
            <span className="sm:hidden">Guide</span>
          </button>

          <button
            onClick={onOpenConfig}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
              isCustomKeySet
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300'
            }`}
          >
            <Key className="h-3.5 w-3.5 text-teal-400" />
            <span className="hidden sm:inline">{isCustomKeySet ? 'API Key Active' : 'API Key / Settings'}</span>
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-200 bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg transition-all shadow-sm shadow-emerald-600/30 font-semibold"
          >
            <GitPullRequest className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
};
