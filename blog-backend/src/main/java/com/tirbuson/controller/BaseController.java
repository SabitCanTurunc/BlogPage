package com.tirbuson.controller;

import com.tirbuson.dto.BaseDto;
import com.tirbuson.mapper.BaseMapper;
import com.tirbuson.model.BaseEntity;
import com.tirbuson.repository.BaseRepository;
import com.tirbuson.service.BaseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
public abstract class BaseController<
        S extends BaseService<E, ID, R>,
        E extends BaseEntity,
        ID,
        R extends BaseRepository<E, ID>,
        ResDto extends BaseDto,
        ReqDto extends BaseDto,
        M extends BaseMapper<E, ResDto, ReqDto>> {


    private final S service;
    private final M mapper;

    protected BaseController(S service, M mapper) {
        this.service = service;
        this.mapper = mapper;
    }
    @PostMapping
    public ResponseEntity<ResDto> create(@Valid @RequestBody ReqDto dtoEntity) {
        E entity= mapper.convertToEntity(dtoEntity);
        ResDto dto = mapper.convertToDto(service.save(entity));
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResDto> getById(@Valid @PathVariable ID id) {
        ResDto dto =mapper.convertToDto(service.findById(id));
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public ResponseEntity<List<ResDto>> getAll() {
        List<ResDto> dtos=new ArrayList<>();
        for(E entity:service.findAll()){
            ResDto newDto= mapper.convertToDto(entity);
            dtos.add(newDto);
        }
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResDto> update(@Valid @PathVariable ID id, @RequestBody ReqDto reqDto) {

        E dtoEntity = mapper.convertToEntity(reqDto);
        dtoEntity.setId(Integer.parseInt(id.toString()));
        ResDto dto = mapper.convertToDto(service.update(dtoEntity));

        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@Valid @PathVariable ID id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
