import { NextRequest, NextResponse } from 'next/server';
import { appendFile, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

/**
 * Inbound webhook receiver + reader for the Watts demo bench.
 *
 * POST — BigCommerce webhook deliveries land here (via the public tunnel).
 *        Each event is appended as a JSON line with received-at metadata and
 *        the request headers that matter for observability.
 * GET  — returns the most recent events for the bench page to poll.
 *
 * This is the "platform → integration" half of verbose logging; the bench's
 * exchange panels are the "integration → platform" half.
 */

const LOG_FILE = path.join(os.tmpdir(), 'watts-webhook-events.jsonl');

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    body = { raw: await request.text() };
  }

  const entry = {
    receivedAt: new Date().toISOString(),
    headers: {
      'content-type': request.headers.get('content-type'),
      'user-agent': request.headers.get('user-agent'),
      'webhook-signature': request.headers.get('webhook-signature') ? '(present)' : null,
    },
    event: body,
  };

  await appendFile(LOG_FILE, `${JSON.stringify(entry)}\n`, 'utf8');

  // BigCommerce retries on non-2xx — always acknowledge fast.
  return NextResponse.json({ ok: true });
}

export async function GET() {
  let lines: string[] = [];

  try {
    const raw = await readFile(LOG_FILE, 'utf8');

    lines = raw.trim().split('\n').filter(Boolean);
  } catch {
    // no events yet
  }

  const events = lines.slice(-25).reverse().map((line) => {
    try {
      return JSON.parse(line) as Record<string, unknown>;
    } catch {
      return { raw: line };
    }
  });

  return NextResponse.json({ events });
}
