package com.studentmeal;

/**
 * Cross-cutting literals kept in one place for backend services and the UI filter.
 */
public final class BudgetBitesConstants {

    private BudgetBitesConstants() {}

    /** Subscription created only to carry PayOS payment when user pays the cart without choosing a package. */
    public static final String SUBSCRIPTION_NOTES_CART_CHECKOUT_NO_PACKAGE =
            "Thanh toán theo giỏ hàng (không chọn gói cố định)";
}
