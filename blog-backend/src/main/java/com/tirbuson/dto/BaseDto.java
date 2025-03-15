package com.tirbuson.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public abstract class BaseDto {
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
