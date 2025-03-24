package com.tirbuson.dto.request;

import com.tirbuson.dto.BaseDto;
import jakarta.validation.constraints.NotBlank;

public class PasswordResetRequestDto extends BaseDto {

    @NotBlank(message = "Email can not be empty !")
    public String email;

    @NotBlank(message = "VerificatonCodecan not be empty !")
    public String verificatonCode;

    @NotBlank(message = "New passsword can not be empty !")
    public String newPassword;
}
