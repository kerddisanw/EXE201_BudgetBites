package com.studentmeal.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.studentmeal.dto.AuthResponse;
import com.studentmeal.entity.Customer;
import com.studentmeal.repository.CustomerRepository;
import com.studentmeal.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    private final CustomerRepository customerRepository;
    private final JwtTokenProvider tokenProvider;

    @Value("${google.client-id}")
    private String googleClientId;

    @Transactional
    public AuthResponse loginWithGoogle(String idToken) {
        // 1. Verify Google ID Token
        GoogleIdToken.Payload payload = verifyGoogleToken(idToken);

        String email = payload.getEmail();
        String fullName = (String) payload.get("name");

        // 2. Tìm hoặc tạo mới Customer
        Customer customer = customerRepository.findByEmail(email)
                .orElseGet(() -> createNewGoogleCustomer(email, fullName));

        // 3. Tạo JWT token hệ thống
        String jwt = tokenProvider.generateTokenForEmail(email);

        return new AuthResponse(
                jwt,
                customer.getId(),
                customer.getEmail(),
                customer.getFullName(),
                customer.getRole().name());
    }

    private GoogleIdToken.Payload verifyGoogleToken(String idToken) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken googleIdToken = verifier.verify(idToken);
            if (googleIdToken == null) {
                throw new RuntimeException("Invalid Google ID Token");
            }

            return googleIdToken.getPayload();

        } catch (Exception e) {
            throw new RuntimeException("Failed to verify Google token: " + e.getMessage());
        }
    }

    private Customer createNewGoogleCustomer(String email, String fullName) {
        Customer customer = new Customer();
        customer.setEmail(email);
        customer.setFullName(fullName != null ? fullName : email);
        // Đặt password ngẫu nhiên vì login bằng Google (không cần password)
        customer.setPassword(UUID.randomUUID().toString());
        // studentId tự tạo bằng phần đầu email
        customer.setStudentId("GOOGLE_" + email.split("@")[0].toUpperCase());
        customer.setRole(Customer.Role.CUSTOMER);
        customer.setActive(true);
        return customerRepository.save(customer);
    }
}
