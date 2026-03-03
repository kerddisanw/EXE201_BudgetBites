package com.studentmeal.security;

import com.studentmeal.entity.Customer;
import com.studentmeal.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final CustomerRepository customerRepository;
    private final com.studentmeal.repository.AdminRepository adminRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // First check in Customers table
        var customerOptional = customerRepository.findByEmail(email);
        if (customerOptional.isPresent()) {
            Customer customer = customerOptional.get();
            return User.builder()
                    .username(customer.getEmail())
                    .password(customer.getPassword())
                    .authorities(
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + customer.getRole().name())))
                    .accountExpired(false)
                    .accountLocked(!customer.getActive())
                    .credentialsExpired(false)
                    .disabled(!customer.getActive())
                    .build();
        }

        // Then check in Admins table
        var adminOptional = adminRepository.findByEmail(email);
        if (adminOptional.isPresent()) {
            com.studentmeal.entity.Admin admin = adminOptional.get();
            return User.builder()
                    .username(admin.getEmail())
                    .password(admin.getPasswordHash())
                    .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")))
                    .accountExpired(false)
                    .accountLocked(false)
                    .credentialsExpired(false)
                    .disabled(false)
                    .build();
        }

        throw new UsernameNotFoundException("User not found with email: " + email);
    }
}
