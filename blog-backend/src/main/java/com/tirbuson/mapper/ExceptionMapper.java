package com.tirbuson.mapper;



import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.tirbuson.exception.BaseException;
import com.tirbuson.exception.MessageType;
import org.springframework.http.converter.HttpMessageNotReadableException;

/**
 * Bilinen exception tiplerini BaseException'a dönüştürür.
 */
public class ExceptionMapper {

    public static BaseException toBaseException(Exception e) {
        // JSON parse hataları
        if (e instanceof HttpMessageNotReadableException) {
            Throwable cause = e.getCause();
            if (cause instanceof JsonParseException) {
                return new BaseException(MessageType.INVALID_REQUEST, "Geçersiz JSON formatı");
            } else if (cause instanceof JsonMappingException) {
                return new BaseException(MessageType.INVALID_REQUEST, "JSON değerleri doğru formatta değil");
            } else if (e.getMessage().contains("Required request body is missing")) {
                return new BaseException(MessageType.MISSING_REQUIRED_FIELD);
            } else {
                return new BaseException(MessageType.INVALID_REQUEST, e.getMessage());
            }
        }

        // IllegalArgumentException ve benzer hatalar
        if (e instanceof IllegalArgumentException) {
            return new BaseException(MessageType.INVALID_REQUEST, e.getMessage());
        }

        // Diğer hatalar için genel bir BaseException döndür
        return new BaseException(MessageType.GENERAL_EXCEPTION, e.getMessage());
    }
}
