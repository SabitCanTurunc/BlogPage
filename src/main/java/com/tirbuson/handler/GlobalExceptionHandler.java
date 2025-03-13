package com.tirbuson.handler;

import com.tirbuson.exception.BaseException;
import io.jsonwebtoken.MalformedJwtException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Date;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(value = {BaseException.class})
    public ResponseEntity<ApiError<String>> handleBaseException(BaseException e, WebRequest request) {
        return ResponseEntity.badRequest().body(createApiError(e.getMessage(), HttpStatus.BAD_REQUEST, request));
    }

    @ExceptionHandler(value = {MalformedJwtException.class})
    public ResponseEntity<ApiError<String>> handleMalformedJwtException(MalformedJwtException e, WebRequest request) {
        String message = "Invalid JWT token: " + e.getMessage();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(createApiError(message, HttpStatus.UNAUTHORIZED, request));
    }

    @ExceptionHandler(value = {Exception.class}) // java.lang.Exception
    public ResponseEntity<ApiError<String>> handleGenericException(Exception e, WebRequest request) {
        String message = "Internal server error: " + e.getMessage();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createApiError(message, HttpStatus.INTERNAL_SERVER_ERROR, request));
    }

    @ExceptionHandler(value = {DataIntegrityViolationException.class})
    public ResponseEntity<ApiError<String>> handleDataIntegrityViolationException(DataIntegrityViolationException e, WebRequest request) {
        System.out.println("Database error: " + e.getMessage()); // Veya bir logger kullanın
        String message = extractUserFriendlyMessage(e.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(createApiError(message, HttpStatus.CONFLICT, request));
    }

    private String getHostname() {
        try {
            return InetAddress.getLocalHost().getHostName();
        } catch (UnknownHostException e) {
            System.out.println("Error occurred while retrieving hostname: " + e.getMessage());
            return "Unknown host";
        }
    }

    private ApiError<String> createApiError(String message, HttpStatus status, WebRequest request) {
        ApiError<String> error = new ApiError<>();
        error.setStatus(status.value());

        CustomException<String> customException = new CustomException<>();
        customException.setMessage(message != null ? message : "Unknown error");
        customException.setCreateTime(new Date());
        customException.setPath(request.getDescription(false));
        customException.setHostname(getHostname());

        error.setCustomException(customException);
        return error;
    }

    private String extractUserFriendlyMessage(String errorMessage) {
        if (errorMessage.contains("duplicate key value violates unique constraint \"user_email_key\"")) {
            String email = errorMessage.split("Key \\(email\\)=\\(")[1].split("\\)")[0];
            return "The email address '" + email + "' is already registered.";
        }
        return "A database error occurred.";
    }
}