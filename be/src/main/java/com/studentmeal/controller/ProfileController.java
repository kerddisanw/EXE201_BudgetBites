package com.studentmeal.controller;

import com.studentmeal.entity.Customer;
import com.studentmeal.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Profile", description = "User profile management endpoints")
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    @Operation(summary = "Get current user profile")
    public ResponseEntity<Customer> getProfile() {
        return ResponseEntity.ok(profileService.getProfile());
    }

    @PutMapping
    @Operation(summary = "Update current user profile")
    public ResponseEntity<Customer> updateProfile(@RequestBody Customer customer) {
        return ResponseEntity.ok(profileService.updateProfile(customer));
    }
}
