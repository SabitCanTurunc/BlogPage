package com.tirbuson.dto.request;

import com.tirbuson.dto.BaseDto;
import com.tirbuson.model.enums.Gender;
import com.tirbuson.model.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRequestDto extends BaseDto {

    @NotBlank(message = "name can not be empty")
    @Size(min = 2, max = 50, message = "name should be betweeen 2 and 50 characters ")
    private String username;

    private String name;
    private String surname;
    private String phoneNumber;
    private Gender gender;
    private String description;

    @NotBlank(message = "name can not be empty")
    @Size(min = 2, max = 50, message = "name should be betweeen 2 and 50 characters ")
    private String email;

    @NotBlank(message = "password can not be empty")
    private String password;
    private Role role;

}
