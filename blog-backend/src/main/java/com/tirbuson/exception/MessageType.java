package com.tirbuson.exception;

import lombok.Getter;

@Getter
public enum MessageType {

    // 1xxx - Kaynak Bulunamadı (404)
    NO_RECORD_EXIST("1001", "Aradığınız kayıt sistemde bulunamadı"),
    USER_NOT_FOUND("1002", "Kullanıcı bulunamadı"),
    POST_NOT_FOUND("1003", "Makale bulunamadı"),
    COMMENT_NOT_FOUND("1004", "Yorum bulunamadı"),
    CATEGORY_NOT_FOUND("1005", "Kategori bulunamadı"),
    HIGHLIGHT_NOT_FOUND("1006", "Highlight bulunamadı"),
    SUBSCRIPTION_REQUEST_NOT_FOUND("1007", "Abonelik talebi bulunamadı"),

    // 2xxx - Geçersiz İstek / Validasyon Hataları (400)
    INVALID_REQUEST("2001", "Geçersiz istek formatı"),
    ALREADY_VERIFIED("2002", "Hesabınız zaten doğrulanmış"),
    INVALID_VERIFICATION_CODE("2003", "Girdiğiniz doğrulama kodu geçersiz"),
    CODE_EXPIRED("2004", "Doğrulama kodunun süresi dolmuş, lütfen yeni kod talep edin"),
    VERIFICATION_CODE_NOT_SET("2005", "Doğrulama kodu oluşturulmamış"),
    INVALID_PASSWORD_FORMAT("2006", "Şifre en az 8 karakter olmalı ve en az bir büyük harf, bir küçük harf ve bir rakam içermelidir"),
    INVALID_EMAIL_FORMAT("2007", "Geçerli bir e-posta adresi giriniz"),
    INVALID_USERNAME_FORMAT("2008", "Kullanıcı adı en az 3, en fazla 20 karakter olmalı ve özel karakter içermemelidir"),
    PASSWORD_MISMATCH("2009", "Girdiğiniz şifreler eşleşmiyor"),
    MISSING_REQUIRED_FIELD("2010", "Lütfen tüm zorunlu alanları doldurun"),
    DAILY_HIGHLIGHT_LIMIT_EXCEEDED("2011", "Günlük highlight limitine ulaştınız."),
    HIGHLIGHT_ALREADY_EXISTS("2012", "Bu post zaten highlight edilmiş"),
    PENDING_REQUEST_EXISTS("2013", "Zaten bekleyen bir abonelik talebiniz bulunmaktadır"),

    // 3xxx - Yetkilendirme Hataları (401)
    INVALID_CREDENTIALS("3001", "E-posta adresi veya şifre hatalı"),
    TOKEN_EXPIRED("3002", "Oturum süreniz doldu, lütfen tekrar giriş yapın"),
    INVALID_TOKEN("3003", "Geçersiz veya hasarlı oturum tokeni"),
    EMAIL_NOT_VERIFIED("3004", "E-posta adresiniz henüz doğrulanmamış, lütfen e-postanızı kontrol edin"),

    // 4xxx - Erişim Engellendi (403)
    UNAUTHORIZED_ACCESS("4001", "Bu işlemi yapmak için gerekli yetkiye sahip değilsiniz"),
    ACCOUNT_LOCKED("4002", "Hesabınız kilitlendi. Lütfen daha sonra tekrar deneyin veya destek ekibiyle iletişime geçin"),
    ACCOUNT_DISABLED("4003", "Hesabınız devre dışı bırakıldı"),
    INVALID_ROLE("4004", "Bu işlemi gerçekleştirmek için gerekli role sahip değilsiniz"),
    NOT_HIGHLIGHT_OWNER("4005", "Bu highlight'i silme yetkiniz yok"),

    // 5xxx - Çakışma Hataları (409)
    EMAIL_ALREADY_EXISTS("5001", "Bu e-posta adresi zaten kayıtlı"),
    USERNAME_ALREADY_EXISTS("5002", "Bu kullanıcı adı zaten kullanılıyor"),
    DUPLICATE_RECORD("5003", "Bu kayıt zaten mevcut"),
    RESOURCE_CONFLICT("5004", "Kaynak çakışması oluştu"),

    // 6xxx - İşlem Başarısız (422)
    EMAIL_SENDING_FAILED("6001", "E-posta gönderimi başarısız oldu, lütfen daha sonra tekrar deneyin"),
    FILE_UPLOAD_FAILED("6002", "Dosya yükleme işlemi başarısız oldu"),
    PROCESS_FAILED("6003", "İşlem tamamlanamadı"),
    INVALID_IMAGE_FORMAT("6004", "Geçersiz resim formatı, lütfen JPEG, PNG veya GIF formatında bir dosya yükleyin"),
    FILE_TOO_LARGE("6005", "Dosya boyutu çok büyük, maksimum 5MB yükleyebilirsiniz"),

    // 9xxx - Genel Sistem Hataları (500)
    GENERAL_EXCEPTION("9001", "Sistemde beklenmeyen bir hata oluştu"),
    DATABASE_ERROR("9002", "Veritabanı işlemi sırasında bir hata oluştu"),
    EXTERNAL_SERVICE_ERROR("9003", "Dış servis bağlantısında bir sorun oluştu"),
    SERVER_OVERLOAD("9004", "Sunucu şu anda yoğun, lütfen daha sonra tekrar deneyin");

    private String code;
    private String message;

    MessageType(String code, String message) {
        this.code = code;
        this.message = message;
    }
}