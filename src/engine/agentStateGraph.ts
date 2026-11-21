import { AgentNodeId, BenchmarkIssue, GraphNodeState, TerminalLog } from '../types';

export const INITIAL_GRAPH_NODES: GraphNodeState[] = [
  {
    id: 'triage',
    label: '1. Issue Triage & Spec',
    sublabel: 'Parse reproduction steps & severity',
    status: 'idle',
  },
  {
    id: 'ast_indexing',
    label: '2. AST Code Explorer',
    sublabel: 'Tree-sitter symbol graph traversal',
    status: 'idle',
  },
  {
    id: 'hypothesis_planning',
    label: '3. Root-Cause Hypothesis',
    sublabel: 'Formulate minimal fix plan',
    status: 'idle',
  },
  {
    id: 'patch_generation',
    label: '4. Targeted Code Patch',
    sublabel: 'Synthesize minimal AST edits',
    status: 'idle',
  },
  {
    id: 'sandbox_test_run',
    label: '5. Docker Sandbox Runner',
    sublabel: 'Execute pytest / npm test suites',
    status: 'idle',
  },
  {
    id: 'critic_reflection',
    label: '6. Self-Correction Loop',
    sublabel: 'Analyze stderr tracebacks & re-patch',
    status: 'idle',
  },
  {
    id: 'pr_generation',
    label: '7. Git & PR Generator',
    sublabel: 'Branch, commit & open verified PR',
    status: 'idle',
  },
];

export interface AgentRunnerCallbacks {
  onNodeChange: (nodeId: AgentNodeId, status: GraphNodeState['status'], metrics?: { durationMs?: number; tokens?: number }) => void;
  onLog: (log: Omit<TerminalLog, 'id' | 'timestamp'>) => void;
  onDiffUpdate: (diff: string, round: number) => void;
  onRoundChange: (currentRound: number, totalRounds: number) => void;
  onComplete: (issue: BenchmarkIssue) => void;
  onError: (error: string) => void;
}

export class AgentStateGraphRunner {
  private isCancelled: boolean = false;

  public cancel(): void {
    this.isCancelled = true;
  }

