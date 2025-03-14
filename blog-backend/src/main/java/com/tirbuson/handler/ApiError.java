package com.tirbuson.handler;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApiError<E> {
private Integer status;
private CustomException<E> customException;
}
