package com.studentmeal.service;

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
    public Customer updateProfile(Customer profileDetails) {
        Customer customer = getProfile();
        customer.setFullName(profileDetails.getFullName());
        customer.setPhoneNumber(profileDetails.getPhoneNumber());
        customer.setAddress(profileDetails.getAddress());
        customer.setUniversity(profileDetails.getUniversity());
        customer.setStudentId(profileDetails.getStudentId());

        if (profileDetails.getPassword() != null && !profileDetails.getPassword().isEmpty()) {
            customer.setPassword(passwordEncoder.encode(profileDetails.getPassword()));
        }

        return customerRepository.save(customer);
    }
}
