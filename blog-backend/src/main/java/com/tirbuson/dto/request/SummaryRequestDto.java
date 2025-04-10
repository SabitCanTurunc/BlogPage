package com.tirbuson.dto.request;

import com.tirbuson.dto.BaseDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SummaryRequestDto extends BaseDto {
    private String summary;
    private Integer postId;
}
