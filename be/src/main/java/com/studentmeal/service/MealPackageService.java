package com.studentmeal.service;

import com.studentmeal.dto.MealPackageDTO;
import com.studentmeal.dto.MealPackageRequest;
import com.studentmeal.entity.MealPackage;
import com.studentmeal.entity.MealPartner;
import com.studentmeal.exception.ResourceNotFoundException;
import com.studentmeal.repository.MealPackageRepository;
import com.studentmeal.repository.MealPartnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MealPackageService {

    private final MealPackageRepository mealPackageRepository;
    private final MealPartnerRepository mealPartnerRepository;

    @Transactional(readOnly = true)
    public List<MealPackageDTO> getAllPackages() {
        return mealPackageRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MealPackageDTO> getActivePackages() {
        return mealPackageRepository.findByActiveTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MealPackageDTO getPackageById(Long id) {
        MealPackage mealPackage = mealPackageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meal package not found with id: " + id));
        return convertToDTO(mealPackage);
    }

    @Transactional
    public MealPackageDTO createPackage(MealPackageRequest request) {
        MealPackage mealPackage = new MealPackage();
        mealPackage.setName(request.getName());
        mealPackage.setDescription(request.getDescription());
        mealPackage.setPrice(request.getPrice());
        mealPackage.setDurationDays(request.getDurationDays());
        mealPackage.setMealsPerDay(request.getMealsPerDay());
        mealPackage.setPackageType(request.getPackageType());
        mealPackage.setImageUrl(request.getImageUrl());
        mealPackage.setActive(request.getActive() != null ? request.getActive() : true);

        // Gán partner nếu có partnerId
        if (request.getPartnerId() != null) {
            MealPartner partner = mealPartnerRepository.findById(request.getPartnerId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Partner not found with id: " + request.getPartnerId()));
            mealPackage.setPartner(partner);
        }

        return convertToDTO(mealPackageRepository.save(mealPackage));
    }

    @Transactional
    public MealPackageDTO updatePackage(Long id, MealPackageRequest request) {
        MealPackage existing = mealPackageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meal package not found with id: " + id));

        existing.setName(request.getName());
        existing.setDescription(request.getDescription());
        existing.setPrice(request.getPrice());
        existing.setDurationDays(request.getDurationDays());
        existing.setMealsPerDay(request.getMealsPerDay());
        existing.setPackageType(request.getPackageType());
        existing.setImageUrl(request.getImageUrl());
        if (request.getActive() != null) {
            existing.setActive(request.getActive());
        }

        // Cập nhật partner nếu có partnerId mới
        if (request.getPartnerId() != null) {
            MealPartner partner = mealPartnerRepository.findById(request.getPartnerId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Partner not found with id: " + request.getPartnerId()));
            existing.setPartner(partner);
        }

        return convertToDTO(mealPackageRepository.save(existing));
    }

    @Transactional
    public void deletePackage(Long id) {
        if (!mealPackageRepository.existsById(id)) {
            throw new ResourceNotFoundException("Meal package not found with id: " + id);
        }
        mealPackageRepository.deleteById(id);
    }

    private MealPackageDTO convertToDTO(MealPackage mealPackage) {
        return new MealPackageDTO(
                mealPackage.getId(),
                mealPackage.getPartner() != null ? mealPackage.getPartner().getId() : null,
                mealPackage.getName(),
                mealPackage.getDescription(),
                mealPackage.getPrice(),
                mealPackage.getDurationDays(),
                mealPackage.getMealsPerDay(),
                mealPackage.getPackageType().name(),
                mealPackage.getPartner() != null ? mealPackage.getPartner().getName() : null,
                mealPackage.getImageUrl(),
                mealPackage.getActive(),
                mealPackage.getCreatedAt());
    }
}
