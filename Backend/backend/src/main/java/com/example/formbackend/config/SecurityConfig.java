package com.example.formbackend.config;

import com.example.formbackend.security.JwtAuthenticationFilter;
import com.example.formbackend.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.OAuth2LoginAuthenticationFilter;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletException;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    private final ClientRegistrationRepository clientRegistrationRepository;

    public SecurityConfig(CustomUserDetailsService userDetailsService,
                          JwtAuthenticationFilter jwtAuthenticationFilter,
                          ClientRegistrationRepository clientRegistrationRepository) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.clientRegistrationRepository = clientRegistrationRepository;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf(csrf -> csrf
                .ignoringRequestMatchers(
                    "/api/users/register",
                    "/api/auth/login",
                    "/api/tickets",
                    "/api/tickets/*/assign/*",
                    "/api/tickets/*/state",
                    "/api/tickets/*",  // Added to ignore CSRF for DELETE endpoint
                "/api/auth/register-otp",
                "/api/auth/verify-otp",
                "/api/auth/verify-otpp",

                "/api/auth/resend-otp",
                "/api/auth/google-login",
                "/api/auth/forgot-password",
                
                "/api/auth/reset-password",
                
                "/api/comments/*",
                "/api/comments/ticket/*"
            )
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(
                    "/api/auth/register-otp",
                    "/api/auth/verify-otp",
                    "/api/auth/resend-otp",
                    "/api/auth/login",
                    "/api/auth/forgot-password",
                    "/api/auth/reset-password",
                    "/api/auth/verify-otpp",
                    "/api/auth/google-login",
                    "/oauth2/**",
                    "/api/auth/register"  // Added to allow registration endpoint
                ).permitAll()
                .requestMatchers(HttpMethod.POST, "/api/tickets").hasRole("CUSTOMER")
                .requestMatchers(HttpMethod.DELETE, "/api/tickets/*").hasRole("CUSTOMER")
                .requestMatchers(HttpMethod.POST, "/api/comments/*").hasAnyRole("CUSTOMER", "AGENT")
                .requestMatchers(HttpMethod.POST, "/api/comments/ticket/*").hasAnyRole("CUSTOMER", "AGENT")
                .requestMatchers(HttpMethod.PUT, "/api/comments/*").hasAnyRole("CUSTOMER", "AGENT")
                .requestMatchers(HttpMethod.GET, "/api/comments/getcomments").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/tickets/*/assign/*").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/users/admin").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/tickets/*/state").hasRole("AGENT")
                .requestMatchers(HttpMethod.GET, "/api/tickets/state").hasAnyRole("ADMIN", "AGENT", "CUSTOMER")
                .anyRequest().authenticated()
            )
            .exceptionHandling()
            .accessDeniedHandler((request, response, accessDeniedException) -> {
                System.out.println("Access denied: " + accessDeniedException.getMessage());
                response.sendError(403, "Access Denied");
            })
            .authenticationEntryPoint((request, response, authException) -> {
                System.out.println("Authentication failed: " + authException.getMessage());
                response.sendError(401, "Unauthorized");
            })
            .and()
            .headers(headers -> headers
                .addHeaderWriter((request, response) -> {
                    response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
                    response.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
                })
            )
            .oauth2Login(oauth2 -> oauth2
                .loginPage("/google-login")
                .successHandler(oAuth2AuthenticationSuccessHandler())
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(oAuth2UserService())
                )
            )
            .authenticationProvider(userAuthenticationProvider())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public OAuth2UserService<OAuth2UserRequest, OAuth2User> oAuth2UserService() {
        return new DefaultOAuth2UserService();
    }

    @Bean
    public AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler() {
        return new SimpleUrlAuthenticationSuccessHandler() {
            public void onAuthenticationSuccess(javax.servlet.http.HttpServletRequest request,
                                                javax.servlet.http.HttpServletResponse response,
                                                org.springframework.security.core.Authentication authentication)
                    throws java.io.IOException, javax.servlet.ServletException {
                // Here you can generate JWT token and send it in response or redirect
                // For now, just redirect to frontend or home page
                response.sendRedirect("/");
            }
        };
    }

    @Bean
    public AuthenticationProvider userAuthenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
