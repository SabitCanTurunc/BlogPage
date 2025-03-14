package com.tirbuson.exception;

public class BaseException extends RuntimeException {

    public BaseException() {}

    public BaseException(ErrorMessage errorMessage) {
        super(errorMessage.prepareErrorMessage());
    }

    public BaseException(String message) {
        super(message);
    }
}
