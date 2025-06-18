package com.example.formbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private EmailSenderService emailSenderService;

    public void sendOtp(String toEmail, String otp) {
        String subject = "Your OTP Code";
        String body = "Your OTP code is: " + otp + ". It will expire in 5 minutes.";
        emailSenderService.sendEmail(toEmail, subject, body);
    }
}
