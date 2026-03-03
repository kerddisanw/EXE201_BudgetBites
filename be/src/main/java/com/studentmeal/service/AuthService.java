package com.studentmeal.service;

import com.studentmeal.dto.AuthResponse;
import com.studentmeal.dto.LoginRequest;
import com.studentmeal.dto.RegisterRequest;
import com.studentmeal.entity.Customer;
import com.studentmeal.repository.CustomerRepository;
import com.studentmeal.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final CustomerRepository customerRepository;
    private final com.studentmeal.repository.AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public void register(RegisterRequest request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (customerRepository.existsByStudentId(request.getStudentId())) {
            throw new RuntimeException("Student ID already exists");
        }

        Customer customer = new Customer();
        customer.setEmail(request.getEmail());
        customer.setPassword(passwordEncoder.encode(request.getPassword()));
        customer.setFullName(request.getFullName());
        customer.setStudentId(request.getStudentId());
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setAddress(request.getAddress());
        customer.setUniversity(request.getUniversity());
        customer.setRole(Customer.Role.CUSTOMER);
        customer.setActive(true);

        customerRepository.save(customer);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        String token = tokenProvider.generateToken(authentication);

        // Check customer first
        var customerOptional = customerRepository.findByEmail(request.getEmail());
        if (customerOptional.isPresent()) {
            Customer customer = customerOptional.get();
            return new AuthResponse(
                    token,
                    customer.getId(),
                    customer.getEmail(),
                    customer.getFullName(),
                    customer.getRole().name());
        }

        // Check admin second
        var adminOptional = adminRepository.findByEmail(request.getEmail());
        if (adminOptional.isPresent()) {
            com.studentmeal.entity.Admin admin = adminOptional.get();
            return new AuthResponse(
                    token,
                    admin.getId(),
                    admin.getEmail(),
                    admin.getFullName(),
                    "ADMIN");
        }

        throw new RuntimeException("User not found");
    }
}
