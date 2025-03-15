package com.tirbuson.dto.request;

import com.tirbuson.dto.BaseDto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentRequestDto extends BaseDto {
    
    @NotBlank(message = "Yorum içeriği boş olamaz")
    private String comment;
    
    @NotNull(message = "Post ID boş olamaz")
    private Integer postId;
    
    private String userEmail;
} 