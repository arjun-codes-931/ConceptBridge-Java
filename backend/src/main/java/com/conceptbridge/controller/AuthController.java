package com.conceptbridge.controller;

import com.conceptbridge.dto.request.LoginRequest;
import com.conceptbridge.dto.request.SignupRequest;
import com.conceptbridge.dto.response.ApiResponse;
import com.conceptbridge.dto.response.AuthResponse;
import com.conceptbridge.entity.User;
import com.conceptbridge.security.UserPrincipal;
import com.conceptbridge.service.UserService;
import com.conceptbridge.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService; // Add this

    public AuthController(AuthenticationManager authenticationManager,
                          UserService userService,
                          JwtUtil jwtUtil,
                          UserDetailsService userDetailsService) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }


    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsernameOrEmail(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

            String jwt = jwtUtil.generateToken(userPrincipal);

            // Create a response that matches frontend expectation
            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", jwt);
            response.put("tokenType", "Bearer");
            response.put("username", userPrincipal.getUsername());
            response.put("roles", userPrincipal.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .toList());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Login failed", "message", "Invalid credentials"));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        try {
            System.out.println("=== REGISTRATION ATTEMPT ===");
            System.out.println("Username: " + signUpRequest.getUsername());
            System.out.println("Email: " + signUpRequest.getEmail());
            System.out.println("Role: " + signUpRequest.getRole());

            // Check for existing username
            if (userService.existsByUsername(signUpRequest.getUsername())) {
                System.out.println("❌ Username already exists: " + signUpRequest.getUsername());
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "success", false,
                                "message", "Error: Username is already taken!"
                        ));
            }

            // Check for existing email
            if (userService.existsByEmail(signUpRequest.getEmail())) {
                System.out.println("❌ Email already exists: " + signUpRequest.getEmail());
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "success", false,
                                "message", "Error: Email is already in use!"
                        ));
            }

            System.out.println("✅ User checks passed, creating user...");

            User user = userService.registerUser(signUpRequest);
            System.out.println("✅ User created successfully with ID: " + user.getId());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "User registered successfully!",
                    "userId", user.getId()
            ));

        } catch (Exception e) {
            System.out.println("❌ Registration exception: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "success", false,
                            "message", "Registration failed: " + e.getMessage()
                    ));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);

                if (jwtUtil.validateToken(token)) {
                    String username = jwtUtil.getUsernameFromToken(token);

                    // Use userDetailsService instead of userService
                    UserPrincipal userPrincipal = (UserPrincipal) userDetailsService.loadUserByUsername(username);

                    String newToken = jwtUtil.generateToken(userPrincipal);

                    // Create response
                    Map<String, Object> response = new HashMap<>();
                    response.put("accessToken", newToken);
                    response.put("tokenType", "Bearer");
                    response.put("username", userPrincipal.getUsername());
                    response.put("roles", userPrincipal.getAuthorities().stream()
                            .map(item -> item.getAuthority())
                            .toList());

                    return ResponseEntity.ok(response);
                }
            }

            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid or expired token"));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Token refresh failed", "message", e.getMessage()));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Backend is working! Time: " + new Date());
    }

    @PostMapping("/test-register")
    public ResponseEntity<?> testRegister() {
        // Test if registration endpoint is reachable
        return ResponseEntity.ok(Map.of(
                "message", "Registration endpoint is working",
                "timestamp", new Date()
        ));
    }
}