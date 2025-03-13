package com.tirbuson.service;

import com.tirbuson.dto.VerifyUserDto;
import com.tirbuson.dto.request.UserRequestDto;
import com.tirbuson.exception.BaseException;
import com.tirbuson.exception.ErrorMessage;
import com.tirbuson.exception.MessageType;
import com.tirbuson.mapper.UserMapper;
import com.tirbuson.model.User;
import com.tirbuson.repository.UserRepository;
import jakarta.mail.MessagingException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

    public User signup(UserRequestDto userRequestDto) {
        User user = userMapper.convertToEntity(userRequestDto);
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        user.setVerificationCode(generateVerificationCode());
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
        user.setEnabled(false);
        sendVerificationEmail(user);
    return    userService.save(user);
    }

    public User authenticate(UserRequestDto input){
        User user = userRepository.findByEmail(input.getEmail())
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, input.getEmail())));
        if(!user.isEnabled()) {
            throw new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, input.getEmail()));
        }
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        input.getEmail(),
                        input.getPassword()
                )
        );
        return user;
    }

    public void verifyUser(VerifyUserDto input) {
        Optional<User> optionalUser = userRepository.findByEmail(input.getEmail());
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            LocalDateTime expiresAt = user.getVerificationCodeExpiresAt();

            if (user.isEnabled() && expiresAt == null) {
                throw new BaseException(new ErrorMessage(MessageType.ALREADY_VERIFIED, input.getEmail()));
            }

            if (expiresAt == null) {
                throw new BaseException(new ErrorMessage(MessageType.VERIFICATION_CODE_NOT_SET, "Verification code is not set for " + input.getEmail()));
            }

            if (expiresAt.isBefore(LocalDateTime.now())) {
                throw new BaseException(new ErrorMessage(MessageType.CODE_EXPIRED, input.getVerificationCode()));
            }

            if (user.getVerificationCode().equals(input.getVerificationCode())) {
                user.setEnabled(true);
                user.setVerificationCode(null);
                user.setVerificationCodeExpiresAt(null);
                userRepository.save(user);
            } else {
                throw new BaseException(new ErrorMessage(MessageType.INVALIC_VERICIFATION_CODE, input.getVerificationCode()));
            }
        } else {
            throw new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, input.getEmail()));
        }
    }

    public void resendVerificationCode(String email){
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if(optionalUser.isPresent()){
            User user = optionalUser.get();
            if(user.isEnabled()) {
                throw new BaseException( new ErrorMessage(MessageType.ALREADY_VERIFIED,email));
            }
            user.setVerificationCode(generateVerificationCode());
            user.setVerificationCodeExpiresAt(LocalDateTime.now().plusHours(1));
            sendVerificationEmail(user);
            userRepository.save(user);
        }else{
            throw new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST,email));
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


}
