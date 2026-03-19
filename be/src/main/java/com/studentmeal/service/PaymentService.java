package com.studentmeal.service;

import com.studentmeal.dto.CartResponse;
import com.studentmeal.entity.Customer;
import com.studentmeal.entity.MealPackage;
import com.studentmeal.entity.Payment;
import com.studentmeal.entity.Subscription;
import com.studentmeal.exception.ResourceNotFoundException;
import com.studentmeal.repository.CustomerRepository;
import com.studentmeal.repository.MealPackageRepository;
import com.studentmeal.repository.PaymentRepository;
import com.studentmeal.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.JsonNode;

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
    public CartPayOSCheckoutResponse createCartPayOSCheckoutFromCart() {
        CartResponse cart = cartService.getCart();
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Giỏ hàng trống");
        }

        if (cart.getTotalAmount() == null) {
            throw new RuntimeException("Không xác định được tổng tiền giỏ hàng");
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
        subscription.setTotalAmount(cart.getTotalAmount());
        subscription.setNotes("Thanh toán theo giỏ hàng (không chọn gói cố định)");

        Subscription savedSub = subscriptionRepository.save(subscription);

        Payment payment = new Payment();
        payment.setSubscription(savedSub);
        payment.setAmount(cart.getTotalAmount());
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
