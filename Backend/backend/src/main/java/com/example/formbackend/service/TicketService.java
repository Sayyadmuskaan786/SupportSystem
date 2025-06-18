package com.example.formbackend.service;

import com.example.formbackend.model.Ticket;
import com.example.formbackend.model.User;
import com.example.formbackend.repository.TicketRepository;
import com.example.formbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailSenderService emailSenderService;

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAllWithAgents();
    }

    public Optional<Ticket> getTicketById(Long id) {
        return ticketRepository.findById(id);
    }

    public Ticket saveTicket(Ticket ticket) {
        return ticketRepository.save(ticket);
    }

    public long countAllTickets() {
        return ticketRepository.count();
    }

    public long countTicketsByAgentId(Long agentId) {
        return ticketRepository.countTicketsByAgentId(agentId);
    }

    // // // public List<Ticket> getTicketsByState(Ticket.State state) {
    //     return ticketRepository.findByState(state);
    // }

    // public List<Ticket> getTicketsByStateWithCreatedByEager(Ticket.State state) {
    //     return ticketRepository.findByStateWithCreatedByEager(state);
    // }

    public List<Ticket> getTicketsByCustomerId(Long customerId) {
        return ticketRepository.findByCreatedById(customerId);
    }

    public List<Ticket> getTicketsByAgentId(Long agentId) {
        return ticketRepository.findByAssignedAgentIdWithCreatedBy(agentId);
    }

    public List<Ticket> getAllAssignedTickets() {
        return ticketRepository.findAllAssignedTickets();
    }

    public List<Ticket> getAllOpenTickets(){
        return ticketRepository.findAllOpenTickets();
    }

    public List<Ticket> getAllClosedTickets(){
        return ticketRepository.findAllClosedTickets();
    }

    public void sendTicketAssignmentEmail(User agent, Ticket ticket) {
        String subject = "New Ticket Assigned: " + ticket.getTitle();
        String body = "Dear " + agent.getUsername() + ",\n\n" +
                "You have been assigned a new ticket with ID: " + ticket.getId() + "\n" +
                "Title: " + ticket.getTitle() + "\n" +
                "Room No.: " + (ticket.getRoomNo() != null ? ticket.getRoomNo() : "N/A") + "\n" +
                "Place: " + (ticket.getPlace() != null ? ticket.getPlace() : "N/A") + "\n" +
                "Created By: " + (ticket.getCreatedBy() != null ? ticket.getCreatedBy().getUsername() : "N/A") + "\n" +
                "Description: " + ticket.getDescription() + "\n\n" +
                "Please check the system for more details.\n\n" +
                "Best regards,\nSupport Team";
        emailSenderService.sendEmail(agent.getEmail(), subject, body);
    }

    public void sendTicketClosedEmail(User customer, Ticket ticket) {
        String subject = "Your Ticket is Closed: " + ticket.getTitle();
        String body = "Dear " + customer.getUsername() + ",\n\n" +
                "Your ticket with ID: " + ticket.getId() + " has been marked as " + ticket.getState() + ".\n" +
                "Title: " + ticket.getTitle() + "\n" +
                "Description: " + ticket.getDescription() + "\n\n" +
                "Thank you for using our support system.\n\n" +
                "Best regards,\nSupport Team";
        emailSenderService.sendEmail(customer.getEmail(), subject, body);
    }

    public void deleteTicket(Ticket ticket) {
        ticketRepository.delete(ticket);
    }

    public Ticket createTicketWithAgentAssignment(Ticket ticket) {
        Long customerId = ticket.getCreatedBy().getId();
        String title = ticket.getTitle();

        // Find recent solved or closed tickets by the same customer with the same title
        List<Ticket> recentTickets = ticketRepository.findRecentSolvedOrClosedTicketsByCustomerAndTitle(customerId, title);

        if (!recentTickets.isEmpty()) {
            // Update the existing ticket's state and assign the same agent
            Ticket existingTicket = recentTickets.get(0);
            existingTicket.setState(Ticket.State.OPEN);
            if (existingTicket.getAssignedAgent() != null) {
                existingTicket.setAssignedAgent(existingTicket.getAssignedAgent());
            }
            return ticketRepository.save(existingTicket);
        } else {
            // No recent similar ticket found, create new ticket with OPEN state
            ticket.setState(Ticket.State.OPEN);
            return ticketRepository.save(ticket);
        }
    }
}
