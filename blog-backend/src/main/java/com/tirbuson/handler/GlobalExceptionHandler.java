package com.tirbuson.handler;

import com.tirbuson.exception.BaseException;
import com.tirbuson.exception.ErrorMessage;
import com.tirbuson.exception.MessageType;
import com.tirbuson.mapper.ExceptionMapper;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Date;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {


    @ExceptionHandler(value = {BaseException.class})
    public ResponseEntity<ApiError<String>> handleBaseException(BaseException e, WebRequest request) {

        HttpStatus status = e.getStatus();
        String errorCode = null;
        if (e.getMessageType() != null) errorCode = e.getMessageType().getCode();

        return ResponseEntity.status(status)
                .body(createApiError(e.getMessage(), status, request, errorCode));

    }

//    @ExceptionHandler(MethodArgumentNotValidException.class)
//    public ResponseEntity<ApiError<String>> handleMethodArgumentNotValidException(MethodArgumentNotValidException e, WebRequest request) {
//        MessageType messageType = MessageType.INVALID_REQUEST;
//
//        String validationErrors = e.getBindingResult().getAllErrors().stream()
//                .map(error -> error.getDefaultMessage())
//                .collect(Collectors.joining(", "));
//
//        ErrorMessage errorMessage = new ErrorMessage(messageType, validationErrors);
//        String formattedMessage = errorMessage.prepareErrorMessage();
//
//        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                .body(createApiError(formattedMessage, HttpStatus.BAD_REQUEST, request, messageType.getCode()));
//    }
//
//
//    @ExceptionHandler(value = {MalformedJwtException.class, ExpiredJwtException.class})
//    public ResponseEntity<ApiError<String>> handleJwtException(Exception e, WebRequest request) {
//        MessageType messageType;
//        String additionalInfo = null;
//
//        if (e instanceof MalformedJwtException) {
//            messageType = MessageType.INVALID_TOKEN;
//            additionalInfo = e.getMessage();
//        } else { // ExpiredJwtException
//            messageType = MessageType.TOKEN_EXPIRED;
//        }
//
//        ErrorMessage errorMessage = new ErrorMessage(messageType, additionalInfo);
//        String formattedMessage = errorMessage.prepareErrorMessage();
//
//        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
//                .body(createApiError(formattedMessage, HttpStatus.UNAUTHORIZED, request, messageType.getCode()));
//    }
//
//    @ExceptionHandler(value = {DataIntegrityViolationException.class})
//    public ResponseEntity<ApiError<String>> handleDataIntegrityViolationException(DataIntegrityViolationException e, WebRequest request) {
//        MessageType messageType = MessageType.DATABASE_ERROR;
//
//        String detail = e.getMessage();
//
//        ErrorMessage errorMessage = new ErrorMessage(messageType, detail);
//        String formattedMessage = errorMessage.prepareErrorMessage();
//
//        return ResponseEntity.status(HttpStatus.CONFLICT)
//                .body(createApiError(formattedMessage, HttpStatus.CONFLICT, request, messageType.getCode()));
//    }
//
//    @ExceptionHandler(value = {BadCredentialsException.class})
//    public ResponseEntity<ApiError<String>> handleBadCredentialsException(BadCredentialsException e, WebRequest request) {
//        MessageType messageType = MessageType.INVALID_CREDENTIALS;
//
//        ErrorMessage errorMessage = new ErrorMessage(messageType, null);
//        String formattedMessage = errorMessage.prepareErrorMessage();
//
//        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
//                .body(createApiError(formattedMessage, HttpStatus.UNAUTHORIZED, request, messageType.getCode()));
//    }
//
//
//    @ExceptionHandler(value = {Exception.class})
//    public ResponseEntity<ApiError<String>> handleGenericException(Exception e, WebRequest request) {
//        // Exception'ı BaseException'a dönüştür
//        BaseException baseException = ExceptionMapper.toBaseException(e);
//
//        // BaseException handler'ını kullan
//        return handleBaseException(baseException, request);
//    }


    /// /////////////////////////
    private String getHostname() {
        try {
            return InetAddress.getLocalHost().getHostName();
        } catch (UnknownHostException e) {
            return "Unknown host";
        }
    }

    private ApiError<String> createApiError(String message, HttpStatus status, WebRequest request, String errorCode) {
        ApiError<String> error = new ApiError<>();
        error.setStatus(status.value());
        error.setErrorCode(errorCode);

        CustomException<String> customException = new CustomException<>();
        customException.setMessage(message != null ? message : "Unknown error");
        customException.setCreateTime(new Date());
        customException.setPath(request.getDescription(false));
        customException.setHostname(getHostname());

        error.setCustomException(customException);
        return error;
    }

    private ApiError<String> createApiError(String message, HttpStatus status, WebRequest request) {
        return createApiError(message, status, request, null);
    }
}
