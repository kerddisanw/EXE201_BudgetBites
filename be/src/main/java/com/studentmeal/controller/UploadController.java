package com.studentmeal.controller;

import com.studentmeal.service.CloudinaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class UploadController {

    private final CloudinaryService cloudinaryService;

    /**
     * Upload ảnh quán ăn (partner logo/banner)
     * POST /api/upload/partner
     */
    @PostMapping(value = "/partners", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload ảnh quán ăn lên Cloudinary", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)))
    public ResponseEntity<Map<String, String>> uploadPartnerImage(
            @RequestPart("file") MultipartFile file) throws IOException {
        String url = cloudinaryService.uploadImage(file, "partners");
        return ResponseEntity.ok(Map.of("imageUrl", url));
    }

    /**
     * Upload ảnh món ăn (menu item)
     * POST /api/upload/menu-item
     */
    @PostMapping(value = "/menu-items", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload ảnh món ăn lên Cloudinary", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)))
    public ResponseEntity<Map<String, String>> uploadMenuItemImage(
            @RequestPart("file") MultipartFile file) throws IOException {
        String url = cloudinaryService.uploadImage(file, "menus");
        return ResponseEntity.ok(Map.of("imageUrl", url));
    }

    /**
     * Upload ảnh gói ăn (package thumbnail)
     * POST /api/upload/package
     */
    @PostMapping(value = "/packages", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload ảnh gói ăn lên Cloudinary", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)))
    public ResponseEntity<Map<String, String>> uploadPackageImage(
            @RequestPart("file") MultipartFile file) throws IOException {
        String url = cloudinaryService.uploadImage(file, "packages");
        return ResponseEntity.ok(Map.of("imageUrl", url));
    }

    /**
     * Upload ảnh đại diện khách hàng (avatar)
     * POST /api/images/users — multipart field "file"
     */
    @PostMapping(value = "/users", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload ảnh đại diện người dùng lên Cloudinary", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)))
    public ResponseEntity<Map<String, String>> uploadUserAvatar(
            @RequestPart("file") MultipartFile file) throws IOException {
        String url = cloudinaryService.uploadImage(file, "users");
        return ResponseEntity.ok(Map.of("imageUrl", url));
    }
}
