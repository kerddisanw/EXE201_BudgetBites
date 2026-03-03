package com.studentmeal.controller;

import com.studentmeal.dto.WeeklyMenuDTO;
import com.studentmeal.dto.WeeklyMenuRequest;
import com.studentmeal.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @GetMapping
    public ResponseEntity<List<WeeklyMenuDTO>> getAllMenus() {
        return ResponseEntity.ok(menuService.getAllMenus());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WeeklyMenuDTO> getMenuById(@PathVariable Long id) {
        return ResponseEntity.ok(menuService.getMenuById(id));
    }

    @GetMapping("/partner/{partnerId}")
    public ResponseEntity<List<WeeklyMenuDTO>> getMenusByPartner(@PathVariable Long partnerId) {
        return ResponseEntity.ok(menuService.getMenusByPartner(partnerId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WeeklyMenuDTO> createMenu(@RequestBody WeeklyMenuRequest request) {
        return ResponseEntity.ok(menuService.createMenu(request));
    }
}
