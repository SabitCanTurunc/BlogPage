package com.tirbuson.dto.request;

import com.tirbuson.dto.BaseDto;
import com.tirbuson.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRequestDto extends BaseDto {

    private String username;
    private String email;
    private String password;
    private Role role;

}
