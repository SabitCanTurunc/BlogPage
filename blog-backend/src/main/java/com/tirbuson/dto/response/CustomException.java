package com.tirbuson.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CustomException {
    private String hostname;
    private String path;
    private String createTime;
    private String message;
} 