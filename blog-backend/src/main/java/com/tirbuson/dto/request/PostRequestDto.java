package com.tirbuson.dto.request;

import com.tirbuson.dto.BaseDto;
import com.tirbuson.model.Image;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostRequestDto extends BaseDto {
    @NotBlank(message = "title can not be empty")
    @Size(min = 2, max = 50, message = "Title should be betweeen 2 and 50 characters ")
    private String title;

    @NotBlank(message = "content can not be empty")
    private String content;

//    @NotBlank(message = "userId can not be empty")
    private Integer userId;

//    @NotBlank(message = "categoryId can not be empty")
    private Integer categoryId;
    private List<String> images;
}
