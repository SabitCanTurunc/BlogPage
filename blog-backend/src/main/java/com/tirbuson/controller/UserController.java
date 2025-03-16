package com.tirbuson.controller;

import com.tirbuson.dto.request.UserRequestDto;
import com.tirbuson.dto.response.UserResponseDto;
import com.tirbuson.mapper.UserMapper;
import com.tirbuson.model.User;
import com.tirbuson.repository.CommentRepository;
import com.tirbuson.repository.PostRepository;
import com.tirbuson.repository.UserRepository;
import com.tirbuson.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController extends BaseController<UserService,User,Integer, UserRepository, UserResponseDto, UserRequestDto, UserMapper> {


    private final UserService userService;
    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    protected UserController(UserService service, UserMapper mapper, UserService userService, UserMapper userMapper, 
                            UserRepository userRepository, PasswordEncoder passwordEncoder,
                            CommentRepository commentRepository, PostRepository postRepository) {
        super(service, mapper);
        this.userService = userService;
        this.userMapper = userMapper;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
    }

    @PostMapping("/setRole/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDto> updateRole(@PathVariable(name="id") Integer id, @RequestBody UserRequestDto userRequestDto) {
        return ResponseEntity.ok(userService.updateRole(id, userRequestDto));
    }
    
    @PostMapping("/update-password")
    public ResponseEntity<?> updatePassword(@RequestBody Map<String, String> passwordData) {
        try {
            String email = passwordData.get("email");
            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");
            
            User user = userService.findByEmail(email);
            
            // Mevcut şifreyi kontrol et
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Mevcut şifre yanlış", "success", false));
            }
            
            // Yeni şifreyi hashle ve kaydet
            user.setPassword(passwordEncoder.encode(newPassword));
            userService.update(user);
            
            return ResponseEntity.ok(Map.of("message", "Şifre başarıyla güncellendi", "success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Şifre güncellenirken hata oluştu: " + e.getMessage(), "success", false));
        }
    }
    
    @PostMapping("/update-profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> profileData) {
        try {
            String email = profileData.get("email");
            String username = profileData.get("username");
            
            User user = userService.findByEmail(email);
            user.setUsername(username);
            userService.update(user);
            
            return ResponseEntity.ok(Map.of("message", "Profil başarıyla güncellendi", "success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Profil güncellenirken hata oluştu: " + e.getMessage(), "success", false));
        }
    }
    
    @PostMapping("/delete-account")
    public ResponseEntity<?> deleteAccount(@RequestBody Map<String, String> deleteData) {
        try {
            String email = deleteData.get("email");
            String password = deleteData.get("password");
            
            System.out.println("Hesap silme isteği: Email=" + email + ", Şifre uzunluğu=" + (password != null ? password.length() : "null"));
            
            if (email == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email ve şifre gereklidir", "success", false));
            }
            
            User user = userService.findByEmail(email);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Kullanıcı bulunamadı", "success", false));
            }
            
            // Şifreyi kontrol et
            if (!passwordEncoder.matches(password, user.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Şifre yanlış, hesap silinemedi", "success", false));
            }
            
            try {
                // Kullanıcıyı sil (cascade ilişkiler sayesinde ilişkili entity'ler de silinecektir)
                userService.deleteById(user.getId());
                
                return ResponseEntity.ok(Map.of("message", "Hesabınız başarıyla silindi", "success", true));
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.badRequest().body(Map.of("message", "Hesap silinirken hata oluştu: " + e.getMessage(), "success", false));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Hesap silinirken hata oluştu: " + e.getMessage(), "success", false));
        }
    }
}
