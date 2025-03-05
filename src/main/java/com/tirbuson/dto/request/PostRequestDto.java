package com.tirbuson.dto.request;

import com.tirbuson.dto.BaseDto;
import com.tirbuson.model.Image;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostRequestDto extends BaseDto {
    private String title;
    private String content;
    private Integer userId;
    private Integer categoryId;
    private List<String> images;
}
