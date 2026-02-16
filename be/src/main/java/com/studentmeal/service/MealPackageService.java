package com.studentmeal.service;

import com.studentmeal.dto.MealPackageDTO;
import com.studentmeal.entity.MealPackage;
import com.studentmeal.exception.ResourceNotFoundException;
import com.studentmeal.repository.MealPackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MealPackageService {

    private final MealPackageRepository mealPackageRepository;

    public List<MealPackageDTO> getAllPackages() {
        return mealPackageRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<MealPackageDTO> getActivePackages() {
        return mealPackageRepository.findByActiveTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public MealPackageDTO getPackageById(Long id) {
        MealPackage mealPackage = mealPackageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meal package not found with id: " + id));
        return convertToDTO(mealPackage);
    }

    @Transactional
    public MealPackageDTO createPackage(MealPackage mealPackage) {
        MealPackage saved = mealPackageRepository.save(mealPackage);
        return convertToDTO(saved);
    }

    @Transactional
    public MealPackageDTO updatePackage(Long id, MealPackage mealPackage) {
        MealPackage existing = mealPackageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meal package not found with id: " + id));

        existing.setName(mealPackage.getName());
        existing.setDescription(mealPackage.getDescription());
        existing.setPrice(mealPackage.getPrice());
        existing.setDurationDays(mealPackage.getDurationDays());
        existing.setMealsPerDay(mealPackage.getMealsPerDay());
        existing.setPackageType(mealPackage.getPackageType());
        existing.setImageUrl(mealPackage.getImageUrl());
        existing.setActive(mealPackage.getActive());

        MealPackage updated = mealPackageRepository.save(existing);
        return convertToDTO(updated);
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
