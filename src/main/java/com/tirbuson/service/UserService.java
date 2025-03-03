package com.tirbuson.service;

import com.tirbuson.model.User;
import com.tirbuson.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService extends BaseService<User, Integer, UserRepository>{
    public UserService(UserRepository repository) {
        super(repository);
    }

}
