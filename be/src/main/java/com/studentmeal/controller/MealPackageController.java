package com.studentmeal.controller;

import com.studentmeal.dto.MealPackageDTO;
import com.studentmeal.entity.MealPackage;
import com.studentmeal.service.MealPackageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/packages")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Meal Packages", description = "Meal package management endpoints")
public class MealPackageController {

    private final MealPackageService mealPackageService;

    @GetMapping
    @Operation(summary = "Get all active meal packages")
    public ResponseEntity<List<MealPackageDTO>> getAllPackages() {
        return ResponseEntity.ok(mealPackageService.getActivePackages());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get meal package by ID")
    public ResponseEntity<MealPackageDTO> getPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(mealPackageService.getPackageById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create new meal package (Admin only)")
    public ResponseEntity<MealPackageDTO> createPackage(@RequestBody MealPackage mealPackage) {
        return ResponseEntity.ok(mealPackageService.createPackage(mealPackage));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update meal package (Admin only)")
    public ResponseEntity<MealPackageDTO> updatePackage(@PathVariable Long id, @RequestBody MealPackage mealPackage) {
        return ResponseEntity.ok(mealPackageService.updatePackage(id, mealPackage));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete meal package (Admin only)")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        mealPackageService.deletePackage(id);
        return ResponseEntity.noContent().build();
    }
}
