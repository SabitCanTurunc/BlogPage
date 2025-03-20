package com.tirbuson.dto.request;

import com.tirbuson.dto.BaseDto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;


@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CategoryRequestDto extends BaseDto {

    @NotBlank(message = "name can not be empty")
    @Size(min = 2, max = 50, message = "name should be betweeen 2 and 50 characters ")
    private String name;
}
