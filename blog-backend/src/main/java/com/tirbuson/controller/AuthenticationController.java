package com.tirbuson.controller;

import com.tirbuson.dto.VerifyUserDto;
import com.tirbuson.dto.request.UserRequestDto;
import com.tirbuson.dto.response.LoginResponseDto;
import com.tirbuson.dto.response.VerificationResponseDto;
import com.tirbuson.dto.response.CustomException;
import com.tirbuson.exception.BaseException;
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
    public ResponseEntity<?> verify(@RequestBody VerifyUserDto verifyUserDto) {
        try {
            System.out.println("Verify endpoint çağrıldı: " + verifyUserDto.getEmail() + ", Kod: " + verifyUserDto.getVerificationCode());
            authenticationService.verifyUser(verifyUserDto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Hesabınız başarıyla doğrulandı");
            
            System.out.println("Doğrulama başarılı: " + verifyUserDto.getEmail());
            return ResponseEntity.ok(response);
        } catch (BaseException e) {
            System.out.println("BaseException yakalandı: " + e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (RuntimeException e) {
            System.out.println("RuntimeException yakalandı: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Doğrulama işlemi sırasında bir hata oluştu: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/resend")
    public ResponseEntity<VerificationResponseDto> resendVerificationCode(@RequestBody Map<String, String> payload) {
        try{
            String email = payload.get("email");
            authenticationService.resendVerificationCode(email);
            return ResponseEntity.ok(new VerificationResponseDto("Doğrulama kodu başarıyla tekrar gönderildi", true));
        } catch(BaseException e) {
            // BaseException özel olarak işlenir
            return ResponseEntity.badRequest().body(new VerificationResponseDto(e.getMessage(), false));
        } catch(RuntimeException e) {
            // Diğer hatalar için
            return ResponseEntity.badRequest().body(new VerificationResponseDto("Kod gönderilirken bir hata oluştu: " + e.getMessage(), false));
        }
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<VerificationResponseDto> forgotPassword(@RequestBody Map<String, String> payload) {
        try {
            String email = payload.get("email");
            authenticationService.sendPasswordResetCode(email);
            return ResponseEntity.ok(new VerificationResponseDto("Şifre sıfırlama kodu başarıyla gönderildi", true));
        } catch(BaseException e) {
            return ResponseEntity.badRequest().body(new VerificationResponseDto(e.getMessage(), false));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new VerificationResponseDto("Şifre sıfırlama kodu gönderilirken bir hata oluştu: " + e.getMessage(), false));
        }
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<VerificationResponseDto> resetPassword(@RequestBody Map<String, String> payload) {
        try {
            String email = payload.get("email");
            String verificationCode = payload.get("verificationCode");
            String newPassword = payload.get("newPassword");
            
            authenticationService.resetPassword(email, verificationCode, newPassword);
            return ResponseEntity.ok(new VerificationResponseDto("Şifreniz başarıyla sıfırlandı", true));
        } catch(BaseException e) {
            return ResponseEntity.badRequest().body(new VerificationResponseDto(e.getMessage(), false));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new VerificationResponseDto("Şifre sıfırlanırken bir hata oluştu: " + e.getMessage(), false));
        }
    }
}
