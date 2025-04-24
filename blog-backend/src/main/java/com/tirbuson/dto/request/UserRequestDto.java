package com.tirbuson.dto.request;

import com.tirbuson.dto.BaseDto;
import com.tirbuson.model.enums.Gender;
import com.tirbuson.model.enums.Role;
import com.tirbuson.model.enums.SubscriptionPlan;
import jakarta.validation.constraints.Email;
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

    @NotBlank(message = "Email can not be empty")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password can not be empty")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Username can not be empty")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    private String name;
    private String surname;
    private String phoneNumber;
    private Gender gender;
    private String description;

    private Role role;
    private String profileImageUrl;
    private SubscriptionPlan subscriptionPlan;

}
