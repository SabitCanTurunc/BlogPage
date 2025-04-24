package com.tirbuson.dto.request;

import com.tirbuson.dto.BaseDto;
import com.tirbuson.model.enums.SubscriptionPlan;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionRequestDto extends BaseDto {
    
    @NotNull(message = "Talep edilen abonelik planı belirtilmelidir")
    private SubscriptionPlan requestedPlan;
    
    private String message; // Kullanıcının yükseltme talebi için isteğe bağlı açıklaması
} 