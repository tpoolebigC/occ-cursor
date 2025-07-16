import { useAddToQuote, useAddToShoppingList } from '../../../../b2b/use-product-details';
import { Field } from './schema';
import { Button } from '@/vibes/soul/primitives/button';

interface Props {
  productId: string;
  quantity: number;
  selectedOptions: Array<{ field: Field; value?: string | number }>;
}

export function ProductDetailB2BActions({ productId, quantity, selectedOptions }: Props) {
  const {
    isQuotesEnabled,
    isAddingToQuote,
    addProductsToQuote,
  } = useAddToQuote();
  const {
    isShoppingListEnabled,
    isAddingToShoppingList,
    addProductToShoppingList,
  } = useAddToShoppingList();

  return (
    <div className="flex gap-x-3 pt-3">
      {isQuotesEnabled && (
        <Button
          type="button"
          loading={isAddingToQuote}
          onClick={() =>
            addProductsToQuote({ productId, quantity, selectedOptions })
          }
        >
          Add to Quote
        </Button>
      )}
      {isShoppingListEnabled && (
        <Button
          type="button"
          loading={isAddingToShoppingList}
          onClick={() =>
            addProductToShoppingList({ productId, quantity, selectedOptions })
          }
        >
          Add to Shopping List
        </Button>
      )}
    </div>
  );
} 