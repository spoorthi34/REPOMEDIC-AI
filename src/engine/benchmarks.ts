import { BenchmarkIssue } from '../types';

export const BENCHMARK_ISSUES: BenchmarkIssue[] = [
  {
    id: 'fastapi-async-session-race',
    title: 'Race Condition in Async SQLAlchemy DB Session Pool under Concurrency',
    repo: 'acme-corp/payment-gateway-service',
    difficulty: 'Production Severity 1',
    category: 'Race Condition',
    language: 'python',
    issueNumber: 412,
    issueDescription:
      'Under high concurrent load (>150 req/sec), customer checkout requests randomly crash with `ResourceClosedError: This Connection is closed` or `InvalidRequestError: Object is already attached to session`. Trace indicates coroutines are sharing a single AsyncSession instance across concurrent request contexts.',
    affectedFiles: [
      {
        path: 'services/db/session.py',
        language: 'python',
        content: `import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql+asyncpg://user:pass@localhost:5432/payments"

engine = create_async_engine(DATABASE_URL, pool_size=20, max_overflow=10)
# BUG: Shared global session instance across concurrent coroutines
_global_async_session_maker = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)
_shared_session = _global_async_session_maker()

async def get_db_session() -> AsyncSession:
    """Yields a database session for FastAPI dependencies."""
    # BUG: Returning shared reference causes race conditions between coroutines
    return _shared_session
`
      },
      {
        path: 'api/routers/checkout.py',
        language: 'python',
        content: `from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from services.db.session import get_db_session

router = APIRouter(prefix="/checkout")

@router.post("/process")
async def process_checkout(payload: dict, db: AsyncSession = Depends(get_db_session)):
    async with db.begin():
        # Executes payment ledger entry
        await db.execute("UPDATE accounts SET balance = balance - 10 WHERE id = 1")
    return {"status": "confirmed"}
`
      }
    ],
    testFile: {
      path: 'tests/test_concurrency_race.py',
      language: 'python',
      content: `import pytest
import asyncio
from httpx import AsyncClient
from api.main import app

@pytest.mark.asyncio
async def test_high_concurrency_checkout_no_race():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Launch 50 concurrent requests simultaneously
        tasks = [ac.post("/checkout/process", json={"amount": 10}) for _ in range(50)]
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        errors = [r for r in responses if isinstance(r, Exception) or r.status_code != 200]
        assert len(errors) == 0, f"Encountered {len(errors)} race condition failures out of 50 requests!"
`
    },
    testCommand: 'pytest tests/test_concurrency_race.py -v --asyncio-mode=auto',
    astSymbolsDetected: [
      { name: '_shared_session', type: 'variable', file: 'services/db/session.py', line: 12, relevanceScore: 0.98 },
      { name: 'get_db_session', type: 'function', file: 'services/db/session.py', line: 14, relevanceScore: 0.95 },
      { name: '_global_async_session_maker', type: 'variable', file: 'services/db/session.py', line: 9, relevanceScore: 0.88 },
      { name: 'process_checkout', type: 'function', file: 'api/routers/checkout.py', line: 8, relevanceScore: 0.72 }
    ],
    simulationRounds: [
      {
        round: 1,
        patchDescription: 'Added global asyncio.Lock around shared session to serialize access.',
        patchDiff: `@@ -12,5 +12,8 @@
-_shared_session = _global_async_session_maker()
+_lock = asyncio.Lock()
+_shared_session = _global_async_session_maker()
 
 async def get_db_session() -> AsyncSession:
-    return _shared_session
+    async with _lock:
+        return _shared_session`,
        testExitCode: 1,
        testStderr: `FAILED tests/test_concurrency_race.py::test_high_concurrency_checkout_no_race
AsyncioTimeoutError: Task was pending for > 5.00 seconds.
CRITICAL DEADLOCK: Global lock in dependency getter creates severe bottleneck; 
FastAPI holds connection inside coroutine while other tasks starve.
Encountered 42 race condition failures out of 50 requests!
1 failed in 5.12s`,
        reflectionAnalysis:
          'DIAGNOSIS: Naive global mutex lock serialized dependency resolution but failed to isolate transaction state during query execution, leading to coroutine starvation and deadlocks. A proper generator with `async with async_session_maker() as session:` must be yielded to guarantee per-request lifecycle isolation and automatic teardown.',
        passed: false
      },
      {
        round: 2,
        patchDescription:
          'Refactored `get_db_session` to an async generator with contextvars support and proper try/finally cleanup.',
        patchDiff: `@@ -9,10 +9,11 @@
- _shared_session = _global_async_session_maker()
+ async_session_factory = sessionmaker(
+     engine, class_=AsyncSession, expire_on_commit=False, autoflush=False
+ )
 
-async def get_db_session() -> AsyncSession:
-    return _shared_session
+async def get_db_session():
+    """Yields an isolated, per-request transactional AsyncSession."""
+    async with async_session_factory() as session:
+        try:
+            yield session
+        finally:
+            await session.close()`,
        testExitCode: 0,
        testStderr: `tests/test_concurrency_race.py::test_high_concurrency_checkout_no_race PASSED [100%]
============================== 1 passed in 0.48s ===============================
[Sandbox] Memory usage: 48.2 MB | CPU: 12% | Zero connection leaks detected`,
        reflectionAnalysis:
          'VERIFICATION: Exit code 0. All 50 concurrent coroutines completed in 0.48s with zero resource collisions. Session lifecycle is strictly bound to request scope.',
        passed: true
      }
    ],
    finalPR: {
      title: 'fix(db): resolve concurrent session race by yielding per-request AsyncSession',
      branchName: 'repomedic/fix-issue-412-async-session-race',
      summary:
        'Resolves critical production race condition where concurrent coroutines collided over a shared global AsyncSession instance. Migrated dependency injection to an isolated per-request async context generator with strict try/finally cleanup.',
      keyChanges: [
        'Removed hazardous module-level `_shared_session` singleton instantiation',
        'Implemented `async with async_session_factory() as session` generator pattern',
        'Guaranteed deterministic session teardown and connection return to pool on completion or error',
        'Validated with 50-worker concurrent stress test suite'
      ],
      verificationNote:
        'Verified in ephemeral Docker sandbox container with PostgreSQL 16. All 50 concurrent execution checks passed without connection pool starvation.'
    }
  },
  {
    id: 'jwt-skew-replay-vulnerability',
    title: 'Clock Skew Rejection in Multi-Region Auth & Token Replay Exploit',
    repo: 'fintech-core/distributed-auth-gateway',
    difficulty: 'Hard',
    category: 'JWT Timing Attack',
    language: 'typescript',
    issueNumber: 889,
    issueDescription:
      'Tokens issued in AWS us-east-1 are rejected in eu-central-1 due to sub-second clock drift (120ms - 450ms). An earlier attempt to increase leeway to 60s introduced a critical replay attack vulnerability where revoked access tokens remain active.',
    affectedFiles: [
      {
        path: 'src/auth/jwtValidator.ts',
        language: 'typescript',
        content: `import jwt from 'jsonwebtoken';

interface TokenPayload {
  sub: string;
  jti: string;
  iat: number;
  exp: number;
}

export class JwtValidator {
  private publicKey: string;

  constructor(publicKey: string) {
    this.publicKey = publicKey;
  }

  public verifyToken(token: string): TokenPayload {
    // BUG: Zero clockTolerance causes drift rejections across multi-region edge nodes
    return jwt.verify(token, this.publicKey, {
      algorithms: ['RS256'],
      clockTolerance: 0,
    }) as TokenPayload;
  }
}
`
      }
    ],
    testFile: {
      path: 'test/auth/jwtValidator.spec.ts',
      language: 'typescript',
      content: `import { JwtValidator } from '../../src/auth/jwtValidator';
import { generateSignedToken, testKeyPair } from '../fixtures/keys';

describe('JwtValidator Multi-Region & Anti-Replay', () => {
  it('should tolerate acceptable 3s multi-region clock drift', () => {
    const validator = new JwtValidator(testKeyPair.public);
    const tokenWithDrift = generateSignedToken({ iatDeltaSec: 2 });
    expect(() => validator.verifyToken(tokenWithDrift)).not.toThrow();
  });

  it('should reject replay attacks with duplicate JTI within valid window', () => {
    const validator = new JwtValidator(testKeyPair.public);
    const token = generateSignedToken({ jti: 'nonce-uuid-1234' });
    
    // First verification should pass
    expect(validator.verifyToken(token)).toBeDefined();
    
    // Second identical verification within replay window MUST throw ReplayAttackDetectedError
    expect(() => validator.verifyToken(token)).toThrow(/ReplayAttackDetectedError/);
  });
});
`
    },
    testCommand: 'npm test -- --grep "JwtValidator"',
    astSymbolsDetected: [
      { name: 'JwtValidator', type: 'class', file: 'src/auth/jwtValidator.ts', line: 10, relevanceScore: 0.99 },
      { name: 'verifyToken', type: 'function', file: 'src/auth/jwtValidator.ts', line: 16, relevanceScore: 0.97 },
      { name: 'clockTolerance', type: 'variable', file: 'src/auth/jwtValidator.ts', line: 19, relevanceScore: 0.91 }
    ],
    simulationRounds: [
      {
        round: 1,
        patchDescription: 'Increased clockTolerance to 60 seconds without JTI nonce deduplication.',
        patchDiff: `@@ -18,3 +18,3 @@
       algorithms: ['RS256'],
-      clockTolerance: 0,
+      clockTolerance: 60,
     }) as TokenPayload;`,
        testExitCode: 1,
        testStderr: `FAIL test/auth/jwtValidator.spec.ts
  ● JwtValidator Multi-Region & Anti-Replay › should reject replay attacks with duplicate JTI within valid window
    
    Error: expect(received).toThrow(expected)
    Expected substring: /ReplayAttackDetectedError/
    Received function did not throw
    
    1 failed, 1 passed, 2 total`,
        reflectionAnalysis:
          'DIAGNOSIS: Broadening clockTolerance to 60 seconds allowed the drift test to pass, but catastrophically failed the anti-replay test. Cryptographic JTI (JWT ID) deduplication with a sliding TTL in-memory set is required alongside a tightly bounded 3-second clock tolerance window.',
        passed: false
      },
      {
        round: 2,
        patchDescription:
          'Implemented bounded 3s clockTolerance + LRU JTI Nonce Cache with expiration to prevent replay exploits.',
        patchDiff: `@@ -11,4 +11,6 @@
 export class JwtValidator {
   private publicKey: string;
+  private seenJtiNonces = new Map<string, number>();
+  private readonly NONCE_TTL_MS = 15000;
 
@@ -16,4 +18,17 @@
   public verifyToken(token: string): TokenPayload {
-    return jwt.verify(token, this.publicKey, {
-      algorithms: ['RS256'],
-      clockTolerance: 0,
-    }) as TokenPayload;
+    const decoded = jwt.verify(token, this.publicKey, {
+      algorithms: ['RS256'],
+      clockTolerance: 3, // Bounded 3-second multi-region skew allowance
+    }) as TokenPayload;
+
+    const now = Date.now();
+    // Evict expired nonces
+    for (const [jti, timestamp] of this.seenJtiNonces) {
+      if (now - timestamp > this.NONCE_TTL_MS) this.seenJtiNonces.delete(jti);
+    }
+
+    if (this.seenJtiNonces.has(decoded.jti)) {
+      throw new Error(\`ReplayAttackDetectedError: Token JTI \${decoded.jti} already used\`);
+    }
+    this.seenJtiNonces.set(decoded.jti, now);
+    return decoded;`,
        testExitCode: 0,
        testStderr: `PASS test/auth/jwtValidator.spec.ts
  ✓ should tolerate acceptable 3s multi-region clock drift (14 ms)
  ✓ should reject replay attacks with duplicate JTI within valid window (18 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        0.612 s`,
        reflectionAnalysis:
          'VERIFICATION: All test assertions passed. Dual-objective requirement satisfied: 3s clock drift gracefully absorbed, duplicate JTI replay within 15s window deterministically blocked.',
        passed: true
      }
    ],
    finalPR: {
      title: 'security(auth): add 3s bounded clock drift tolerance with JTI anti-replay cache',
      branchName: 'repomedic/fix-issue-889-jwt-skew-replay',
      summary:
        'Eliminates multi-region authorization false-rejections by introducing a calibrated 3-second clockTolerance while preventing replay vulnerabilities via cryptographic JTI nonce tracking.',
      keyChanges: [
        'Configured RS256 verification with explicit 3s multi-region skew allowance',
        'Implemented LRU JTI nonce memory tracker with 15-second rolling expiration',
        'Added explicit `ReplayAttackDetectedError` guardrail on token reuse',
        'Maintained 100% test coverage against cryptographic edge cases'
      ],
      verificationNote:
        'Passed sandbox regression tests for clock drift, expired tokens, tampered signatures, and replay vectors.'
    }
  },
  {
    id: 'memory-leak-event-listener',
    title: 'Unbounded Heap Memory Leak in Event Bus Subscription Registry',
    repo: 'stream-mesh/node-event-router',
    difficulty: 'Intermediate',
    category: 'Memory Leak',
    language: 'typescript',
    issueNumber: 219,
    issueDescription:
      'Services running for > 4 hours trigger Node.js `MaxListenersExceededWarning` followed by OOM process termination. WeakRef cleanup was omitted when client channels disconnect without explicit unsubscription.',
    affectedFiles: [
      {
        path: 'src/events/router.ts',
        language: 'typescript',
        content: `export class EventRouter {
  private listeners: Array<{ topic: string; handler: (data: any) => void }> = [];

  public subscribe(topic: string, handler: (data: any) => void): void {
    // BUG: Retains strong reference to handler closures indefinitely
    this.listeners.push({ topic, handler });
  }

  public publish(topic: string, data: any): void {
    this.listeners
      .filter(l => l.topic === topic)
      .forEach(l => l.handler(data));
  }
}
`
      }
    ],
    testFile: {
      path: 'test/events/router.spec.ts',
      language: 'typescript',
      content: `import { EventRouter } from '../../src/events/router';

describe('EventRouter Memory Leak Prevention', () => {
  it('should return unsubscribe disposer and clean up stale listeners', () => {
    const router = new EventRouter();
    const unsub = router.subscribe('metrics', () => {});
    expect(router.getListenerCount('metrics')).toBe(1);
    
    unsub();
    expect(router.getListenerCount('metrics')).toBe(0);
  });
});
`
    },
    testCommand: 'npm test -- --grep "EventRouter"',
    astSymbolsDetected: [
      { name: 'EventRouter', type: 'class', file: 'src/events/router.ts', line: 1, relevanceScore: 0.99 },
      { name: 'subscribe', type: 'function', file: 'src/events/router.ts', line: 4, relevanceScore: 0.96 },
      { name: 'listeners', type: 'variable', file: 'src/events/router.ts', line: 2, relevanceScore: 0.94 }
    ],
    simulationRounds: [
      {
        round: 1,
        patchDescription: 'Added clearAll() method, but did not return unsubscriber closure.',
        patchDiff: `@@ -9,2 +9,5 @@
   }
+  public clearAll() {
+    this.listeners = [];
+  }
 }`,
        testExitCode: 1,
        testStderr: `TypeError: unsub is not a function
    at test/events/router.spec.ts:8:5
    1 failed, 0 passed, 1 total`,
        reflectionAnalysis:
          'DIAGNOSIS: The test contract requires subscribe() to return an unsubscribe function `() => void` and provide a getListenerCount() inspector. Returning a disposer callback allows callers to avoid memory leaks automatically.',
        passed: false
      },
      {
        round: 2,
        patchDescription:
          'Updated `subscribe` to return an unsubscribe closure and added `getListenerCount` method.',
        patchDiff: `@@ -4,4 +4,11 @@
-  public subscribe(topic: string, handler: (data: any) => void): void {
-    this.listeners.push({ topic, handler });
+  public subscribe(topic: string, handler: (data: any) => void): () => void {
+    const entry = { topic, handler };
+    this.listeners.push(entry);
+    return () => {
+      const idx = this.listeners.indexOf(entry);
+      if (idx !== -1) this.listeners.splice(idx, 1);
+    };
   }
+
+  public getListenerCount(topic?: string): number {
+    return topic ? this.listeners.filter(l => l.topic === topic).length : this.listeners.length;
+  }`,
        testExitCode: 0,
        testStderr: `PASS test/events/router.spec.ts
  ✓ should return unsubscribe disposer and clean up stale listeners (8 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Time:        0.395 s`,
        reflectionAnalysis:
          'VERIFICATION: Disposer pattern verified. Heap allocation returns to baseline upon unsubscriber execution.',
        passed: true
      }
    ],
    finalPR: {
      title: 'fix(core): return unsubscribe disposer from EventRouter.subscribe to eliminate heap leaks',
      branchName: 'repomedic/fix-issue-219-event-bus-leak',
      summary:
        'Resolves process OOM issues caused by retained event handler closures by returning an idempotent unsubscription function from `subscribe()` and adding `getListenerCount()` observability.',
      keyChanges: [
        'Changed `subscribe()` return signature from `void` to `() => void` disposer function',
        'Implemented array reference pruning on unsubscription call',
        'Added `getListenerCount(topic?: string)` method for telemetry and assertions'
      ],
      verificationNote: 'Tested memory retention under 10,000 rapid subscribe/unsubscribe cycles.'
    }
  }
];
