package com.example.formbackend.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Username is mandatory")
    @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
    private String username;

    @NotBlank(message = "Email is mandatory")
    @Email(message = "Email should be valid")
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank(message = "Password is mandatory")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;
    // @Column(name = "is_enabled", nullable = false)
    // private boolean isEnabled = false;
  
    private String googleId;

    // private String otp;
    // private LocalDateTime otpGeneratedTime;

    @OneToMany(mappedBy = "assignedAgent")
    private Set<Ticket> assignedTickets = new HashSet<>();

    @OneToMany(mappedBy = "createdBy")
    private Set<Ticket> createdTickets = new HashSet<>();

    // private String resetPasswordToken;

    // private LocalDateTime resetPasswordExpires;

    public User() {
    }

    public User(String username, String email, String password, Role role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
       
        
    }

    public String getGoogleId() {
        return googleId;
    }

    public void setGoogleId(String googleId) {
        this.googleId = googleId;
    }

    // public void setIsEnabled(boolean isEnabled){
    //     this.isEnabled = isEnabled;
    // }

    // public boolean getIsEnabled(){
    //     return this.isEnabled;
    // }

    // public void setOtp(String otp) {
    //     this.otp = otp;
    // }

    // public String getOtp() {
    //     return otp;
    // }

    // public LocalDateTime getOtpGeneratedTime() {
    //     return otpGeneratedTime;
    // }

    // public void setOtpGeneratedTime(LocalDateTime otpGeneratedTime){
    //     this.otpGeneratedTime = otpGeneratedTime;
    // }
    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    // public String getResetPasswordToken() {
    //     return resetPasswordToken;
    // }

    // public void setResetPasswordToken(String resetPasswordToken) {
    //     this.resetPasswordToken = resetPasswordToken;
    // }

    // public LocalDateTime getResetPasswordExpires() {
    //     return resetPasswordExpires;
    // }

    // public void setResetPasswordExpires(LocalDateTime resetPasswordExpires) {
    //     this.resetPasswordExpires = resetPasswordExpires;
    }

