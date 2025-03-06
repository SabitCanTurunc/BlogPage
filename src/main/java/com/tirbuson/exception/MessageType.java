package com.tirbuson.exception;

import lombok.Getter;

@Getter
public enum MessageType {

    NO_RECORD_EXIST("1001","Record not found"),
    GENERAL_EXCEPTION("9999","A general error occurred");
    private String code;
    private String message;

    MessageType(String code, String message) {
        this.code = code;
        this.message = message;
    }

}
