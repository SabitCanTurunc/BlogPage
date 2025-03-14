package com.tirbuson.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerificationResponseDto {
    private String message;
    private boolean success;

    public VerificationResponseDto(String message, boolean success) {
        this.message = message;
        this.success = success;
    }
} 