package com.studentmeal.service;

import com.studentmeal.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final CustomerRepository customerRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final MealPartnerRepository mealPartnerRepository;
    private final PaymentRepository paymentRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCustomers", customerRepository.count());
        stats.put("totalPartners", mealPartnerRepository.count());
        stats.put("totalSubscriptions", subscriptionRepository.count());

        BigDecimal totalRevenue = paymentRepository.findAll().stream()
                .map(p -> p.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalRevenue", totalRevenue);

        return stats;
    }

    public List<com.studentmeal.entity.Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public com.studentmeal.entity.Customer toggleCustomerActive(Long id) {
        com.studentmeal.entity.Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new com.studentmeal.exception.ResourceNotFoundException("Customer not found"));
        customer.setActive(!customer.getActive());
        return customerRepository.save(customer);
    }
}
