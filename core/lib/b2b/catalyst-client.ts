import { createClient, BigCommerceAuthError } from '@bigcommerce/catalyst-client';
import { headers } from 'next/headers';

import { backendUserAgent } from '../userAgent';

// B2B-specific client configuration
export const b2bClient = createClient({
  storefrontToken: process.env.BIGCOMMERCE_STOREFRONT_TOKEN ?? '',
  storeHash: process.env.BIGCOMMERCE_STORE_HASH ?? '',
  channelId: process.env.BIGCOMMERCE_CHANNEL_ID,
  backendUserAgentExtensions: backendUserAgent,
  logger: process.env.NODE_ENV !== 'production',
  getChannelId: async (defaultChannelId: string) => {
    // For B2B, we always use the configured channel
    return process.env.BIGCOMMERCE_CHANNEL_ID ?? defaultChannelId;
  },
  beforeRequest: async (fetchOptions) => {
    const requestHeaders: Record<string, string> = {};
    
    // Add B2B-specific headers
    if (process.env.B2B_API_TOKEN) {
      requestHeaders['X-B2B-Token'] = process.env.B2B_API_TOKEN;
    }
    
    // Add customer access token if available
    try {
      const headersList = await headers();
      const customerToken = headersList.get('X-Bc-Customer-Access-Token');
      if (customerToken) {
        requestHeaders['X-Bc-Customer-Access-Token'] = customerToken;
      }
    } catch {
      // Headers not available in this context
    }

    return {
      headers: requestHeaders,
    };
  },
  onError: (error, queryType) => {
    if (error instanceof BigCommerceAuthError && queryType === 'query') {
      console.warn('B2B BigCommerce auth error:', error);
      // Don't redirect for B2B - let the component handle gracefully
      return;
    }
  },
});

// B2B-specific utility functions
export class B2BCatalystClient {
  private client = b2bClient;

  /**
   * Get customer profile using B2B APIs
   */
  async getCustomerProfile(customerAccessToken: string) {
    return this.client.fetch({
      document: {
        kind: 'Document',
        definitions: [
          {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'GetCustomerProfile' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customer' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'lastName' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'company' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'customerGroup' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
      customerAccessToken,
    });
  }

  /**
   * Get customer orders using B2B APIs
   */
  async getCustomerOrders(customerAccessToken: string, limit = 10) {
    return this.client.fetch({
      document: {
        kind: 'Document',
        definitions: [
          {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'GetCustomerOrders' },
            variableDefinitions: [
              {
                kind: 'VariableDefinition',
                variable: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
                type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customer' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'orders' },
                        arguments: [
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'limit' },
                            value: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
                          },
                        ],
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'edges' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'node' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                                        { kind: 'Field', name: { kind: 'Name', value: 'orderNumber' } },
                                        { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'totalAmount' },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              { kind: 'Field', name: { kind: 'Name', value: 'amount' } },
                                              { kind: 'Field', name: { kind: 'Name', value: 'currencyCode' } },
                                            ],
                                          },
                                        },
                                        { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
      variables: { limit },
      customerAccessToken,
    });
  }

  /**
   * Get customer quotes using B2B APIs
   */
  async getCustomerQuotes(customerAccessToken: string, limit = 10) {
    return this.client.fetch({
      document: {
        kind: 'Document',
        definitions: [
          {
            kind: 'OperationDefinition',
            operation: 'query',
            name: { kind: 'Name', value: 'GetCustomerQuotes' },
            variableDefinitions: [
              {
                kind: 'VariableDefinition',
                variable: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
                type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customer' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'quotes' },
                        arguments: [
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'limit' },
                            value: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
                          },
                        ],
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'edges' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'node' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                                        { kind: 'Field', name: { kind: 'Name', value: 'quoteNumber' } },
                                        { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'totalAmount' },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              { kind: 'Field', name: { kind: 'Name', value: 'amount' } },
                                              { kind: 'Field', name: { kind: 'Name', value: 'currencyCode' } },
                                            ],
                                          },
                                        },
                                        { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                                        { kind: 'Field', name: { kind: 'Name', value: 'expiresAt' } },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
      variables: { limit },
      customerAccessToken,
    });
  }
}

// Export singleton instance
export const b2bCatalystClient = new B2BCatalystClient(); 