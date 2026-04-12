const KEY = 'bb_checkout_meta';

/**
 * Snapshot of what the user was paying for (set before PayOS redirect).
 * @typedef {{
 *   flow?: 'package' | 'cart_subscription' | 'cart',
 *   subscriptionId?: number | null,
 *   packageId?: number | null,
 *   packageName?: string | null,
 *   price?: number | string | null,
 *   imageUrl?: string | null,
 *   cartTotal?: number | string | null,
 *   itemCount?: number | null
 * }} CheckoutMeta
 */

/** @returns {CheckoutMeta | null} */
export function readCheckoutMeta() {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
        const o = JSON.parse(raw);
        return o && typeof o === 'object' ? o : null;
    } catch {
        return null;
    }
}

/** @param {CheckoutMeta} meta */
export function writeCheckoutMeta(meta) {
    localStorage.setItem(KEY, JSON.stringify(meta));
}

export function clearCheckoutMeta() {
    localStorage.removeItem(KEY);
}
