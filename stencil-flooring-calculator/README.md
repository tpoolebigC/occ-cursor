# Flooring Calculator - Stencil Integration

Drop-in flooring calculator for BigCommerce Stencil themes. Allows customers to order flooring by exact square footage or by box count, with live pricing and box conversion calculations.

## Product Setup

The same product setup works for both Catalyst and Stencil. Ensure your flooring product has these **Custom Fields**:

| Custom Field | Value | Description |
|---|---|---|
| `unit_of_measure` | `sqft` | Triggers the calculator to render |
| `unit_label` | `Square Feet` | Display label for the unit |
| `price_per_sqft` | `5.99` | Price per square foot |
| `box_coverage_sqft` | `20` | Square footage per box |
| `box_price` | `119.80` | Price per box |
| `min_order_sqft` | `10` | Minimum sqft order |

Also create a **Product Modifier** of type "Text" named "Square Footage" on the product. This stores the sqft value on the line item through the order lifecycle.

## Files

- `flooring-calculator.html` - Handlebars template snippet
- `flooring-calculator.js` - JavaScript module (vanilla JS, no dependencies)
- `flooring-calculator.css` - Styles

## Installation

### 1. Add the CSS

Copy `flooring-calculator.css` to `assets/scss/` or inline it in your theme stylesheet.

### 2. Add the JavaScript

Copy `flooring-calculator.js` to `assets/js/` and import it in your theme's `app.js`:

```js
import './flooring-calculator';
```

### 3. Add the Template

Include `flooring-calculator.html` in your product page template (`templates/pages/product.html`) below the add-to-cart form.

### 4. Sqft Proxy Endpoint (for exact pricing)

For sqft mode, you need a serverless function at `/api/flooring-cart` that proxies the BigCommerce Management API. This is because the Storefront Cart API does not support `list_price` overrides.

Example (Node.js):

```js
export default async function handler(req, res) {
  const { productId, variantId, sqft, totalPrice, modifierName } = req.body;

  // Get existing cart ID from session/cookie, or create new
  // Call BC Management API: POST /v3/carts/{cartId}/items
  // with list_price = totalPrice and option_selections for the modifier

  res.json({ success: true });
}
```

### 5. Box Mode

Box mode uses the standard Storefront Cart API and works out of the box with no proxy needed.

## How It Works

- **Sqft Mode**: Customer enters decimal sqft. JS calculates exact price. Management API adds item with `quantity: 1` and `list_price = sqft * price_per_sqft`. The "Square Footage" modifier stores the sqft value.
- **Box Mode**: Customer enters integer box count. Standard Storefront Cart API is used. No price override needed.
