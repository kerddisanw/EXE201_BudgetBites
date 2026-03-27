package com.studentmeal.service;

import com.studentmeal.dto.FeedbackDTO;
import com.studentmeal.dto.FeedbackEligibilityDTO;
import com.studentmeal.dto.FeedbackRequest;
import com.studentmeal.entity.Customer;
import com.studentmeal.entity.Feedback;
import com.studentmeal.entity.MealOrder;
import com.studentmeal.entity.MealPartner;
import com.studentmeal.exception.ResourceNotFoundException;
import com.studentmeal.repository.CustomerRepository;
import com.studentmeal.repository.FeedbackRepository;
import com.studentmeal.repository.MealOrderRepository;
import com.studentmeal.repository.MealPartnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final CustomerRepository customerRepository;
    private final MealPartnerRepository mealPartnerRepository;
    private final MealOrderRepository mealOrderRepository;

    @Transactional(readOnly = true)
    public List<FeedbackDTO> getFeedbacksByPartner(Long partnerId) {
        return feedbackRepository.findByPartnerId(partnerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public FeedbackDTO createFeedback(FeedbackRequest request) {
        Customer customer = getCurrentCustomer();

        MealPartner partner = mealPartnerRepository.findById(request.getPartnerId())
                .orElseThrow(() -> new ResourceNotFoundException("Partner not found"));
        if (!hasCompletedOrderWithPartner(customer.getId(), partner.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Bạn chỉ có thể đánh giá sau khi bữa ăn hoàn thành (Hoàn thành) từ quán này");
        }

        Feedback feedback = new Feedback();
        feedback.setCustomer(customer);
        feedback.setPartner(partner);
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());

        return convertToDTO(feedbackRepository.save(feedback));
    }

    @Transactional(readOnly = true)
    public FeedbackEligibilityDTO getMyEligibilityForPartner(Long partnerId) {
        Customer customer = getCurrentCustomer();
        mealPartnerRepository.findById(partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Partner not found"));

        boolean eligible = hasCompletedOrderWithPartner(customer.getId(), partnerId);
        String message = eligible
                ? "Bạn có thể đánh giá quán này."
                : "Bạn cần có ít nhất 1 bữa ăn hoàn thành (Hoàn thành) từ quán này để đánh giá.";
        return new FeedbackEligibilityDTO(eligible, message);
    }

    private Customer getCurrentCustomer() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    }

    private boolean hasCompletedOrderWithPartner(Long customerId, Long partnerId) {
        return mealOrderRepository.existsCompletedOrderByCustomerAndPartner(
                customerId,
                partnerId,
                MealOrder.OrderStatus.DELIVERED
        );
    }

    private FeedbackDTO convertToDTO(Feedback feedback) {
        FeedbackDTO dto = new FeedbackDTO();
        dto.setId(feedback.getId());
        dto.setCustomerId(feedback.getCustomer().getId());
        dto.setCustomerName(feedback.getCustomer().getFullName());
        dto.setPartnerId(feedback.getPartner().getId());
        dto.setPartnerName(feedback.getPartner().getName());
        dto.setRating(feedback.getRating());
        dto.setComment(feedback.getComment());
        dto.setCreatedAt(feedback.getCreatedAt());
        return dto;
    }
}
