package com.tirbuson.dto.response;

import com.tirbuson.dto.BaseDto;
import com.tirbuson.model.Image;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostResponseDto extends BaseDto {
    private Integer id;
    private String title;
    private String content;
    private String username;
    private String category;
    private List<String> images;
}
