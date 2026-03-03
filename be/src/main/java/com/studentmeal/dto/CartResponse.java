package com.studentmeal.dto;

import lombok.Data;

import java.math.BigDecimal;

import java.util.List;

@Data
public class CartResponse {
    private List<CartItemDTO> items;
    private int totalItems;
    private BigDecimal totalAmount;
}
