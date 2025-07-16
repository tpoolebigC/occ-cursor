import { auth } from '~/auth';
import { B2BQuickOrderForm } from '~/components/b2b/b2b-quick-order-form';

export default async function B2BQuickOrderPage() {
  const session = await auth();

  if (!session?.b2bToken) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quick Order</h1>
        <p className="mt-2 text-gray-600">
          Search for products and add them to your cart quickly. Perfect for bulk orders and repeat purchases.
        </p>
      </div>

      {/* Quick Order Form */}
      <B2BQuickOrderForm />
    </div>
  );
} 