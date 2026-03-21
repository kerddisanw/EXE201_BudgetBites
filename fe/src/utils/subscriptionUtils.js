/** Must match {@code BudgetBitesConstants.SUBSCRIPTION_NOTES_CART_CHECKOUT_NO_PACKAGE} on the backend. */
export const SUBSCRIPTION_NOTES_CART_CHECKOUT_NO_PACKAGE =
    'Thanh toán theo giỏ hàng (không chọn gói cố định)';

/** Pay-only shell subscription when user checks out the cart without choosing a meal package. */
export function isCartCheckoutNoPackageSubscription(sub) {
    return (sub?.notes || '') === SUBSCRIPTION_NOTES_CART_CHECKOUT_NO_PACKAGE;
}
