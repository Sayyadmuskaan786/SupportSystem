package com.example.formbackend.repository;

import com.example.formbackend.model.Comment;
import com.example.formbackend.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTicket(Ticket ticket);

    @Query("SELECT c FROM Comment c WHERE c.ticket = :ticket ORDER BY c.createdAt ASC")
    List<Comment> findCommentsByTicketOrderByCreatedAtAsc(@org.springframework.data.repository.query.Param("ticket") Ticket ticket);

    @Query("SELECT c FROM Comment c")
    List<Comment> getAllComments();

    // Equivalent native SQL query:
    // SELECT * FROM comment WHERE ticket_id = :ticketId ORDER BY created_at ASC;
}
