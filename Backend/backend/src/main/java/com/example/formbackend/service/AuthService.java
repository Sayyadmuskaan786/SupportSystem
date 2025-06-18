package com.example.formbackend.service;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.formbackend.model.OtpToken;
import com.example.formbackend.model.User;
import com.example.formbackend.repository.OtpTokenRepository;
import com.example.formbackend.repository.UserRepository;

@Service
public class AuthService {

    @Autowired private UserRepository userRepo;
    @Autowired private OtpTokenRepository otpRepo;
    @Autowired private EmailService emailService;

    public void sendOtp(String email) {
        if (!userRepo.existsByEmail(email)) {
            throw new RuntimeException("Email not registered");
        }

        String otp = String.valueOf(new Random().nextInt(900000) + 100000);

        OtpToken token = new OtpToken();
        token.setEmail(email);
        token.setOtp(otp);
        token.setExpiry(LocalDateTime.now().plusMinutes(5));
        otpRepo.save(token);

        emailService.sendOtp(email, otp);
    }

    @Transactional
    public void verifyOtp(String email, String otp) {
        java.util.List<OtpToken> tokens = otpRepo.findAllByEmail(email);
        if (tokens.isEmpty()) {
            throw new RuntimeException("OTP not found");
        }

        // Find the latest valid token by sorting tokens by expiry descending
        OtpToken validToken = null;
        LocalDateTime now = LocalDateTime.now();
        tokens.sort((a, b) -> b.getExpiry().compareTo(a.getExpiry()));
        for (OtpToken token : tokens) {
            if (token.getExpiry().isAfter(now)) {
                validToken = token;
                break;
            }
        }

        if (validToken == null) {
            throw new RuntimeException("OTP expired");
        }

        if (!validToken.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        // OTP verified, allow reset
        otpRepo.deleteByEmail(email); // Clear OTP after success
    }

    public void resetPassword(String email, String newPassword) {
        User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(new BCryptPasswordEncoder().encode(newPassword));
        userRepo.save(user);
    }
}
