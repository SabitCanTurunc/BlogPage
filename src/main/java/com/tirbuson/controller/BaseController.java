package com.tirbuson.controller;

import com.tirbuson.dto.BaseDto;
import com.tirbuson.mapper.BaseMapper;
import com.tirbuson.model.BaseEntity;
import com.tirbuson.repository.BaseRepository;
import com.tirbuson.service.BaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
public abstract class  BaseController <S extends BaseService<E,ID,R>, E extends BaseEntity, ID, R extends BaseRepository<E,ID>, DTO extends BaseDto, M extends BaseMapper<E, DTO>> {

    private final S service;
    private final M mapper;

    protected BaseController(S service, M mapper) {
        this.service = service;
        this.mapper = mapper;
    }
    @PostMapping
    public ResponseEntity<DTO> create(@RequestBody E entity) {
        DTO dto = mapper.convertToDto(service.save(entity));
        return ResponseEntity.ok(dto);
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
