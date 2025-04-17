package com.tirbuson.dto.response;

import com.tirbuson.dto.BaseDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HighlightResponseDto extends BaseDto {
    private Integer id;
    private Integer postId;
    private String postTitle;
    private String postContent;
    private String postImageUrl;
    private Integer userId;
    private String userName;
    private String userEmail;
    private String userProfileImage;
    private boolean isSeen;
    private boolean isActive;
    private LocalDateTime highlightDate;
    private LocalDateTime expiresAt;
}