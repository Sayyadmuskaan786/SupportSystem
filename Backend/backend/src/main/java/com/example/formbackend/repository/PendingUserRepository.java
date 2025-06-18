package com.example.formbackend.repository;

import com.example.formbackend.model.PendingUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PendingUserRepository extends JpaRepository<PendingUser, Long> {
    Optional<PendingUser> findByEmail(String email);
    Optional<PendingUser> findByOtp(String otp);

    List<PendingUser> findByOtpGeneratedTimeBefore(LocalDateTime time);
}
