package com.studentmeal.service;

import com.studentmeal.dto.FeedbackDTO;
import com.studentmeal.dto.FeedbackRequest;
import com.studentmeal.entity.Customer;
import com.studentmeal.entity.Feedback;
import com.studentmeal.entity.MealPartner;
import com.studentmeal.exception.ResourceNotFoundException;
import com.studentmeal.repository.CustomerRepository;
import com.studentmeal.repository.FeedbackRepository;
import com.studentmeal.repository.MealPartnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final CustomerRepository customerRepository;
    private final MealPartnerRepository mealPartnerRepository;

    @Transactional(readOnly = true)
    public List<FeedbackDTO> getFeedbacksByPartner(Long partnerId) {
        return feedbackRepository.findByPartnerId(partnerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public FeedbackDTO createFeedback(FeedbackRequest request) {
        // Lấy customer từ JWT token - không cần customerId trong request
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        MealPartner partner = mealPartnerRepository.findById(request.getPartnerId())
                .orElseThrow(() -> new ResourceNotFoundException("Partner not found"));

        Feedback feedback = new Feedback();
        feedback.setCustomer(customer);
        feedback.setPartner(partner);
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());

        return convertToDTO(feedbackRepository.save(feedback));
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
