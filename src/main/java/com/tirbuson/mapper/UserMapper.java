package com.tirbuson.mapper;

import com.tirbuson.dto.BaseDto;
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

        // BaseDto'nun doğru türde olduğundan emin olalım.
        if (baseDto instanceof UserRequestDto) {
            UserRequestDto requestDto = (UserRequestDto) baseDto;
            User user = new User();

            // Dönüştürme işlemi
            user.setEmail(requestDto.getEmail());
            user.setRoles(requestDto.getRole());
            user.setUsername(requestDto.getUsername());
            user.setPassword(requestDto.getPassword());

            // Tarih bilgisi varsa ekleyebilirsiniz
            // user.setCreatedAt(requestDto.getCreatedAt());
            // user.setUpdatedAt(requestDto.getUpdatedAt());

            return user;
        }

        // Eğer baseDto beklenen türde değilse, null döndür.
        return null;
    }

    @Override
    public UserResponseDto convertToDto(User entity) {
        if (entity == null) return null;

        UserResponseDto responseDto = new UserResponseDto();
        responseDto.setEmail(entity.getEmail());
        responseDto.setUsername(entity.getUsername());
        responseDto.setRole(entity.getRoles());
        return responseDto;
    }
}
