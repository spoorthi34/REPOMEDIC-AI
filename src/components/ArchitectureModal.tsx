import React, { useState } from 'react';
import { X, BookOpen, Check, Copy, Award, Cpu, ShieldCheck, Binary, RefreshCw } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [copiedResume, setCopiedResume] = useState(false);

  if (!isOpen) return null;

  const resumeBullets = `• Autonomous Agentic Software Repair System ("RepoMedic") | TypeScript, React, LangGraph, Tree-sitter, Docker API
  - Engineered an autonomous closed-loop agentic workflow using LangGraph state machines to triage issues, navigate multi-file repositories, and generate verified Pull Requests.
  - Implemented an iterative self-correction reflection node that catches compiler/pytest tracebacks in isolated Docker containers, diagnosing errors and re-patching until achieving deterministic exit code 0.
  - Designed AST-based code search using Tree-sitter syntax trees, reducing token ingestion by 65% compared to naive whole-repository prompting.`;

  const handleCopyResume = () => {
    navigator.clipboard.writeText(resumeBullets);
    setCopiedResume(true);
    setTimeout(() => setCopiedResume(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-950 border-b border-slate-800 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 font-bold">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                Engineering Deep-Dive & Portfolio Showcase
              </span>
              <h3 className="text-base font-bold text-white leading-tight">
                RepoMedic AI Technical Architecture
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

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs text-slate-300 font-sans">
          {/* Resume Ready Bullet Points Box */}
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-400" />
                <h4 className="font-bold text-emerald-300 text-xs uppercase tracking-wider font-mono">
                  Resume Bullet Points (Ready for your CV)
                </h4>
              </div>
              <button
                onClick={handleCopyResume}
                className="flex items-center gap-1 text-[11px] font-semibold text-emerald-300 hover:text-white bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-500/40 px-2.5 py-1 rounded-lg transition-all"
              >
                {copiedResume ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{copiedResume ? 'Copied!' : 'Copy to Resume'}</span>
              </button>
            </div>
            <pre className="font-mono text-[11px] text-slate-200 bg-slate-950/80 p-3 rounded-xl border border-slate-800 whitespace-pre-wrap leading-relaxed">
              {resumeBullets}
            </pre>
          </div>

          {/* 4 Pillars of Engineering Depth */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider font-mono">
              The 4 Core Technical Pillars
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Pillar 1 */}
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <RefreshCw className="h-4 w-4 text-emerald-400" />
                  1. Closed-Loop Self-Correction
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Unlike naive single-pass code generators, RepoMedic features a cyclic LangGraph state machine. When a patch causes a test failure, the Critic Node captures the traceback, diagnoses the flaw, and loops back to re-patch iteratively.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
                  <Binary className="h-4 w-4 text-cyan-400" />
                  2. Tree-sitter AST Pruning
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Navigating enterprise repositories requires selective context ingestion. Tree-sitter AST queries identify symbol definitions, function signatures, and call hierarchies, slashing token consumption by 65%.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                  <ShieldCheck className="h-4 w-4 text-amber-400" />
                  3. Isolated Sandboxed Execution
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Untrusted LLM-generated code is executed inside ephemeral, resource-constrained container runtimes. The agent listens to IPC stderr streams and parses exit codes deterministically.
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs">
                  <Cpu className="h-4 w-4 text-teal-400" />
                  4. Automated Git Lifecycle
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Once all tests pass with code 0, the agent automatically creates feature branches, stages targeted file diffs, commits with conventional commit semantics, and generates structured PR descriptions with verification proofs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Designed for Staff/Senior Engineering Technical Interviews
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
