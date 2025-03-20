package com.tirbuson.exception;

import com.tirbuson.model.User;

import java.util.LinkedList;
import java.util.List;

public class BaseException extends RuntimeException {

    public BaseException() {}

    public BaseException(ErrorMessage errorMessage) {
        super(errorMessage.prepareErrorMessage());
    }

    public BaseException(String message) {
        super(message);
    }

}
