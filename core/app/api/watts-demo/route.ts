import { NextRequest, NextResponse } from 'next/server';

import { managementGet, type VerboseExchange } from '~/b2b/management-client';

/**
 * Watts demo test bench — server-side runner for B2B Management V3 test cases.
 * The Management token never leaves the server; the browser only ever sees the
 * verbose exchange (with the token redacted). This IS the architecture story:
 * cross-company data is served by a backend that enforces entitlement.
 */

interface CaseResult {
  title: string;
  facts: string[];
  exchanges: VerboseExchange[];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testCase = searchParams.get('case') ?? '';
  const status = searchParams.get('status') ?? undefined;
  const companyName = searchParams.get('companyName') ?? undefined;
  const id = searchParams.get('id') ?? undefined;

  let result: CaseResult;

  switch (testCase) {
    case 'book-quotes': {
      const exchange = await managementGet('/rfq', {
        limit: 10,
        offset: 0,
        status,
        companyName,
        sortBy: 'updatedAt',
        orderBy: 'desc',
      });

      result = {
        title: 'Book of Business — Quotes across ALL companies (GET /rfq)',
        facts: [
          'One server-side call returns quotes across every Company in the store — no impersonation involved. The BFF filters to the rep’s assigned companies (the "security hierarchy").',
          'Filterable: status, companyName, dateRange, salesRep sort — Watts Q10: filtering the book of business is a key rep workflow.',
          'Backend statuses: 0 New, 2 In Process, 3 Updated by customer, 4 Ordered, 5 Expired, 6 Archived, 7 Draft (staff-side).',
          'Watts scale note: at ~350K quotes, replicate via webhooks into your data layer; this API seeds and reconciles it.',
        ],
        exchanges: [exchange],
      };
      break;
    }

    case 'book-orders': {
      const exchange = await managementGet('/orders', { limit: 10, offset: 0 });

      result = {
        title: 'Book of Business — Orders across ALL companies (GET /orders)',
        facts: [
          'Same pattern as quotes: server-side, cross-company, entitlement enforced by YOUR orchestration layer (SAP-BTP).',
          'Watts already aggregates orders from 18 ERPs via their own APIs — BigCommerce feeds that layer via this API + webhooks.',
          'B2B order records link to BigCommerce order IDs (bcOrderId) for drill-down to core order detail.',
        ],
        exchanges: [exchange],
      };
      break;
    }

    case 'invoices': {
      const exchange = await managementGet('/invoices', { limit: 10, offset: 0 });

      result = {
        title: 'Book of Business — Invoices (GET /invoices)',
        facts: [
          'Invoice Management API: invoices, payments, receipts — same cross-company server-side access.',
          'Buyer-facing invoice portal is a B2B Edition feature toggle; Watts is undecided on it ("deferred to us") — this API works either way.',
        ],
        exchanges: [exchange],
      };
      break;
    }

    case 'super-admins': {
      const exchanges = [await managementGet('/super-admins', { limit: 10, offset: 0 })];

      if (id) {
        exchanges.push(await managementGet(`/super-admins/${id}/companies`, { limit: 10 }));
      }

      result = {
        title: 'Rep model — Super Admins and their company assignments',
        facts: [
          'A rep = Super Admin. Assignments are API-managed (PUT /super-admins/{id}/companies) — sync from ERP territory data.',
          'Many-to-many: a company can have multiple Super Admins, a Super Admin many companies (Watts Q8: reps overlap "without the business knowing").',
          'This assignment list IS the "security hierarchy" the book-of-business queries filter by.',
          'Provide a Super Admin id to also fetch that rep’s assigned companies.',
        ],
        exchanges,
      };
      break;
    }

    case 'companies': {
      const exchange = await managementGet('/companies', { limit: 10, offset: 0 });

      result = {
        title: 'Companies (GET /companies) — the account master',
        facts: [
          'Each Company carries customerGroupId — the pivot to price lists (contract "ceiling") and catalog visibility.',
          'Company Hierarchy endpoints (/companies/{id}/hierarchy, /subsidiaries, /parent) model OWNERSHIP structures — Ferguson + branches. Caps: 5 levels, 500 companies per hierarchy — which is why rep books use Super Admin assignments instead.',
        ],
        exchanges: [exchange],
      };
      break;
    }

    case 'quote-detail': {
      const exchanges: VerboseExchange[] = [];

      if (id) {
        exchanges.push(await managementGet(`/rfq/${id}`));
      } else {
        exchanges.push(await managementGet('/rfq', { limit: 1, sortBy: 'updatedAt', orderBy: 'desc' }));
      }

      result = {
        title: 'Quote lifecycle — detail + API facts (GET /rfq/{id})',
        facts: [
          'POST /rfq (Create Quote) ALWAYS auto-submits to the buyer — draft-then-submit is a Control Panel workflow, not an API one.',
          'PUT /rfq/{id} documents exactly one writable status: "archived". There is NO draft→submitted transition in the API.',
          'Therefore: floor/ceiling approval queues must gate BEFORE quote creation — hold the draft in SAP-BTP, create the quote on approval (optionally allowCheckout:false).',
          'Line-level basePrice / discount / offeredPrice are all expressible on the Create Quote payload — the rep discount model maps directly.',
        ],
        exchanges,
      };
      break;
    }

    default:
      return NextResponse.json(
        { error: `Unknown case "${testCase}". Valid: book-quotes, book-orders, invoices, super-admins, companies, quote-detail` },
        { status: 400 },
      );
  }

  return NextResponse.json(result);
}
