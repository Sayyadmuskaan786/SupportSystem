package com.example.formbackend.service;

import com.example.formbackend.model.User;
// import com.example.formbackend.model.PasswordResetToken;
import com.example.formbackend.model.PendingUser;
import com.example.formbackend.repository.UserRepository;
// import com.example.formbackend.repository.PasswordResetTokenRepository;
import com.example.formbackend.repository.PendingUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserServiceExtension {

    @Autowired
    private UserRepository userRepository;

    // @Autowired
    // private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JavaMailSender mailSender;

    private String generateOtp() {
        return String.valueOf((int)(Math.random() * 900000) + 100000); // 6-digit OTP
    }

    

 

  

    private void sendPasswordResetOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Password Reset OTP");
        message.setText("Your OTP for password reset is: " + otp + "\nIt will expire in 5 minutes.");
        mailSender.send(message);
    }

    // // New method to clean up expired password reset tokens
    // public void cleanupExpiredPasswordResetTokens() {
    //     LocalDateTime expirationTime = LocalDateTime.now().minusMinutes(10);
    //     List<PasswordResetToken> expiredTokens = passwordResetTokenRepository.findByOtpGeneratedTimeBefore(expirationTime);
    //     passwordResetTokenRepository.deleteAll(expiredTokens);
    // }
}
