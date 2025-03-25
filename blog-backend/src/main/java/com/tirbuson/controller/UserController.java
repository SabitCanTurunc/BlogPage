package com.tirbuson.controller;

import com.tirbuson.dto.request.UserRequestDto;
import com.tirbuson.dto.response.UserResponseDto;
import com.tirbuson.mapper.UserMapper;
import com.tirbuson.model.User;
import com.tirbuson.repository.UserRepository;
import com.tirbuson.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController extends BaseController<UserService,User,Integer, UserRepository, UserResponseDto, UserRequestDto, UserMapper> {

    private final UserService userService;
    private final UserMapper userMapper;

    protected UserController(UserService service, UserMapper mapper, UserService userService, UserMapper userMapper) {
        super(service, mapper);
        this.userService = userService;
        this.userMapper = userMapper;
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
        
        Map<String, Object> result = userService.updatePassword(email, currentPassword, newPassword);
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/update-profile")
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody UserRequestDto userRequestDto) {

        
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
        // SecurityContextHolder'dan mevcut kimliği doğrulanmış kullanıcıyı al
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userService.findByEmail(email);
        UserResponseDto userResponseDto = userMapper.convertToDto(user);
        return ResponseEntity.ok(userResponseDto);
    }
}
