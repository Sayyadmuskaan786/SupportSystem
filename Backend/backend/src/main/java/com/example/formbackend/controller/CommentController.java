package com.example.formbackend.controller;

import com.example.formbackend.dto.CommentDTO;
import com.example.formbackend.model.Comment;
import com.example.formbackend.model.Ticket;
import com.example.formbackend.model.User;
import com.example.formbackend.service.CommentService;
import com.example.formbackend.service.TicketService;
import com.example.formbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private TicketService ticketService;

    @Autowired
    private UserService userService;

    @GetMapping("/getcomments")
    @PreAuthorize("hasRole('ADMIN')")
    public List<CommentDTO> getAllComments() {
        return commentService.getAllComments().stream()
            .map(CommentDTO::new)
            .collect(Collectors.toList());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'AGENT')")
    public ResponseEntity<?> updateComment(@PathVariable Long id, @RequestBody Comment updatedComment, Authentication authentication) {
        User user = userService.getUserByUsername(authentication.getName());
        if (user == null) {
            return ResponseEntity.status(401).body("User not authenticated");
        }
        Optional<Comment> existingCommentOpt = commentService.getCommentById(id);
        if (!existingCommentOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Comment existingComment = existingCommentOpt.get();
        if (!existingComment.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Forbidden: You can only update your own comments");
        }
        existingComment.setContent(updatedComment.getContent());
        Comment savedComment = commentService.updateComment(existingComment);
        return ResponseEntity.ok(savedComment);
    }


    @GetMapping("/ticket/{ticketId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'CUSTOMER')")
    public ResponseEntity<List<CommentDTO>> getCommentsByTicket(@PathVariable Long ticketId) {
        Optional<Ticket> ticket = ticketService.getTicketById(ticketId);
        if (!ticket.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        List<CommentDTO> comments = commentService.getCommentDTOsByTicketOrderByCreatedAtAsc(ticket.get());
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/ticket/{ticketId}/ordered")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'CUSTOMER')")
    public ResponseEntity<List<CommentDTO>> getCommentsByTicketOrdered(@PathVariable Long ticketId) {
        Optional<Ticket> ticket = ticketService.getTicketById(ticketId);
        if (!ticket.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        List<CommentDTO> comments = commentService.getCommentDTOsByTicketOrderByCreatedAtAsc(ticket.get());
        return ResponseEntity.ok(comments);
    }

    @PostMapping("/ticket/{ticketId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'CUSTOMER')")
    public ResponseEntity<?> addComment(@PathVariable Long ticketId, @RequestBody Comment comment, Authentication authentication) {
        System.out.println("Received addComment request for ticketId: " + ticketId + " by user: " + authentication.getName());
        Optional<Ticket> ticket = ticketService.getTicketById(ticketId);
        if (!ticket.isPresent()) {
            System.out.println("Ticket not found: " + ticketId);
            return ResponseEntity.notFound().build();
        }
        User user = userService.getUserByUsername(authentication.getName());
        if (user == null) {
            System.out.println("User not authenticated: " + authentication.getName());
            return ResponseEntity.status(401).body("User not authenticated");
        }
        comment.setTicket(ticket.get());
        comment.setUser(user);
        try {
            Comment savedComment = commentService.addComment(comment);
            System.out.println("Comment saved with id: " + savedComment.getId());
            // Return CommentDTO instead of raw Comment to include userRole
            return ResponseEntity.ok(new com.example.formbackend.dto.CommentDTO(savedComment));
        } catch (Exception e) {
            System.out.println("Error saving comment: " + e.getMessage());
            return ResponseEntity.status(500).body("Error saving comment");
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteComment(@PathVariable Long id) {
        Optional<Comment> commentOpt = commentService.getCommentById(id);
        if (!commentOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        commentService.deleteComment(id);
        return ResponseEntity.ok().build();
    }

    // New endpoint to add or update admin report on a comment
    @PutMapping("/{id}/report")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addOrUpdateReport(@PathVariable Long id, @RequestBody String reportContent) {
        Optional<Comment> commentOpt = commentService.getCommentById(id);
        if (!commentOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Comment comment = commentOpt.get();
        comment.setAdminReport(reportContent);
        Comment updatedComment = commentService.updateComment(comment);
        return ResponseEntity.ok(updatedComment);
    }

    // New endpoint to get all reports related to a user
    @GetMapping("/reports/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CommentDTO>> getReportsByUser(@PathVariable Long userId) {
        List<CommentDTO> reports = commentService.getAllComments().stream()
                .filter(c -> c.getUser() != null && c.getUser().getId().equals(userId) && c.getAdminReport() != null)
                .map(CommentDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(reports);
    }
}
