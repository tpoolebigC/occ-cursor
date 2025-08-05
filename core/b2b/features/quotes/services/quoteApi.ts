/**
 * Quote API Services
 * 
 * API functions for the B2B Quote Management system.
 * Based on BigCommerce B2B Buyer Portal architecture.
 */

'use server';

import { 
  QuoteDetail, 
  QuoteListResponse, 
  QuoteListFilters, 
  CreateQuoteRequest, 
  AddProductToQuoteRequest,
  QuoteCheckoutRequest,
  QuoteCheckoutResponse,
  QuoteApiResponse,
  QuoteStatus,
  QuoteProduct,
  QuoteStatistics
} from '../types';
import { getB2BToken, getB2BUserId, getCompanyInfo } from '../../utils/b3StorageUtils';
import { b2bRestClient } from '../../server-actions';

// GraphQL queries for quotes
const GET_QUOTES = `
  query GetQuotes($first: Int!, $after: String, $filters: QuoteFilters) {
    quotes(first: $first, after: $after, filters: $filters) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          referenceNumber
          status
          createdAt
          updatedAt
          expiresAt
          contactName
          contactEmail
          contactPhone
          companyName
          subtotal
          taxTotal
          total
          currency
          customerNotes
          internalNotes
          products {
            id
            productId
            variantId
            name
            sku
            imageUrl
            quantity
            basePrice
            discountedPrice
            lineTotal
            options {
              id
              name
              value
              price
            }
            isAvailable
            isPurchasable
            inventoryLevel
            maxQuantity
          }
          history {
            id
            action
            description
            timestamp
            userId
            userName
          }
          permissions {
            canEdit
            canDelete
            canApprove
            canReject
            canConvertToOrder
            canExportPdf
            canAddProducts
            canModifyQuantities
          }
        }
      }
    }
  }
`;

const GET_QUOTE_DETAIL = `
  query GetQuoteDetail($id: ID!) {
    quote(id: $id) {
      id
      title
      referenceNumber
      status
      createdAt
      updatedAt
      expiresAt
      contactName
      contactEmail
      contactPhone
      companyName
      shippingAddress {
        firstName
        lastName
        company
        address1
        address2
        city
        state
        postalCode
        country
        phone
        email
      }
      billingAddress {
        firstName
        lastName
        company
        address1
        address2
        city
        state
        postalCode
        country
        phone
        email
      }
      useSameAddress
      subtotal
      taxTotal
      total
      currency
      customerNotes
      internalNotes
      extraFields
      products {
        id
        productId
        variantId
        name
        sku
        imageUrl
        quantity
        basePrice
        discountedPrice
        lineTotal
        options {
          id
          name
          value
          price
        }
        isAvailable
        isPurchasable
        inventoryLevel
        maxQuantity
      }
      history {
        id
        action
        description
        timestamp
        userId
        userName
      }
      permissions {
        canEdit
        canDelete
        canApprove
        canReject
        canConvertToOrder
        canExportPdf
        canAddProducts
        canModifyQuantities
      }
    }
  }
`;

