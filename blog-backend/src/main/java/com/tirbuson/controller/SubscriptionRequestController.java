package com.tirbuson.controller;

import com.tirbuson.dto.request.SubscriptionRequestDto;
import com.tirbuson.dto.response.SubscriptionRequestResponseDto;
import com.tirbuson.service.SubscriptionRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/subscription-request")
public class SubscriptionRequestController {

    private final SubscriptionRequestService subscriptionRequestService;

    public SubscriptionRequestController(SubscriptionRequestService subscriptionRequestService) {
        this.subscriptionRequestService = subscriptionRequestService;
    }

    @PostMapping("/create")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SubscriptionRequestResponseDto> createSubscriptionRequest(
            @RequestBody SubscriptionRequestDto subscriptionRequestDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        SubscriptionRequestResponseDto response = subscriptionRequestService.createRequest(email, subscriptionRequestDto);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/user-requests")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SubscriptionRequestResponseDto>> getUserRequests() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        List<SubscriptionRequestResponseDto> requests = subscriptionRequestService.getUserRequests(email);
        return ResponseEntity.ok(requests);
    }
    
    @PostMapping("/cancel/{requestId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> cancelRequest(@PathVariable Integer requestId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        Map<String, Object> response = subscriptionRequestService.cancelRequest(requestId, email);
        return ResponseEntity.ok(response);
    }
    
    // Admin işlemleri
    
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SubscriptionRequestResponseDto>> getAllPendingRequests() {
        List<SubscriptionRequestResponseDto> pendingRequests = subscriptionRequestService.getAllPendingRequests();
        return ResponseEntity.ok(pendingRequests);
    }
    
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SubscriptionRequestResponseDto>> getAllRequests() {
        List<SubscriptionRequestResponseDto> allRequests = subscriptionRequestService.getAllRequests();
        return ResponseEntity.ok(allRequests);
    }
    
    @PostMapping("/process/{requestId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SubscriptionRequestResponseDto> processRequest(
            @PathVariable Integer requestId,
            @RequestBody Map<String, Object> requestBody) {
        
        boolean approved = (boolean) requestBody.get("approved");
        String adminNote = (String) requestBody.get("adminNote");
        
        SubscriptionRequestResponseDto response = subscriptionRequestService.processRequest(requestId, approved, adminNote);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{requestId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> deleteRejectedRequest(@PathVariable Integer requestId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        Map<String, Object> response = subscriptionRequestService.deleteRejectedRequest(requestId, email);
        return ResponseEntity.ok(response);
    }
} 