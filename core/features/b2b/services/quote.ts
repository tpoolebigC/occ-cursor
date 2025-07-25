// B2B Quote Service
// Service functions for B2B quote management

import { B2BSDK } from '../types/sdk';
import { Quote, QuoteItem, QuoteSearchParams } from '../types/quote';

/**
 * Get quotes for a customer
 */
export async function getQuotes(
  sdk: B2BSDK,
  customerId: string,
  params?: QuoteSearchParams
): Promise<Quote[]> {
  try {
    if (!sdk.utils?.quote) {
      throw new Error('Quote service not available in B2B SDK');
    }
    const quotes = await sdk.utils.quote.getQuotes(customerId, params);
    return quotes;
  } catch (error) {
    console.error('Error fetching quotes:', error);
    throw error;
  }
}

/**
 * Get a specific quote by ID
 */
export async function getQuote(sdk: B2BSDK, quoteId: string): Promise<Quote> {
  try {
    if (!sdk.utils?.quote) {
      throw new Error('Quote service not available in B2B SDK');
    }
    const quote = await sdk.utils.quote.getQuote(quoteId);
    return quote;
  } catch (error) {
    console.error('Error fetching quote:', error);
    throw error;
  }
}

/**
 * Create a new quote
 */
export async function createQuote(
  sdk: B2BSDK,
  customerId: string,
  quoteData: Partial<Quote>
): Promise<Quote> {
  try {
    if (!sdk.utils?.quote) {
      throw new Error('Quote service not available in B2B SDK');
    }
    const quote = await sdk.utils.quote.createQuote(customerId, quoteData);
    return quote;
  } catch (error) {
    console.error('Error creating quote:', error);
    throw error;
  }
}

/**
 * Update a quote
 */
export async function updateQuote(
  sdk: B2BSDK,
  quoteId: string,
  quoteData: Partial<Quote>
): Promise<Quote> {
  try {
    if (!sdk.utils?.quote) {
      throw new Error('Quote service not available in B2B SDK');
    }
    const quote = await sdk.utils.quote.updateQuote(quoteId, quoteData);
    return quote;
  } catch (error) {
    console.error('Error updating quote:', error);
    throw error;
  }
}

/**
 * Add items to a quote
 */
export async function addQuoteItems(
  sdk: B2BSDK,
  quoteId: string,
  items: QuoteItem[]
): Promise<Quote> {
  try {
    if (!sdk.utils?.quote) {
      throw new Error('Quote service not available in B2B SDK');
    }
    const quote = await sdk.utils.quote.addItems(quoteId, items);
    return quote;
  } catch (error) {
    console.error('Error adding quote items:', error);
    throw error;
  }
} 