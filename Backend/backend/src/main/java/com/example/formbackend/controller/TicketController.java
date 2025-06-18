package com.example.formbackend.controller;

import com.example.formbackend.model.Ticket;
import com.example.formbackend.model.Ticket.State;
import com.example.formbackend.model.User;
import com.example.formbackend.repository.TicketRepository;
import com.example.formbackend.repository.UserRepository;
import com.example.formbackend.service.TicketService;
import com.example.formbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import java.util.List;
import java.util.Optional;
    import com.example.formbackend.dto.TicketDTO;
    import java.util.stream.Collectors;
@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @Autowired
    private UserService userService;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;
    


    @GetMapping("/gettickets")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public List<TicketDTO> getAllTickets() {
        return ticketService.getAllTickets().stream()
            .map(TicketDTO::new)
            .collect(Collectors.toList());
    }

    @GetMapping("/available-agents")
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAgentsWithoutTickets() {
        return userService.getAgentsWithoutTickets();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'CUSTOMER')")
    public ResponseEntity<TicketDTO> getTicketById(@PathVariable Long id) {
        Optional<Ticket> ticket = ticketService.getTicketById(id);
        return ticket.map(t -> ResponseEntity.ok(new TicketDTO(t))).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Temporarily remove role-based authorization to test ticket creation
    // @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping
    public ResponseEntity<?> createTicket(@RequestBody Ticket ticket, Authentication authentication) {
        try {
            System.out.println("Authenticated user: " + authentication.getName());
            System.out.println("Authorities: " + authentication.getAuthorities());
            User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
            ticket.setCreatedBy(user);
            // Use the new service method to create ticket with agent assignment logic
            Ticket savedTicket = ticketService.createTicketWithAgentAssignment(ticket);
            // If assigned agent is set, send assignment email
            if (savedTicket.getAssignedAgent() != null) {
                ticketService.sendTicketAssignmentEmail(savedTicket.getAssignedAgent(), savedTicket);
            }
            return ResponseEntity.ok(savedTicket);
        } catch (Exception e) {
            e.printStackTrace(); // Log the stack trace for debugging
            return ResponseEntity.status(403).body("Failed to create ticket: " + e.getMessage());
        }
    }

    // @PostMapping
    // @PreAuthorize("hasRole('CUSTOMER')")  // <-- FIXED here
    // public Ticket createTicket(@RequestBody Ticket ticket) {
    //     org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
    //     String username = authentication.getName();
    //     User user = userService.getUserByUsername(username);
    //     ticket.setCreatedBy(user);
    //     return ticketService.saveTicket(ticket);
    // }

    @PutMapping("/{id}/assign/{agentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Ticket> assignTicketToAgent(@PathVariable Long id, @PathVariable Long agentId) {
        Optional<Ticket> optionalTicket = ticketService.getTicketById(id);
        Optional<User> optionalAgent = userService.getUserById(agentId);

        if (!optionalTicket.isPresent() || !optionalAgent.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        User agent = optionalAgent.get();
        if (agent.getRole() != com.example.formbackend.model.Role.AGENT) {
            return ResponseEntity.badRequest().build();
        }

        Ticket ticket = optionalTicket.get();
        ticket.setAssignedAgent(agent);
        ticket.setState(Ticket.State.ASSIGNED);
        Ticket updatedTicket = ticketService.saveTicket(ticket);

        // Send email notification to the assigned agent
        ticketService.sendTicketAssignmentEmail(agent, updatedTicket);

        return ResponseEntity.ok(updatedTicket);
    }

    @PutMapping("/{id}/state")
    @PreAuthorize("hasRole('AGENT')")
    public ResponseEntity<Ticket> updateTicketState(@PathVariable Long id, @RequestParam Ticket.State state, Authentication authentication) {
        System.out.println("User " + authentication.getName() + " with roles " + authentication.getAuthorities() + " is attempting to update ticket state to " + state);
        Optional<Ticket> optionalTicket = ticketService.getTicketById(id);
        if (!optionalTicket.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Ticket ticket = optionalTicket.get();
        ticket.setState(state);
        if (state == Ticket.State.CLOSED) {
            ticket.setClosedAt(java.time.LocalDateTime.now());
        }
        Ticket updatedTicket = ticketService.saveTicket(ticket);

        // Send email notification to customer if ticket is SOLVED or CLOSED
        if (state == Ticket.State.SOLVED || state == Ticket.State.CLOSED) {
            User customer = ticket.getCreatedBy();
            ticketService.sendTicketClosedEmail(customer, updatedTicket);
        }

        return ResponseEntity.ok(updatedTicket);
    }

    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> getTotalTicketCount() {
        long count = ticketService.countAllTickets();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/count/agent/{agentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<Long> getTicketCountForAgent(@PathVariable Long agentId) {
        Optional<User> agent = userService.getUserById(agentId);
        if (!agent.isPresent() || agent.get().getRole() != com.example.formbackend.model.Role.AGENT) {
            return ResponseEntity.badRequest().build();
        }
        long count = ticketService.countTicketsByAgentId(agentId);
        return ResponseEntity.ok(count);
    }

    // @GetMapping("/state")
    // @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'CUSTOMER')")
    // public List<Ticket> getTicketsByState(@RequestParam Ticket.State state) {
    //     return ticketService.getTicketsByState(state);
    // }

    @GetMapping("/customer")
    // @PreAuthorize("hasRole('CUSTOMER')")
    public List<TicketDTO> getTicketsByCustomerId() {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        return ticketService.getTicketsByCustomerId(user.getId()).stream()
                .map(TicketDTO::new)
                .collect(java.util.stream.Collectors.toList());
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public List<TicketDTO> getTicketsAssignedToAgent() {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        return ticketService.getTicketsByAgentId(user.getId()).stream()
                .map(TicketDTO::new)
                .collect(java.util.stream.Collectors.toList());
    }

    @GetMapping("/assigned/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<TicketDTO> getAllAssignedTickets() {
        return ticketService.getAllAssignedTickets().stream()
                .map(TicketDTO::new)
                .collect(java.util.stream.Collectors.toList());
    }


    @GetMapping("/open")
    @PreAuthorize("hasRole('ADMIN')")
    public List<TicketDTO> getAllOpenTickets() {
        return ticketService.getAllOpenTickets().stream()
                .map(TicketDTO::new)
                .collect(java.util.stream.Collectors.toList());
    }

    @GetMapping("/closed")
    @PreAuthorize("hasRole('ADMIN')")
    public List<TicketDTO> getAllClosedTickets() {
        return ticketService.getAllClosedTickets().stream()
                .map(TicketDTO::new)
                .collect(java.util.stream.Collectors.toList());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> deleteTicket(@PathVariable Long id) {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);

        Optional<Ticket> optionalTicket = ticketService.getTicketById(id);
        if (!optionalTicket.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Ticket ticket = optionalTicket.get();
        if (!ticket.getCreatedBy().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("You are not authorized to delete this ticket");
        }

        ticketService.deleteTicket(ticket);
        return ResponseEntity.ok().build();
    }
}
