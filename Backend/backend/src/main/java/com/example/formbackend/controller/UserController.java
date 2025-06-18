package com.example.formbackend.controller;

import com.example.formbackend.dto.UserDTO;
import com.example.formbackend.model.User;
import com.example.formbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/agents")
    public ResponseEntity<java.util.List<UserDTO>> getAllAgents() {
        java.util.List<UserDTO> agents = userService.getAllAgents().stream()
            .map(UserDTO::new)
            .toList();
        return ResponseEntity.ok(agents);
    }


      @GetMapping("/customers")
    public ResponseEntity<java.util.List<UserDTO>> getAllCustomers() {
        java.util.List<UserDTO> customers = userService.getAllCustomers().stream()
            .map(UserDTO::new)
            .toList();
        return ResponseEntity.ok(customers);
    }
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        Optional<User> userOptional = userService.getUserById(id);
        if (userOptional.isPresent()) {
            UserDTO userDTO = new UserDTO(userOptional.get());
            return ResponseEntity.ok(userDTO);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public ResponseEntity<java.util.List<UserDTO>> getAllUsers() {
        java.util.List<UserDTO> users = userService.getAllUsers().stream()
            .map(UserDTO::new)
            .toList();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/admin")
    public ResponseEntity<String> createAdminUser(@RequestBody User user) {
        try {
            userService.createAdminUser(user);
            return ResponseEntity.ok("Admin user created successfully.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to create admin user.");
        }
    }

    // @GetMapping("/customers")
    // public ResponseEntity<java.util.List<UserDTO>> getAllCustomers() {
    //     java.util.List<UserDTO> customers = userService.getAllUsers().stream()
    //         .filter(user -> user.getRole() != null && user.getRole().equals("CUSTOMER"))
    //         .map(UserDTO::new)
    //         .toList();
    //     return ResponseEntity.ok(customers);
    // }
}
