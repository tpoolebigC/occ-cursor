/**
 * Flooring Calculator - Stencil JavaScript Module
 *
 * Reads configuration from data attributes on #flooring-calculator.
 * Uses the BigCommerce Storefront Cart API for box mode
 * and the BC Management API (proxied through a custom endpoint) for sqft mode.
 *
 * Setup:
 * 1. Include this file in your Stencil theme's assets/js directory
 * 2. Import/require it in your theme's app.js or product page bundle
 * 3. For sqft mode, create a serverless function or proxy at /api/flooring-cart
 *    that calls the BC Management API with list_price override
 *
 * Usage:
 *   import FlooringCalculator from './flooring-calculator';
 *   new FlooringCalculator();
 */

class FlooringCalculator {
  constructor() {
    this.el = document.getElementById('flooring-calculator');
    if (!this.el) return;

    this.config = {
      productId: parseInt(this.el.dataset.productId, 10) || 0,
      variantId: parseInt(this.el.dataset.variantId, 10) || 0,
      pricePerSqft: parseFloat(this.el.dataset.pricePerSqft) || 0,
      boxCoverage: parseFloat(this.el.dataset.boxCoverage) || 0,
      boxPrice: parseFloat(this.el.dataset.boxPrice) || 0,
      minOrderSqft: parseFloat(this.el.dataset.minOrderSqft) || 0,
      unitLabel: this.el.dataset.unitLabel || 'Square Feet',
      modifierName: this.el.dataset.modifierName || 'Square Footage',
    };

    this.mode = 'sqft';
    this.cacheElements();
    this.bindEvents();
    this.setUnitLabels();
    this.el.style.display = '';
  }

  cacheElements() {
    // Toggle buttons
    this.toggleBtns = this.el.querySelectorAll('.flooring-calculator__toggle-btn');
    this.panels = {
      sqft: this.el.querySelector('.flooring-calculator__panel--sqft'),
      boxes: this.el.querySelector('.flooring-calculator__panel--boxes'),
    };

    // Sqft elements
    this.sqftInput = this.el.querySelector('#flooring-sqft-input');
    this.sqftMinMsg = this.el.querySelector('.flooring-calculator__min-msg');
    this.sqftSummary = this.el.querySelector('.flooring-calculator__summary');
    this.sqftBreakdown = this.el.querySelector('.flooring-calculator__breakdown');
    this.sqftTotal = this.el.querySelector('.flooring-calculator__total');
    this.boxEstimate = this.el.querySelector('.flooring-calculator__box-estimate');
    this.boxesNeeded = this.el.querySelector('.flooring-calculator__boxes-needed');
    this.coveragePerBox = this.el.querySelector('.flooring-calculator__coverage-per-box');
    this.totalCoverageSqft = this.el.querySelector('.flooring-calculator__total-coverage-sqft');
    this.overage = this.el.querySelector('.flooring-calculator__overage');
    this.overageValue = this.el.querySelector('.flooring-calculator__overage-value');

    // Box elements
    this.boxInput = this.el.querySelector('#flooring-box-input');
    this.boxCoverageHint = this.el.querySelector('.flooring-calculator__box-coverage-hint');
    this.boxSummary = this.el.querySelector('.flooring-calculator__summary--boxes');
    this.boxBreakdown = this.el.querySelector('.flooring-calculator__breakdown--boxes');
    this.boxTotal = this.el.querySelector('.flooring-calculator__total--boxes');
    this.coverageInfo = this.el.querySelector('.flooring-calculator__coverage-info');
    this.totalCoverageBoxes = this.el.querySelector('.flooring-calculator__total-coverage-boxes');
    this.effectivePrice = this.el.querySelector('.flooring-calculator__effective-price');

    // Shared
    this.statusEl = this.el.querySelector('.flooring-calculator__status');
    this.addBtn = this.el.querySelector('.flooring-calculator__add-btn');
  }

