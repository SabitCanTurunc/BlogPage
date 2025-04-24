package com.tirbuson.mapper;

import com.tirbuson.dto.request.SubscriptionRequestDto;
import com.tirbuson.dto.response.SubscriptionRequestResponseDto;
import com.tirbuson.model.SubscriptionRequest;
import com.tirbuson.model.User;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class SubscriptionRequestMapper {
    
    public SubscriptionRequest convertToEntity(SubscriptionRequestDto dto, User user) {
        SubscriptionRequest entity = new SubscriptionRequest();
        entity.setUser(user);
        entity.setCurrentPlan(user.getSubscriptionPlan());
        entity.setRequestedPlan(dto.getRequestedPlan());
        entity.setRequestDate(LocalDateTime.now());
        return entity;
    }
    
    public SubscriptionRequestResponseDto convertToDto(SubscriptionRequest entity) {
        SubscriptionRequestResponseDto dto = new SubscriptionRequestResponseDto();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUser().getId());
        dto.setUsername(entity.getUser().getUsername());
        dto.setEmail(entity.getUser().getEmail());
        dto.setCurrentPlan(entity.getCurrentPlan());
        dto.setRequestedPlan(entity.getRequestedPlan());
        dto.setRequestDate(entity.getRequestDate());
        dto.setProcessDate(entity.getProcessDate());
        dto.setAdminNote(entity.getAdminNote());
        dto.setStatus(entity.getStatus());
        return dto;
    }
} 