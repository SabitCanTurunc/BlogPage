package com.tirbuson.dto.request;

import com.tirbuson.dto.BaseDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryRequestDto extends BaseDto {
private String name;
}
