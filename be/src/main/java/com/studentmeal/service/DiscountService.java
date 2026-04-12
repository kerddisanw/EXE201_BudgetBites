package com.studentmeal.service;

import com.studentmeal.dto.DiscountDTO;
import com.studentmeal.dto.DiscountRequest;
import com.studentmeal.dto.DiscountUpdateRequest;
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

    /** Customer checkout: returns discount details only if the code is currently valid. */
    @Transactional(readOnly = true)
    public DiscountDTO getValidDiscountForPreview(String rawCode) {
        String code = rawCode == null ? "" : rawCode.trim();
        if (code.isEmpty()) {
            throw new ResourceNotFoundException("Mã giảm giá không hợp lệ");
        }
        if (!validateDiscount(code)) {
            throw new ResourceNotFoundException("Mã giảm giá không hợp lệ hoặc đã hết hạn");
        }
        return getDiscountByCode(code);
    }

    @Transactional
    public DiscountDTO createDiscount(DiscountRequest request) {
        if (request.getCode() == null || request.getCode().isBlank()) {
            throw new IllegalArgumentException("Mã không được để trống");
        }
        if (discountCodeRepository.findByCode(request.getCode().trim()).isPresent()) {
            throw new IllegalArgumentException("Mã giảm giá đã tồn tại");
        }
        if (request.getDiscountPercent() == null || request.getDiscountPercent().signum() <= 0) {
            throw new IllegalArgumentException("Phần trăm giảm phải lớn hơn 0");
        }
        if (request.getValidFrom() == null || request.getValidTo() == null) {
            throw new IllegalArgumentException("Ngày hiệu lực không hợp lệ");
        }
        if (request.getValidTo().isBefore(request.getValidFrom())) {
            throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu");
        }
        if (request.getMaxUsage() == null || request.getMaxUsage() < 0) {
            throw new IllegalArgumentException("Số lần dùng không hợp lệ");
        }
        DiscountCode discountCode = new DiscountCode();
        discountCode.setCode(request.getCode().trim());
        discountCode.setDiscountPercent(request.getDiscountPercent());
        discountCode.setValidFrom(request.getValidFrom());
        discountCode.setValidTo(request.getValidTo());
        discountCode.setMaxUsage(request.getMaxUsage());
        discountCode.setStatus("ACTIVE"); // status mặc định khi tạo

        return convertToDTO(discountCodeRepository.save(discountCode));
    }

    @Transactional
    public DiscountDTO updateDiscount(Long id, DiscountUpdateRequest request) {
        DiscountCode dc = discountCodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Discount code not found"));
        String newCode = request.getCode() == null ? "" : request.getCode().trim();
        if (newCode.isEmpty()) {
            throw new IllegalArgumentException("Mã không được để trống");
        }
        if (!dc.getCode().equals(newCode) && discountCodeRepository.countOtherWithCode(newCode, id) > 0) {
            throw new IllegalArgumentException("Mã giảm giá đã tồn tại");
        }
        if (request.getDiscountPercent() == null || request.getDiscountPercent().signum() <= 0) {
            throw new IllegalArgumentException("Phần trăm giảm phải lớn hơn 0");
        }
        if (request.getValidFrom() == null || request.getValidTo() == null) {
            throw new IllegalArgumentException("Ngày hiệu lực không hợp lệ");
        }
        if (request.getValidTo().isBefore(request.getValidFrom())) {
            throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu");
        }
        if (request.getMaxUsage() == null || request.getMaxUsage() < 0) {
            throw new IllegalArgumentException("Số lần dùng không hợp lệ");
        }
        String status = normalizeStatus(request.getStatus());
        dc.setCode(newCode);
        dc.setDiscountPercent(request.getDiscountPercent());
        dc.setValidFrom(request.getValidFrom());
        dc.setValidTo(request.getValidTo());
        dc.setMaxUsage(request.getMaxUsage());
        dc.setStatus(status);
        return convertToDTO(discountCodeRepository.save(dc));
    }

    @Transactional
    public DiscountDTO setDiscountStatus(Long id, String rawStatus) {
        DiscountCode dc = discountCodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Discount code not found"));
        dc.setStatus(normalizeStatus(rawStatus));
        return convertToDTO(discountCodeRepository.save(dc));
    }

    private static String normalizeStatus(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("Trạng thái không hợp lệ");
        }
        String s = raw.trim().toUpperCase();
        if (!s.equals("ACTIVE") && !s.equals("INACTIVE") && !s.equals("EXPIRED")) {
            throw new IllegalArgumentException("Trạng thái phải là ACTIVE, INACTIVE hoặc EXPIRED");
        }
        return s;
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
