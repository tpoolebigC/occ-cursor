/**
 * B2B GraphQL API - Barrel Export
 *
 * Single import point for all B2B GraphQL operations.
 *
 * Usage:
 *   import { b2bGraphQL, getAllOrders, getQuotes, getInvoices } from '~/b2b/graphql';
 */

export { b2bGraphQL, getB2BToken, B2BGraphQLError, B2BAuthError } from './client';

export * from './orders';
export * from './quotes';
export * from './invoices';
export * from './shopping-lists';
export * from './addresses';
export * from './users';
export * from './company';
export * from './masquerade';
export * from './catalog';
export * from './store-config';
