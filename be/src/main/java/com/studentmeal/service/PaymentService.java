package com.studentmeal.service;

import com.studentmeal.BudgetBitesConstants;
import com.studentmeal.dto.CartResponse;
import com.studentmeal.entity.Customer;
import com.studentmeal.entity.MealPackage;
import com.studentmeal.entity.Payment;
import com.studentmeal.entity.Subscription;
import com.studentmeal.exception.ResourceNotFoundException;
import com.studentmeal.entity.DiscountCode;
import com.studentmeal.entity.SubscriptionDiscount;
import com.studentmeal.repository.CustomerRepository;
import com.studentmeal.repository.DiscountCodeRepository;
import com.studentmeal.repository.MealPackageRepository;
import com.studentmeal.repository.PaymentRepository;
import com.studentmeal.repository.SubscriptionDiscountRepository;
import com.studentmeal.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final CustomerRepository customerRepository;
    private final MealPackageRepository mealPackageRepository;
    private final CartService cartService;
    private final PayOSService payOSService;
    private final DiscountService discountService;
    private final DiscountCodeRepository discountCodeRepository;
    private final SubscriptionDiscountRepository subscriptionDiscountRepository;

    public record CartPayOSCheckoutResponse(String checkoutUrl, String orderCode, Long subscriptionId) {}

    @Transactional
    public Payment processPayment(Long subscriptionId, String method, String transactionCode) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));

        Payment payment = new Payment();
        payment.setSubscription(subscription);
        payment.setAmount(subscription.getTotalAmount());
        payment.setPaymentMethod(Payment.PaymentMethod.valueOf(method));
        payment.setTransactionId(transactionCode);
        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        payment.setCompletedAt(LocalDateTime.now());

        // Update subscription status to ACTIVE once paid
        subscription.setStatus(Subscription.SubscriptionStatus.ACTIVE);
        subscriptionRepository.save(subscription);
        cartService.fulfillCartCheckoutSubscriptionAfterPayment(subscriptionId);

        return paymentRepository.save(payment);
    }

    @Transactional
    public PayOSService.PayOSCheckoutResponse createPayOSCheckout(Long subscriptionId) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));

        Payment payment = new Payment();
        payment.setSubscription(subscription);
        payment.setAmount(subscription.getTotalAmount());
        payment.setPaymentMethod(Payment.PaymentMethod.E_WALLET);
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment = paymentRepository.save(payment);

        PayOSService.PayOSCheckoutResponse checkout = payOSService.createCheckout(payment);
        payment.setTransactionId(checkout.orderCode());
        paymentRepository.save(payment);

        return checkout;
    }

    @Transactional
    public CartPayOSCheckoutResponse createCartPayOSCheckoutFromCart(String discountCodeParam) {
        CartResponse cart = cartService.getCart();
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Giỏ hàng trống");
        }

        if (cart.getTotalAmount() == null) {
            throw new RuntimeException("Không xác định được tổng tiền giỏ hàng");
        }

        BigDecimal cartTotal = cart.getTotalAmount();
        BigDecimal totalAmount = cartTotal;
        DiscountCode appliedDiscount = null;

        if (discountCodeParam != null && !discountCodeParam.isBlank()) {
            String dc = discountCodeParam.trim();
            if (!discountService.validateDiscount(dc)) {
                throw new ResourceNotFoundException("Mã giảm giá không hợp lệ hoặc đã hết hạn");
            }
            appliedDiscount = discountCodeRepository.findByCode(dc)
                    .orElseThrow(() -> new ResourceNotFoundException("Discount code not found"));
            BigDecimal discountAmount = totalAmount
                    .multiply(appliedDiscount.getDiscountPercent())
                    .divide(new BigDecimal(100), 2, RoundingMode.HALF_UP);
            totalAmount = totalAmount.subtract(discountAmount);
            if (totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("Số tiền sau giảm giá phải lớn hơn 0");
            }
            appliedDiscount.setMaxUsage(appliedDiscount.getMaxUsage() - 1);
            discountCodeRepository.save(appliedDiscount);
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        MealPackage mealPackage = mealPackageRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy gói bữa ăn nào để thanh toán giỏ hàng"));

        LocalDate today = LocalDate.now();

        Subscription subscription = new Subscription();
        subscription.setCustomer(customer);
        subscription.setMealPackage(mealPackage);
        subscription.setStartDate(today);
        subscription.setEndDate(today);
        subscription.setStatus(Subscription.SubscriptionStatus.PENDING);
        subscription.setTotalAmount(totalAmount);
        subscription.setNotes(BudgetBitesConstants.SUBSCRIPTION_NOTES_CART_CHECKOUT_NO_PACKAGE);

        Subscription savedSub = subscriptionRepository.save(subscription);

        if (appliedDiscount != null) {
            SubscriptionDiscount sd = new SubscriptionDiscount();
            sd.setSubscription(savedSub);
            sd.setDiscountCode(appliedDiscount);
            sd.setDiscountAmount(cartTotal.subtract(totalAmount));
            subscriptionDiscountRepository.save(sd);
        }

        Payment payment = new Payment();
        payment.setSubscription(savedSub);
        payment.setAmount(totalAmount);
        payment.setPaymentMethod(Payment.PaymentMethod.E_WALLET);
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment = paymentRepository.save(payment);

        PayOSService.PayOSCheckoutResponse checkout = payOSService.createCheckout(payment);
        payment.setTransactionId(checkout.orderCode());
        paymentRepository.save(payment);

        return new CartPayOSCheckoutResponse(checkout.checkoutUrl(), checkout.orderCode(), savedSub.getId());
    }

    @Transactional
    public void handlePayOSWebhook(JsonNode webhookPayload) {
        PayOSService.PayOSWebhookResult result = payOSService.verifyPaymentWebhook(webhookPayload);

        Optional<Payment> paymentOpt = paymentRepository.findByTransactionId(result.orderCode());
        if (paymentOpt.isEmpty()) {
            // Unknown payment, ignore (but respond 2XX so payOS doesn't retry forever)
            return;
        }

        Payment payment = paymentOpt.get();
        if (result.paymentSuccess()) {
            payment.setStatus(Payment.PaymentStatus.COMPLETED);
            payment.setCompletedAt(LocalDateTime.now());
            Subscription subscription = payment.getSubscription();
            if (subscription != null) {
                subscription.setStatus(Subscription.SubscriptionStatus.ACTIVE);
                subscriptionRepository.save(subscription);
                cartService.fulfillCartCheckoutSubscriptionAfterPayment(subscription.getId());
            }
        } else {
            payment.setStatus(Payment.PaymentStatus.FAILED);
        }

        paymentRepository.save(payment);
    }

    public List<Payment> getPaymentsBySubscription(Long subscriptionId) {
        return paymentRepository.findBySubscriptionId(subscriptionId);
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }
}
