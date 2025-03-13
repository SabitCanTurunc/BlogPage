package com.tirbuson.exception;

import lombok.Getter;

@Getter
public enum MessageType {

    NO_RECORD_EXIST("1001","Record not found"),
    ALREADY_VERIFIED("1002","Record is already verified"),
    INVALIC_VERICIFATION_CODE("1003","Invalid verification code"),
    CODE_EXPIRED("1004","Code expired"),
    EMAIL_SENDING_FAILED("1005","Email sending failed"),
    UNAUTHORIZED("1006","Unauthorized access"),
    VERIFICATION_CODE_NOT_SET("1007","Verification code is not set"),
    GENERAL_EXCEPTION("9999","A general error occurred");
    private String code;
    private String message;

    MessageType(String code, String message) {
        this.code = code;
        this.message = message;
    }

}
