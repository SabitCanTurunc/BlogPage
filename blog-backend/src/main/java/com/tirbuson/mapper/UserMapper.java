package com.tirbuson.mapper;

import com.tirbuson.dto.request.UserRequestDto;
import com.tirbuson.dto.response.UserResponseDto;
import com.tirbuson.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper implements BaseMapper<User, UserResponseDto,UserRequestDto> {


    @Override
    public User convertToEntity(UserRequestDto baseDto) {
        if (baseDto == null) {
            System.out.println("baseDto is null");
            return null;
        }

        User user = new User();
        user.setRole(baseDto.getRole());
        user.setUsername(baseDto.getUsername());
        user.setEmail(baseDto.getEmail());
        user.setPassword(baseDto.getPassword());
        user.setName(baseDto.getName());
        user.setSurname(baseDto.getSurname());
        user.setPhoneNumber(baseDto.getPhoneNumber());
        user.setGender(baseDto.getGender());
        user.setDescription(baseDto.getDescription());

        return user;
    }

    @Override
    public UserResponseDto convertToDto(User entity) {
        if (entity == null) return null;

        UserResponseDto responseDto = new UserResponseDto();
        responseDto.setId(entity.getId());
        responseDto.setUsername(entity.getUsername());
        responseDto.setRole(entity.getRole());
        responseDto.setEmail(entity.getEmail());
        responseDto.setEnabled(entity.isEnabled());
        responseDto.setName(entity.getName());
        responseDto.setSurname(entity.getSurname());
        responseDto.setPhoneNumber(entity.getPhoneNumber());
        responseDto.setGender(entity.getGender());
        responseDto.setDescription(entity.getDescription());
        return responseDto;
    }
}
