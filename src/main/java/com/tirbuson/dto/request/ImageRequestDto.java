package com.tirbuson.dto.request;

import com.tirbuson.dto.BaseDto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImageRequestDto extends BaseDto {
    @NotBlank(message = "Image url can not be empty")
    @Size(min = 2, max = 50, message = "url should be betweeen 2 and 50 characters ")
    private String url;
}
