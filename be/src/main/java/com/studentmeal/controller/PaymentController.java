package com.studentmeal.controller;

import com.studentmeal.entity.Payment;
import com.studentmeal.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Payments", description = "Payment management endpoints")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/process")
    @Operation(summary = "Process a payment for a subscription")
    public ResponseEntity<Payment> processPayment(
            @RequestParam Long subscriptionId,
            @RequestParam String method,
            @RequestParam String transactionCode) {
        return ResponseEntity.ok(paymentService.processPayment(subscriptionId, method, transactionCode));
    }

    @GetMapping("/subscription/{subscriptionId}")
    @Operation(summary = "Get payments for a specific subscription")
    public ResponseEntity<List<Payment>> getPaymentsBySubscription(@PathVariable Long subscriptionId) {
        return ResponseEntity.ok(paymentService.getPaymentsBySubscription(subscriptionId));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all payments (Admin only)")
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }
}
