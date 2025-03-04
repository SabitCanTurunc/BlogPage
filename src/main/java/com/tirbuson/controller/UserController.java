package com.tirbuson.controller;

import com.tirbuson.dto.BaseDto;
import com.tirbuson.mapper.UserMapper;
import com.tirbuson.model.User;
import com.tirbuson.repository.UserRepository;
import com.tirbuson.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController extends BaseController<UserService,User,Integer, UserRepository, BaseDto, UserMapper> {


    protected UserController(UserService service, UserMapper mapper) {
        super(service, mapper);
    }
}
