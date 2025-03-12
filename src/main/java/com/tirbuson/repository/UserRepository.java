package com.tirbuson.repository;

import com.tirbuson.model.User;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends BaseRepository<User,Integer> {
    Optional<User> findByEmail(String email);
    Optional<User> findByverificationCode(String verficationCode);

    Optional<User> findByUsername(String username);
}
