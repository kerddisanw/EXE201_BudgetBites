package com.studentmeal.config;

import com.studentmeal.entity.Admin;
import com.studentmeal.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String adminEmail = "admin@studentmeal.com";

        if (adminRepository.findByEmail(adminEmail).isEmpty()) {
            log.info("Initializing default admin account...");

            Admin admin = new Admin();
            admin.setFullName("System Administrator");
            admin.setEmail(adminEmail);
            admin.setRole("SUPER_ADMIN");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));

            adminRepository.save(admin);
            log.info("Default admin account created with email: {}", adminEmail);
        } else {
            log.info("Admin account already exists. Skipping initialization.");
        }
    }
}
