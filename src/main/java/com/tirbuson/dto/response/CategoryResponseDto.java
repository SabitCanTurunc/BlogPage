package com.tirbuson.dto.response;

import com.tirbuson.dto.BaseDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponseDto extends BaseDto {
    private String name;
}
