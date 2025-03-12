package com.tirbuson.controller;

import com.tirbuson.dto.VerifyUserDto;
import com.tirbuson.dto.request.UserRequestDto;
import com.tirbuson.dto.response.LoginResponseDto;
import com.tirbuson.model.User;
import com.tirbuson.service.AuthenticationService;
import com.tirbuson.service.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/auth")
@RestController
public class AuthenticationController {
    private final JwtService jwtService;
    private final AuthenticationService authenticationService;

    public AuthenticationController(JwtService jwtService, AuthenticationService authenticationService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
    }

    @PostMapping("/signup")
    public ResponseEntity<User> registerUser(@RequestBody UserRequestDto userRequestDto) {
        User registeredUSer = authenticationService.signup(userRequestDto);
        return ResponseEntity.ok(registeredUSer);

    }
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> authenticate(@RequestBody UserRequestDto userRequestDto) {
        User authenticatedUser = authenticationService.authenticate(userRequestDto);
        String jwtToken = jwtService.generateToken(authenticatedUser);
        LoginResponseDto loginResponseDto = new LoginResponseDto(jwtToken,jwtService.getJwtExpirationTime());
        return ResponseEntity.ok(loginResponseDto);
    }
    @PostMapping("/verify")
    public ResponseEntity<?> verifyUSer(@RequestBody VerifyUserDto verifyUserDto) {
        try{
            authenticationService.verifyUser(verifyUserDto);
            return ResponseEntity.ok("Account verified successfully");
        }catch(RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/resend")
    public ResponseEntity<?> resendVerificationCode(@RequestBody String email) {
        try{
            authenticationService.resendVerificationCode(email);
            return ResponseEntity.ok("Verification code resent");
        }catch(RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
