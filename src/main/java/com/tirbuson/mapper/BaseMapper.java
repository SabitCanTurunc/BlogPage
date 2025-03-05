package com.tirbuson.mapper;

import com.tirbuson.dto.request.CategoryRequestDto;
import com.tirbuson.model.Category;

public interface BaseMapper <E,resDTO,reqDTO>{

    E convertToEntity(reqDTO dto);


    resDTO convertToDto(E entity);
}
