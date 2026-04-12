package com.studentmeal.service;

import com.studentmeal.dto.CustomerProfileUpdateRequest;
import com.studentmeal.entity.Customer;
import com.studentmeal.exception.ResourceNotFoundException;
import com.studentmeal.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    public Customer getProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    }

    @Transactional
    public Customer updateProfile(CustomerProfileUpdateRequest req) {
        Customer customer = getProfile();

        if (req.getFullName() != null && !req.getFullName().isBlank()) {
            customer.setFullName(req.getFullName().trim());
        }
        if (req.getPhoneNumber() != null) {
            customer.setPhoneNumber(req.getPhoneNumber().isBlank() ? null : req.getPhoneNumber().trim());
        }
        if (req.getAddress() != null) {
            customer.setAddress(req.getAddress().isBlank() ? null : req.getAddress().trim());
        }
        if (req.getUniversity() != null) {
            customer.setUniversity(req.getUniversity().isBlank() ? null : req.getUniversity().trim());
        }
        if (req.getStudentId() != null && !req.getStudentId().isBlank()) {
            customer.setStudentId(req.getStudentId().trim());
        }
        if (req.getAvatarUrl() != null) {
            customer.setAvatarUrl(req.getAvatarUrl().isBlank() ? null : req.getAvatarUrl().trim());
        }
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            customer.setPassword(passwordEncoder.encode(req.getPassword()));
        }

        return customerRepository.save(customer);
    }
}