  public async runBenchmark(
    issue: BenchmarkIssue,
    apiKey: string | null,
    callbacks: AgentRunnerCallbacks
  ): Promise<void> {
    this.isCancelled = false;

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const checkCancelled = () => {
      if (this.isCancelled) throw new Error('Agent execution cancelled by user.');
    };

    try {
      // Step 1: Issue Triage
      callbacks.onNodeChange('triage', 'running');
      callbacks.onLog({
        level: 'agent',
        nodeId: 'triage',
        message: `[Issue #${issue.issueNumber}] Ingested: "${issue.title}" (${issue.category})`,
      });
      callbacks.onLog({
        level: 'info',
        nodeId: 'triage',
        message: `Extracting reproduction criteria from issue description...`,
      });
      await delay(900);
      checkCancelled();
      callbacks.onLog({
        level: 'success',
        nodeId: 'triage',
        message: `Reproduction criteria mapped: ${issue.testCommand} identified as target verification suite.`,
      });
      callbacks.onNodeChange('triage', 'success', { durationMs: 920, tokens: 340 });

      // Step 2: AST Code Explorer
      callbacks.onNodeChange('ast_indexing', 'running');
      callbacks.onLog({
        level: 'agent',
        nodeId: 'ast_indexing',
        message: `Initializing AST Tree-sitter parser over repository "${issue.repo}"...`,
      });
      await delay(700);
      checkCancelled();

      for (const symbol of issue.astSymbolsDetected) {
        callbacks.onLog({
          level: 'info',
          nodeId: 'ast_indexing',
          message: `AST Symbol Matched: [${symbol.type.toUpperCase()}] "${symbol.name}" in ${symbol.file}:${symbol.line} (Relevance: ${(symbol.relevanceScore * 100).toFixed(0)}%)`,
        });
        await delay(250);
        checkCancelled();
      }

      callbacks.onLog({
        level: 'success',
        nodeId: 'ast_indexing',
        message: `Tree-sitter AST search narrowed call hierarchy from 42 files to ${issue.affectedFiles.length} critical modules.`,
      });
      callbacks.onNodeChange('ast_indexing', 'success', { durationMs: 1240, tokens: 820 });

      // Step 3: Root-Cause Hypothesis
      callbacks.onNodeChange('hypothesis_planning', 'running');
      callbacks.onLog({
        level: 'agent',
        nodeId: 'hypothesis_planning',
        message: `Synthesizing root-cause hypothesis from symbol interactions & traceback...`,
      });
      await delay(1000);
      checkCancelled();
      callbacks.onLog({
        level: 'info',
        nodeId: 'hypothesis_planning',
        message: `Hypothesis Formulated: State isolation failure in module "${issue.affectedFiles[0]?.path}". Target: eliminate shared resource contention without breaking transaction guarantees.`,
      });
      callbacks.onNodeChange('hypothesis_planning', 'success', { durationMs: 1050, tokens: 610 });

      // Iterative Self-Healing Loop over Simulation Rounds
      const totalRounds = issue.simulationRounds.length;

      for (let i = 0; i < totalRounds; i++) {
        const round = issue.simulationRounds[i];
        callbacks.onRoundChange(round.round, totalRounds);

        // Step 4: Patch Generation
        callbacks.onNodeChange('patch_generation', 'running');
        callbacks.onLog({
          level: 'agent',
          nodeId: 'patch_generation',
          message: `[Round ${round.round}/${totalRounds}] Generating minimal targeted patch: ${round.patchDescription}`,
        });
        await delay(900);
        checkCancelled();

        callbacks.onDiffUpdate(round.patchDiff, round.round);
        callbacks.onLog({
          level: 'cmd',
          nodeId: 'patch_generation',
          message: `Git diff applied to working copy:\n${round.patchDiff}`,
        });
        callbacks.onNodeChange('patch_generation', 'success', { durationMs: 950, tokens: 720 });

        // Step 5: Sandbox Test Run
        callbacks.onNodeChange('sandbox_test_run', 'running');
        callbacks.onLog({
          level: 'cmd',
          nodeId: 'sandbox_test_run',
          message: `Spinning up ephemeral Docker sandbox container [alpine-runtime-sandbox:v2.4]...`,
        });
        await delay(600);
        callbacks.onLog({
          level: 'cmd',
          nodeId: 'sandbox_test_run',
          message: `$ ${issue.testCommand}`,
        });
        await delay(1200);
        checkCancelled();

        if (round.testExitCode === 0) {
          callbacks.onLog({
            level: 'success',
            nodeId: 'sandbox_test_run',
            message: `Execution complete with exit code 0:\n${round.testStderr}`,
          });
          callbacks.onNodeChange('sandbox_test_run', 'success', { durationMs: 1800 });

          // Self-Correction Node passes
          callbacks.onNodeChange('critic_reflection', 'running');
          callbacks.onLog({
            level: 'agent',
            nodeId: 'critic_reflection',
            message: `Critic Node: ${round.reflectionAnalysis}`,
          });
          await delay(700);
          callbacks.onNodeChange('critic_reflection', 'success', { durationMs: 700 });
          break; // Loop succeeded!
        } else {
          // Failed test run: trigger reflection & self-healing loop
          callbacks.onLog({
            level: 'error',
            nodeId: 'sandbox_test_run',
            message: `Test suite failed with exit code ${round.testExitCode}:\n${round.testStderr}`,
            traceback: round.testStderr,
          });
          callbacks.onNodeChange('sandbox_test_run', 'failed', { durationMs: 1800 });

          callbacks.onNodeChange('critic_reflection', 'retrying');
          callbacks.onLog({
            level: 'warn',
            nodeId: 'critic_reflection',
            message: `Triggering Closed-Loop Reflection Node... Parsing stderr traceback.`,
          });
          await delay(1100);
          callbacks.onLog({
            level: 'agent',
            nodeId: 'critic_reflection',
            message: `${round.reflectionAnalysis}`,
          });
          await delay(900);
          checkCancelled();
          callbacks.onLog({
            level: 'info',
            nodeId: 'critic_reflection',
            message: `Cyclic state edge active: Routing control back to [Patch Generator] with updated constraints.`,
          });
          callbacks.onNodeChange('critic_reflection', 'success', { durationMs: 2000, tokens: 910 });
        }
      }

      // Step 7: Git & PR Generator
      callbacks.onNodeChange('pr_generation', 'running');
      callbacks.onLog({
        level: 'agent',
        nodeId: 'pr_generation',
        message: `Creating git branch "${issue.finalPR.branchName}"...`,
      });
      await delay(600);
      callbacks.onLog({
        level: 'cmd',
        nodeId: 'pr_generation',
        message: `git checkout -b ${issue.finalPR.branchName} && git commit -m "${issue.finalPR.title}"`,
      });
      await delay(700);
      callbacks.onLog({
        level: 'success',
        nodeId: 'pr_generation',
        message: `Pull Request opened: "${issue.finalPR.title}" on ${issue.repo}#pull/12. All status checks passing (100%).`,
      });
      callbacks.onNodeChange('pr_generation', 'success', { durationMs: 1300, tokens: 420 });

      callbacks.onComplete(issue);
    } catch (err: any) {
      if (this.isCancelled) {
        callbacks.onLog({
          level: 'warn',
          nodeId: 'idle',
          message: 'Execution aborted by user.',
        });
      } else {
        callbacks.onError(err.message || 'Unknown agent execution error occurred.');
      }
    }
  }
}
