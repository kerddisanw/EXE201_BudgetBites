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
        private final com.studentmeal.repository.DiscountCodeRepository discountCodeRepository;
        private final com.studentmeal.repository.SubscriptionDiscountRepository subscriptionDiscountRepository;

        @Transactional
        public SubscriptionDTO createSubscription(SubscriptionRequest request) {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                Customer customer = customerRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

                MealPackage mealPackage = mealPackageRepository.findById(request.getPackageId())
                                .orElseThrow(() -> new ResourceNotFoundException("Meal package not found"));

                java.math.BigDecimal totalAmount = mealPackage.getPrice();
                com.studentmeal.entity.DiscountCode appliedDiscount = null;

                if (request.getDiscountCode() != null && !request.getDiscountCode().isEmpty()) {
                        appliedDiscount = discountCodeRepository.findByCode(request.getDiscountCode())
                                        .orElseThrow(() -> new ResourceNotFoundException("Discount code not found"));

                        // Basic validation
                        if (appliedDiscount.getStatus().equals("ACTIVE") && appliedDiscount.getMaxUsage() > 0) {
                                java.math.BigDecimal discountAmount = totalAmount
                                                .multiply(appliedDiscount.getDiscountPercent())
                                                .divide(new java.math.BigDecimal(100), 2,
                                                                java.math.RoundingMode.HALF_UP);
                                totalAmount = totalAmount.subtract(discountAmount);
                                appliedDiscount.setMaxUsage(appliedDiscount.getMaxUsage() - 1);
                                discountCodeRepository.save(appliedDiscount);
                        }
                }

                Subscription subscription = new Subscription();
                subscription.setCustomer(customer);
                subscription.setMealPackage(mealPackage);
                subscription.setStartDate(request.getStartDate());
                subscription.setEndDate(request.getStartDate().plusDays(mealPackage.getDurationDays()));
                subscription.setStatus(Subscription.SubscriptionStatus.PENDING);
                subscription.setTotalAmount(totalAmount);
                subscription.setNotes(request.getNotes());

                Subscription saved = subscriptionRepository.save(subscription);

                if (appliedDiscount != null) {
                        com.studentmeal.entity.SubscriptionDiscount sd = new com.studentmeal.entity.SubscriptionDiscount();
                        sd.setSubscription(saved);
                        sd.setDiscountCode(appliedDiscount);
                        sd.setDiscountAmount(mealPackage.getPrice().subtract(totalAmount));
                        subscriptionDiscountRepository.save(sd);
                }

                return convertToDTO(saved);
        }

        @Transactional(readOnly = true)
        public List<SubscriptionDTO> getMySubscriptions() {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                Customer customer = customerRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

                return subscriptionRepository.findByCustomerId(customer.getId()).stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<SubscriptionDTO> getAllSubscriptions() {
                return subscriptionRepository.findAll().stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
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
