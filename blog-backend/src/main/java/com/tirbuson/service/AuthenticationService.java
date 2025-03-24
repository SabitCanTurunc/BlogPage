package com.tirbuson.service;

import com.tirbuson.dto.VerifyUserDto;
import com.tirbuson.dto.request.UserRequestDto;
import com.tirbuson.exception.BaseException;
import com.tirbuson.exception.MessageType;
import com.tirbuson.mapper.UserMapper;
import com.tirbuson.model.User;
import com.tirbuson.model.enums.Role;
import com.tirbuson.repository.UserRepository;
import jakarta.mail.MessagingException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
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
                throw new BaseException(MessageType.EMAIL_ALREADY_EXISTS);
            }
            if (userRepository.findByUsername(userRequestDto.getUsername()).isPresent()) {
                throw new BaseException(MessageType.USERNAME_ALREADY_EXISTS);
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
            if (e instanceof BaseException) {
                throw e;
            }
            throw new BaseException(MessageType.PROCESS_FAILED, e.getMessage());
        }
    }

    public User authenticate(UserRequestDto input){
        User user = userRepository.findByEmail(input.getEmail())
                .orElseThrow(() -> new BaseException(MessageType.INVALID_CREDENTIALS));
        
        if(!user.isEnabled()) {
            throw new BaseException(MessageType.EMAIL_NOT_VERIFIED);
        }
        
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            input.getEmail(),
                            input.getPassword()
                    )
            );
        } catch (Exception e) {
            throw new BaseException(MessageType.INVALID_CREDENTIALS);
        }
        return user;
    }

    public User verifyUser(VerifyUserDto input) {

        User user = userRepository.findByEmail(input.getEmail())
                .orElseThrow(() -> new BaseException(MessageType.NO_RECORD_EXIST));

            LocalDateTime expiresAt = user.getVerificationCodeExpiresAt();
            String storedCode = user.getVerificationCode();
            

            if (user.isEnabled() && expiresAt == null) {
                throw new BaseException(MessageType.ALREADY_VERIFIED);
            }

            if (expiresAt == null) {
                throw new BaseException(MessageType.VERIFICATION_CODE_NOT_SET);
            }

            if (expiresAt.isBefore(LocalDateTime.now())) {
                throw new BaseException(MessageType.CODE_EXPIRED,expiresAt.toString());
            }

            if (storedCode.equals(input.getVerificationCode())) {
                System.out.println("Doğrulama başarılı: Kod eşleşti");
                user.setEnabled(true);
                user.setVerificationCode(null);
                user.setVerificationCodeExpiresAt(null);
                userRepository.save(user);
                return user;
            } else {
                throw new BaseException(MessageType.INVALID_VERIFICATION_CODE);
            }

    }

    public void resendVerificationCode(String email){
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if(optionalUser.isPresent()){
            User user = optionalUser.get();
            if(user.isEnabled()) {
                throw new BaseException(MessageType.ALREADY_VERIFIED);
            }
            user.setVerificationCode(generateVerificationCode());
            user.setVerificationCodeExpiresAt(LocalDateTime.now().plusHours(1));
            sendVerificationEmail(user);
            userRepository.save(user);
        }else{
            throw new BaseException(MessageType.USER_NOT_FOUND, email);
        }
    }

    public void sendVerificationEmail(User user){
        String subject ="NeoWrite Hesap Doğrulama";
        String verificationCode = user.getVerificationCode();
        String htmlMessage = "<html>"
                + "<head>"
                + "<meta charset=\"UTF-8\">"
                + "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">"
                + "</head>"
                + "<body style=\"font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f2f2f2;\">"
                + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">"
                + "<tr><td align=\"center\" style=\"padding: 20px;\">"
                + "<table style=\"max-width: 600px; width: 100%; border-spacing: 0; border-collapse: collapse;\">"
                
                // Header - Standart tablo yapısı ve doğrudan bgcolor özelliği ile
                + "<tr>"
                + "<td style=\"background-color: #2e0c43; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;\">"
                + "<div style=\"font-family: Arial, sans-serif; font-size: 4rem; font-weight: 800; color: white; letter-spacing: -2px; text-shadow: 0 0 15px rgba(255, 255, 255, 0.7);\">NeoWrite</div>"
                + "</td>"
                + "</tr>"
                
                // İçerik
                + "<tr>"
                + "<td style=\"background-color: #1e1e30; padding: 30px; color: white; border-radius: 0 0 12px 12px;\">"
                + "<h2 style=\"color: #ffffff; margin-bottom: 20px;\">Merhaba " + user.getUsername() + ",</h2>"
                + "<p style=\"margin-bottom: 20px; line-height: 1.6;\">NeoWrite'a hoş geldiniz! Hesabınızı doğrulamak için aşağıdaki kodu kullanabilirsiniz:</p>"
                + "<div style=\"background-color: rgba(40, 40, 80, 0.5); padding: 20px; margin: 20px 0; border-radius: 12px; font-size: 28px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #ffffff; border: 1px solid #ff0088;\">" + verificationCode + "</div>"
                + "<p style=\"margin-bottom: 20px; line-height: 1.6;\">Bu kod 15 dakika içinde geçerliliğini yitirecektir. Lütfen doğrulama işlemini bu süre içinde tamamlayın.</p>"
                + "<p style=\"margin-bottom: 20px; line-height: 1.6;\">Eğer bu işlemi siz yapmadıysanız, lütfen bu e-postayı dikkate almayınız.</p>"
                + "</td>"
                + "</tr>"
                
                // Footer
                + "<tr>"
                + "<td style=\"text-align: center; padding: 20px; color: #666; font-size: 14px;\">"
                + "<p>&copy; " + java.time.Year.now().getValue() + " NeoWrite. Tüm hakları saklıdır.</p>"
                + "</td>"
                + "</tr>"
                
                + "</table>"
                + "</td></tr>"
                + "</table>"
                + "</body>"
                + "</html>";
        try{
            emailService.sendVerificationEmail(user.getEmail(),subject, htmlMessage);

        }catch(MessagingException e){
            throw new BaseException(MessageType.EMAIL_SENDING_FAILED, user.getEmail());
        }
    }

    private String generateVerificationCode(){
        Random random = new Random();
        int code = random.nextInt(900000)+100000;
        return String.valueOf(code);
    }

    // Şifre sıfırlama işlemi için kod gönderme
    public void sendPasswordResetCode(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(()->new BaseException(MessageType.USER_NOT_FOUND,email));
            user.setVerificationCode(generateVerificationCode());
            user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
            sendPasswordResetEmail(user);
            userRepository.save(user);

    }

    // Şifre sıfırlama e-postası gönderme
    private void sendPasswordResetEmail(User user) {
        String subject = "NeoWrite Şifre Sıfırlama";
        String verificationCode = user.getVerificationCode();
        String htmlMessage = "<html>"
                + "<head>"
                + "<meta charset=\"UTF-8\">"
                + "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">"
                + "</head>"
                + "<body style=\"font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f2f2f2;\">"
                + "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">"
                + "<tr><td align=\"center\" style=\"padding: 20px;\">"
                + "<table style=\"max-width: 600px; width: 100%; border-spacing: 0; border-collapse: collapse;\">"
                
                // Header - Standart tablo yapısı ve doğrudan bgcolor özelliği ile
                + "<tr>"
                + "<td style=\"background-color: #2e0c43; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;\">"
                + "<div style=\"font-family: Arial, sans-serif; font-size: 4rem; font-weight: 800; color: white; letter-spacing: -2px; text-shadow: 0 0 15px rgba(255, 255, 255, 0.7);\">NeoWrite</div>"
                + "</td>"
                + "</tr>"
                
                // İçerik
                + "<tr>"
                + "<td style=\"background-color: #1e1e30; padding: 30px; color: white; border-radius: 0 0 12px 12px;\">"
                + "<h2 style=\"color: #ffffff; margin-bottom: 20px;\">Merhaba " + user.getUsername() + ",</h2>"
                + "<p style=\"margin-bottom: 20px; line-height: 1.6;\">NeoWrite hesabınız için şifre sıfırlama talebinde bulundunuz. Şifrenizi sıfırlamak için aşağıdaki doğrulama kodunu kullanabilirsiniz:</p>"
                + "<div style=\"background-color: rgba(40, 40, 80, 0.5); padding: 20px; margin: 20px 0; border-radius: 12px; font-size: 28px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #ffffff; border: 1px solid #ff0088;\">" + verificationCode + "</div>"
                + "<p style=\"margin-bottom: 20px; line-height: 1.6;\">Bu kod 15 dakika içinde geçerliliğini yitirecektir. Lütfen şifre sıfırlama işlemini bu süre içinde tamamlayın.</p>"
                + "<p style=\"margin-bottom: 20px; line-height: 1.6;\">Eğer bu işlemi siz talep etmediyseniz, lütfen bu e-postayı dikkate almayınız ve hesabınızın güvenliğini kontrol ediniz.</p>"
                + "</td>"
                + "</tr>"
                
                // Footer
                + "<tr>"
                + "<td style=\"text-align: center; padding: 20px; color: #666; font-size: 14px;\">"
                + "<p>&copy; " + java.time.Year.now().getValue() + " NeoWrite. Tüm hakları saklıdır.</p>"
                + "</td>"
                + "</tr>"
                
                + "</table>"
                + "</td></tr>"
                + "</table>"
                + "</body>"
                + "</html>";
        try {
            emailService.sendVerificationEmail(user.getEmail(), subject, htmlMessage);
        } catch(MessagingException e) {
            throw new BaseException(MessageType.EMAIL_SENDING_FAILED, user.getEmail());
        }
    }

    // Şifre sıfırlama kodunu doğrulama ve şifreyi güncelleme
    public void resetPassword(String email, String verificationCode, String newPassword) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            LocalDateTime expiresAt = user.getVerificationCodeExpiresAt();

            if (expiresAt == null) {
                throw new BaseException(MessageType.VERIFICATION_CODE_NOT_SET);
            }

            if (expiresAt.isBefore(LocalDateTime.now())) {
                throw new BaseException(MessageType.CODE_EXPIRED);
            }

            if (user.getVerificationCode().equals(verificationCode)) {
                // Şifreyi güncelle
                user.setPassword(passwordEncoder.encode(newPassword));
                user.setVerificationCode(null);
                user.setVerificationCodeExpiresAt(null);
                userRepository.save(user);
            } else {
                throw new BaseException(MessageType.INVALID_VERIFICATION_CODE);
            }
        } else {
            throw new BaseException(MessageType.USER_NOT_FOUND, email);
        }
    }
}
