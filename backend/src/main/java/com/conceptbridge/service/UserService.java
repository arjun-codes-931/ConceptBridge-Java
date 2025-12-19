package com.conceptbridge.service;

import com.conceptbridge.dto.request.SignupRequest;
import com.conceptbridge.entity.User;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;

public interface UserService extends UserDetailsService {
    User registerUser(SignupRequest signUpRequest);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    User findByUsername(String username);
    User findByEmail(String email);
    List<User> getAllUsers();
    User updateUser(Long userId, User updatedUser);
    void deleteUser(Long userId);
    User changeUserRole(Long userId, String newRole);
    List<User> getUsersByRole(String role);
    Long getTotalUserCount();
    Long getActiveUserCount();
}