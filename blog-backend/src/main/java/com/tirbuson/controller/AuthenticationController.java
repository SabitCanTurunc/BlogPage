package com.tirbuson.controller;

import com.tirbuson.dto.VerifyUserDto;
import com.tirbuson.dto.request.PasswordResetRequestDto;
import com.tirbuson.dto.request.UserRequestDto;
import com.tirbuson.dto.response.LoginResponseDto;
import com.tirbuson.dto.response.VerificationResponseDto;
import com.tirbuson.dto.response.CustomException;
import com.tirbuson.exception.BaseException;
import com.tirbuson.exception.ErrorMessage;
import com.tirbuson.exception.MessageType;
import com.tirbuson.mapper.UserMapper;
import com.tirbuson.model.User;
import com.tirbuson.service.AuthenticationService;
import com.tirbuson.service.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;

import java.util.Map;
import java.util.HashMap;

@RequestMapping("/auth")
@RestController
public class AuthenticationController {
    private final JwtService jwtService;
    private final AuthenticationService authenticationService;
    private final UserMapper userMapper;

    public AuthenticationController(JwtService jwtService, AuthenticationService authenticationService, UserMapper userMapper) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
        this.userMapper = userMapper;
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
    public ResponseEntity<?> verify(@RequestBody VerifyUserDto verifyUserDto) {
        User user = authenticationService.verifyUser(verifyUserDto);

        return ResponseEntity.ok(userMapper.convertToDto(user));
    }

    @PostMapping("/resend")
    public ResponseEntity<VerificationResponseDto> resendVerificationCode(@RequestBody Map<String, String> payload) {
        try {
            String email = payload.get("email");
            authenticationService.resendVerificationCode(email);
            return ResponseEntity.ok(new VerificationResponseDto("Doğrulama kodu başarıyla tekrar gönderildi", true));
        } catch (Exception e) {
            throw new BaseException(new ErrorMessage(MessageType.GENERAL_EXCEPTION,e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<VerificationResponseDto> forgotPassword(@RequestBody Map<String, String> payload) {

            String email = payload.get("email");
            authenticationService.sendPasswordResetCode(email);
            return ResponseEntity.ok(new VerificationResponseDto("Şifre sıfırlama kodu başarıyla gönderildi", true));

    }

    @PostMapping("/reset-password")
    public ResponseEntity<VerificationResponseDto> resetPassword(@RequestBody PasswordResetRequestDto payload) {
            String email = payload.email;
            String verificationCode = payload.verificatonCode;
            String newPassword = payload.newPassword;

            authenticationService.resetPassword(email, verificationCode, newPassword);
            return ResponseEntity.ok(new VerificationResponseDto("Şifreniz başarıyla sıfırlandı", true));

    }
}
