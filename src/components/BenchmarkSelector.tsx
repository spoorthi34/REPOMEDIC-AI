import React, { useState } from 'react';
import { BenchmarkIssue } from '../types';
import {
  Bug,
  Play,
  RotateCcw,
  Sparkles,
  GitBranch,
  ShieldAlert,
  Clock,
  Terminal,
  ExternalLink,
} from 'lucide-react';

interface BenchmarkSelectorProps {
  benchmarks: BenchmarkIssue[];
  selectedIssue: BenchmarkIssue;
  onSelectIssue: (issue: BenchmarkIssue) => void;
  onStartRepair: () => void;
  onStopRepair: () => void;
  isRunning: boolean;
}

export const BenchmarkSelector: React.FC<BenchmarkSelectorProps> = ({
  benchmarks,
  selectedIssue,
  onSelectIssue,
  onStartRepair,
  onStopRepair,
  isRunning,
}) => {
  const [activeTab, setActiveTab] = useState<'benchmarks' | 'custom'>('benchmarks');
  const [customRepoUrl, setCustomRepoUrl] = useState('');
  const [customIssueNumber, setCustomIssueNumber] = useState('');

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 lg:p-6 shadow-xl">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
            <Bug className="h-4 w-4 text-emerald-400" />
            Target Issue & Codebase Benchmark
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select a verified production repository bug to run through the closed-loop repair agent.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isRunning ? (
            <button
              onClick={onStopRepair}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-rose-600/30 transition-all"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Abort Execution</span>
            </button>
          ) : (
            <button
              onClick={onStartRepair}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95"
            >
              <Play className="h-4 w-4 fill-slate-950" />
              <span>Run Autonomous Repair</span>
            </button>
          )}
        </div>
      </div>

      {/* Benchmark Issue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {benchmarks.map((issue) => {
          const isSelected = selectedIssue.id === issue.id;

          let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
          if (issue.difficulty === 'Production Severity 1') {
            badgeColor = 'bg-rose-950/80 text-rose-300 border-rose-500/40';
          } else if (issue.difficulty === 'Hard') {
            badgeColor = 'bg-amber-950/80 text-amber-300 border-amber-500/40';
          } else {
            badgeColor = 'bg-blue-950/80 text-blue-300 border-blue-500/40';
          }

          return (
            <button
              key={issue.id}
              onClick={() => !isRunning && onSelectIssue(issue)}
              disabled={isRunning}
              className={`p-3.5 rounded-xl text-left border transition-all relative ${
                isSelected
                  ? 'bg-slate-800/90 border-emerald-500/80 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
              } ${isRunning ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
            >
              {isSelected && (
                <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              )}

              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                  {issue.difficulty}
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  {issue.language}
                </span>
              </div>

              <h3 className="text-xs font-semibold text-slate-100 line-clamp-1 mb-1">
                {issue.title}
              </h3>

              <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 mb-2">
                <GitBranch className="h-3 w-3 text-emerald-400/80" />
                <span className="truncate">{issue.repo}</span>
                <span className="text-emerald-400">#{issue.issueNumber}</span>
              </div>

              <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                {issue.issueDescription}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span className="flex items-center gap-1 truncate max-w-[200px]">
                  <Terminal className="h-2.5 w-2.5 text-slate-400" />
                  {issue.testCommand}
                </span>
                <span className="text-slate-400">
                  {issue.affectedFiles.length} file{issue.affectedFiles.length > 1 ? 's' : ''}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
