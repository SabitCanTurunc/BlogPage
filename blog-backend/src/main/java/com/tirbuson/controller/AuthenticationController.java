package com.tirbuson.controller;

import com.tirbuson.dto.VerifyUserDto;
import com.tirbuson.dto.request.UserRequestDto;
import com.tirbuson.dto.response.LoginResponseDto;
import com.tirbuson.dto.response.VerificationResponseDto;
import com.tirbuson.dto.response.CustomException;
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
        try {
            User authenticatedUser = authenticationService.authenticate(userRequestDto);
            String jwtToken = jwtService.generateToken(authenticatedUser);
            LoginResponseDto loginResponseDto = new LoginResponseDto(jwtToken, jwtService.getJwtExpirationTime());
            return ResponseEntity.ok(loginResponseDto);
        } catch (RuntimeException e) {
            LoginResponseDto errorResponse = new LoginResponseDto();
            errorResponse.setStatus(400);
            CustomException customException = new CustomException(
                "GAMZE",
                "uri=/auth/login",
                java.time.LocalDateTime.now().toString(),
                e.getMessage()
            );
            errorResponse.setCustomException(customException);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    @PostMapping("/verify")
    public ResponseEntity<VerificationResponseDto> verifyUSer(@RequestBody VerifyUserDto verifyUserDto) {
        try{
            authenticationService.verifyUser(verifyUserDto);
            return ResponseEntity.ok(new VerificationResponseDto("Account verified successfully", true));
        }catch(RuntimeException e){
            return ResponseEntity.badRequest().body(new VerificationResponseDto(e.getMessage(), false));
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
