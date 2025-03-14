package com.tirbuson.service;

import com.tirbuson.exception.BaseException;
import com.tirbuson.exception.ErrorMessage;
import com.tirbuson.exception.MessageType;
import com.tirbuson.model.BaseEntity;
import com.tirbuson.repository.BaseRepository;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public class BaseService<E extends BaseEntity, ID, R extends BaseRepository<E, ID>>{


    private final R repository;

    public BaseService(R repository) {
        this.repository = repository;
    }

    @Transactional
    public E save(E entity) {

        return repository.save(entity);
    }

    @Transactional
    public E findById(ID id) {
        if (id == null) {
            throw new IllegalArgumentException("ID cannot be null");
        }
        return repository
                .findById(id)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, id.toString())));
    }

    @Transactional
    public List<E> findAll() {
        return repository.findAll();
    }

    @Transactional
    public void deleteById(ID id) {
        repository.deleteById(id);
    }

    @Transactional
    public E update(E entity) {
        E oldEntity= repository
                .findById((ID) entity.getId())
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, entity.getId().toString())));
        entity.setCreatedAt(oldEntity.getCreatedAt());
        return repository.save(entity);  // JpaRepository save hem insert hem update yapar.
    }

}
