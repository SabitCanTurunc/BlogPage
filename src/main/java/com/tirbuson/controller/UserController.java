package com.tirbuson.controller;

import com.tirbuson.dto.request.UserRequestDto;
import com.tirbuson.dto.response.UserResponseDto;
import com.tirbuson.mapper.UserMapper;
import com.tirbuson.model.User;
import com.tirbuson.repository.UserRepository;
import com.tirbuson.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
        return ResponseEntity.ok(userService.updateRole(id, userRequestDto)) ;


    }
}
