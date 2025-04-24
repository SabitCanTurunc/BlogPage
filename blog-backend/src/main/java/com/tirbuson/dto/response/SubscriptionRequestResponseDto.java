package com.tirbuson.dto.response;

import com.tirbuson.dto.BaseDto;
import com.tirbuson.model.enums.RequestStatus;
import com.tirbuson.model.enums.SubscriptionPlan;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionRequestResponseDto extends BaseDto {
    private Integer id;
    private Integer userId;
    private String username;
    private String email;
    private SubscriptionPlan currentPlan;
    private SubscriptionPlan requestedPlan;
    private LocalDateTime requestDate;
    private LocalDateTime processDate;
    private String adminNote;
    private RequestStatus status;
    private String message; // Kullanıcının mesajı
} 