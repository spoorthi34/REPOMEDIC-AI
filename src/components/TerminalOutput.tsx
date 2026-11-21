import React, { useState, useEffect, useRef } from 'react';
import { TerminalLog } from '../types';
import { Terminal as TerminalIcon, Copy, Trash2, Check, Download, Play } from 'lucide-react';

interface TerminalOutputProps {
  logs: TerminalLog[];
  onClear: () => void;
  isRunning: boolean;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({ logs, onClear, isRunning }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'agent' | 'sandbox'>('all');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((log) => {
    if (activeTab === 'agent') return log.level === 'agent' || log.nodeId === 'critic_reflection';
    if (activeTab === 'sandbox') return log.nodeId === 'sandbox_test_run' || log.level === 'cmd' || log.traceback;
    return true;
  });

  const handleCopyLogs = () => {
    const rawText = logs.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLogStyle = (level: TerminalLog['level']) => {
    switch (level) {
      case 'agent':
        return 'text-cyan-300 bg-cyan-950/20 border-l-2 border-cyan-400 pl-2';
      case 'cmd':
        return 'text-amber-300 font-mono';
      case 'error':
        return 'text-rose-400 bg-rose-950/30 border-l-2 border-rose-500 pl-2 font-mono';
      case 'warn':
        return 'text-amber-400 bg-amber-950/20 pl-2';
      case 'success':
        return 'text-emerald-400 font-semibold';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
      {/* Top Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <TerminalIcon className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-mono font-semibold text-slate-200">
              repomedic-engine:~ (Docker IPC / LangGraph Stream)
            </span>
          </div>
        </div>

        {/* Tab Controls & Actions */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px] font-mono flex">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeTab === 'all' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Logs ({logs.length})
            </button>
            <button
              onClick={() => setActiveTab('agent')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeTab === 'agent' ? 'bg-slate-800 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Agent Reasoning
            </button>
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeTab === 'sandbox' ? 'bg-slate-800 text-amber-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sandbox Stderr
            </button>
          </div>

          <button
            onClick={handleCopyLogs}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            title="Copy logs to clipboard"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={onClear}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all"
            title="Clear terminal logs"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2 select-text">
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 font-mono">
            <Play className="h-8 w-8 mb-2 text-slate-600 opacity-60" />
            <p>Select a benchmark issue or click "Run Autonomous Repair" to start.</p>
            <p className="text-[11px] text-slate-600 mt-1">Docker sandbox output and agent AST logs stream here live.</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className={`py-0.5 leading-relaxed transition-all ${getLogStyle(log.level)}`}>
              <span className="text-slate-500 mr-2 select-none">[{log.timestamp}]</span>
              <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded mr-2 bg-slate-900 border border-slate-800 text-slate-300 select-none">
                {log.nodeId}
              </span>
              <span className="whitespace-pre-wrap">{log.message}</span>
            </div>
          ))
        )}

        {isRunning && (
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs pt-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Agent working... streaming execution trace</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Footer controls */}
      <div className="bg-slate-900/60 border-t border-slate-800/80 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0"
            />
            <span>Auto-scroll</span>
          </label>
        </div>
        <div>Sandbox Isolation: Secure Ephemeral Container (runc/gVisor)</div>
      </div>
    </div>
  );
};