const CREATE_QUOTE = `
  mutation CreateQuote($input: CreateQuoteInput!) {
    createQuote(input: $input) {
      quote {
        id
        title
        referenceNumber
        status
        createdAt
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

const ADD_PRODUCT_TO_QUOTE = `
  mutation AddProductToQuote($quoteId: ID!, $input: AddProductToQuoteInput!) {
    addProductToQuote(quoteId: $quoteId, input: $input) {
      quote {
        id
        products {
          id
          productId
          name
          sku
          quantity
          basePrice
          lineTotal
        }
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

const UPDATE_QUOTE_PRODUCT = `
  mutation UpdateQuoteProduct($quoteId: ID!, $productId: ID!, $input: UpdateQuoteProductInput!) {
    updateQuoteProduct(quoteId: $quoteId, productId: $productId, input: $input) {
      quote {
        id
        products {
          id
          productId
          name
          sku
          quantity
          basePrice
          lineTotal
        }
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

const REMOVE_PRODUCT_FROM_QUOTE = `
  mutation RemoveProductFromQuote($quoteId: ID!, $productId: ID!) {
    removeProductFromQuote(quoteId: $quoteId, productId: $productId) {
      quote {
        id
        products {
          id
          productId
          name
          sku
          quantity
          basePrice
          lineTotal
        }
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

const SUBMIT_QUOTE = `
  mutation SubmitQuote($quoteId: ID!) {
    submitQuote(quoteId: $quoteId) {
      quote {
        id
        status
        updatedAt
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

const APPROVE_QUOTE = `
  mutation ApproveQuote($quoteId: ID!, $notes: String) {
    approveQuote(quoteId: $quoteId, notes: $notes) {
      quote {
        id
        status
        updatedAt
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

const REJECT_QUOTE = `
  mutation RejectQuote($quoteId: ID!, $notes: String) {
    rejectQuote(quoteId: $quoteId, notes: $notes) {
      quote {
        id
        status
        updatedAt
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

const DELETE_QUOTE = `
  mutation DeleteQuote($quoteId: ID!) {
    deleteQuote(quoteId: $quoteId) {
      success
      errors {
        field
        message
        code
      }
    }
  }
`;

// Quote API functions
export async function getQuotes(filters: QuoteListFilters = {}): Promise<QuoteApiResponse<QuoteListResponse>> {
  try {
    const b2bToken = getB2BToken();
    const userId = getB2BUserId();
    
    if (!b2bToken || !userId) {
      return { success: false, error: 'B2B authentication required' };
    }

    const variables = {
      first: filters.limit || 20,
      after: filters.page ? btoa(`arrayconnection:${(filters.page - 1) * (filters.limit || 20)}`) : null,
      filters: {
        status: filters.status,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        search: filters.search,
      }
    };

    const response = await b2bRestClient.post('/graphql', {
      query: GET_QUOTES,
      variables,
    }, {
      headers: {
        'Authorization': `Bearer ${b2bToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.data?.errors) {
      return { success: false, error: response.data.errors[0].message };
    }

    const quotes = response.data?.data?.quotes?.edges?.map((edge: any) => edge.node) || [];
    const pageInfo = response.data?.data?.quotes?.pageInfo;

    return {
      success: true,
      data: {
        quotes,
        total: quotes.length, // This would come from the API
        page: filters.page || 1,
        limit: filters.limit || 20,
        totalPages: Math.ceil(quotes.length / (filters.limit || 20)),
      }
    };

  } catch (error) {
    console.error('Error fetching quotes:', error);
    return { success: false, error: 'Failed to fetch quotes' };
  }
}

export async function getQuoteDetail(quoteId: number): Promise<QuoteApiResponse<QuoteDetail>> {
  try {
    const b2bToken = getB2BToken();
    const userId = getB2BUserId();
    
    if (!b2bToken || !userId) {
      return { success: false, error: 'B2B authentication required' };
    }

    const response = await b2bRestClient.post('/graphql', {
      query: GET_QUOTE_DETAIL,
      variables: { id: quoteId.toString() },
    }, {
      headers: {
        'Authorization': `Bearer ${b2bToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.data?.errors) {
      return { success: false, error: response.data.errors[0].message };
    }

    const quote = response.data?.data?.quote;
    if (!quote) {
      return { success: false, error: 'Quote not found' };
    }

    return { success: true, data: quote };

  } catch (error) {
    console.error('Error fetching quote detail:', error);
    return { success: false, error: 'Failed to fetch quote detail' };
  }
}

export async function createQuote(request: CreateQuoteRequest): Promise<QuoteApiResponse<QuoteDetail>> {
  try {
    const b2bToken = getB2BToken();
    const userId = getB2BUserId();
    
    if (!b2bToken || !userId) {
      return { success: false, error: 'B2B authentication required' };
    }

    const response = await b2bRestClient.post('/graphql', {
      query: CREATE_QUOTE,
      variables: { input: request },
    }, {
      headers: {
        'Authorization': `Bearer ${b2bToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.data?.errors) {
      return { success: false, error: response.data.errors[0].message };
    }

    const result = response.data?.data?.createQuote;
    if (result?.errors?.length > 0) {
      return { 
        success: false, 
        validationErrors: result.errors 
      };
    }

    return { success: true, data: result.quote };

  } catch (error) {
    console.error('Error creating quote:', error);
    return { success: false, error: 'Failed to create quote' };
  }
}

export async function addProductToQuote(
  quoteId: number, 
  request: AddProductToQuoteRequest
): Promise<QuoteApiResponse<QuoteProduct>> {
  try {
    const b2bToken = getB2BToken();
    const userId = getB2BUserId();
    
    if (!b2bToken || !userId) {
      return { success: false, error: 'B2B authentication required' };
    }

    const response = await b2bRestClient.post('/graphql', {
      query: ADD_PRODUCT_TO_QUOTE,
      variables: { 
        quoteId: quoteId.toString(),
        input: request 
      },
    }, {
      headers: {
        'Authorization': `Bearer ${b2bToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.data?.errors) {
      return { success: false, error: response.data.errors[0].message };
    }

    const result = response.data?.data?.addProductToQuote;
    if (result?.errors?.length > 0) {
      return { 
        success: false, 
        validationErrors: result.errors 
      };
    }

    const addedProduct = result.quote.products.find((p: any) => 
      p.productId === request.productId && 
      p.variantId === request.variantId
    );

    return { success: true, data: addedProduct };

  } catch (error) {
    console.error('Error adding product to quote:', error);
    return { success: false, error: 'Failed to add product to quote' };
  }
}

export async function updateQuoteProduct(
  quoteId: number,
  productId: number,
  updates: Partial<QuoteProduct>
): Promise<QuoteApiResponse<QuoteProduct>> {
  try {
    const b2bToken = getB2BToken();
    const userId = getB2BUserId();
    
    if (!b2bToken || !userId) {
      return { success: false, error: 'B2B authentication required' };
    }

    const response = await b2bRestClient.post('/graphql', {
      query: UPDATE_QUOTE_PRODUCT,
      variables: { 
        quoteId: quoteId.toString(),
        productId: productId.toString(),
        input: updates 
      },
    }, {
      headers: {
        'Authorization': `Bearer ${b2bToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.data?.errors) {
      return { success: false, error: response.data.errors[0].message };
    }

    const result = response.data?.data?.updateQuoteProduct;
    if (result?.errors?.length > 0) {
      return { 
        success: false, 
        validationErrors: result.errors 
      };
    }

    const updatedProduct = result.quote.products.find((p: any) => p.id === productId);
    return { success: true, data: updatedProduct };

  } catch (error) {
    console.error('Error updating quote product:', error);
    return { success: false, error: 'Failed to update quote product' };
  }
}

export async function removeProductFromQuote(
  quoteId: number,
  productId: number
): Promise<QuoteApiResponse<boolean>> {
  try {
    const b2bToken = getB2BToken();
    const userId = getB2BUserId();
    
    if (!b2bToken || !userId) {
      return { success: false, error: 'B2B authentication required' };
    }

    const response = await b2bRestClient.post('/graphql', {
      query: REMOVE_PRODUCT_FROM_QUOTE,
      variables: { 
        quoteId: quoteId.toString(),
        productId: productId.toString()
      },
    }, {
      headers: {
        'Authorization': `Bearer ${b2bToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.data?.errors) {
      return { success: false, error: response.data.errors[0].message };
    }

    const result = response.data?.data?.removeProductFromQuote;
    if (result?.errors?.length > 0) {
      return { 
        success: false, 
        validationErrors: result.errors 
      };
    }

    return { success: true, data: true };

  } catch (error) {
    console.error('Error removing product from quote:', error);
    return { success: false, error: 'Failed to remove product from quote' };
  }
}

export async function submitQuote(quoteId: number): Promise<QuoteApiResponse<QuoteDetail>> {
  try {
    const b2bToken = getB2BToken();
    const userId = getB2BUserId();
    
    if (!b2bToken || !userId) {
      return { success: false, error: 'B2B authentication required' };
    }

    const response = await b2bRestClient.post('/graphql', {
      query: SUBMIT_QUOTE,
      variables: { quoteId: quoteId.toString() },
    }, {
      headers: {
        'Authorization': `Bearer ${b2bToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.data?.errors) {
      return { success: false, error: response.data.errors[0].message };
    }

    const result = response.data?.data?.submitQuote;
    if (result?.errors?.length > 0) {
      return { 
        success: false, 
        validationErrors: result.errors 
      };
    }

    return { success: true, data: result.quote };

  } catch (error) {
    console.error('Error submitting quote:', error);
    return { success: false, error: 'Failed to submit quote' };
  }
}

export async function approveQuote(quoteId: number, notes?: string): Promise<QuoteApiResponse<QuoteDetail>> {
  try {
    const b2bToken = getB2BToken();
    const userId = getB2BUserId();
    
    if (!b2bToken || !userId) {
      return { success: false, error: 'B2B authentication required' };
    }

    const response = await b2bRestClient.post('/graphql', {
      query: APPROVE_QUOTE,
      variables: { 
        quoteId: quoteId.toString(),
        notes 
      },
    }, {
      headers: {
        'Authorization': `Bearer ${b2bToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.data?.errors) {
      return { success: false, error: response.data.errors[0].message };
    }

    const result = response.data?.data?.approveQuote;
    if (result?.errors?.length > 0) {
      return { 
        success: false, 
        validationErrors: result.errors 
      };
    }

    return { success: true, data: result.quote };

  } catch (error) {
    console.error('Error approving quote:', error);
    return { success: false, error: 'Failed to approve quote' };
  }
}

export async function rejectQuote(quoteId: number, notes?: string): Promise<QuoteApiResponse<QuoteDetail>> {
  try {
    const b2bToken = getB2BToken();
    const userId = getB2BUserId();
    
    if (!b2bToken || !userId) {
      return { success: false, error: 'B2B authentication required' };
    }

    const response = await b2bRestClient.post('/graphql', {
      query: REJECT_QUOTE,
      variables: { 
        quoteId: quoteId.toString(),
        notes 
      },
    }, {
      headers: {
        'Authorization': `Bearer ${b2bToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.data?.errors) {
      return { success: false, error: response.data.errors[0].message };
    }

    const result = response.data?.data?.rejectQuote;
    if (result?.errors?.length > 0) {
      return { 
        success: false, 
        validationErrors: result.errors 
      };
    }

    return { success: true, data: result.quote };

  } catch (error) {
    console.error('Error rejecting quote:', error);
    return { success: false, error: 'Failed to reject quote' };
  }
}

export async function deleteQuote(quoteId: number): Promise<QuoteApiResponse<boolean>> {
  try {
    const b2bToken = getB2BToken();
    const userId = getB2BUserId();
    
    if (!b2bToken || !userId) {
      return { success: false, error: 'B2B authentication required' };
    }

    const response = await b2bRestClient.post('/graphql', {
      query: DELETE_QUOTE,
      variables: { quoteId: quoteId.toString() },
    }, {
      headers: {
        'Authorization': `Bearer ${b2bToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.data?.errors) {
      return { success: false, error: response.data.errors[0].message };
    }

    const result = response.data?.data?.deleteQuote;
    if (result?.errors?.length > 0) {
      return { 
        success: false, 
        validationErrors: result.errors 
      };
    }

    return { success: true, data: result.success };

  } catch (error) {
    console.error('Error deleting quote:', error);
    return { success: false, error: 'Failed to delete quote' };
  }
}

export async function checkoutQuote(request: QuoteCheckoutRequest): Promise<QuoteApiResponse<QuoteCheckoutResponse>> {
  try {
    const b2bToken = getB2BToken();
    const userId = getB2BUserId();
    
    if (!b2bToken || !userId) {
      return { success: false, error: 'B2B authentication required' };
    }

    // Call the B2B checkout API
    const response = await b2bRestClient.post('/b2b/checkout/quote', {
      quoteId: request.quoteId,
      createSession: request.createSession ?? true,
    }, {
      headers: {
        'Authorization': `Bearer ${b2bToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.data?.error) {
      return { success: false, error: response.data.error };
    }

    return { 
      success: true, 
      data: {
        success: true,
        sessionId: response.data?.sessionId,
        checkoutUrl: response.data?.checkoutUrl,
      }
    };

  } catch (error) {
    console.error('Error checking out quote:', error);
    return { success: false, error: 'Failed to checkout quote' };
  }
}

export async function getQuoteStatistics(): Promise<QuoteApiResponse<QuoteStatistics>> {
  try {
    const b2bToken = getB2BToken();
    const userId = getB2BUserId();
    
    if (!b2bToken || !userId) {
      return { success: false, error: 'B2B authentication required' };
    }

    const response = await b2bRestClient.get('/b2b/quotes/statistics', {
      headers: {
        'Authorization': `Bearer ${b2bToken}`,
      }
    });

    return { success: true, data: response.data };

  } catch (error) {
    console.error('Error fetching quote statistics:', error);
    return { success: false, error: 'Failed to fetch quote statistics' };
  }
}

export async function exportQuotePdf(quoteId: number): Promise<QuoteApiResponse<{ url: string }>> {
  try {
    const b2bToken = getB2BToken();
    const userId = getB2BUserId();
    
    if (!b2bToken || !userId) {
      return { success: false, error: 'B2B authentication required' };
    }

    const response = await b2bRestClient.post(`/b2b/quotes/${quoteId}/export/pdf`, {}, {
      headers: {
        'Authorization': `Bearer ${b2bToken}`,
      }
    });

    return { success: true, data: { url: response.data.url } };

  } catch (error) {
    console.error('Error exporting quote PDF:', error);
    return { success: false, error: 'Failed to export quote PDF' };
  }
} 