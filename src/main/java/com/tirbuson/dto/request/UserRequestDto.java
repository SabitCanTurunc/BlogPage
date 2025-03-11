package com.tirbuson.dto.request;

import com.tirbuson.dto.BaseDto;
import com.tirbuson.model.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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

    @NotBlank(message = "name can not be empty")
    @Size(min = 2, max = 50, message = "name should be betweeen 2 and 50 characters ")
    private String username;



    @NotBlank(message = "password can not be empty")
    private String password;
    private Role role;

}
