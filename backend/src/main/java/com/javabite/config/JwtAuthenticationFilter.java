package com.javabite.config;

import com.javabite.service.CustomUserDetailsService;
import com.javabite.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // Skip JWT check for public endpoints
        if (shouldSkipAuthentication(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        // If no Authorization header, continue (will be handled by Spring Security)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("⚠️ No Bearer token found for: " + request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        String userEmail;

        try {
            userEmail = jwtService.extractUsername(jwt);
            System.out.println("🔍 Extracted email from JWT: " + userEmail);

            // Debug: Print all claims
            System.out.println("📋 JWT Claims:");
            System.out.println("  - Role: " + jwtService.extractClaim(jwt, claims -> claims.get("role", String.class)));
            System.out.println("  - User ID: " + jwtService.extractClaim(jwt, claims -> claims.get("userId")));
            System.out.println("  - Name: " + jwtService.extractClaim(jwt, claims -> claims.get("name", String.class)));

        } catch (Exception ex) {
            System.out.println("❌ Invalid JWT token: " + ex.getMessage());
            ex.printStackTrace();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Invalid JWT token: " + ex.getMessage());
            return;
        }

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
                System.out.println("✅ UserDetails loaded: " + userDetails.getUsername());

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities());

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    System.out.println("🔐 Authentication set for user: " + userEmail);
                    System.out.println("   Authorities: " + userDetails.getAuthorities());
                } else {
                    System.out.println("❌ JWT token invalid for user: " + userEmail);
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("Invalid JWT token");
                    return;
                }
            } catch (Exception ex) {
                System.out.println("❌ JWT validation failed for " + userEmail + ": " + ex.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Authentication failed");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean shouldSkipAuthentication(HttpServletRequest request) {
        String path = request.getServletPath();
        String method = request.getMethod();

        return path.startsWith("/api/auth") ||
                path.startsWith("/swagger") ||
                path.startsWith("/v3") ||
                path.startsWith("/uploads") ||
                (path.startsWith("/api/menu") && "GET".equalsIgnoreCase(method)) ||
                path.equals("/api/payment/debug-auth") ||
                path.equals("/api/payment/health");
    }
}