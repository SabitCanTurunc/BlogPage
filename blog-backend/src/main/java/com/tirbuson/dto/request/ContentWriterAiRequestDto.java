package com.tirbuson.dto.request;

import com.tirbuson.dto.BaseDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ContentWriterAiRequestDto extends BaseDto {
    private String title;
    private String category;
    private String content;
}
