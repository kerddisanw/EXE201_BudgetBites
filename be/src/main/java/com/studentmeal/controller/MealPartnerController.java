package com.studentmeal.controller;

import com.studentmeal.dto.MealPartnerRequest;
import com.studentmeal.dto.MealPartnerResponse;
import com.studentmeal.service.MealPartnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/partners")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class MealPartnerController {

    private final MealPartnerService mealPartnerService;

    @GetMapping
    public ResponseEntity<List<MealPartnerResponse>> getAllPartners() {
        return ResponseEntity.ok(mealPartnerService.getAllPartners());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MealPartnerResponse> getPartnerById(@PathVariable Long id) {
        return ResponseEntity.ok(mealPartnerService.getPartnerById(id));
    }

    @PostMapping
    public ResponseEntity<MealPartnerResponse> createPartner(@RequestBody MealPartnerRequest request) {
        return ResponseEntity.ok(mealPartnerService.createPartner(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MealPartnerResponse> updatePartner(
            @PathVariable Long id,
            @RequestBody MealPartnerRequest request) {
        return ResponseEntity.ok(mealPartnerService.updatePartner(id, request));
    }

    /**
     * Set trạng thái active của partner (true = đang hoạt động, false = ngưng hoạt
     * động)
     * PUT /api/admin/partners/{id}/active?value=true
     */
    @PutMapping("/{id}/active")
    public ResponseEntity<MealPartnerResponse> setActive(
            @PathVariable Long id,
            @RequestParam Boolean value) {
        return ResponseEntity.ok(mealPartnerService.setActive(id, value));
    }

    /**
     * Set trạng thái status của partner (true = approved, false = pending/rejected)
     * PUT /api/admin/partners/{id}/status?value=true
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<MealPartnerResponse> setStatus(
            @PathVariable Long id,
            @RequestParam Boolean value) {
        return ResponseEntity.ok(mealPartnerService.setStatus(id, value));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePartner(@PathVariable Long id) {
        mealPartnerService.deletePartner(id);
        return ResponseEntity.noContent().build();
    }
}
