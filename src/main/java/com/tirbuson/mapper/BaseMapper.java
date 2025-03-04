package com.tirbuson.mapper;

public interface BaseMapper <E,resDTO,reqDTO>{

    E convertToEntity(reqDTO dto);
    resDTO convertToDto(E entity);
}
