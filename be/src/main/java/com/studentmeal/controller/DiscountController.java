package com.studentmeal.controller;

import com.studentmeal.dto.DiscountDTO;
import com.studentmeal.dto.DiscountRequest;
import com.studentmeal.service.DiscountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discounts")
@RequiredArgsConstructor
public class DiscountController {

    private final DiscountService discountService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DiscountDTO>> getAllDiscounts() {
        return ResponseEntity.ok(discountService.getAllDiscounts());
    }

    @GetMapping("/preview/{code}")
    public ResponseEntity<DiscountDTO> previewDiscount(@PathVariable String code) {
        return ResponseEntity.ok(discountService.getValidDiscountForPreview(code));
    }

    @GetMapping("/{code}")
    public ResponseEntity<Boolean> validateDiscount(@PathVariable String code) {
        return ResponseEntity.ok(discountService.validateDiscount(code));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DiscountDTO> createDiscount(@RequestBody DiscountRequest request) {
        return ResponseEntity.ok(discountService.createDiscount(request));
    }
}
