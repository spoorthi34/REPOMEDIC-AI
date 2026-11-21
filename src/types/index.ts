export type AgentNodeId =
  | 'idle'
  | 'triage'
  | 'ast_indexing'
  | 'hypothesis_planning'
  | 'patch_generation'
  | 'sandbox_test_run'
  | 'critic_reflection'
  | 'pr_generation'
  | 'completed'
  | 'failed';

export type NodeExecutionStatus = 'idle' | 'running' | 'success' | 'failed' | 'retrying';

export interface GraphNodeState {
  id: AgentNodeId;
  label: string;
  sublabel: string;
  status: NodeExecutionStatus;
  executionTimeMs?: number;
  tokensUsed?: number;
}

export interface CodeFile {
  path: string;
  content: string;
  language: 'python' | 'typescript' | 'javascript' | 'go';
}

export interface BenchmarkIssue {
  id: string;
  title: string;
  repo: string;
  difficulty: 'Intermediate' | 'Hard' | 'Production Severity 1';
  category: 'Race Condition' | 'Memory Leak' | 'JWT Timing Attack' | 'Distributed Deadlock';
  language: 'python' | 'typescript' | 'go';
  issueNumber: number;
  issueDescription: string;
  affectedFiles: CodeFile[];
  testFile: CodeFile;
  testCommand: string;
  astSymbolsDetected: Array<{
    name: string;
    type: 'class' | 'function' | 'variable' | 'import';
    file: string;
    line: number;
    relevanceScore: number;
  }>;
  simulationRounds: Array<{
    round: number;
    patchDescription: string;
    patchDiff: string;
    testExitCode: number;
    testStderr: string;
    reflectionAnalysis: string;
    passed: boolean;
  }>;
  finalPR: {
    title: string;
    branchName: string;
    summary: string;
    keyChanges: string[];
    verificationNote: string;
  };
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  level: 'info' | 'agent' | 'cmd' | 'warn' | 'error' | 'success';
  nodeId: AgentNodeId;
  message: string;
  traceback?: string;
}

export interface DiffViewProps {
  filePath: string;
  oldContent: string;
  newContent: string;
}
