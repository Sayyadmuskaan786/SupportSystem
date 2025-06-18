package com.example.formbackend.service;

import com.example.formbackend.model.User;
// import com.example.formbackend.model.EmailVerificationToken;
import com.example.formbackend.model.PendingUser;
// import com.example.formbackend.model.PasswordResetToken;
import com.example.formbackend.repository.UserRepository;
// import com.example.formbackend.repository.EmailVerificationTokenRepository;
// import com.example.formbackend.repository.PasswordResetTokenRepository;
import com.example.formbackend.repository.PendingUserRepository;
import com.example.formbackend.payload.GoogleTokenInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.formbackend.model.Role;
import org.springframework.mail.javamail.JavaMailSender;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@Service
public class UserService {
    
    // Existing code...

    public User registerGoogleUser(GoogleTokenInfo tokenInfo) {
        User user = new User();
        user.setEmail(tokenInfo.getEmail());
        user.setUsername(tokenInfo.getName());
        user.setRole(Role.CUSTOMER); // or default role
        user.setGoogleId(tokenInfo.getSub()); // You may need to add this field in User model
        // You may want to set other fields or flags as needed        // Save user to database
        return saveUser(user);
    }



    @Autowired
    private UserRepository userRepository;

    // @Autowired
    // private EmailVerificationTokenRepository tokenRepository;

    @Autowired
    private EmailSenderService emailSenderService;

    // @Autowired
    // private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

     @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private PendingUserRepository pendingUserRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public User saveUser(User user) {
        // Hash the password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public void createAdminUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already registered.");
        }
        user.setRole(Role.ADMIN);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public User getUserByUsername(String username) {
        return userRepository.findByEmail(username).orElse(null);
    }


    

    

   

    // public User registerUser(User user) throws IllegalArgumentException {
    //     if(userRepository.existsByEmail(user.getEmail())){
    //         throw new IllegalArgumentException("Email Already Exists");
    //     }
    //     // Convert role string to uppercase enum if role is set as string
    //     if (user.getRole() != null) {
    //         try {
    //             user.setRole(Role.valueOf(user.getRole().name().toUpperCase()));
    //         } catch (IllegalArgumentException e) {
    //             throw new IllegalArgumentException("Invalid role for registration");
    //         }
    //     } else {
    //         user.setRole(Role.CUSTOMER);
    //     }
    //     // Validate role: only CUSTOMER or AGENT allowed
    //     if (user.getRole() != Role.CUSTOMER && user.getRole() != Role.AGENT) {
    //         throw new IllegalArgumentException("Invalid role for registration");
    //     }
    //     // Hash the password before saving
    //     user.setPassword(passwordEncoder.encode(user.getPassword()));
    //     User savedUser = userRepository.save(user);
    //     // Create and send verification token
    //     createVerificationToken(savedUser);
    //     return savedUser;
    // }

    // public void createVerificationToken(User user) {
    //     EmailVerificationToken token = new EmailVerificationToken(user);
    //     tokenRepository.save(token);
    //     // Send verification email
    //     emailSenderService.sendEmail(user.getEmail(), "Email Verification",
    //             "Please verify your email by clicking the link: " +
    //                     "http://localhost:8080/api/auth/verify-email?token=" + token.getToken());
    // }

    public Optional<User> findByUsername(String username) {
       return userRepository.findByUsername(username);
    }

    // New method for password change
    public boolean changePassword(Long userId, String oldPassword, String newPassword) {
        Optional<User> optionalUser = userRepository.findById(userId);
        if (!optionalUser.isPresent()) {
            return false;
        }
        User user = optionalUser.get();
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return false;
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return true;
    }

    // New method to get agents without tickets
    public List<User> getAgentsWithoutTickets() {
        return userRepository.findAgentsWithoutTickets();
    }

    // New method to get all agents
    public List<User> getAllAgents() {
        return userRepository.findAllAgents();
    }

    public List<User> getAllCustomers(){
        return userRepository.findAllCustomers();
    }

    public String registerUser(User user) {
        // Check if already registered
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return "Email already registered and verified.";
        }
        if (pendingUserRepository.findByEmail(user.getEmail()).isPresent()) {
            return "Registration already pending for this email.";
        }
        // Hash password
        String hashedPassword = passwordEncoder.encode(user.getPassword());
        String otp = generateOtp();
        PendingUser pending = new PendingUser();
        pending.setEmail(user.getEmail());
        pending.setUsername(user.getUsername());
        pending.setPassword(hashedPassword);
        pending.setRole(user.getRole() != null ? user.getRole().name() : "CUSTOMER");
        pending.setOtp(otp);
        pending.setOtpGeneratedTime(LocalDateTime.now());
        pendingUserRepository.save(pending);
        sendOtpEmail(user.getEmail(), otp);
        return "OTP sent to email.";
    }

    private void sendOtpEmail(String toEmail, String otp) {
        try {
            System.out.println("Sending OTP email to: " + toEmail + " with OTP: " + otp);
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Verify your email with OTP");
            message.setText("Your OTP for registration is: " + otp + "\nIt will expire in 5 minutes.");
            mailSender.send(message);
            System.out.println("OTP email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send OTP email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

public String verifyOtp(String email, String otp) {
    Optional<PendingUser> pendingOpt = pendingUserRepository.findByEmail(email);
    if (pendingOpt.isEmpty()) return "No pending registration for this email.";
    PendingUser pending = pendingOpt.get();
    if (!pending.getOtp().equals(otp)) return "Invalid OTP.";
    if (pending.getOtpGeneratedTime().plusMinutes(10).isBefore(LocalDateTime.now()))
        return "OTP expired.";
    // Create user
    User user = new User();
    user.setEmail(pending.getEmail());
    user.setUsername(pending.getUsername());
    user.setPassword(pending.getPassword());
    String roleStr = pending.getRole();
    Role roleEnum;
    if (roleStr == null || roleStr.isEmpty()) {
        roleEnum = Role.CUSTOMER;
    } else {
        try {
            roleEnum = Role.valueOf(roleStr);
        } catch (IllegalArgumentException e) {
            roleEnum = Role.CUSTOMER;
        }
    }
    user.setRole(roleEnum);
    userRepository.save(user);
    pendingUserRepository.delete(pending);
    return "Verification successful.";
}

    public String resendOtp(String email) {
        Optional<PendingUser> pendingOpt = pendingUserRepository.findByEmail(email);
        if (pendingOpt.isEmpty()) return "No pending registration for this email.";
        PendingUser pending = pendingOpt.get();
        String newOtp = generateOtp();
        pending.setOtp(newOtp);
        pending.setOtpGeneratedTime(LocalDateTime.now());
        pendingUserRepository.save(pending);
        sendOtpEmail(email, newOtp);
        return "OTP resent successfully.";
    }

    private String generateOtp() {
        return String.valueOf((int)(Math.random() * 900000) + 100000); // 6-digit OTP
    }
}



