'use client';

import { useState } from 'react';

/**
 * Watts Water — API Test Bench
 *
 * Live proof panel for the 2026-08-13 tech deep dive. Each button fires a real
 * B2B Management V3 call server-side (token never reaches the browser) and
 * renders the FULL request → response exchange — which doubles as the
 * "verbose logging" demonstration (agenda row 3).
 */

interface Exchange {
  request: { method: string; url: string; headers: Record<string, string> };
  response: { status: number; statusText: string; durationMs: number; body: unknown };
  error?: string;
}

interface CaseResult {
  title: string;
  facts: string[];
  exchanges: Exchange[];
}

interface LogEntry extends CaseResult {
  ranAt: string;
}

const TEST_CASES: Array<{
  group: string;
  cases: Array<{ id: string; label: string; description: string; needsId?: boolean }>;
}> = [
  {
    group: '1 · Book of Business (the #1 requirement)',
    cases: [
      {
        id: 'book-quotes',
        label: 'All quotes, all companies',
        description: 'GET /rfq — cross-company, filterable, zero impersonation',
      },
      {
        id: 'book-orders',
        label: 'All orders, all companies',
        description: 'GET /orders — same server-side pattern',
      },
      {
        id: 'invoices',
        label: 'All invoices',
        description: 'GET /invoices — Invoice Management API',
      },
    ],
  },
  {
    group: '2 · Manufacturer-Rep model',
    cases: [
      {
        id: 'super-admins',
        label: 'Reps + assignments',
        description: 'GET /super-admins (+ /{id}/companies) — the security hierarchy',
        needsId: true,
      },
      {
        id: 'companies',
        label: 'Companies + pricing pivot',
        description: 'GET /companies — customerGroupId → price list chain',
      },
    ],
  },
  {
    group: '3 · Quote lifecycle facts',
    cases: [
      {
        id: 'quote-detail',
        label: 'Quote detail + API truths',
        description: 'GET /rfq/{id} — auto-submit / no draft→submit / approval-before-create',
        needsId: true,
      },
    ],
  },
];

function StatusBadge({ status }: { status: number }) {
  const ok = status >= 200 && status < 300;
  const cls = ok
    ? 'bg-green-100 text-green-800'
    : status === 0
      ? 'bg-gray-200 text-gray-700'
      : 'bg-red-100 text-red-800';

  return (
    <span className={`inline-block rounded px-2 py-0.5 font-mono text-xs font-bold ${cls}`}>
      {status === 0 ? 'NO CALL' : `${status}`}
    </span>
  );
}

