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

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class UserService extends BaseService<User, Integer, UserRepository> {

    private final UserMapper userMapper;
    private final UserRepository userRepository;

    public UserService(UserRepository repository, UserMapper userMapper, UserRepository userRepository) {
        super(repository);
        this.userMapper = userMapper;
        this.userRepository = userRepository;
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
