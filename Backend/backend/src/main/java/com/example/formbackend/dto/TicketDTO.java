package com.example.formbackend.dto;

import com.example.formbackend.model.Ticket;
import com.example.formbackend.model.User;

public class TicketDTO {
    private Long id;
    private String title;
    private String description;
    private String roomNo;
    private String place;
    private Ticket.State state;
    private UserDTO assignedAgent;
    private UserDTO createdBy;
    private String createdAt;
    private String closedAt;
    private String opendedAt;
    public TicketDTO(Ticket ticket) {
        this.id = ticket.getId();
        this.title = ticket.getTitle();
        this.description = ticket.getDescription();
        this.roomNo = ticket.getRoomNo();
        this.place = ticket.getPlace();
        this.state = ticket.getState();
        this.assignedAgent = ticket.getAssignedAgent() != null ? new UserDTO(ticket.getAssignedAgent()) : null;
        if (ticket.getCreatedBy() != null) {
            this.createdBy = new UserDTO(ticket.getCreatedBy());
        } else {
            System.out.println("Warning: Ticket id " + ticket.getId() + " has null createdBy");
            this.createdBy = null;
        }
        this.createdAt = ticket.getCreatedAt() != null ? ticket.getCreatedAt().toString() : null;
        this.closedAt = ticket.getClosedAt() != null ? ticket.getClosedAt().toString() : null;
    }

    // Getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Ticket.State getState() {
        return state;
    }

    public void setState(Ticket.State state) {
        this.state = state;
    }

    public UserDTO getAssignedAgent() {
        return assignedAgent;
    }

    public void setAssignedAgent(UserDTO assignedAgent) {
        this.assignedAgent = assignedAgent;
    }

    public UserDTO getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(UserDTO createdBy) {
        this.createdBy = createdBy;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getClosedAt() {
        return closedAt;
    }
    public void setClosedAt(String closedAt) {
        this.closedAt = closedAt;
    }
    public String getRoomNo() {
        return roomNo;
    }
    public void setRoomNo(String roomNo) {
        this.roomNo = roomNo;
    }
    public String getPlace() {
        return place;
    }
    public void setPlace(String place) {
        this.place = place;
    }
    public String getOpendedAt() {
        return opendedAt;
    }
    public void setOpendedAt(String opendedAt) {
        this.opendedAt = opendedAt;
    }
    
}
