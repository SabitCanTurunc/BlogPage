package com.tirbuson.repository;

import com.tirbuson.model.User;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends BaseRepository<User,Integer> {
}
