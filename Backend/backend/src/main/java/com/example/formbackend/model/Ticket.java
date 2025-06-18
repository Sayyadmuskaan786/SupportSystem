// package com.example.formbackend.model;

// import jakarta.persistence.*;
// import jakarta.validation.constraints.NotBlank;
// import java.util.HashSet;
// import java.util.Set;
// import com.fasterxml.jackson.annotation<edit_file>
// <path>backend/src/main/java/com/example/formbackend/model/Ticket.java</path>
// <content>
// <<<<<<< SEARCH
// import jakarta.persistence.*;
// import jakarta.validation.constraints.NotBlank;
// import java.util.HashSet;
// import java.util.Set;

// @Entity
// public class Ticket {

//     public enum State {
//         OPEN,
//         ASSIGNED,
//         SOLVED
//     }

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     @NotBlank(message = "Title is mandatory")
//     private String title;

//     @NotBlank(message = "Description is mandatory")
//     private String description;

//     @Enumerated(EnumType.STRING)
//     private State state = State.OPEN;

//     @ManyToOne
//     @JoinColumn(name = "assigned_agent_id")
//     private User assignedAgent;

//     @ManyToOne(optional = false)
//     @JoinColumn(name = "created_by_id")
//     private User createdBy;

//     @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
//     private Set<Comment> comments = new HashSet<>();
// =======
package com.example.formbackend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.util.HashSet;
import java.util.Set;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

@Entity
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Ticket {

    public enum State {
        OPEN,
        ASSIGNED,
        SOLVED,
        CLOSED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is mandatory")
    private String title;

    @NotBlank(message = "Description is mandatory")
    private String description;

    private String roomNo;

    private String place;

    @Enumerated(EnumType.STRING)
    private State state = State.OPEN;

    @ManyToOne
    @JoinColumn(name = "assigned_agent_id")
    private User assignedAgent;

    @ManyToOne(optional = false)
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime closedAt;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Comment> comments = new HashSet<>();

    
    

    public Ticket() {
    }

    public Ticket(String title, String description, User createdBy) {
        this.title = title;
        this.description = description;
        this.createdBy = createdBy;
        this.state = State.OPEN;
    }

    public Long getId() {
        return id;
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

    public State getState() {
        return state;
    }

    public void setState(State state) {
        this.state = state;
    }

    public User getAssignedAgent() {
        return assignedAgent;
    }

    public void setAssignedAgent(User assignedAgent) {
        this.assignedAgent = assignedAgent;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Set<Comment> getComments() {
        return comments;
    }

    public void setComments(Set<Comment> comments) {
        this.comments = comments;
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
    public LocalDateTime getClosedAt() {
        return closedAt;
    }
    public void setClosedAt(LocalDateTime closedAt) {
        this.closedAt = closedAt;
    } 

    @Override
    public String toString() {
        return "Ticket{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", roomNo='" + roomNo + '\'' +
                ", place='" + place + '\'' +
                ", state=" + state +
                ", assignedAgent=" + (assignedAgent != null ? assignedAgent.getUsername() : "N/A") +
                ", createdBy=" + (createdBy != null ? createdBy.getUsername() : "N/A") +
                ", createdAt=" + createdAt +
                ", closedAt=" + closedAt +
                '}';
    }
}
