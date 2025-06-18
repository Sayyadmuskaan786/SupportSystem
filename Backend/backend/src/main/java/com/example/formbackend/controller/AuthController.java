package com.example.formbackend.controller;

import com.example.formbackend.service.AuthService;
import com.example.formbackend.service.UserService;
import com.example.formbackend.service.UserServiceExtension;
import com.example.formbackend.model.User;
import com.example.formbackend.payload.LoginRequest;
import com.example.formbackend.payload.LoginResponse;
import com.example.formbackend.payload.OtpRequest;
import com.example.formbackend.payload.GoogleLoginRequest;
import com.example.formbackend.payload.ResetPasswordRequest;
import com.example.formbackend.security.JwtUtil;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import com.example.formbackend.payload.GoogleTokenInfo;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserServiceExtension userServiceE;

    @Autowired
    private UserService userService; 

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthService authService;

    private final String GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token=";

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()));

            User user = userService.getUserByUsername(loginRequest.getEmail());
            if (user == null) {
                return ResponseEntity.badRequest().body("Invalid email or password");
            }
            // Optionally, check if user is verified here

            String token = jwtUtil.generateToken(user.getEmail());

            LoginResponse loginResponse = new LoginResponse(
                    user.getId(),
                    user.getEmail(),
                    user.getRole().name(),
                    token);

            return ResponseEntity.ok(loginResponse);
        } catch (AuthenticationException e) {
            return ResponseEntity.badRequest().body("Invalid email or password");
        }
    }

    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginRequest request) {
        try {
            String idToken = request.getIdToken();
            // Verify the token with Google
            RestTemplate restTemplate = new RestTemplate();
            String tokenInfoUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
            GoogleTokenInfo tokenInfo = restTemplate.getForObject(tokenInfoUrl, GoogleTokenInfo.class);

            if (tokenInfo == null || tokenInfo.getEmail() == null) {
                return ResponseEntity.badRequest().body("Invalid Google ID token");
            }

            // Check if user exists, if not register
            User user = userService.getUserByUsername(tokenInfo.getEmail());
            if (user == null) {
                user = userService.registerGoogleUser(tokenInfo);
            }

            // Generate JWT token
            String token = jwtUtil.generateToken(user.getEmail());

            LoginResponse loginResponse = new LoginResponse(
                    user.getId(),
                    user.getEmail(),
                    user.getRole().name(),
                    token);

            return ResponseEntity.ok(loginResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Google login failed: " + e.getMessage());
        }
    }

    @PostMapping("/register-otp")
    public ResponseEntity<String> registerWithOtp(@RequestBody User user) {
        String response = userService.registerUser(user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otpp")
    public ResponseEntity<String> verifyOtpp(@RequestBody OtpRequest request) {
        String result = userService.verifyOtp(request.getEmail(), request.getOtp());
        if ("Verification successful.".equals(result)) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<String> resendOtp(@RequestBody OtpRequest request) {
        String result = userService.resendOtp(request.getEmail());
        if ("OTP resent successfully.".equals(result)) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

 

   // 1. Send OTP to user email
    @PostMapping("/forgot-password")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        authService.sendOtp(email);
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully to your email"));
    }

     @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        authService.verifyOtp(request.get("email"), request.get("otp"));
        return ResponseEntity.ok(Map.of("message", "OTP verified"));
    }


  // 3. After OTP verification, allow password reset
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");
        authService.resetPassword(email, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

   
}
