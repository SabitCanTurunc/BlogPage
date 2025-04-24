package com.tirbuson.controller;

import com.tirbuson.dto.request.UserRequestDto;
import com.tirbuson.dto.response.UserResponseDto;
import com.tirbuson.exception.BaseException;
import com.tirbuson.exception.MessageType;
import com.tirbuson.mapper.UserMapper;
import com.tirbuson.model.User;
import com.tirbuson.model.enums.SubscriptionPlan;
import com.tirbuson.repository.UserRepository;
import com.tirbuson.service.UserService;
import com.tirbuson.service.ImageService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController extends BaseController<UserService,User,Integer, UserRepository, UserResponseDto, UserRequestDto, UserMapper> {

    private final UserService userService;
    private final UserMapper userMapper;
    private final ImageService imageService;

    protected UserController(UserService service, UserMapper mapper, UserService userService, UserMapper userMapper, ImageService imageService) {
        super(service, mapper);
        this.userService = userService;
        this.userMapper = userMapper;
        this.imageService = imageService;
    }

    @PostMapping("/upload-profile-image")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponseDto> uploadProfileImage(@RequestParam("file") MultipartFile file) throws IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);

        var imageResponse = imageService.uploadImage(file);
        
        user.setProfileImage(imageService.findById(imageResponse.getId()));
        User updatedUser = userService.update(user);

        return ResponseEntity.ok(userMapper.convertToDto(updatedUser));
    }

    @PostMapping("/setRole/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDto> updateRole(@PathVariable(name="id") Integer id, @RequestBody UserRequestDto userRequestDto) {
        return ResponseEntity.ok(userService.updateRole(id, userRequestDto));
    }
    
    @PostMapping("/update-password")
    public ResponseEntity<Map<String, Object>> updatePassword(@RequestBody Map<String, String> passwordData) {
        String email = passwordData.get("email");
        String currentPassword = passwordData.get("currentPassword");
        String newPassword = passwordData.get("newPassword");
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        
        if (!"anonymousUser".equals(authentication.getPrincipal())) {
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
            
            if (!isAdmin && !currentUserEmail.equals(email)) {
                throw new BaseException(MessageType.UNAUTHORIZED_ACCESS, "Başka bir kullanıcının şifresini değiştirme yetkiniz yok");
            }
        }
        
        Map<String, Object> result = userService.updatePassword(email, currentPassword, newPassword);
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/update-profile")
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody UserRequestDto userRequestDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        
        if (!"anonymousUser".equals(authentication.getPrincipal())) {
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
            
            if (!isAdmin && !currentUserEmail.equals(userRequestDto.getEmail())) {
                throw new BaseException(MessageType.UNAUTHORIZED_ACCESS, "Başka bir kullanıcının profilini değiştirme yetkiniz yok");
            }
        }
        
        Map<String, Object> result = userService.updateProfile(userRequestDto);
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/delete-account")
    public ResponseEntity<Map<String, Object>> deleteAccount(@RequestBody Map<String, String> deleteData) {
        String email = deleteData.get("email");
        String password = deleteData.get("password");
        
        Map<String, Object> result = userService.deleteAccount(email, password);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/setEnabled/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDto> updateEnabled(@PathVariable(name="id") Integer id, @RequestBody Map<String, Boolean> enabledStatus) {
        Boolean enabled = enabledStatus.get("enabled");
        if (enabled == null) {
            return ResponseEntity.badRequest().build();
        }
        
        return ResponseEntity.ok(userService.updateEnabled(id, enabled));
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponseDto> getUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userService.findByEmail(email);
        UserResponseDto userResponseDto = userMapper.convertToDto(user);
        return ResponseEntity.ok(userResponseDto);
    }

    @GetMapping("/profile/{email}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<UserResponseDto> getUserProfileByEmail(@PathVariable String email) {
        User user = userService.findByEmail(email);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        UserResponseDto userResponseDto = userMapper.convertToDto(user);
        return ResponseEntity.ok(userResponseDto);
    }

    @DeleteMapping("/delete-profile-image")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> deleteProfileImage() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userService.findByEmail(email);
        
        if (user.getProfileImage() != null) {
            imageService.deleteById(user.getProfileImage().getId());
            user.setProfileImage(null);
            userService.update(user);
            return ResponseEntity.ok(Map.of("message", "Profil fotoğrafı başarıyla silindi", "success", true));
        }
        
        return ResponseEntity.ok(Map.of("message", "Profil fotoğrafı bulunamadı", "success", false));
    }

    @PostMapping("/update-subscription-plan")
    // @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> updateSubscriptionPlan(@RequestBody Map<String, String> requestData) {
        String email = requestData.get("email");
        String subscriptionPlan = requestData.get("subscriptionPlan");
        
        if (email == null || subscriptionPlan == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Email ve subscription plan zorunludur",
                "success", false
            ));
        }
        
        try {
            // Mevcut kullanıcının bilgilerini al
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUserEmail = authentication.getName();
            User currentUser = userService.findByEmail(currentUserEmail);
            
            // Yetki kontrolü - mevcut kullanıcı kendi planını değiştirebilir veya admin başkalarının planını değiştirebilir
            if (!currentUserEmail.equals(email) && !currentUser.getRole().name().equals("ADMIN")) {
                return ResponseEntity.status(403).body(Map.of(
                    "message", "Başka bir kullanıcının abonelik planını değiştirme yetkiniz yok",
                    "success", false
                ));
            }
            
            // Kullanıcıyı bul
            User user = userService.findByEmail(email);
            
            // Subscription planı güncelle
            user.setSubscriptionPlan(SubscriptionPlan.valueOf(subscriptionPlan.toUpperCase()));
            
            // Kaydet
            User updatedUser = userService.update(user);
            
            return ResponseEntity.ok(Map.of(
                "message", "Abonelik planı başarıyla güncellendi",
                "success", true,
                "user", userMapper.convertToDto(updatedUser)
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Geçersiz subscription plan değeri. Geçerli değerler: ESSENTIAL, PLUS, MAX",
                "success", false
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "message", "Abonelik planı güncellenirken bir hata oluştu: " + e.getMessage(),
                "success", false
            ));
        }
    }
}
