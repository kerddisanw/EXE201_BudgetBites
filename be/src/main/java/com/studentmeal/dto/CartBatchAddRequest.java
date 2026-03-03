package com.studentmeal.dto;

import lombok.Data;
import java.util.List;

@Data
public class CartBatchAddRequest {
    private List<CartAddRequest> items;
}
