package com.studentmeal.dto;

import lombok.Data;

/**
 * Safe subset of profile fields customers may update (no role/email).
 */
@Data
public class CustomerProfileUpdateRequest {

    private String fullName;
    private String phoneNumber;
    private String address;
    private String university;
    private String studentId;
    private String avatarUrl;
    /** When non-blank, replaces password */
    private String password;
}
