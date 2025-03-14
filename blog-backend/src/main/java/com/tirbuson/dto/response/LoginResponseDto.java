package com.tirbuson.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponseDto {
    private int status;
    private CustomException customException;
    private String token;
    private long expiresIn;

    public LoginResponseDto(String token, long expiresIn) {
        this.status = 200;
        this.token = token;
        this.expiresIn = expiresIn;
    }
}
