package com.tirbuson.dto.response;

import com.tirbuson.dto.BaseDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SummaryResponseDto extends BaseDto {

    private Integer id;
    private String summary;
    private PostResponseDto post;
}
