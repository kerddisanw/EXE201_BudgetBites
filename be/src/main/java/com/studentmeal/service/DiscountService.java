package com.studentmeal.service;

import com.studentmeal.dto.DiscountDTO;
import com.studentmeal.dto.DiscountRequest;
import com.studentmeal.entity.DiscountCode;
import com.studentmeal.exception.ResourceNotFoundException;
import com.studentmeal.repository.DiscountCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiscountService {

    private final DiscountCodeRepository discountCodeRepository;

    public List<DiscountDTO> getAllDiscounts() {
        return discountCodeRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public DiscountDTO getDiscountByCode(String code) {
        DiscountCode discountCode = discountCodeRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Discount code not found"));
        return convertToDTO(discountCode);
    }

    public boolean validateDiscount(String code) {
        DiscountCode discountCode = discountCodeRepository.findByCode(code).orElse(null);
        if (discountCode == null)
            return false;

        LocalDate now = LocalDate.now();
        return discountCode.getStatus().equals("ACTIVE") &&
                !now.isBefore(discountCode.getValidFrom()) &&
                !now.isAfter(discountCode.getValidTo()) &&
                discountCode.getMaxUsage() > 0;
    }

    @Transactional
    public DiscountDTO createDiscount(DiscountRequest request) {
        DiscountCode discountCode = new DiscountCode();
        discountCode.setCode(request.getCode());
        discountCode.setDiscountPercent(request.getDiscountPercent());
        discountCode.setValidFrom(request.getValidFrom());
        discountCode.setValidTo(request.getValidTo());
        discountCode.setMaxUsage(request.getMaxUsage());
        discountCode.setStatus("ACTIVE"); // status mặc định khi tạo

        return convertToDTO(discountCodeRepository.save(discountCode));
    }

    private DiscountDTO convertToDTO(DiscountCode discountCode) {
        DiscountDTO dto = new DiscountDTO();
        dto.setId(discountCode.getId());
        dto.setCode(discountCode.getCode());
        dto.setDiscountPercent(discountCode.getDiscountPercent());
        dto.setValidFrom(discountCode.getValidFrom());
        dto.setValidTo(discountCode.getValidTo());
        dto.setMaxUsage(discountCode.getMaxUsage());
        dto.setStatus(discountCode.getStatus());
        return dto;
    }
}
