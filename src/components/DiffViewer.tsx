import React, { useState } from 'react';
import { FileCode, GitCommit, CheckCircle, XCircle, Copy, Check } from 'lucide-react';

interface DiffViewerProps {
  diff: string;
  round: number;
  fileName?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ diff, round, fileName = 'services/db/session.py' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(diff);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = diff ? diff.split('\n') : [];

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
      {/* Header */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-mono font-semibold text-slate-200">{fileName}</span>
          {round > 0 && (
            <span
              className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                round === 1
                  ? 'bg-rose-950/60 border-rose-500/30 text-rose-300'
                  : 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
              }`}
            >
              {round === 1 ? 'Round 1: Initial Patch (Regression Detected)' : `Round ${round}: Verified Self-Healed Patch`}
            </span>
          )}
        </div>

        <button
          onClick={handleCopy}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all flex items-center gap-1 text-xs"
          title="Copy diff to clipboard"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">Copy Diff</span>
        </button>
      </div>

      {/* Code diff container */}
      <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-0.5 select-text">
        {!diff ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <GitCommit className="h-8 w-8 mb-2 text-slate-600 opacity-60" />
            <p>No active git diff yet.</p>
            <p className="text-[11px] text-slate-600 mt-1">
              When the agent generates code patches, the unified diff will render here line-by-line.
            </p>
          </div>
        ) : (
          lines.map((line, idx) => {
            const isAddition = line.startsWith('+') && !line.startsWith('+++');
            const isDeletion = line.startsWith('-') && !line.startsWith('---');
            const isHeader = line.startsWith('@@') || line.startsWith('---') || line.startsWith('+++');

            let lineClass = 'text-slate-300 hover:bg-slate-900/50';
            let bgClass = '';
            let icon = ' ';

            if (isAddition) {
              lineClass = 'text-emerald-300 font-semibold';
              bgClass = 'bg-emerald-950/30 border-l-2 border-emerald-500';
              icon = '+';
            } else if (isDeletion) {
              lineClass = 'text-rose-400';
              bgClass = 'bg-rose-950/30 border-l-2 border-rose-500';
              icon = '-';
            } else if (isHeader) {
              lineClass = 'text-cyan-400 font-bold';
              bgClass = 'bg-cyan-950/20';
            }

            return (
              <div key={idx} className={`px-2 py-0.5 rounded flex items-start gap-3 transition-colors ${lineClass} ${bgClass}`}>
                <span className="text-slate-600 select-none w-6 text-right text-[11px] font-mono">{idx + 1}</span>
                <span className="select-none font-bold w-3 text-center">{icon}</span>
                <span className="flex-1 whitespace-pre-wrap break-all">{line.startsWith('+') || line.startsWith('-') ? line.substring(1) : line}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Diff Stats Footer */}
      {diff && (
        <div className="bg-slate-900/60 border-t border-slate-800/80 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              {lines.filter((l) => l.startsWith('+') && !l.startsWith('+++')).length} additions
            </span>
            <span className="text-rose-400 flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              {lines.filter((l) => l.startsWith('-') && !l.startsWith('---')).length} deletions
            </span>
          </div>
          <div className="text-slate-500">Targeted Minimal AST Edit</div>
        </div>
      )}
    </div>
  );
};
