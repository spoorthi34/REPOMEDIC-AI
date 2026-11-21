import React, { useState } from 'react';
import { BenchmarkIssue } from '../types';
import { GitPullRequest, CheckCircle2, ShieldCheck, Copy, Check, X, GitCommit, GitBranch } from 'lucide-react';

interface PullRequestModalProps {
  issue: BenchmarkIssue;
  isOpen: boolean;
  onClose: () => void;
}

export const PullRequestModal: React.FC<PullRequestModalProps> = ({ issue, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pr = issue.finalPR;

  const fullPrMarkdown = `## ${pr.title}
**Branch:** \`${pr.branchName}\`
**Fixes:** #${issue.issueNumber}

### Summary
${pr.summary}

### Key Changes
${pr.keyChanges.map((c) => `- ${c}`).join('\n')}

### Verification
${pr.verificationNote}
> Verified autonomously by **RepoMedic AI** closed-loop test runner.
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullPrMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="bg-slate-950 border-b border-slate-800 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
              <GitPullRequest className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                Automated Pull Request Generated
              </span>
              <h3 className="text-base font-bold text-white leading-tight">
                {issue.repo} #pull/12
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* PR Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-sans text-slate-300">
          {/* Branch badge */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-950/60 border border-slate-800 rounded-xl font-mono text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <GitBranch className="h-3.5 w-3.5 text-emerald-400" />
              base: <span className="text-slate-200 font-bold">main</span>
            </span>
            <span className="text-slate-500">←</span>
            <span className="text-emerald-300 bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded">
              {pr.branchName}
            </span>
          </div>

          {/* Status Check Box */}
          <div className="flex items-start gap-3 p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-emerald-300 text-xs">
                All 4 CI/CD Verification Checks Passed
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Ephemeral Docker test suite passed with exit code 0. Zero regressions detected across test boundary.
              </p>
            </div>
          </div>

          {/* PR Details */}
          <div>
            <h4 className="font-bold text-slate-200 text-sm mb-1">{pr.title}</h4>
            <p className="text-slate-400 leading-relaxed">{pr.summary}</p>
          </div>

          {/* Key Changes */}
          <div>
            <h5 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-2 font-mono">
              Key Changes
            </h5>
            <ul className="space-y-1.5">
              {pr.keyChanges.map((change, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Verification details */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Deterministic Verification Note
            </span>
            <p className="text-[11px] text-slate-300 italic">{pr.verificationNote}</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Autonomous Sign-Off: RepoMedic Agent v2.0
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy PR Markdown'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
