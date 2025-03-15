package com.tirbuson.dto.response;

import com.tirbuson.dto.BaseDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponseDto extends BaseDto {
    private Integer id;
    private String comment;
    private Integer postId;
    private String userEmail;
    private String username;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 