function ExchangePanel({ exchange }: { exchange: Exchange }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-3 rounded border border-gray-300 bg-white">
      <button
        className="flex w-full items-center gap-3 px-3 py-2 text-left"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <StatusBadge status={exchange.response.status} />
        <span className="font-mono text-xs font-bold">{exchange.request.method}</span>
        <span className="flex-1 truncate font-mono text-xs text-gray-700">
          {exchange.request.url}
        </span>
        <span className="font-mono text-xs text-gray-500">{exchange.response.durationMs}ms</span>
      </button>
      {open && (
        <div className="border-t border-gray-200 px-3 py-2">
          <div className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500">
            Request headers
          </div>
          <pre className="mb-2 overflow-x-auto rounded bg-gray-900 p-2 text-xs text-green-300">
            {JSON.stringify(exchange.request.headers, null, 2)}
          </pre>
          {exchange.error ? (
            <>
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-red-500">
                Error
              </div>
              <pre className="overflow-x-auto rounded bg-red-50 p-2 text-xs text-red-800">
                {exchange.error}
              </pre>
            </>
          ) : (
            <>
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500">
                Response body ({exchange.response.status} {exchange.response.statusText})
              </div>
              <pre className="max-h-96 overflow-auto rounded bg-gray-900 p-2 text-xs text-amber-200">
                {JSON.stringify(exchange.response.body, null, 2)}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function WattsDemoPage() {
  const [log, setLog] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState<string | null>(null);
  const [recordId, setRecordId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  async function runCase(caseId: string) {
    setRunning(caseId);

    try {
      const params = new URLSearchParams({ case: caseId });

      if (recordId) params.set('id', recordId);
      if (statusFilter) params.set('status', statusFilter);

      const response = await fetch(`/api/watts-demo?${params.toString()}`);
      const data: CaseResult = await response.json();

      setLog((previous) => [{ ...data, ranAt: new Date().toLocaleTimeString() }, ...previous]);
    } catch (error) {
      setLog((previous) => [
        {
          title: `Failed to run ${caseId}`,
          facts: [error instanceof Error ? error.message : String(error)],
          exchanges: [],
          ranAt: new Date().toLocaleTimeString(),
        },
        ...previous,
      ]);
    } finally {
      setRunning(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-1 text-3xl font-bold">Watts Water — API Test Bench</h1>
      <p className="mb-6 text-sm text-gray-600">
        Live calls against the B2B Edition <strong>REST Management V3 API</strong> (
        <code className="rounded bg-gray-100 px-1">api-b2b.bigcommerce.com/api/v3/io</code>) using
        the current auth scheme (<code className="rounded bg-gray-100 px-1">X-Auth-Token</code> +{' '}
        <code className="rounded bg-gray-100 px-1">X-Store-Hash</code>). The token stays
        server-side — the browser only receives this redacted exchange log. Spec:{' '}
        <a
          className="text-blue-600 underline"
          href="https://docs.bigcommerce.com/openapi/b2b-management.json"
          rel="noreferrer"
          target="_blank"
        >
          b2b-management.json
        </a>{' '}
        (85 endpoints).
      </p>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {TEST_CASES.map((group) => (
          <div className="rounded border border-gray-300 bg-gray-50 p-3" key={group.group}>
            <h2 className="mb-2 text-sm font-bold">{group.group}</h2>
            {group.cases.map((testCase) => (
              <button
                className="mb-2 w-full rounded bg-blue-600 px-3 py-2 text-left text-sm text-white transition hover:bg-blue-700 disabled:opacity-50"
                disabled={running !== null}
                key={testCase.id}
                onClick={() => void runCase(testCase.id)}
                type="button"
              >
                <span className="block font-semibold">
                  {running === testCase.id ? 'Running…' : testCase.label}
                </span>
                <span className="block text-xs text-blue-100">{testCase.description}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-4 rounded border border-gray-300 bg-gray-50 p-3">
        <label className="text-xs font-semibold text-gray-700">
          Record id (Super Admin id / Quote id)
          <input
            className="mt-1 block w-56 rounded border border-gray-300 px-2 py-1 font-mono text-sm"
            onChange={(event) => setRecordId(event.target.value)}
            placeholder="optional"
            value={recordId}
          />
        </label>
        <label className="text-xs font-semibold text-gray-700">
          Quote status filter (0,2,3,4,5,6,7)
          <input
            className="mt-1 block w-40 rounded border border-gray-300 px-2 py-1 font-mono text-sm"
            onChange={(event) => setStatusFilter(event.target.value)}
            placeholder="optional"
            value={statusFilter}
          />
        </label>
        <button
          className="rounded border border-gray-400 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
          onClick={() => setLog([])}
          type="button"
        >
          Clear log
        </button>
      </div>

      {log.length === 0 && (
        <div className="rounded border border-dashed border-gray-400 p-8 text-center text-sm text-gray-500">
          Run a test case — the full request → response exchange renders here (this panel is also
          the verbose-logging demonstration for agenda row 3).
        </div>
      )}

      {log.map((entry, index) => (
        <div className="mb-6 rounded-lg border border-gray-300 p-4" key={`${entry.ranAt}-${index}`}>
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="text-lg font-bold">{entry.title}</h3>
            <span className="font-mono text-xs text-gray-500">{entry.ranAt}</span>
          </div>
          <ul className="mb-3 list-disc pl-5 text-sm text-gray-800">
            {entry.facts.map((fact) => (
              <li className="mb-1" key={fact}>
                {fact}
              </li>
            ))}
          </ul>
          {entry.exchanges.map((exchange, exchangeIndex) => (
            <ExchangePanel exchange={exchange} key={exchangeIndex} />
          ))}
        </div>
      ))}
    </div>
  );
}
