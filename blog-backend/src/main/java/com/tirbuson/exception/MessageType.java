package com.tirbuson.exception;

import lombok.Getter;

@Getter
public enum MessageType {

    NO_RECORD_EXIST("1001","Kayıt bulunamadı"),
    ALREADY_VERIFIED("1002","Kayıt zaten doğrulanmış"),
    INVALIC_VERICIFATION_CODE("1003","Geçersiz doğrulama kodu"),
    CODE_EXPIRED("1004","Doğrulama kodu süresi dolmuş"),
    EMAIL_SENDING_FAILED("1005","E-posta gönderimi başarısız"),
    UNAUTHORIZED("1006","Yetkisiz erişim"),
    VERIFICATION_CODE_NOT_SET("1007","Doğrulama kodu ayarlanmamış"),
    INVALID_CREDENTIALS("1008","Geçersiz e-posta veya şifre"),
    ACCOUNT_LOCKED("1009","Hesabınız kilitlendi. Lütfen daha sonra tekrar deneyin"),
    ACCOUNT_DISABLED("1010","Hesabınız devre dışı bırakılmış"),
    EMAIL_NOT_VERIFIED("1011","E-posta adresiniz doğrulanmamış"),
    INVALID_PASSWORD_FORMAT("1012","Şifre formatı geçersiz"),
    INVALID_EMAIL_FORMAT("1013","E-posta formatı geçersiz"),
    INVALID_USERNAME_FORMAT("1014","Kullanıcı adı formatı geçersiz"),
    PASSWORD_MISMATCH("1015","Şifreler eşleşmiyor"),
    GENERAL_EXCEPTION("9999","Bir hata oluştu");

    private String code;
    private String message;

    MessageType(String code, String message) {
        this.code = code;
        this.message = message;
    }
}
