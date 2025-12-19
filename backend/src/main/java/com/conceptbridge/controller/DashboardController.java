package com.conceptbridge.controller;

import com.conceptbridge.dto.response.DashboardResponse;
import com.conceptbridge.service.DashboardService;
import com.conceptbridge.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/student")
    public ResponseEntity<DashboardResponse> getStudentDashboard(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        DashboardResponse dashboard = dashboardService.getStudentDashboard(userPrincipal.getId());
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/teacher")
    public ResponseEntity<DashboardResponse> getTeacherDashboard(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        DashboardResponse dashboard = dashboardService.getTeacherDashboard(userPrincipal.getId());
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/admin")
    public ResponseEntity<DashboardResponse> getAdminDashboard(Authentication authentication) {
        DashboardResponse dashboard = dashboardService.getAdminDashboard();
        return ResponseEntity.ok(dashboard);
    }
}