package com.example.formbackend.dto;

import com.example.formbackend.model.Comment;

import java.time.LocalDateTime;

public class CommentDTO {
    private Long id;
    private String content;
    private Long ticketId;
    private Long userId;
    private String ticketTitle;
    private String username;
    private String userRole;
    private String adminReport;
    private LocalDateTime createdAt;

    public CommentDTO(Comment comment) {
        this.id = comment.getId();
        this.content = comment.getContent();
        this.ticketId = comment.getTicket() != null ? comment.getTicket().getId() : null;
        this.userId = comment.getUser() != null ? comment.getUser().getId() : null;
        this.ticketTitle = comment.getTicket() != null ? comment.getTicket().getTitle() : null;
        this.username = comment.getUser() != null ? comment.getUser().getUsername() : null;
        this.userRole = comment.getUser() != null ? comment.getUser().getRole().name() : null;
        this.adminReport = comment.getAdminReport();
        this.createdAt = comment.getCreatedAt();
    }

    // Getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Long getTicketId() {
        return ticketId;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getTicketTitle() {
        return ticketTitle;
    }

    public void setTicketTitle(String ticketTitle) {
        this.ticketTitle = ticketTitle;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getUserRole() {
        return userRole;
    }
    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }
}
