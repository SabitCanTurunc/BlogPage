package com.tirbuson.dto.response;

import com.tirbuson.dto.BaseDto;
import com.tirbuson.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto extends BaseDto {
    private Integer id;
    private String username;
    private String email;
    private Role role;

}
