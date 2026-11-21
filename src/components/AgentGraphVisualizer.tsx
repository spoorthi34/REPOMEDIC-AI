import React from 'react';
import { GraphNodeState } from '../types';
import {
  FileSearch,
  Binary,
  Lightbulb,
  FileCode,
  Terminal,
  RefreshCw,
  GitPullRequest,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

interface AgentGraphVisualizerProps {
  nodes: GraphNodeState[];
  currentRound: number;
  totalRounds: number;
}

const getNodeIcon = (id: string) => {
  switch (id) {
    case 'triage':
      return <FileSearch className="h-4 w-4" />;
    case 'ast_indexing':
      return <Binary className="h-4 w-4" />;
    case 'hypothesis_planning':
      return <Lightbulb className="h-4 w-4" />;
    case 'patch_generation':
      return <FileCode className="h-4 w-4" />;
    case 'sandbox_test_run':
      return <Terminal className="h-4 w-4" />;
    case 'critic_reflection':
      return <RefreshCw className="h-4 w-4" />;
    case 'pr_generation':
      return <GitPullRequest className="h-4 w-4" />;
    default:
      return <CheckCircle2 className="h-4 w-4" />;
  }
};

export const AgentGraphVisualizer: React.FC<AgentGraphVisualizerProps> = ({
  nodes,
  currentRound,
  totalRounds,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 lg:p-6 shadow-xl relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6 relative z-10">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Agent State Graph Execution Pipeline (LangGraph Cyclic DAG)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-stage agentic workflow with closed-loop self-correction feedback edge
          </p>
        </div>

        {totalRounds > 0 && (
          <div className="flex items-center gap-2 text-xs font-mono bg-slate-800/90 border border-slate-700 px-3 py-1 rounded-lg">
            <span className="text-slate-400">Self-Healing Iteration:</span>
            <span className="text-emerald-400 font-bold">Round {currentRound} of {totalRounds}</span>
          </div>
        )}
      </div>

      {/* Node Graph Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 relative z-10">
        {nodes.map((node, index) => {
          const isRunning = node.status === 'running';
          const isSuccess = node.status === 'success';
          const isFailed = node.status === 'failed';
          const isRetrying = node.status === 'retrying';

          let statusBorder = 'border-slate-800 bg-slate-950/60 text-slate-400';
          let iconColor = 'text-slate-500';

          if (isRunning) {
            statusBorder = 'border-amber-500/80 bg-amber-950/30 text-amber-200 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10 animate-pulse';
            iconColor = 'text-amber-400';
          } else if (isSuccess) {
            statusBorder = 'border-emerald-500/60 bg-emerald-950/20 text-emerald-200 shadow-sm shadow-emerald-500/10';
            iconColor = 'text-emerald-400';
          } else if (isFailed) {
            statusBorder = 'border-rose-500/70 bg-rose-950/30 text-rose-200 ring-1 ring-rose-500/30';
            iconColor = 'text-rose-400';
          } else if (isRetrying) {
            statusBorder = 'border-cyan-500/80 bg-cyan-950/30 text-cyan-200 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/10 animate-bounce';
            iconColor = 'text-cyan-400';
          }

          return (
            <div
              key={node.id}
              className={`rounded-xl border p-3 flex flex-col justify-between transition-all relative ${statusBorder}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-lg bg-slate-900 border border-slate-800 ${iconColor}`}>
                    {getNodeIcon(node.id)}
                  </div>
                  {/* Status Indicator */}
                  {isSuccess && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                  {isRunning && <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />}
                  {isFailed && <AlertTriangle className="h-4 w-4 text-rose-400" />}
                  {isRetrying && <RefreshCw className="h-4 w-4 text-cyan-400 animate-spin" />}
                </div>

                <div className="text-xs font-semibold tracking-tight text-white line-clamp-1">
                  {node.label}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-tight">
                  {node.sublabel}
                </div>
              </div>

              {/* Metrics footer */}
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                <span className="capitalize text-slate-400">{node.status}</span>
                {node.executionTimeMs && (
                  <span className="text-slate-300 flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    {(node.executionTimeMs / 1000).toFixed(1)}s
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cyclic Edge Callout Badge */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 relative z-10">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-[11px]">
            CYCLIC EDGE: Node 5 ⇄ Node 6 ⇄ Node 4
          </span>
          <span className="hidden sm:inline">
            If unit tests fail, traceback parses back to Patch Generator with critique constraints.
          </span>
        </div>
        <div className="text-slate-500 text-[11px] font-mono">
          Deterministic Exit Code 0 Validation
        </div>
      </div>
    </div>
  );
};
