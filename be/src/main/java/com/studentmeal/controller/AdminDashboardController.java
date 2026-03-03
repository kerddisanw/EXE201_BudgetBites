package com.studentmeal.controller;

import com.studentmeal.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin dashboard and statistics endpoints")
public class AdminDashboardController {

    private final AdminService adminService;

    @GetMapping("/stats")
    @Operation(summary = "Get high-level dashboard statistics")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/customers")
    @Operation(summary = "Get all customers")
    public ResponseEntity<java.util.List<com.studentmeal.entity.Customer>> getAllCustomers() {
        return ResponseEntity.ok(adminService.getAllCustomers());
    }

    @PatchMapping("/customers/{id}/toggle-active")
    @Operation(summary = "Toggle customer active status")
    public ResponseEntity<com.studentmeal.entity.Customer> toggleCustomerActive(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleCustomerActive(id));
    }
}
