package com.tirbuson.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponseDto  {
    private String token;
    private long expiresIn;

    public LoginResponseDto(String token, long expiresIn) {
        this.token = token;
        this.expiresIn = expiresIn;
    }
}
