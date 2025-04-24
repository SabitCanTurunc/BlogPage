package com.tirbuson.mapper;

import com.tirbuson.dto.request.UserRequestDto;
import com.tirbuson.dto.response.UserResponseDto;
import com.tirbuson.model.Image;
import com.tirbuson.model.User;
import com.tirbuson.service.ImageService;
import org.springframework.stereotype.Component;

@Component
public class UserMapper implements BaseMapper<User, UserResponseDto, UserRequestDto> {

    private final ImageService imageService;

    public UserMapper(ImageService imageService) {
        this.imageService = imageService;
    }

    @Override
    public User convertToEntity(UserRequestDto dto) {
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setUsername(dto.getUsername());
        user.setRole(dto.getRole());
        user.setPassword(dto.getPassword());
        
        if (dto.getProfileImageUrl() != null) {
            Image profileImage = new Image();
            profileImage.setUrl(dto.getProfileImageUrl());
            user.setProfileImage(profileImage);
        }
        
        return user;
    }

    @Override
    public UserResponseDto convertToDto(User entity) {
        UserResponseDto dto = new UserResponseDto();
        dto.setId(entity.getId());
        dto.setEmail(entity.getEmail());
        dto.setUsername(entity.getUsername());
        dto.setRole(entity.getRole());
        dto.setEnabled(entity.isEnabled());
        dto.setName(entity.getName());
        dto.setSurname(entity.getSurname());
        dto.setPhoneNumber(entity.getPhoneNumber());
        dto.setGender(entity.getGender());
        dto.setDescription(entity.getDescription());
        dto.setSubscriptionPlan(entity.getSubscriptionPlan());
        
        if (entity.getProfileImage() != null) {
            dto.setProfileImageUrl(entity.getProfileImage().getUrl());
        }
        
        return dto;
    }
}
