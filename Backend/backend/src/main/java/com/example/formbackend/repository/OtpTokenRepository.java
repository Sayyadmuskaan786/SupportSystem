
package com.example.formbackend.repository;
import com.example.formbackend.model.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.time.LocalDateTime;
import java.util.List;


@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    java.util.List<OtpToken> findAllByEmail(String email);
    void deleteByEmail(String email);
}