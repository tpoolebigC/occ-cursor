'use client';

import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/vibes/soul/primitives/button';

import { FlooringConfig } from './flooring-config';

export type { FlooringConfig };

interface FlooringCalculatorProps {
  config: FlooringConfig;
  onAddToCartSqft: (sqft: number) => Promise<void>;
  onAddToCartBoxes: (quantity: number) => Promise<void>;
}

type OrderMode = 'sqft' | 'boxes';

export function FlooringCalculator({
  config,
  onAddToCartSqft,
  onAddToCartBoxes,
}: FlooringCalculatorProps) {
  const [mode, setMode] = useState<OrderMode>('sqft');
  const [sqftInput, setSqftInput] = useState('');
  const [boxInput, setBoxInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatCurrency = useCallback(
    (amount: number) =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: config.currencyCode || 'USD',
      }).format(amount),
    [config.currencyCode],
  );

  // Sqft mode calculations
  const sqftCalc = useMemo(() => {
    const sqft = parseFloat(sqftInput) || 0;
    const totalPrice = sqft * config.pricePerSqft;
    const boxesNeeded = config.boxCoverageSqft > 0 ? Math.ceil(sqft / config.boxCoverageSqft) : 0;
    const totalCoverage = boxesNeeded * config.boxCoverageSqft;
    const overage = totalCoverage - sqft;
    const boxTotal = boxesNeeded * config.boxPrice;

    return { sqft, totalPrice, boxesNeeded, totalCoverage, overage, boxTotal };
  }, [sqftInput, config]);

  // Box mode calculations
  const boxCalc = useMemo(() => {
    const boxes = parseInt(boxInput, 10) || 0;
    const totalCoverage = boxes * config.boxCoverageSqft;
    const totalPrice = boxes * config.boxPrice;
    const sqftEquivalent = totalCoverage;
    const pricePerSqftEffective = totalCoverage > 0 ? totalPrice / totalCoverage : 0;

    return { boxes, totalCoverage, totalPrice, sqftEquivalent, pricePerSqftEffective };
  }, [boxInput, config]);

  const isValid = mode === 'sqft'
    ? sqftCalc.sqft >= config.minOrderSqft
    : boxCalc.boxes > 0;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (mode === 'sqft') {
        await onAddToCartSqft(sqftCalc.sqft);
        setSuccessMessage(`Added ${sqftCalc.sqft} sqft to cart`);
      } else {
        await onAddToCartBoxes(boxCalc.boxes);
        setSuccessMessage(`Added ${boxCalc.boxes} box${boxCalc.boxes !== 1 ? 'es' : ''} to cart`);
      }
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to add to cart');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/50 p-5">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          How would you like to order?
        </h3>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-1 rounded-lg bg-gray-200 p-1">
        <button
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
            mode === 'sqft'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setMode('sqft')}
          type="button"
        >
          By {config.unitLabel}
        </button>
        <button
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
            mode === 'boxes'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setMode('boxes')}
          type="button"
        >
          By Box
        </button>
      </div>

      {/* Sqft Mode */}
      {mode === 'sqft' && (
        <div className="space-y-4">
          {/* Input */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700" htmlFor="sqft-input">
              {config.unitLabel}
            </label>
            <div className="relative">
              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg font-medium focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                id="sqft-input"
                inputMode="decimal"
                min={config.minOrderSqft}
                onChange={(e) => setSqftInput(e.target.value)}
                placeholder={`Enter ${config.unitLabel.toLowerCase()}`}
                step="0.01"
                type="number"
                value={sqftInput}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                sqft
              </span>
            </div>
            {config.minOrderSqft > 0 && sqftCalc.sqft > 0 && sqftCalc.sqft < config.minOrderSqft && (
              <p className="mt-1 text-xs text-amber-600">
                Minimum order: {config.minOrderSqft} sqft
              </p>
            )}
          </div>

          {/* Price Summary */}
          {sqftCalc.sqft > 0 && (
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-gray-500">
                  {formatCurrency(config.pricePerSqft)}/sqft &times; {sqftCalc.sqft} sqft
                </span>
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(sqftCalc.totalPrice)}
                </span>
              </div>
            </div>
          )}

          {/* Box Estimate */}
          {sqftCalc.sqft > 0 && config.boxCoverageSqft > 0 && (
            <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
                Box Estimate
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600">Boxes needed:</div>
                <div className="font-medium text-gray-900">{sqftCalc.boxesNeeded}</div>
                <div className="text-gray-600">Coverage per box:</div>
                <div className="font-medium text-gray-900">{config.boxCoverageSqft} sqft</div>
                <div className="text-gray-600">Total coverage:</div>
                <div className="font-medium text-gray-900">{sqftCalc.totalCoverage} sqft</div>
                {sqftCalc.overage > 0 && (
                  <>
                    <div className="text-gray-600">Overage:</div>
                    <div className="font-medium text-amber-600">+{sqftCalc.overage.toFixed(1)} sqft</div>
                  </>
                )}
                {config.boxPrice > 0 && (
                  <>
                    <div className="border-t border-blue-100 pt-2 text-gray-600">
                      Box price ({formatCurrency(config.boxPrice)}/box):
                    </div>
                    <div className="border-t border-blue-100 pt-2 font-medium text-gray-900">
                      {formatCurrency(sqftCalc.boxTotal)}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Box Mode */}
      {mode === 'boxes' && (
        <div className="space-y-4">
          {/* Input */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700" htmlFor="box-input">
              Number of Boxes
            </label>
            <div className="relative">
              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg font-medium focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                id="box-input"
                min={1}
                onChange={(e) => setBoxInput(e.target.value)}
                placeholder="Enter number of boxes"
                step={1}
                type="number"
                value={boxInput}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                boxes
              </span>
            </div>
            {config.boxCoverageSqft > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                Each box covers {config.boxCoverageSqft} sqft
              </p>
            )}
          </div>

          {/* Price Summary */}
          {boxCalc.boxes > 0 && (
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-gray-500">
                  {formatCurrency(config.boxPrice)}/box &times; {boxCalc.boxes} box{boxCalc.boxes !== 1 ? 'es' : ''}
                </span>
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(boxCalc.totalPrice)}
                </span>
              </div>
            </div>
          )}

          {/* Coverage Info */}
          {boxCalc.boxes > 0 && config.boxCoverageSqft > 0 && (
            <div className="rounded-lg border border-green-100 bg-green-50/50 p-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-green-700">
                Coverage
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600">Total coverage:</div>
                <div className="font-medium text-gray-900">{boxCalc.totalCoverage} sqft</div>
                <div className="text-gray-600">Effective price/sqft:</div>
                <div className="font-medium text-gray-900">
                  {formatCurrency(boxCalc.pricePerSqftEffective)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Messages */}
      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {/* Add to Cart */}
      <Button
        className="w-full"
        disabled={!isValid || isSubmitting}
        loading={isSubmitting}
        onClick={handleSubmit}
        size="medium"
        type="button"
      >
        {isSubmitting
          ? 'Adding to Cart...'
          : mode === 'sqft'
            ? sqftCalc.sqft > 0
              ? `Add ${sqftCalc.sqft} sqft to Cart \u2014 ${formatCurrency(sqftCalc.totalPrice)}`
              : `Enter ${config.unitLabel.toLowerCase()} to continue`
            : boxCalc.boxes > 0
              ? `Add ${boxCalc.boxes} Box${boxCalc.boxes !== 1 ? 'es' : ''} to Cart \u2014 ${formatCurrency(boxCalc.totalPrice)}`
              : 'Enter quantity to continue'}
      </Button>
    </div>
  );
}

