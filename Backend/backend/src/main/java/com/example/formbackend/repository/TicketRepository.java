package com.example.formbackend.repository;

import com.example.formbackend.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

import com.example.formbackend.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByAssignedAgentId(Long agentId);

    @Query("SELECT t FROM Ticket t LEFT JOIN FETCH t.createdBy WHERE t.assignedAgent.id = :agentId")
    List<Ticket> findByAssignedAgentIdWithCreatedBy(@Param("agentId") Long agentId);

    @Query("SELECT t FROM Ticket t WHERE t.createdBy.id = :customerId")
    List<Ticket> findByCreatedById(@Param("customerId") Long customerId);

    // List<Ticket> findByState(Ticket.State state);

    // @Query("SELECT t FROM Ticket t LEFT JOIN FETCH t.createdBy LEFT JOIN FETCH t.assignedAgent WHERE t.state = :state")
    // List<Ticket> findByStateWithCreatedByEager(@Param("state") Ticket.State state);

    @Query("SELECT t FROM Ticket t WHERE t.state = com.example.formbackend.model.Ticket$State.ASSIGNED")
    List<Ticket> findAllAssignedTickets();

    @Query("SELECT COUNT(t) FROM Ticket t")
    long countAllTickets();

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.assignedAgent.id = :agentId")
    long countTicketsByAgentId(@Param("agentId") Long agentId);

    @Query("SELECT t FROM Ticket t LEFT JOIN FETCH t.assignedAgent LEFT JOIN FETCH t.createdBy")
    List<Ticket> findAllWithAgents();

    @Query("SELECT t FROM Ticket t")
    List<Ticket> getAllTickets();

    @Query("SELECT t FROM Ticket t WHERE t.state = com.example.formbackend.model.Ticket$State.OPEN")
    List<Ticket> findAllOpenTickets();
    @Query("SELECT t FROM Ticket t WHERE t.state = com.example.formbackend.model.Ticket$State.CLOSED ORDER BY t.closedAt DESC")
    List<Ticket> findAllClosedTickets();

    @Query("SELECT t FROM Ticket t WHERE t.createdBy.id = :customerId AND t.state IN (com.example.formbackend.model.Ticket$State.SOLVED, com.example.formbackend.model.Ticket$State.CLOSED) AND t.title = :title ORDER BY t.id DESC")
    List<Ticket> findRecentSolvedOrClosedTicketsByCustomerAndTitle(@Param("customerId") Long customerId, @Param("title") String title);
}
