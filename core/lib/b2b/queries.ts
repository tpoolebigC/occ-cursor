// B2B Customer Queries
export const GET_CUSTOMER = `
  query GetCustomer($customerId: ID!) {
    customer(id: $customerId) {
      id
      firstName
      lastName
      email
      company
      phone
      addresses {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        stateOrProvince
        postalCode
        country
        phone
      }
      customerGroup {
        id
        name
      }
    }
  }
`;

export const GET_CUSTOMERS = `
  query GetCustomers($search: String, $limit: Int = 10) {
    customers(search: $search, limit: $limit) {
      edges {
        node {
          id
          firstName
          lastName
          email
          company
          customerGroup {
            id
            name
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// B2B Order Queries
export const GET_CUSTOMER_ORDERS = `
  query GetCustomerOrders($customerId: ID!, $limit: Int = 10, $after: String) {
    customer(id: $customerId) {
      orders(limit: $limit, after: $after) {
        edges {
          node {
            id
            orderNumber
            status
            totalAmount {
              amount
              currencyCode
            }
            createdAt
            updatedAt
            lineItems {
              edges {
                node {
                  id
                  productId
                  productName
                  quantity
                  unitPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export const GET_ORDER_DETAILS = `
  query GetOrderDetails($orderId: ID!) {
    order(id: $orderId) {
      id
      orderNumber
      status
      totalAmount {
        amount
        currencyCode
      }
      subtotalAmount {
        amount
        currencyCode
      }
      taxAmount {
        amount
        currencyCode
      }
      shippingAmount {
        amount
        currencyCode
      }
      createdAt
      updatedAt
      customer {
        id
        firstName
        lastName
        email
        company
      }
      billingAddress {
        firstName
        lastName
        company
        address1
        address2
        city
        stateOrProvince
        postalCode
        country
        phone
      }
      shippingAddress {
        firstName
        lastName
        company
        address1
        address2
        city
        stateOrProvince
        postalCode
        country
        phone
      }
      lineItems {
        edges {
          node {
            id
            productId
            productName
            sku
            quantity
            unitPrice {
              amount
              currencyCode
            }
            totalAmount {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

// B2B Quote Queries
export const GET_CUSTOMER_QUOTES = `
  query GetCustomerQuotes($customerId: ID!, $limit: Int = 10, $after: String) {
    customer(id: $customerId) {
      quotes(limit: $limit, after: $after) {
        edges {
          node {
            id
            quoteNumber
            status
            totalAmount {
              amount
              currencyCode
            }
            createdAt
            expiresAt
            lineItems {
              edges {
                node {
                  id
                  productId
                  productName
                  quantity
                  unitPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export const GET_QUOTE_DETAILS = `
  query GetQuoteDetails($quoteId: ID!) {
    quote(id: $quoteId) {
      id
      quoteNumber
      status
      totalAmount {
        amount
        currencyCode
      }
      subtotalAmount {
        amount
        currencyCode
      }
      taxAmount {
        amount
        currencyCode
      }
      createdAt
      expiresAt
      customer {
        id
        firstName
        lastName
        email
        company
      }
      lineItems {
        edges {
          node {
            id
            productId
            productName
            sku
            quantity
            unitPrice {
              amount
              currencyCode
            }
            totalAmount {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

// B2B Product Queries
export const GET_B2B_PRODUCTS = `
  query GetB2BProducts($search: String, $categoryId: ID, $limit: Int = 20, $after: String) {
    site {
      products(search: $search, categoryEntityId: $categoryId, limit: $limit, after: $after) {
        edges {
          node {
            entityId
            name
            sku
            path
            brand {
              name
            }
            prices {
              price {
                value
                currencyCode
              }
              salePrice {
                value
                currencyCode
              }
            }
            defaultImage {
              url(width: 300)
              altText
            }
            inventoryLevel
            availabilityV2 {
              status
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`; 