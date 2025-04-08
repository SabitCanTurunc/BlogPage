import { HttpErrorResponse } from '@angular/common/http';

export class ErrorHandlerUtil {
  /**
   * Http hatalarını işleyip kullanıcı dostu hata mesajları döndürür
   * @param error HttpErrorResponse nesnesi
   * @param defaultMessage Varsayılan hata mesajı
   * @returns Kullanıcı dostu hata mesajı
   */
  public static handleError(error: HttpErrorResponse, defaultMessage: string = 'Bir hata oluştu'): string {
    console.log('ErrorHandlerUtil işliyor:', error);
    
    // Backend'den gelen özel hata mesajını kontrol et (customException)
    if (error.error?.customException?.message) {
      console.log('Backend customException hata mesajı:', error.error.customException.message);
      const errorMessage = error.error.customException.message;
      // Backend hata mesajı Türkçe gelebilir veya çevirmeye ihtiyacı olabilir
      return this.translateErrorMessage(errorMessage);
    }

    // Standart API hata mesajı
    if (error.error?.message) {
      console.log('Backend standard hata mesajı:', error.error.message);
      return this.translateErrorMessage(error.error.message);
    }

    // Hata kodu veya tipi varsa
    if (error.error?.errorCode) {
      console.log('Backend hata kodu:', error.error.errorCode);
      return this.getMessageByErrorCode(error.error.errorCode);
    }

    // HTTP Status koduna göre mesaj
    if (error.status) {
      // Duruma göre özel mesajlar
      switch (error.status) {
        case 0:
          return 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.';
        case 401:
          return 'Oturumunuz sonlanmış olabilir. Lütfen tekrar giriş yapın.';
        case 403:
          return 'Bu işlemi yapmak için yetkiniz bulunmuyor.';
        case 404:
          return 'İstediğiniz kaynak bulunamadı.';
        case 500:
          return 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
      }
    }

    // Genel hata mesajı
    if (error.message) {
      return this.translateErrorMessage(error.message);
    }

    // Hiçbir özel durum yoksa varsayılan mesajı döndür
    return defaultMessage;
  }
  
  /**
   * Backend'den gelen hata koduna göre anlamlı bir Türkçe mesaj döndürür
   */
  private static getMessageByErrorCode(errorCode: string): string {
    switch (errorCode) {
      // 1xxx - Kaynak Bulunamadı (404)
      case '1001': return 'Aradığınız kayıt sistemde bulunamadı.';
      case '1002': return 'Kullanıcı bulunamadı.';
      case '1003': return 'Makale bulunamadı.';
      case '1004': return 'Yorum bulunamadı.';
      case '1005': return 'Kategori bulunamadı.';

      // 2xxx - Geçersiz İstek / Validasyon Hataları (400)
      case '2001': return 'Geçersiz istek formatı.';
      case '2002': return 'Hesabınız zaten doğrulanmış.';
      case '2003': return 'Girdiğiniz doğrulama kodu geçersiz.';
      case '2004': return 'Doğrulama kodunun süresi dolmuş, lütfen yeni kod talep edin.';
      case '2005': return 'Doğrulama kodu oluşturulmamış.';
      case '2006': return 'Şifre en az 8 karakter olmalı ve en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.';
      case '2007': return 'Geçerli bir e-posta adresi giriniz.';
      case '2008': return 'Kullanıcı adı en az 3, en fazla 20 karakter olmalı ve özel karakter içermemelidir.';
      case '2009': return 'Girdiğiniz şifreler eşleşmiyor.';
      case '2010': return 'Lütfen tüm zorunlu alanları doldurun.';

      // 3xxx - Yetkilendirme Hataları (401)
      case '3001': return 'E-posta adresi veya şifre hatalı.';
      case '3002': return 'Oturum süreniz doldu, lütfen tekrar giriş yapın.';
      case '3003': return 'Geçersiz veya hasarlı oturum tokeni.';
      case '3004': return 'E-posta adresiniz henüz doğrulanmamış, lütfen e-postanızı kontrol edin.';

      // 4xxx - Erişim Engellendi (403)
      case '4001': return 'Bu işlemi yapmak için gerekli yetkiye sahip değilsiniz.';
      case '4002': return 'Hesabınız kilitlendi. Lütfen daha sonra tekrar deneyin veya destek ekibiyle iletişime geçin.';
      case '4003': return 'Hesabınız devre dışı bırakıldı.';
      case '4004': return 'Bu işlemi gerçekleştirmek için gerekli role sahip değilsiniz.';

      // 5xxx - Çakışma Hataları (409)
      case '5001': return 'Bu e-posta adresi zaten kayıtlı.';
      case '5002': return 'Bu kullanıcı adı zaten kullanılıyor.';
      case '5003': return 'Bu kayıt zaten mevcut.';
      case '5004': return 'Kaynak çakışması oluştu.';

      // 6xxx - İşlem Başarısız (422)
      case '6001': return 'E-posta gönderimi başarısız oldu, lütfen daha sonra tekrar deneyin.';
      case '6002': return 'Dosya yükleme işlemi başarısız oldu.';
      case '6003': return 'İşlem tamamlanamadı.';
      case '6004': return 'Geçersiz resim formatı, lütfen JPEG, PNG veya GIF formatında bir dosya yükleyin.';
      case '6005': return 'Dosya boyutu çok büyük, maksimum 5MB yükleyebilirsiniz.';

      // 9xxx - Genel Sistem Hataları (500)
      case '9001': return 'Sistemde beklenmeyen bir hata oluştu.';
      case '9002': return 'Veritabanı işlemi sırasında bir hata oluştu.';
      case '9003': return 'Dış servis bağlantısında bir sorun oluştu.';
      case '9004': return 'Sunucu şu anda yoğun, lütfen daha sonra tekrar deneyin.';

      default: return 'Beklenmeyen bir hata oluştu.';
    }
  }
  
