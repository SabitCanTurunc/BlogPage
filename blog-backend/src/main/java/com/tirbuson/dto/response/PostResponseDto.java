package com.tirbuson.dto.response;

import com.tirbuson.dto.BaseDto;
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
    private String userEmail;
    private Integer categoryId;
    private String categoryName;
    private List<String> images;
    private boolean isPremium;
}
