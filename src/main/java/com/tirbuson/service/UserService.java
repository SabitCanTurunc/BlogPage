package com.tirbuson.service;

import com.tirbuson.dto.BaseDto;
import com.tirbuson.dto.request.UserRequestDto;
import com.tirbuson.dto.response.UserResponseDto;
import com.tirbuson.mapper.UserMapper;
import com.tirbuson.model.User;
import com.tirbuson.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService extends BaseService<User, Integer, UserRepository>{

    private final UserMapper userMapper;
    public UserService(UserRepository repository, UserMapper userMapper) {
        super(repository);
        this.userMapper = userMapper;
    }



}
