export const ORDERS_UPDATED_EVENT = 'admin-orders-updated';

export function isOrderDelivered(status: string) {
  return status === 'delivered' || status === 'completed';
}

export function isOrderPending(status: string) {
  return !isOrderDelivered(status);
}

export function notifyOrdersUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ORDERS_UPDATED_EVENT));
  }
}
