package com.studentmeal.controller;

import com.studentmeal.dto.*;
import com.studentmeal.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Cart (Khay thức ăn)", description = "Quản lý giỏ hàng bữa ăn trước khi thanh toán")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Xem giỏ hàng hiện tại")
    public ResponseEntity<CartResponse> getCart() {
        return ResponseEntity.ok(cartService.getCart());
    }

    @PostMapping("/add")
    @Operation(summary = "Thêm bữa ăn vào giỏ hàng")
    public ResponseEntity<CartItemDTO> addToCart(@RequestBody CartAddRequest request) {
        return ResponseEntity.ok(cartService.addToCart(request));
    }

    @PostMapping("/add-batch")
    @Operation(summary = "Thêm nhiều bữa ăn vào giỏ hàng cùng lúc")
    public ResponseEntity<List<CartItemDTO>> addToCartBatch(@RequestBody CartBatchAddRequest request) {
        return ResponseEntity.ok(cartService.addMultipleToCart(request));
    }

    @DeleteMapping("/{itemId}")
    @Operation(summary = "Xóa 1 bữa ăn khỏi giỏ hàng")
    public ResponseEntity<Map<String, String>> removeFromCart(@PathVariable Long itemId) {
        cartService.removeFromCart(itemId);
        return ResponseEntity.ok(Map.of("message", "Đã xóa khỏi giỏ hàng"));
    }

    @DeleteMapping("/clear")
    @Operation(summary = "Xóa toàn bộ giỏ hàng")
    public ResponseEntity<Map<String, String>> clearCart() {
        cartService.clearCart();
        return ResponseEntity.ok(Map.of("message", "Đã xóa toàn bộ giỏ hàng"));
    }

    @PostMapping("/checkout")
    @Operation(summary = "Checkout — tạo các MealOrder từ giỏ hàng cho 1 Subscription đang ACTIVE")
    public ResponseEntity<List<MealOrderDTO>> checkout(@RequestParam Long subscriptionId) {
        return ResponseEntity.ok(cartService.checkout(subscriptionId));
    }
}
