package com.conceptbridge.controller;

import com.conceptbridge.dto.request.SignupRequest;
import com.conceptbridge.dto.response.ApiResponse;
import com.conceptbridge.dto.response.DashboardResponse;
import com.conceptbridge.entity.User;
import com.conceptbridge.service.UserService;
import com.conceptbridge.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final DashboardService dashboardService;

    public AdminController(UserService userService, DashboardService dashboardService) {
        this.userService = userService;
        this.dashboardService = dashboardService;
    }

    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody SignupRequest signUpRequest) {
        User user = userService.registerUser(signUpRequest);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(new ApiResponse(true, "User deleted successfully"));
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        System.out.println(users);
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<User> changeUserRole(@PathVariable Long userId, @RequestBody String newRole) {
        User user = userService.changeUserRole(userId, newRole);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getAdminDashboard() {
        DashboardResponse dashboard = dashboardService.getAdminDashboard();
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/stats/users")
    public ResponseEntity<ApiResponse> getUserStatistics() {
        Long totalUsers = userService.getTotalUserCount();
        Long activeUsers = userService.getActiveUserCount();

        ApiResponse response = new ApiResponse(true,
                String.format("Total Users: %d, Active Users: %d", totalUsers, activeUsers));
        return ResponseEntity.ok(response);
    }
}