  bindEvents() {
    this.toggleBtns.forEach((btn) => {
      btn.addEventListener('click', () => this.setMode(btn.dataset.mode));
    });

    this.sqftInput.addEventListener('input', () => this.updateSqftCalc());
    this.boxInput.addEventListener('input', () => this.updateBoxCalc());
    this.addBtn.addEventListener('click', () => this.handleAddToCart());
  }

  setUnitLabels() {
    this.el.querySelectorAll('.flooring-calculator__unit-label').forEach((el) => {
      el.textContent = this.config.unitLabel;
    });
    this.boxCoverageHint.textContent = this.config.boxCoverage > 0
      ? `Each box covers ${this.config.boxCoverage} sqft`
      : '';
  }

  setMode(mode) {
    this.mode = mode;

    this.toggleBtns.forEach((btn) => {
      btn.classList.toggle(
        'flooring-calculator__toggle-btn--active',
        btn.dataset.mode === mode,
      );
    });

    this.panels.sqft.classList.toggle('flooring-calculator__panel--active', mode === 'sqft');
    this.panels.boxes.classList.toggle('flooring-calculator__panel--active', mode === 'boxes');

    // Re-evaluate button state
    if (mode === 'sqft') {
      this.updateSqftCalc();
    } else {
      this.updateBoxCalc();
    }
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  updateSqftCalc() {
    const sqft = parseFloat(this.sqftInput.value) || 0;
    const totalPrice = sqft * this.config.pricePerSqft;
    const boxesNeeded = this.config.boxCoverage > 0 ? Math.ceil(sqft / this.config.boxCoverage) : 0;
    const totalCoverage = boxesNeeded * this.config.boxCoverage;
    const overageVal = totalCoverage - sqft;

    // Min order warning
    if (sqft > 0 && sqft < this.config.minOrderSqft) {
      this.sqftMinMsg.textContent = `Minimum order: ${this.config.minOrderSqft} sqft`;
      this.sqftMinMsg.style.display = '';
    } else {
      this.sqftMinMsg.style.display = 'none';
    }

    // Price summary
    if (sqft > 0) {
      this.sqftBreakdown.textContent = `${this.formatCurrency(this.config.pricePerSqft)}/sqft × ${sqft} sqft`;
      this.sqftTotal.textContent = this.formatCurrency(totalPrice);
      this.sqftSummary.style.display = '';
    } else {
      this.sqftSummary.style.display = 'none';
    }

    // Box estimate
    if (sqft > 0 && this.config.boxCoverage > 0) {
      this.boxesNeeded.textContent = boxesNeeded;
      this.coveragePerBox.textContent = `${this.config.boxCoverage} sqft`;
      this.totalCoverageSqft.textContent = `${totalCoverage} sqft`;

      if (overageVal > 0) {
        this.overageValue.textContent = `+${overageVal.toFixed(1)} sqft`;
        this.overage.style.display = '';
      } else {
        this.overage.style.display = 'none';
      }

      this.boxEstimate.style.display = '';
    } else {
      this.boxEstimate.style.display = 'none';
    }

    // Button state
    const valid = sqft >= this.config.minOrderSqft;
    this.addBtn.disabled = !valid;
    this.addBtn.textContent = valid
      ? `Add ${sqft} sqft to Cart — ${this.formatCurrency(totalPrice)}`
      : sqft > 0
        ? `Enter at least ${this.config.minOrderSqft} sqft`
        : `Enter ${this.config.unitLabel.toLowerCase()} to continue`;
  }

  updateBoxCalc() {
    const boxes = parseInt(this.boxInput.value, 10) || 0;
    const totalCoverage = boxes * this.config.boxCoverage;
    const totalPrice = boxes * this.config.boxPrice;
    const effectivePerSqft = totalCoverage > 0 ? totalPrice / totalCoverage : 0;

    // Price summary
    if (boxes > 0) {
      this.boxBreakdown.textContent = `${this.formatCurrency(this.config.boxPrice)}/box × ${boxes} box${boxes !== 1 ? 'es' : ''}`;
      this.boxTotal.textContent = this.formatCurrency(totalPrice);
      this.boxSummary.style.display = '';
    } else {
      this.boxSummary.style.display = 'none';
    }

    // Coverage info
    if (boxes > 0 && this.config.boxCoverage > 0) {
      this.totalCoverageBoxes.textContent = `${totalCoverage} sqft`;
      this.effectivePrice.textContent = this.formatCurrency(effectivePerSqft);
      this.coverageInfo.style.display = '';
    } else {
      this.coverageInfo.style.display = 'none';
    }

    // Button state
    this.addBtn.disabled = boxes <= 0;
    this.addBtn.textContent = boxes > 0
      ? `Add ${boxes} Box${boxes !== 1 ? 'es' : ''} to Cart — ${this.formatCurrency(totalPrice)}`
      : 'Enter quantity to continue';
  }

  async handleAddToCart() {
    this.addBtn.disabled = true;
    const origText = this.addBtn.textContent;
    this.addBtn.textContent = 'Adding to Cart...';
    this.statusEl.style.display = 'none';

    try {
      if (this.mode === 'sqft') {
        await this.addSqftToCart();
      } else {
        await this.addBoxesToCart();
      }
    } catch (err) {
      this.showStatus(err.message || 'Failed to add to cart', 'error');
    } finally {
      this.addBtn.disabled = false;
      this.addBtn.textContent = origText;
    }
  }

  /**
   * Sqft mode: POST to a custom proxy endpoint that uses the Management API
   * to add the item with a list_price override and modifier value.
   *
   * You must create a serverless function / API route that:
   *   1. Receives { productId, variantId, sqft, totalPrice, modifierName }
   *   2. Calls BC Management API POST /v3/carts/{cartId}/items
   *      with list_price = totalPrice, option_selections = [{ Square Footage: sqft }]
   *   3. Returns the cart
   */
  async addSqftToCart() {
    const sqft = parseFloat(this.sqftInput.value) || 0;
    const totalPrice = Math.round(sqft * this.config.pricePerSqft * 100) / 100;

    const response = await fetch('/api/flooring-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'sqft',
        productId: this.config.productId,
        variantId: this.config.variantId,
        sqft,
        totalPrice,
        modifierName: this.config.modifierName,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${response.status}`);
    }

    this.showStatus(`Added ${sqft} sqft to cart`, 'success');

    // Refresh cart count in header
    this.refreshCartCount();
  }

  /**
   * Box mode: Use the standard Storefront Cart API (no price override needed).
   */
  async addBoxesToCart() {
    const boxes = parseInt(this.boxInput.value, 10) || 0;

    // Get or create cart
    let cartId = this.getCartIdFromCookie();

    const cartUrl = cartId
      ? `/api/storefront/carts/${cartId}/items`
      : '/api/storefront/carts';

    const payload = {
      lineItems: [
        {
          productId: this.config.productId,
          variantId: this.config.variantId,
          quantity: boxes,
        },
      ],
    };

    const response = await fetch(cartUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.title || `HTTP ${response.status}`);
    }

    this.showStatus(`Added ${boxes} box${boxes !== 1 ? 'es' : ''} to cart`, 'success');
    this.refreshCartCount();
  }

  getCartIdFromCookie() {
    const match = document.cookie.match(/SHOP_SESSION_TOKEN=([^;]+)/);
    return match ? match[1] : null;
  }

  refreshCartCount() {
    // Trigger Stencil's cart count refresh
    const event = new CustomEvent('cart-quantity-update');
    document.body.dispatchEvent(event);

    // Also try the common Stencil utility
    if (window.stencilUtils && typeof window.stencilUtils.api === 'object') {
      try {
        window.stencilUtils.api.cart.getCart({}, () => {});
      } catch (_e) {
        // Ignore
      }
    }
  }

  showStatus(message, type) {
    this.statusEl.textContent = message;
    this.statusEl.className = `flooring-calculator__status flooring-calculator__status--${type}`;
    this.statusEl.style.display = '';
    setTimeout(() => {
      this.statusEl.style.display = 'none';
    }, 4000);
  }
}

// Auto-init on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new FlooringCalculator());
} else {
  new FlooringCalculator();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FlooringCalculator;
}
