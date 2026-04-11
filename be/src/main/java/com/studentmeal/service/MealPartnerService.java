package com.studentmeal.service;

import com.studentmeal.dto.MealPartnerRequest;
import com.studentmeal.dto.MealPartnerResponse;
import com.studentmeal.entity.MealPartner;
import com.studentmeal.exception.ResourceNotFoundException;
import com.studentmeal.repository.MealPartnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MealPartnerService {

    private final MealPartnerRepository mealPartnerRepository;

    public List<MealPartnerResponse> getAllPartners() {
        return mealPartnerRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Public API — chỉ trả về partner đang active và đã được duyệt (status=true)
    @Transactional(readOnly = true)
    public List<MealPartnerResponse> getActivePartners() {
        return mealPartnerRepository.findByActiveTrueAndStatusTrue()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public MealPartnerResponse getPartnerById(Long id) {
        MealPartner partner = mealPartnerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meal Partner not found"));
        return toResponse(partner);
    }

    @Transactional
    public MealPartnerResponse createPartner(MealPartnerRequest request) {
        MealPartner partner = new MealPartner();
        partner.setName(request.getName());
        partner.setDescription(request.getDescription());
        partner.setAddress(request.getAddress());
        partner.setPhoneNumber(request.getPhoneNumber());
        partner.setEmail(request.getEmail());
        partner.setImageUrl(request.getImageUrl());
        partner.setDiscountRate(request.getDiscountRate());

        // active và status mặc định false từ entity
        return toResponse(mealPartnerRepository.save(partner));
    }

    @Transactional
    public MealPartnerResponse updatePartner(Long id, MealPartnerRequest request) {
        MealPartner partner = mealPartnerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meal Partner not found"));
        partner.setName(request.getName());
        partner.setDescription(request.getDescription());
        partner.setAddress(request.getAddress());
        partner.setPhoneNumber(request.getPhoneNumber());
        partner.setEmail(request.getEmail());
        partner.setImageUrl(request.getImageUrl());
        partner.setDiscountRate(request.getDiscountRate());

        return toResponse(mealPartnerRepository.save(partner));
    }

    @Transactional
    public MealPartnerResponse setActive(Long id, Boolean active) {
        MealPartner partner = mealPartnerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meal Partner not found"));
        partner.setActive(active);
        return toResponse(mealPartnerRepository.save(partner));
    }

    @Transactional
    public MealPartnerResponse setStatus(Long id, Boolean status) {
        MealPartner partner = mealPartnerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meal Partner not found"));
        partner.setStatus(status);
        return toResponse(mealPartnerRepository.save(partner));
    }

    @Transactional
    public void deletePartner(Long id) {
        MealPartner partner = mealPartnerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meal Partner not found"));
        mealPartnerRepository.delete(partner);
    }

    private MealPartnerResponse toResponse(MealPartner partner) {
        MealPartnerResponse response = new MealPartnerResponse();
        response.setId(partner.getId());
        response.setName(partner.getName());
        response.setDescription(partner.getDescription());
        response.setAddress(partner.getAddress());
        response.setPhoneNumber(partner.getPhoneNumber());
        response.setEmail(partner.getEmail());
        response.setImageUrl(partner.getImageUrl());
        response.setActive(partner.getActive());

        response.setDiscountRate(partner.getDiscountRate());
        response.setStatus(partner.getStatus());
        response.setCreatedAt(partner.getCreatedAt());
        response.setUpdatedAt(partner.getUpdatedAt());
        return response;
    }
}
