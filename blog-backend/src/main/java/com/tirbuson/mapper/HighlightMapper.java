package com.tirbuson.mapper;

import com.tirbuson.dto.HighlightRequestDto;
import com.tirbuson.dto.HighlightResponseDto;
import com.tirbuson.model.Highlights;
import com.tirbuson.model.Image;
import org.springframework.stereotype.Component;

@Component
public class HighlightMapper implements BaseMapper<Highlights, HighlightResponseDto, HighlightRequestDto> {

    @Override
    public HighlightResponseDto convertToDto(Highlights entity) {
        if (entity == null) {
            return null;
        }
        
        HighlightResponseDto dto = new HighlightResponseDto();
        dto.setId(entity.getId());
        
        if (entity.getPost() != null) {
            dto.setPostId(entity.getPost().getId());
            dto.setPostTitle(entity.getPost().getTitle());
            
            // Post içeriğinin ilk 100 karakterini al
            String content = entity.getPost().getContent();
            if (content != null && content.length() > 100) {
                content = content.substring(0, 100) + "...";
            }
            dto.setPostContent(content);
        }
        
        if (entity.getUser() != null) {
            dto.setUserId(entity.getUser().getId());
            dto.setUserName(entity.getUser().getName());
            dto.setUserEmail(entity.getUser().getEmail());
            
            // Profile image URL
            Image profileImage = entity.getUser().getProfileImage();
            String profileImageUrl = (profileImage != null) ? profileImage.getUrl() : null;
            dto.setUserProfileImage(profileImageUrl);
        }
        
        dto.setSeen(entity.isSeen());
        dto.setActive(entity.isActive());
        dto.setHighlightDate(entity.getHighlightDate());
        dto.setExpiresAt(entity.getExpiresAt());
        
        return dto;
    }

    @Override
    public Highlights convertToEntity(HighlightRequestDto dto) {
        // Not implemented directly as we need User and Post references 
        // These are handled in the service
        Highlights highlight = new Highlights();
        highlight.setActive(true);
        highlight.setSeen(false);
        
        // Expires at time will be set in the @PrePersist method
        return highlight;
    }
}