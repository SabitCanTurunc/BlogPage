package com.tirbuson.service;

import com.tirbuson.model.BaseEntity;
import com.tirbuson.repository.BaseRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

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
        return repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Entity not found with ID: " + id));
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
        E oldEntity= repository.findById((ID) entity.getId()).orElseThrow(()-> new EntityNotFoundException("Entity not found"));
        entity.setCreatedAt(oldEntity.getCreatedAt());
        return repository.save(entity);  // JpaRepository save hem insert hem update yapar.
    }

}
