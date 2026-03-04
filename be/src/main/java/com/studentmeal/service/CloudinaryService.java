package com.studentmeal.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    /**
     * Upload ảnh lên Cloudinary
     * 
     * @param file   File ảnh từ multipart request
     * @param folder Thư mục trên Cloudinary (vd: "partners", "menus", "packages")
     * @return URL ảnh đã upload
     */
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "studentmeal/" + folder,
                        "resource_type", "image",
                        "quality", "auto",
                        "fetch_format", "auto"));
        return (String) result.get("secure_url");
    }

    /**
     * Xóa ảnh khỏi Cloudinary theo public_id
     */
    public void deleteImage(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}
