import { orderService } from '../services/api';

/**
 * Loads meal orders for all non-cancelled subscriptions, deduped by order id.
 */
export async function fetchAllMyOrdersFromSubscriptions(subList) {
    const orderSourceSubs = subList.filter((s) => {
        const status = (s.status || '').toUpperCase();
        return status !== 'CANCELLED';
    });
    const orderPromises = orderSourceSubs.map((s) =>
        orderService.getOrdersBySubscription(s.id).catch(() => ({ data: [] }))
    );
    const orderResults = await Promise.all(orderPromises);
    const dedup = new Map();
    orderResults.forEach((r) => {
        const rows = Array.isArray(r.data) ? r.data : [];
        rows.forEach((order) => {
            if (order?.id != null) dedup.set(order.id, order);
        });
    });
    const allOrders = Array.from(dedup.values());
    allOrders.sort((a, b) => {
        const da = a.orderDate ? new Date(a.orderDate) : new Date(0);
        const db = b.orderDate ? new Date(b.orderDate) : new Date(0);
        return db - da;
    });
    return allOrders;
}
