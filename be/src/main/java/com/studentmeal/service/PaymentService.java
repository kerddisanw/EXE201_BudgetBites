package com.studentmeal.service;

import com.studentmeal.entity.Payment;
import com.studentmeal.entity.Subscription;
import com.studentmeal.exception.ResourceNotFoundException;
import com.studentmeal.repository.PaymentRepository;
import com.studentmeal.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final SubscriptionRepository subscriptionRepository;

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

    public List<Payment> getPaymentsBySubscription(Long subscriptionId) {
        return paymentRepository.findBySubscriptionId(subscriptionId);
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }
}
