'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  EyeIcon, 
  ClipboardDocumentListIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { Order } from '~/lib/b2b/client';

interface B2BOrdersListProps {
  orders: Order[];
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-green-100 text-green-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-gray-100 text-gray-800',
};

const statusIcons = {
  pending: ClockIcon,
  processing: ClipboardDocumentListIcon,
  shipped: TruckIcon,
  delivered: CheckIcon,
  cancelled: XMarkIcon,
  completed: CheckIcon,
};

export function B2BOrdersList({ orders }: B2BOrdersListProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
        <p className="mt-1 text-sm text-gray-500">
          Your B2B orders will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Order #{order.id}
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    statusColors[order.status as keyof typeof statusColors] || statusColors.pending
                  }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Customer ID:</span> {order.customerId}
                </div>
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                </div>
                <div>
                  <span className="font-medium">Total:</span>{' '}
                  ${order.total.toFixed(2)} {order.currencyCode}
                </div>
              </div>

              {order.items.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Items:</h4>
                  <div className="space-y-2">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 text-sm">
                        <span className="text-gray-600">{item.quantity}x</span>
                        <span className="font-medium">{item.productName}</span>
                        <span className="text-gray-500">({item.productSku})</span>
                        <span className="text-gray-600">
                          ${item.salePrice.toFixed(2)} each
                        </span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{order.items.length - 3} more items
                      </div>
                    )}
                  </div>
                </div>
              )}

              {order.billingAddress && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Billing Address:</h4>
                  <p className="text-sm text-gray-600">
                    {order.billingAddress.firstName} {order.billingAddress.lastName}
                    {order.billingAddress.company && `, ${order.billingAddress.company}`}
                    <br />
                    {order.billingAddress.address1}
                    {order.billingAddress.address2 && <br />}
                    {order.billingAddress.address2}
                    <br />
                    {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zipCode}
                    <br />
                    {order.billingAddress.country}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => setSelectedOrder(order)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="View details"
              >
                <EyeIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Order #{selectedOrder.id} Details
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      statusColors[selectedOrder.status as keyof typeof statusColors] || statusColors.pending
                    }`}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Customer ID:</span> {selectedOrder.customerId}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>{' '}
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Total:</span>{' '}
                    ${selectedOrder.total.toFixed(2)} {selectedOrder.currencyCode}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Items:</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-sm text-gray-600">SKU: {item.productSku}</div>
                          {item.options && item.options.length > 0 && (
                            <div className="text-sm text-gray-500">
                              Options: {item.options.map(opt => `${opt.name}: ${opt.value}`).join(', ')}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{item.quantity}x</div>
                          <div className="text-sm text-gray-600">
                            ${item.salePrice.toFixed(2)} each
                          </div>
                          <div className="text-sm font-medium">
                            ${item.extendedSalePrice.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.billingAddress && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Billing Address:</h3>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-600">
                        {selectedOrder.billingAddress.firstName} {selectedOrder.billingAddress.lastName}
                        {selectedOrder.billingAddress.company && <br />}
                        {selectedOrder.billingAddress.company}
                        <br />
                        {selectedOrder.billingAddress.address1}
                        {selectedOrder.billingAddress.address2 && <br />}
                        {selectedOrder.billingAddress.address2}
                        <br />
                        {selectedOrder.billingAddress.city}, {selectedOrder.billingAddress.state} {selectedOrder.billingAddress.zipCode}
                        <br />
                        {selectedOrder.billingAddress.country}
                        {selectedOrder.billingAddress.phone && (
                          <>
                            <br />
                            Phone: {selectedOrder.billingAddress.phone}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {selectedOrder.shippingAddress && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Shipping Address:</h3>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-600">
                        {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                        {selectedOrder.shippingAddress.company && <br />}
                        {selectedOrder.shippingAddress.company}
                        <br />
                        {selectedOrder.shippingAddress.address1}
                        {selectedOrder.shippingAddress.address2 && <br />}
                        {selectedOrder.shippingAddress.address2}
                        <br />
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                        <br />
                        {selectedOrder.shippingAddress.country}
                        {selectedOrder.shippingAddress.phone && (
                          <>
                            <br />
                            Phone: {selectedOrder.shippingAddress.phone}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 