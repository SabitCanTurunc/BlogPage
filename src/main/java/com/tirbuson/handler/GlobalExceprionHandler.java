package com.tirbuson.handler;

import com.tirbuson.exception.BaseException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Date;

@ControllerAdvice
public class GlobalExceprionHandler {

    @ExceptionHandler(value = {BaseException.class })
    public ResponseEntity<ApiError> handleBaseException(BaseException e, WebRequest request) {
        return ResponseEntity.badRequest().body(createApiError(e.getMessage(),request));
    }

    private String getHostname() {
        try {
            return InetAddress.getLocalHost().getHostName();
        } catch (UnknownHostException e) {
            System.out.println("Error occured while retrieving hostname: " + e.getMessage());
        }
        return null;
    }

    public <E> ApiError<E> createApiError(E message,WebRequest request) {
        ApiError<E> error = new ApiError<>();
        error.setStatus(HttpStatus.BAD_REQUEST.value());
        Exception<E> exception = new Exception<>();
        exception.setMessage(message);
        exception.setCreateTime(new Date());
        exception.setPath(request.getDescription(false));
        exception.setHostname(getHostname());
        error.setException(exception);
        return error;
    }
}
