package com.studentmeal.controller;

import com.studentmeal.dto.MealPackageDTO;
import com.studentmeal.service.MealPackageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/packages")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin — Meal packages", description = "List all packages (including inactive)")
public class AdminMealPackageController {

    private final MealPackageService mealPackageService;

    @GetMapping
    @Operation(summary = "List all meal packages for admin")
    public ResponseEntity<List<MealPackageDTO>> listAllPackages() {
        return ResponseEntity.ok(mealPackageService.getAllPackages());
    }
}
