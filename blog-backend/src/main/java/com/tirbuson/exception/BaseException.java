package com.tirbuson.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;


@Getter
public class BaseException extends RuntimeException {
    private HttpStatus status;
    private MessageType messageType;

    public BaseException(ErrorMessage errorMessage){
        super(errorMessage.prepareErrorMessage());
        this.messageType=errorMessage.getMessageType();
        this.status=determineStatus(messageType);
    }

    public BaseException(String message){
        super(message);
        this.messageType=null;
        this.status=HttpStatus.BAD_REQUEST;
    }

    public BaseException(MessageType messageType){
        super(messageType.getMessage());
        this.messageType=messageType;
        this.status=determineStatus(messageType);
    }

    public BaseException(MessageType messageType, String additionalMessage){
        super(new ErrorMessage(messageType,additionalMessage).prepareErrorMessage());
        this.messageType=messageType;
        this.status=determineStatus(messageType);
    }


/// //////////////////////////

    private HttpStatus determineStatus(MessageType messageType){
        if(messageType == null){
            return HttpStatus.BAD_REQUEST;
        }

        switch(messageType.getCode().substring(0,1)){
            case "1": return HttpStatus.NOT_FOUND;
            case "2": return HttpStatus.BAD_REQUEST;
            case "3": return HttpStatus.UNAUTHORIZED;
            case "4": return HttpStatus.FORBIDDEN;
            case "5": return HttpStatus.CONFLICT;
            case "6": return HttpStatus.UNPROCESSABLE_ENTITY;
            default: return HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }
}
