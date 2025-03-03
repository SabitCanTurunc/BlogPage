package com.tirbuson.controller;

import com.tirbuson.model.BaseEntity;
import com.tirbuson.repository.BaseRepository;
import com.tirbuson.service.BaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
public abstract class  BaseController <S extends BaseService<E,ID,R>, E extends BaseEntity, ID, R extends BaseRepository<E,ID>> {

    private final S service;

    protected BaseController(S service) {
        this.service = service;
    }
    @PostMapping
    public ResponseEntity<E> create(@RequestBody E entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @GetMapping("/{id}")
    public ResponseEntity<E> getById(@PathVariable ID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<E>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<E> update(@PathVariable ID id, @RequestBody E entity) {
        if (!id.equals(entity.getId())) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable ID id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
