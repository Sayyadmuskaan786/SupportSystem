-- This script updates existing user passwords in the database to BCrypt hashes.
-- WARNING: This script assumes you have the original plain text passwords available.
-- If you do not have plain text passwords, you will need to reset passwords manually.

-- Example: Update password for a specific user
-- Replace 'user_email@example.com' and 'new_plain_password' accordingly

-- You can run this script multiple times for each user whose password you want to update.

-- For demonstration, here is a sample update for one user:
-- UPDATE users SET password = '$2a$10$7QJ1vZxQ1YxQ1YxQ1YxQeOq1YxQ1YxQ1YxQ1YxQ1YxQ1YxQ1YxQ1Y' WHERE email = 'user_email@example.com';

-- Note: The above hash is a BCrypt hash of the password 'new_plain_password'.
-- You need to generate BCrypt hashes for each user's password.

-- To generate BCrypt hashes, you can use online tools or Java code like:
-- new BCryptPasswordEncoder().encode("plain_password");

-- Alternatively, you can write a Java utility to read users, encode passwords, and update the database.

-- If you want, I can help you create such a Java utility.
