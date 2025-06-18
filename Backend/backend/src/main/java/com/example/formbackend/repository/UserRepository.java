package com.example.formbackend.repository;

import com.example.formbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;


public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.role = com.example.formbackend.model.Role.AGENT AND u.id NOT IN (SELECT t.assignedAgent.id FROM Ticket t WHERE t.assignedAgent IS NOT NULL)")
    List<User> findAgentsWithoutTickets();

    @Query("SELECT u FROM User u WHERE u.role = com.example.formbackend.model.Role.AGENT")
    List<User> findAllAgents();

    @Query("SELECT u FROM User u WHERE u.role = com.example.formbackend.model.Role.CUSTOMER")
    List<User> findAllCustomers();
}
