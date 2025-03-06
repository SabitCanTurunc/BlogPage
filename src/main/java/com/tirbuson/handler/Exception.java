package com.tirbuson.handler;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class Exception<E>{
    private String hostname;
    private String path;
    private Date createTime;
    private E message;
}
