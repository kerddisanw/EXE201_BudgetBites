package com.studentmeal.service;

import com.studentmeal.dto.SubscriptionDTO;
import com.studentmeal.dto.SubscriptionRequest;
import com.studentmeal.entity.Customer;
import com.studentmeal.entity.MealPackage;
import com.studentmeal.entity.Subscription;
import com.studentmeal.exception.ResourceNotFoundException;
import com.studentmeal.repository.CustomerRepository;
import com.studentmeal.repository.MealPackageRepository;
import com.studentmeal.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final CustomerRepository customerRepository;
    private final MealPackageRepository mealPackageRepository;

    @Transactional
    public SubscriptionDTO createSubscription(SubscriptionRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        MealPackage mealPackage = mealPackageRepository.findById(request.getPackageId())
                .orElseThrow(() -> new ResourceNotFoundException("Meal package not found"));

        Subscription subscription = new Subscription();
        subscription.setCustomer(customer);
        subscription.setMealPackage(mealPackage);
        subscription.setStartDate(request.getStartDate());
        subscription.setEndDate(request.getStartDate().plusDays(mealPackage.getDurationDays()));
        subscription.setStatus(Subscription.SubscriptionStatus.PENDING);
        subscription.setTotalAmount(mealPackage.getPrice());
        subscription.setNotes(request.getNotes());

        Subscription saved = subscriptionRepository.save(subscription);
        return convertToDTO(saved);
    }

    public List<SubscriptionDTO> getMySubscriptions() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        return subscriptionRepository.findByCustomerId(customer.getId()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SubscriptionDTO> getAllSubscriptions() {
        return subscriptionRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public SubscriptionDTO getSubscriptionById(Long id) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
        return convertToDTO(subscription);
    }

    @Transactional
    public SubscriptionDTO updateSubscriptionStatus(Long id, Subscription.SubscriptionStatus status) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));

        subscription.setStatus(status);
        Subscription updated = subscriptionRepository.save(subscription);
        return convertToDTO(updated);
    }

    private SubscriptionDTO convertToDTO(Subscription subscription) {
        return new SubscriptionDTO(
                subscription.getId(),
                subscription.getCustomer().getId(),
                subscription.getCustomer().getFullName(),
                subscription.getMealPackage().getId(),
                subscription.getMealPackage().getName(),
                subscription.getStartDate(),
                subscription.getEndDate(),
                subscription.getStatus().name(),
                subscription.getTotalAmount(),
                subscription.getNotes(),
                subscription.getCreatedAt());
    }
}
