package com.studentmeal.controller;

import com.studentmeal.dto.MealOrderDTO;
import com.studentmeal.dto.MealOrderRequest;
import com.studentmeal.entity.MealOrder;
import com.studentmeal.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping("/subscriptions/{subscriptionId}")
    public ResponseEntity<List<MealOrderDTO>> getOrdersBySubscription(@PathVariable Long subscriptionId) {
        return ResponseEntity.ok(orderService.getOrdersBySubscription(subscriptionId));
    }

    @PostMapping
    public ResponseEntity<MealOrderDTO> createOrder(@RequestBody MealOrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<MealOrderDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam MealOrder.OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }
}