  /**
   * İngilizce hata mesajlarını Türkçe'ye çevirir
   */
  private static translateErrorMessage(message: string): string {
    // İngilizce'den Türkçe'ye çevirme kuralları
    const messageMap: { [key: string]: string } = {
      // Genel hata mesajları
      'An error occurred': 'Bir hata oluştu',
      'Internal server error': 'Sunucu hatası',
      'Bad request': 'Geçersiz istek',
      'Not found': 'Bulunamadı',
      'Unauthorized': 'Yetkisiz erişim',
      'Forbidden': 'Erişim engellendi',
      
      // Highlight ile ilgili hatalar
      'Post highlight not found': 'Öne çıkarılan içerik bulunamadı. Sayfayı yenileyip tekrar deneyiniz.',
      'HIGHLIGHT_NOT_FOUND': 'Öne çıkarılan içerik bulunamadı',
      'NOT_HIGHLIGHT_OWNER': 'Bu öne çıkarılan içeriği kaldırma yetkiniz yok',
      'HIGHLIGHT_ALREADY_EXISTS': 'Bu içerik zaten öne çıkarılmış',
      'DAILY_HIGHLIGHT_LIMIT_EXCEEDED': 'Günlük öne çıkarma limitine ulaştınız',
      'highlight not found': 'Öne çıkarma bulunamadı',
      'daily highlight limit': 'Günlük öne çıkarma limiti',
      
      // E-posta doğrulama ile ilgili
      'Email already verified': 'E-posta adresi zaten doğrulanmış',
      'Verification code is incorrect': 'Doğrulama kodu hatalı',
      'Verification code has expired': 'Doğrulama kodunun süresi dolmuş',
      'Email not verified': 'E-posta adresi doğrulanmamış',
      'already verified': 'zaten doğrulanmış',
      'incorrect code': 'hatalı kod',
      'expired': 'süresi dolmuş',
      'Email not registered': 'Bu e-posta adresi kayıtlı değil',
      'Code is incorrect': 'Doğrulama kodu hatalı',
      'Code has expired': 'Doğrulama kodunun süresi dolmuş',
      
      // Kayıt ve Giriş
      'Email already registered': 'Bu e-posta adresi zaten kayıtlı',
      'Username already exists': 'Bu kullanıcı adı zaten kullanılıyor',
      'Invalid credentials': 'E-posta adresi veya şifre hatalı',
      'Email or password is incorrect': 'E-posta adresi veya şifre hatalı',
      'Password is incorrect': 'Şifre hatalı',
      'invalid_credentials': 'E-posta adresi veya şifre hatalı',
      
      // Şifre sıfırlama
      'Password reset failed': 'Şifre sıfırlama başarısız oldu',
      'Verification code is required': 'Doğrulama kodu gereklidir',
      'New password is required': 'Yeni şifre gereklidir',
      'verification code': 'doğrulama kodu',
      'verification code is incorrect': 'doğrulama kodu hatalı',
      'verification code has expired': 'doğrulama kodunun süresi dolmuş',
      'verificaton code is incorrect': 'doğrulama kodu hatalı',
      'verificaton code has expired': 'doğrulama kodunun süresi dolmuş',
      
      // Makaleler
      'Post not found': 'Makale bulunamadı',
      'post not found': 'makale bulunamadı',
      'Post creation failed': 'Makale oluşturma başarısız oldu',
      'Post update failed': 'Makale güncelleme başarısız oldu',
      'Post deletion failed': 'Makale silme başarısız oldu',
      
      // Kullanıcı profileri
      'User not found': 'Kullanıcı bulunamadı',
      'user not found': 'kullanıcı bulunamadı',
      'Profile update failed': 'Profil güncelleme başarısız oldu',
      'Password update failed': 'Şifre güncelleme başarısız oldu',
      'Current password is incorrect': 'Mevcut şifre hatalı',
      'current password is incorrect': 'mevcut şifre hatalı',
    };

    // Tam eşleşme kontrolü
    if (messageMap[message]) {
      return messageMap[message];
    }

    // Kısmi eşleşme kontrolü
    // İngilizce mesajda geçen anahtar kelimeleri ara
    for (const key in messageMap) {
      if (message.toLowerCase().includes(key.toLowerCase())) {
        return messageMap[key];
      }
    }

    // Çeviri bulunamadıysa orijinal mesajı döndür
    return message;
  }
} 