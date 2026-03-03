package com.studentmeal.dto;

import lombok.Data;

@Data
public class GoogleLoginRequest {
    // ID Token lấy từ Google Sign-In SDK trên mobile/frontend
    private String idToken;
}
