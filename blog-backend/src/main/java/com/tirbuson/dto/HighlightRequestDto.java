package com.tirbuson.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HighlightRequestDto extends BaseDto {
    @NotNull(message = "Post ID zorunludur")
    private Integer postId;
}