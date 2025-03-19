package com.tirbuson.service;

import com.tirbuson.dto.request.UserRequestDto;
import com.tirbuson.dto.response.UserResponseDto;
import com.tirbuson.exception.BaseException;
import com.tirbuson.exception.ErrorMessage;
import com.tirbuson.exception.MessageType;
import com.tirbuson.mapper.UserMapper;
import com.tirbuson.model.User;
import com.tirbuson.model.enums.Role;
import com.tirbuson.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;


@Service
public class UserService extends BaseService<User, Integer, UserRepository> {

    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository repository, UserMapper userMapper, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        super(repository);
        this.userMapper = userMapper;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email) .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, email)));
    }

    @Transactional
    public UserResponseDto updateRole(Integer id, UserRequestDto dto) {
        User user = userRepository
                .findById(id)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, id.toString())));
        user.setRole(dto.getRole());
        super.update(user);
        return userMapper.convertToDto(user);
    }

    @Transactional
    public UserResponseDto updateEnabled(Integer id, boolean enabled) {
        User user = userRepository
                .findById(id)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, id.toString())));
        user.setEnabled(enabled);
        super.update(user);
        return userMapper.convertToDto(user);
    }
    
    @Transactional
    public Map<String, Object> updatePassword(String email, String currentPassword, String newPassword) {
        User user = findByEmail(email);
        
        // Mevcut şifreyi kontrol et
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BaseException(new ErrorMessage(MessageType.INVALID_CREDENTIALS, "Mevcut şifre yanlış"));
        }
        
        // Yeni şifreyi hashle ve kaydet
        user.setPassword(passwordEncoder.encode(newPassword));
        super.update(user);
        
        return Map.of("message", "Şifre başarıyla güncellendi", "success", true);
    }
    
    @Transactional
    public Map<String, Object> updateProfile(String email, String username) {
        User user = findByEmail(email);
        user.setUsername(username);
        super.update(user);
        
        return Map.of("message", "Profil başarıyla güncellendi", "success", true);
    }
    
    @Transactional
    public Map<String, Object> deleteAccount(String email, String password) {
        User user = findByEmail(email);
        
        // Şifreyi kontrol et
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BaseException(new ErrorMessage(MessageType.INVALID_CREDENTIALS, "Şifre yanlış, hesap silinemedi"));
        }
        
        // İlişkili yorumları ve yazıları manuel olarak temizle
        if (user.getComments() != null) {
            user.getComments().clear();
        }
        
        if (user.getPosts() != null) {
            user.getPosts().clear();
        }
        
        // Kullanıcıyı sil
        userRepository.delete(user);
        
        return Map.of("message", "Hesabınız başarıyla silindi", "success", true);
    }

    @Override
    @Transactional
    public User save(User user) {
        long userCount = userRepository.count();
        if (userCount == 0) {
            user.setRole(Role.ADMIN);
        } else if (user.getRole() != Role.ADMIN) {
            user.setRole(Role.USER);
        }
        return userRepository.save(user);
    }

    @Transactional
    public void deleteById(Integer userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        
        // İlişkili yorumları ve yazıları manuel olarak temizle
        if (user.getComments() != null) {
            user.getComments().clear();
        }
        
        if (user.getPosts() != null) {
            user.getPosts().clear();
        }
        
        // Kullanıcıyı sil
        userRepository.delete(user);
    }

}
