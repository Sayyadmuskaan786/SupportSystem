-- Insert initial admin user with username 'admin' and password 'admin123' (password should be hashed)
-- Adjust the password hash according to your password encoder (e.g., BCrypt)

INSERT INTO admins (username, password) VALUES (
  'admin',
  '$2a$10$Dow1Q6q6v6Q6q6v6Q6q6uO6q6v6Q6q6v6Q6q6v6Q6q6v6Q6q6v6Q6' -- Replace with actual bcrypt hash of 'admin123'
);
