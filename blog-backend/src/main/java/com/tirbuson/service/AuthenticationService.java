package com.tirbuson.service;

import com.tirbuson.dto.VerifyUserDto;
import com.tirbuson.dto.request.UserRequestDto;
import com.tirbuson.exception.BaseException;
import com.tirbuson.exception.ErrorMessage;
import com.tirbuson.exception.MessageType;
import com.tirbuson.mapper.UserMapper;
import com.tirbuson.model.User;
import com.tirbuson.model.enums.Role;
import com.tirbuson.repository.UserRepository;
import jakarta.mail.MessagingException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final UserMapper userMapper;
    private final UserService userService;


    public AuthenticationService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, EmailService emailService, UserMapper userMapper, UserService userService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
        this.userMapper = userMapper;
        this.userService = userService;
    }

    @Transactional
    public User signup(UserRequestDto userRequestDto) {
        try {
            if (userRepository.findByEmail(userRequestDto.getEmail()).isPresent()) {
                throw new BaseException("Email address is already registered.");
            }
            if (userRepository.findByUsername(userRequestDto.getUsername()).isPresent()) {
                throw new BaseException("Username is already taken.");
            }

            User user = userMapper.convertToEntity(userRequestDto);
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            user.setVerificationCode(generateVerificationCode());
            user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
            user.setEnabled(false);
            user.setRole(Role.USER); // Varsayılan rol ataması

            sendVerificationEmail(user);
            return userService.save(user);
        } catch (Exception e) {
            throw new BaseException("Registration failed: " + e.getMessage());
        }
    }

    public User authenticate(UserRequestDto input){
        User user = userRepository.findByEmail(input.getEmail())
                .orElseThrow(() -> new BaseException("Invalid email or password"));
        
        if(!user.isEnabled()) {
            throw new BaseException("UNVERIFIED_USER");
        }
        
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            input.getEmail(),
                            input.getPassword()
                    )
            );
        } catch (Exception e) {
            throw new BaseException("Invalid email or password");
        }
        return user;
    }

    public void verifyUser(VerifyUserDto input) {
        System.out.println("Doğrulama isteği alındı: Email=" + input.getEmail() + ", Kod=" + input.getVerificationCode());
        
        Optional<User> optionalUser = userRepository.findByEmail(input.getEmail());
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            LocalDateTime expiresAt = user.getVerificationCodeExpiresAt();
            String storedCode = user.getVerificationCode();
            
            System.out.println("Kullanıcı bilgileri: Enabled=" + user.isEnabled() + ", StoredCode=" + storedCode + ", ExpiresAt=" + expiresAt);

            if (user.isEnabled() && expiresAt == null) {
                System.out.println("Hata: Kullanıcı zaten doğrulanmış");
                throw new BaseException("Bu e-posta adresi zaten doğrulanmış.");
            }

            if (expiresAt == null) {
                System.out.println("Hata: Doğrulama kodu yok");
                throw new BaseException("Bu e-posta adresi için doğrulama kodu oluşturulmamış: " + input.getEmail());
            }

            if (expiresAt.isBefore(LocalDateTime.now())) {
                System.out.println("Hata: Doğrulama kodu süresi dolmuş");
                throw new BaseException("Doğrulama kodunun süresi dolmuş. Lütfen yeni bir kod talep edin.");
            }

            if (storedCode.equals(input.getVerificationCode())) {
                System.out.println("Doğrulama başarılı: Kod eşleşti");
                user.setEnabled(true);
                user.setVerificationCode(null);
                user.setVerificationCodeExpiresAt(null);
                userRepository.save(user);
            } else {
                System.out.println("Hata: Yanlış doğrulama kodu. Beklenen=" + storedCode + ", Gelen=" + input.getVerificationCode());
                if (storedCode.trim().equalsIgnoreCase(input.getVerificationCode().trim())) {
                    System.out.println("Ama case-insensitive veya trim edilmiş haliyle eşleşiyor, doğrulama kabul ediliyor");
                    user.setEnabled(true);
                    user.setVerificationCode(null);
                    user.setVerificationCodeExpiresAt(null);
                    userRepository.save(user);
                } else {
                    throw new BaseException("Yanlış doğrulama kodu. Lütfen tekrar deneyin.");
                }
            }
        } else {
            System.out.println("Hata: Kullanıcı bulunamadı - " + input.getEmail());
            throw new BaseException("Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı: " + input.getEmail());
        }
    }

    public void resendVerificationCode(String email){
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if(optionalUser.isPresent()){
            User user = optionalUser.get();
            if(user.isEnabled()) {
                throw new BaseException("Bu hesap zaten doğrulanmış.");
            }
            user.setVerificationCode(generateVerificationCode());
            user.setVerificationCodeExpiresAt(LocalDateTime.now().plusHours(1));
            sendVerificationEmail(user);
            userRepository.save(user);
        }else{
            throw new BaseException("Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı: " + email);
        }
    }

    public void sendVerificationEmail(User user){
        String subject ="AccountVerification";
        String verificationCode = user.getVerificationCode();
        String htmlMessage = "<html>"
                + "<body style=\"font-family: Arial, sans-serif;\">"
                + "<div style=\"background-color: #f5f5f5; padding: 20px;\">"
                + "<h2 style=\"color: #333;\">Welcome to myBLogApp !</h2>"
                + "<p style=\"font-size: 16px;\">Please enter the verification code below to continue:</p>"
                + "<div style=\"background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);\">"
                + "<h3 style=\"color: #333;\">Verification Code:</h3>"
                + "<p style=\"font-size: 18px; font-weight: bold; color: #007bff;\">" + verificationCode + "</p>"
                + "</div>"
                + "</div>"
                + "</body>"
                + "</html>";
        try{
            emailService.sendVerificationEmail(user.getEmail(),subject, htmlMessage);

        }catch(MessagingException e){
            throw new BaseException(new ErrorMessage(MessageType.EMAIL_SENDING_FAILED,  user.getEmail()));
        }
    }

    private String generateVerificationCode(){
        Random random = new Random();
        int code = random.nextInt(900000)+100000;
        return String.valueOf(code);
    }

    // Şifre sıfırlama işlemi için kod gönderme
    public void sendPasswordResetCode(String email) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if(optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setVerificationCode(generateVerificationCode());
            user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
            sendPasswordResetEmail(user);
            userRepository.save(user);
        } else {
            throw new BaseException("Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı: " + email);
        }
    }

    // Şifre sıfırlama e-postası gönderme
    private void sendPasswordResetEmail(User user) {
        String subject = "Password Reset";
        String verificationCode = user.getVerificationCode();
        String htmlMessage = "<html>"
                + "<body style=\"font-family: Arial, sans-serif;\">"
                + "<div style=\"background-color: #f5f5f5; padding: 20px;\">"
                + "<h2 style=\"color: #333;\">myBLogApp Password Reset</h2>"
                + "<p style=\"font-size: 16px;\">Please enter the verification code below to reset your password:</p>"
                + "<div style=\"background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);\">"
                + "<h3 style=\"color: #333;\">Verification Code:</h3>"
                + "<p style=\"font-size: 18px; font-weight: bold; color: #007bff;\">" + verificationCode + "</p>"
                + "</div>"
                + "</div>"
                + "</body>"
                + "</html>";
        try {
            emailService.sendVerificationEmail(user.getEmail(), subject, htmlMessage);
        } catch(MessagingException e) {
            throw new BaseException(new ErrorMessage(MessageType.EMAIL_SENDING_FAILED, user.getEmail()));
        }
    }

    // Şifre sıfırlama kodunu doğrulama ve şifreyi güncelleme
    public void resetPassword(String email, String verificationCode, String newPassword) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            LocalDateTime expiresAt = user.getVerificationCodeExpiresAt();

            if (expiresAt == null) {
                throw new BaseException("Bu e-posta adresi için şifre sıfırlama talebi oluşturulmamış.");
            }

            if (expiresAt.isBefore(LocalDateTime.now())) {
                throw new BaseException("Doğrulama kodunun süresi dolmuş. Lütfen yeni bir kod talep edin.");
            }

            if (user.getVerificationCode().equals(verificationCode)) {
                // Şifreyi güncelle
                user.setPassword(passwordEncoder.encode(newPassword));
                user.setVerificationCode(null);
                user.setVerificationCodeExpiresAt(null);
                userRepository.save(user);
            } else {
                throw new BaseException("Yanlış doğrulama kodu. Lütfen tekrar deneyin.");
            }
        } else {
            throw new BaseException("Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı: " + email);
        }
    }
}
