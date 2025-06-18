package com.example.formbackend.security;

import com.example.formbackend.service.CustomUserDetailsService;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.logging.Logger;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = Logger.getLogger(JwtAuthenticationFilter.class.getName());

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // Skip filtering for OPTIONS requests and specific public endpoints including forgot-password and google-login
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }

        return path.equals("/api/auth/login") 
            || path.equals("/api/users/register") 
            || path.equals("/api/auth/register-otp") 
            || path.equals("/api/auth/verify-otp")
            || path.equals("/api/auth/forgot-password")
            || path.equals("/api/auth/google-login");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        logger.info("Authorization header: " + authHeader + " for request: " + request.getMethod() + " " + request.getRequestURI());

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.info("No Bearer token found in Authorization header for request: " + request.getMethod() + " " + request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        logger.info("Extracted token: " + token + " for request: " + request.getMethod() + " " + request.getRequestURI());
        String email = jwtUtil.extractUsername(token);
        logger.info("Extracted email from token: " + email + " for request: " + request.getMethod() + " " + request.getRequestURI());

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            var userDetails = userDetailsService.loadUserByUsername(email);
            if (userDetails != null && jwtUtil.validateToken(token, userDetails.getUsername())) {
                logger.info("Token validated successfully for user: " + userDetails.getUsername() + " for request: " + request.getMethod() + " " + request.getRequestURI());
                logger.info("User authorities: " + userDetails.getAuthorities());
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                logger.info("Token validation failed for request: " + request.getMethod() + " " + request.getRequestURI());
            }
        } else {
            logger.info("Email is null or authentication already set for request: " + request.getMethod() + " " + request.getRequestURI());
        }

        filterChain.doFilter(request, response);
    }
}
