import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

interface TranslationValue {
  [key: string]: string;
}

interface Translations {
  [key: string]: TranslationValue;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLang = new BehaviorSubject<string>('tr');
  currentLang$ = this.currentLang.asObservable();

  private translations: Translations = {
    tr: {
      'home': 'Ana Sayfa',
      'login': 'Giriş Yap',
      'signup': 'Kayıt Ol',
      'logout': 'Çıkış Yap',
      'create_post': 'Yazı Oluştur',
      'create_post_edit_title': 'Blog Yazısını Düzenle',
      'create_post_new_title': 'Yeni Blog Yazısı Oluştur',
      'create_post_subtitle': 'Düşüncelerinizi ve bilgilerinizi paylaşın',
      'create_post_login_required': 'Lütfen önce giriş yapın.',
      'create_post_title': 'Başlık',
      'create_post_title_placeholder': 'Blog yazınızın başlığını girin',
      'create_post_title_required': 'Başlık alanı zorunludur',
      'create_post_category': 'Kategori',
      'create_post_select_category': 'Kategori seçin',
      'create_post_category_required': 'Kategori seçimi zorunludur',
      'create_post_content': 'İçerik',
      'create_post_content_placeholder': 'Blog yazınızın içeriğini girin',
      'create_post_content_required': 'İçerik alanı zorunludur',
      'create_post_upload_image': 'Resim Yükle',
      'create_post_select_image': 'Resim Seç',
      'create_post_image_upload_info': 'En fazla 5 resim, her biri 20MB\'dan küçük olmalıdır.',
      'create_post_uploaded_image': 'Yüklenen resim',
      'create_post_uploading': 'Resim yükleniyor...',
      'create_post_cancel': 'İptal',
      'create_post_submitting': 'Gönderiliyor...',
      'create_post_update': 'Güncelle',
      'create_post_submit': 'Gönder',
      'profile': 'Profil',
      'admin': 'Admin Panel',
      'contact': 'İletişim',
      'search': 'Ara...',
      'welcome': 'Bilginin ışıldadığı platform!',
      'read_more': 'Devamını Oku',
      'comments': 'Yorumlar',
      'add_comment': 'Yorum Yap',
      'save': 'Kaydet',
      'cancel': 'İptal',
      'delete': 'Sil',
      'edit': 'Düzenle',
      'title': 'Başlık',
      'content': 'İçerik',
      'category': 'Kategoriler',
      'all': 'Tümü',
      'tags': 'Etiketler',
      'publish': 'Yayınla',
      'draft': 'Taslak',
      'published': 'Yayınlandı',
      'draft_status': 'Taslak',
      'error': 'Hata',
      'success': 'Başarılı',
      'loading': 'Yükleniyor...',
      'no_posts': 'Henüz yazı bulunmuyor',
      'no_comments': 'Henüz yorum yapılmamış',
      'confirm_delete': 'Silmek istediğinize emin misiniz?',
      'yes': 'Evet',
      'no': 'Hayır',
      'popular_authors': 'Popüler Yazarlar',
      'recent_posts': 'Son Yazılar',
      'load_more': 'Daha Fazla Yazı Yükle',
      'email': 'E-posta',
      'password': 'Şifre',
      'email_placeholder': 'E-posta adresinizi giriniz',
      'password_placeholder': 'Şifrenizi giriniz',
      'email_required': 'E-posta adresi zorunludur',
      'email_invalid': 'Geçerli bir e-posta adresi giriniz',
      'password_required': 'Şifre zorunludur',
      'forgot_password': 'Şifremi Unuttum',
      'logging_in': 'Giriş Yapılıyor...',
      'redirecting_to_verify': 'Doğrulama ekranına yönlendiriliyor...',
      'no_account': 'Hesabınız yok mu?',
      'admin_panel': 'Admin Paneli',
      'admin_user_management': 'Kullanıcı Yönetimi',
      'admin_category_management': 'Kategori Yönetimi',
      'admin_post_management': 'Post Yönetimi',
      'admin_access_denied': 'Bu sayfaya erişim yetkiniz bulunmamaktadır.',
      'admin_search_users': 'Kullanıcı ara...',
      'admin_search_categories': 'Kategori ara...',
      'admin_search_posts': 'Yazı ara...',
      'admin_save_changes': 'Değişiklikleri Kaydet',
      'admin_id': 'ID',
      'admin_username': 'Kullanıcı Adı',
      'admin_email': 'E-posta',
      'admin_role': 'Yönetici',
      'admin_status': 'Durum',
      'admin_actions': 'İşlemler',
      'admin_user_role': 'Kullanıcı',
      'admin_admin_role': 'Admin',
      'admin_active': 'Aktif',
      'admin_inactive': 'Pasif',
      'admin_delete': 'Sil',
      'admin_edit': 'Düzenle',
      'admin_name': 'Ad',
      'admin_title': 'Başlık',
      'admin_author': 'Yazar',
      'admin_date': 'Tarih',
      'admin_new_category': 'Yeni kategori adı',
      'admin_add_category': 'Ekle',
      'admin_created_at': 'Oluşturulma Tarihi',
      'admin_no_date': 'Tarih yok',
      'images': 'Görseller',
      'post_image': 'Post görseli',
      'post_load_error': 'Yazılar yüklenirken hata oluştu',
      'profile_load_error': 'Profil bilgileri yüklenirken hata oluştu',
      'user_role': 'Kullanıcı',
      'phone': 'Telefon',
      'gender': 'Cinsiyet',
      'male': 'Erkek',
      'female': 'Kadın',
      'other': 'Diğer',
      'posts': 'Yazı',
      'my_posts': 'Yazılarım',
      'account_settings': 'Hesap Ayarları',
      'change_password': 'Şifre Değiştir',
      'delete_account': 'Hesabı Sil',
      'back_to_home': 'Ana Sayfaya Dön',
      'user_posts': 'Kullanıcısının Yazıları',
      'search_posts': 'Yazılarda ara...',
      'no_posts_yet': 'Henüz hiç yazı yazmadınız.',
      'user_no_posts': 'Bu kullanıcı henüz hiç yazı yazmamış.',
      'create_new_post': 'Yeni Yazı Oluştur',
      'view': 'Görüntüle',
      'username': 'Kullanıcı Adı',
      'username_required': 'Kullanıcı adı gereklidir',
      'email_cannot_change': 'E-posta adresi değiştirilemez',
      'name': 'Ad',
      'surname': 'Soyad',
      'select': 'Seçiniz',
      'about_me': 'Hakkımda',
      'signup_title': 'Hesap Oluştur',
      'signup_subtitle': 'Blog platformuna katılın ve düşüncelerinizi paylaşın',
      'username_placeholder': 'Kullanıcı adınızı giriniz',
      'username_minlength': 'Kullanıcı adı en az 3 karakter olmalıdır',
      'confirm_password': 'Şifre Tekrarı',
      'confirm_password_placeholder': 'Şifrenizi tekrar giriniz',
      'confirm_password_required': 'Şifre tekrarı zorunludur',
      'password_mismatch': 'Şifreler eşleşmiyor',
      'signup_button': 'Hesap Oluştur',
      'signup_loading': 'Oluşturuluyor...',
      'already_have_account': 'Zaten hesabınız var mı?',
      'updating': 'Güncelleniyor...',
      'update_account_info': 'Hesap Bilgilerini Güncelle',
      'change_password_title': 'Şifre Değiştir',
      'change_password_security_info': 'Güvenliğiniz için, şifre değiştirme işlemi sırasında e-posta doğrulaması gereklidir.',
      'verification_code': 'Doğrulama Kodu',
      'verification_code_placeholder': 'Doğrulama kodunu giriniz',
      'verification_code_required': 'Doğrulama kodu gereklidir',
      'verification_code_minlength': 'Doğrulama kodu en az 6 karakter olmalıdır',
      'new_password': 'Yeni Şifre',
      'new_password_placeholder': 'Yeni şifrenizi giriniz',
      'new_password_required': 'Yeni şifre gereklidir',
      'new_password_minlength': 'Şifre en az 6 karakter olmalıdır',
      'confirm_new_password': 'Şifre Tekrar',
      'confirm_new_password_placeholder': 'Yeni şifrenizi tekrar giriniz',
      'confirm_new_password_required': 'Şifre tekrarı gereklidir',
      'request_code': 'Doğrulama Kodu İste',
      'sending_code': 'Kod Gönderiliyor...',
      'resend_code': 'Yeni Kod İste',
      'resending_code': 'Kod Gönderiliyor...',
      'update_password': 'Şifremi Değiştir',
      'updating_password': 'Güncelleniyor...',
      'account_update_success': 'Hesap bilgileriniz başarıyla güncellendi',
      'account_update_error': 'Hesap bilgileri güncellenirken bir hata oluştu',
      'password_reset_code_sent': 'Doğrulama kodu e-posta adresinize gönderildi',
      'password_reset_code_error': 'Doğrulama kodu gönderilirken bir hata oluştu',
      'password_update_success': 'Şifreniz başarıyla güncellendi',
      'password_update_error': 'Şifre güncellenirken bir hata oluştu',
      'account_delete_success': 'Hesabınız başarıyla silindi',
      'account_delete_error': 'Hesap silinirken bir hata oluştu',
      'post_delete_success': 'Yazı başarıyla silindi',
      'post_delete_error': 'Yazı silinirken bir hata oluştu',
      'image_upload_success': 'Profil fotoğrafı başarıyla güncellendi',
      'image_upload_error': 'Profil fotoğrafı güncellenirken bir hata oluştu',
      'image_size_error': 'Dosya boyutu çok büyük. Lütfen 5MB\'dan küçük bir dosya seçin',
      'image_type_error': 'Geçersiz dosya türü. Lütfen bir resim dosyası seçin',
      'account_delete_confirm': 'Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!',
      'post_delete_confirm': 'Bu yazıyı silmek istediğinizden emin misiniz?',
      'verification_code_resent': 'Doğrulama kodu tekrar gönderildi. Lütfen e-posta kutunuzu kontrol ediniz.',
      'verification_code_resend_error': 'Doğrulama kodu gönderilemedi.',
      'verification_code_send_error': 'Doğrulama kodu gönderilirken bir hata oluştu. Lütfen tekrar deneyin.',
      'search_placeholder': 'Blog yazılarında ara...',
      'loading_posts': 'Yazılar yükleniyor...',
      'all_posts_loaded': 'Tüm yazılar yüklendi.',
      'no_posts_found': 'Henüz Yazı Bulunamadı',
      'no_posts_message': 'Bu kategoride henüz yazı bulunmuyor. Daha sonra tekrar kontrol edin veya başka bir kategori seçin.',
      'sidebar_load_error': 'Yan panel verileri yüklenemedi',
      'categories_load_error': 'Kategoriler yüklenemedi',
      'authors_load_error': 'Popüler yazarlar yüklenemedi',
      'recent_posts_load_error': 'Son yazılar yüklenemedi',
      'load_more_error': 'Daha fazla yazı yüklenirken bir hata oluştu',
      'write_comment': 'Yorumunuzu yazın...',
      'comment_required': 'Yorum alanı boş bırakılamaz',
      'sending': 'Gönderiliyor...',
      'comment_action': 'Yorum Yap',
      'login_to_comment': 'Yorum yapmak için lütfen giriş yapın:',
      'no_comments_yet': 'Henüz yorum yapılmamış.',
      'user_avatar_alt': 'Kullanıcı',
      'delete_comment': 'Yorumu Sil',
      'user': 'Kullanıcı',
      'delete_profile_image_title': 'Profil Fotoğrafını Sil',
      'delete_profile_image_text': 'Profil fotoğrafınızı silmek istediğinizden emin misiniz?',
      'yes_delete': 'Evet, Sil',
      'profile_image_deleted': 'Profil fotoğrafı başarıyla silindi',
      'profile_image_delete_error': 'Profil fotoğrafı silinirken bir hata oluştu',
      'date_month_january': 'Ocak',
      'date_month_february': 'Şubat',
      'date_month_march': 'Mart',
      'date_month_april': 'Nisan',
      'date_month_may': 'Mayıs',
      'date_month_june': 'Haziran',
      'date_month_july': 'Temmuz',
      'date_month_august': 'Ağustos',
      'date_month_september': 'Eylül',
      'date_month_october': 'Ekim',
      'date_month_november': 'Kasım',
      'date_month_december': 'Aralık',
      'date_day_monday': 'Pazartesi',
      'date_day_tuesday': 'Salı',
      'date_day_wednesday': 'Çarşamba',
      'date_day_thursday': 'Perşembe',
      'date_day_friday': 'Cuma',
      'date_day_saturday': 'Cumartesi',
      'date_day_sunday': 'Pazar',
      'date_day_short_monday': 'Pt',
      'date_day_short_tuesday': 'Sa',
      'date_day_short_wednesday': 'Ça',
      'date_day_short_thursday': 'Pe',
      'date_day_short_friday': 'Cu',
      'date_day_short_saturday': 'Ct',
      'date_day_short_sunday': 'Pa',
      'date_today': 'Bugün',
      'date_yesterday': 'Dün',
      'date_tomorrow': 'Yarın',
      'date_format_short': 'dd.MM.yyyy',
      'date_format_medium': 'dd MMM yyyy',
      'date_format_long': 'd MMMM yyyy',
      'date_format_full': 'd MMMM yyyy EEEE',
      'edit_comment': 'Yorumu Düzenle',
      'highlight': 'Öne Çıkar',
      'highlighted': 'Öne Çıkarıldı',
      'daily_highlight_limit_reached': 'Günlük öne çıkarma limitine ulaştınız. Yarın tekrar deneyebilirsiniz.',
      'post_highlighted_success': 'Yazı başarıyla öne çıkarıldı',
      'post_highlight_error': 'Yazı öne çıkarılırken bir hata oluştu',
      'no_highlights': 'Henüz öne çıkarılan içerik yok',
      'highlights': 'Öne Çıkanlar',
      'highlights_load_error': 'Öne çıkarılan içerikler yüklenirken hata oluştu',
      'view_highlighted_post': 'Öne çıkan içeriği görüntüle',
      'discover_highlighted_posts': 'Tüm kullanıcıların öne çıkardığı içerikler',
      'view_post': 'Yazıyı Görüntüle',
      'user_highlights': 'Kullanıcının Öne Çıkanları',
      'no_highlights_for_user': 'Kullanıcının henüz öne çıkardığı içerik yok',
      'no_image_available': 'Resim yok',
      'remove_highlight': 'Öne Çıkarmayı Kaldır',
      'highlight_removed_success': 'Yazı öne çıkarmadan kaldırıldı',
      'highlight_remove_error': 'Yazı öne çıkarmadan kaldırılırken bir hata oluştu',
      'highlight_not_found': 'Öne çıkarılan içerik bulunamadı',
      'highlight_already_exists': 'Bu yazı zaten öne çıkarılmış',
      'daily_highlight_limit': 'Günlük öne çıkarma limitine ulaştınız',
      'summarize_post': 'Özet Çıkar',
      'post_summary': 'Yazı Özeti',
      'ai_summary': 'Yapay Zeka Özeti',
      'ai_summary_creating': 'Yapay zeka özeti oluşturuluyor...',
      'ai_generated': 'Yapay zeka tarafından oluşturuldu',
      'close': 'Kapat',
      'summary_creating': 'Özet oluşturuluyor...',
      'regenerate_summary': 'Yeniden Oluştur',
      'ai_complete': 'AI ile Tamamla',
      'ai_generating': 'Yazı oluşturuluyor...',
      'ai_generated_content': 'AI Tarafından Oluşturulan İçerik',
      'ai_apply': 'Uygula',
      'ai_error_empty_fields': 'Lütfen AI\'ın yardımcı olabilmesi için en az bir alan doldurun.',
      'ai_error_generation': 'İçerik oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.',
      'dark_mode': 'Karanlık Mod',
      'light_mode': 'Aydınlık Mod',
      'theme_changed': 'Tema değiştirildi',
      'theme_toggle': 'Tema Değiştir',
    },
    en: {
      'home': 'Home',
      'login': 'Login',
      'signup': 'Sign Up',
      'logout': 'Logout',
      'create_post': 'Create Post',
      'create_post_edit_title': 'Edit Blog Post',
      'create_post_new_title': 'Create New Blog Post',
      'create_post_subtitle': 'Share your thoughts and knowledge',
      'create_post_login_required': 'Please login first.',
      'create_post_title': 'Title',
      'create_post_title_placeholder': 'Enter your blog post title',
      'create_post_title_required': 'Title is required',
      'create_post_category': 'Category',
      'create_post_select_category': 'Select a category',
      'create_post_category_required': 'Category selection is required',
      'create_post_content': 'Content',
      'create_post_content_placeholder': 'Enter your blog post content',
      'create_post_content_required': 'Content is required',
      'create_post_upload_image': 'Upload Image',
      'create_post_select_image': 'Select Image',
      'create_post_image_upload_info': 'Maximum 5 images, each under 20MB.',
      'create_post_uploaded_image': 'Uploaded image',
      'create_post_uploading': 'Uploading...',
      'create_post_cancel': 'Cancel',
      'create_post_submitting': 'Submitting...',
      'create_post_update': 'Update',
      'create_post_submit': 'Submit',
      'profile': 'Profile',
      'admin': 'Admin Panel',
      'contact': 'Contact',
      'search': 'Search...',
      'welcome': 'Let your knowledge shine',
      'read_more': 'Read More',
      'comments': 'Comments',
      'add_comment': 'Add Comment',
      'save': 'Save',
      'cancel': 'Cancel',
      'delete': 'Delete',
      'edit': 'Edit',
      'title': 'Title',
      'content': 'Content',
      'category': 'Categories',
      'all': 'All',
      'tags': 'Tags',
      'publish': 'Publish',
      'draft': 'Draft',
      'published': 'Published',
      'draft_status': 'Draft',
      'error': 'Error',
      'success': 'Success',
      'loading': 'Loading...',
      'no_posts': 'No posts yet',
      'no_comments': 'No comments yet',
      'confirm_delete': 'Are you sure you want to delete?',
      'yes': 'Yes',
      'no': 'No',
      'popular_authors': 'Popular Authors',
      'recent_posts': 'Recent Posts',
      'load_more': 'Load More Posts',
      'email': 'Email',
      'password': 'Password',
      'email_placeholder': 'Enter your email address',
      'password_placeholder': 'Enter your password',
      'email_required': 'Email is required',
      'email_invalid': 'Please enter a valid email address',
      'password_required': 'Password is required',
      'forgot_password': 'Forgot Password',
      'logging_in': 'Logging in...',
      'redirecting_to_verify': 'Redirecting to verification screen...',
      'no_account': 'Don\'t have an account?',
      'admin_panel': 'Admin Panel',
      'admin_user_management': 'User Management',
      'admin_category_management': 'Category Management',
      'admin_post_management': 'Post Management',
      'admin_access_denied': 'You do not have permission to access this page.',
      'admin_search_users': 'Search users...',
      'admin_search_categories': 'Search categories...',
      'admin_search_posts': 'Search posts...',
      'admin_save_changes': 'Save Changes',
      'admin_id': 'ID',
      'admin_username': 'Username',
      'admin_email': 'Email',
      'admin_role': 'Admin',
      'admin_status': 'Status',
      'admin_actions': 'Actions',
      'admin_user_role': 'User',
      'admin_admin_role': 'Admin',
      'admin_active': 'Active',
      'admin_inactive': 'Inactive',
      'admin_delete': 'Delete',
      'admin_edit': 'Edit',
      'admin_name': 'Name',
      'admin_title': 'Title',
      'admin_author': 'Author',
      'admin_date': 'Date',
      'admin_new_category': 'New category name',
      'admin_add_category': 'Add',
      'admin_created_at': 'Created At',
      'admin_no_date': 'No date',
      'images': 'Images',
      'post_image': 'Post image',
      'post_load_error': 'Error loading posts',
      'profile_load_error': 'Error loading profile information',
      'user_role': 'User',
      'phone': 'Phone',
      'gender': 'Gender',
      'male': 'Male',
      'female': 'Female',
      'other': 'Other',
      'posts': 'Posts',
      'my_posts': 'My Posts',
      'account_settings': 'Account Settings',
      'change_password': 'Change Password',
      'delete_account': 'Delete Account',
      'back_to_home': 'Back to Home',
      'user_posts': 'User\'s Posts',
      'search_posts': 'Search posts...',
      'no_posts_yet': 'You haven\'t written any posts yet.',
      'user_no_posts': 'This user hasn\'t written any posts yet.',
      'create_new_post': 'Create New Post',
      'view': 'View',
      'username': 'Username',
      'username_required': 'Username is required',
      'email_cannot_change': 'Email address cannot be changed',
      'name': 'Name',
      'surname': 'Surname',
      'select': 'Select',
      'about_me': 'About Me',
      'signup_title': 'Create Account',
      'signup_subtitle': 'Join the blog platform and share your thoughts',
      'username_placeholder': 'Enter your username',
      'username_minlength': 'Username must be at least 3 characters',
      'confirm_password': 'Confirm Password',
      'confirm_password_placeholder': 'Re-enter your password',
      'confirm_password_required': 'Password confirmation is required',
      'password_mismatch': 'Passwords do not match',
      'signup_button': 'Create Account',
      'signup_loading': 'Creating...',
      'already_have_account': 'Already have an account?',
      'updating': 'Updating...',
      'update_account_info': 'Update Account Information',
      'change_password_title': 'Change Password',
      'change_password_security_info': 'For your security, email verification is required during the password change process.',
      'verification_code': 'Verification Code',
      'verification_code_placeholder': 'Enter verification code',
      'verification_code_required': 'Verification code is required',
      'verification_code_minlength': 'Verification code must be at least 6 characters',
      'new_password': 'New Password',
      'new_password_placeholder': 'Enter your new password',
      'new_password_required': 'New password is required',
      'new_password_minlength': 'Password must be at least 6 characters',
      'confirm_new_password': 'Confirm Password',
      'confirm_new_password_placeholder': 'Re-enter your new password',
      'confirm_new_password_required': 'Password confirmation is required',
      'request_code': 'Request Verification Code',
      'sending_code': 'Sending Code...',
      'resend_code': 'Request New Code',
      'resending_code': 'Sending Code...',
      'update_password': 'Change My Password',
      'updating_password': 'Updating...',
      'account_update_success': 'Your account information has been successfully updated',
      'account_update_error': 'An error occurred while updating account information',
      'password_reset_code_sent': 'Verification code has been sent to your email address',
      'password_reset_code_error': 'An error occurred while sending the verification code',
      'password_update_success': 'Your password has been successfully updated',
      'password_update_error': 'An error occurred while updating the password',
      'account_delete_success': 'Your account has been successfully deleted',
      'account_delete_error': 'An error occurred while deleting the account',
      'post_delete_success': 'Post has been successfully deleted',
      'post_delete_error': 'An error occurred while deleting the post',
      'image_upload_success': 'Profile photo has been successfully updated',
      'image_upload_error': 'An error occurred while updating the profile photo',
      'image_size_error': 'File size is too large. Please select a file smaller than 5MB',
      'image_type_error': 'Invalid file type. Please select an image file',
      'account_delete_confirm': 'Are you sure you want to delete your account? This action cannot be undone!',
      'post_delete_confirm': 'Are you sure you want to delete this post?',
      'verification_code_resent': 'Verification code has been resent. Please check your email.',
      'verification_code_resend_error': 'Failed to send verification code.',
      'verification_code_send_error': 'An error occurred while sending the verification code. Please try again.',
      'search_placeholder': 'Search in blog posts...',
      'loading_posts': 'Loading posts...',
      'all_posts_loaded': 'All posts have been loaded.',
      'no_posts_found': 'No Posts Found',
      'no_posts_message': 'No posts found in this category. Check back later or select another category.',
      'sidebar_load_error': 'Failed to load sidebar data',
      'categories_load_error': 'Failed to load categories',
      'authors_load_error': 'Failed to load popular authors',
      'recent_posts_load_error': 'Failed to load recent posts',
      'load_more_error': 'An error occurred while loading more posts',
      'write_comment': 'Write your comment...',
      'comment_required': 'Comment field cannot be empty',
      'sending': 'Sending...',
      'comment_action': 'Comment',
      'login_to_comment': 'Please log in to comment:',
      'no_comments_yet': 'No comments yet.',
      'user_avatar_alt': 'User',
      'delete_comment': 'Delete Comment',
      'user': 'User',
      'delete_profile_image_title': 'Delete Profile Picture',
      'delete_profile_image_text': 'Are you sure you want to delete your profile picture?',
      'yes_delete': 'Yes, Delete',
      'profile_image_deleted': 'Profile picture successfully deleted',
      'profile_image_delete_error': 'An error occurred while deleting the profile picture',
      'date_month_january': 'January',
      'date_month_february': 'February',
      'date_month_march': 'March',
      'date_month_april': 'April',
      'date_month_may': 'May',
      'date_month_june': 'June',
      'date_month_july': 'July',
      'date_month_august': 'August',
      'date_month_september': 'September',
      'date_month_october': 'October',
      'date_month_november': 'November',
      'date_month_december': 'December',
      'date_day_monday': 'Monday',
      'date_day_tuesday': 'Tuesday',
      'date_day_wednesday': 'Wednesday',
      'date_day_thursday': 'Thursday',
      'date_day_friday': 'Friday',
      'date_day_saturday': 'Saturday',
      'date_day_sunday': 'Sunday',
      'date_day_short_monday': 'Mon',
      'date_day_short_tuesday': 'Tue',
      'date_day_short_wednesday': 'Wed',
      'date_day_short_thursday': 'Thu',
      'date_day_short_friday': 'Fri',
      'date_day_short_saturday': 'Sat',
      'date_day_short_sunday': 'Sun',
      'date_today': 'Today',
      'date_yesterday': 'Yesterday',
      'date_tomorrow': 'Tomorrow',
      'date_format_short': 'MM/dd/yyyy',
      'date_format_medium': 'MMM d, yyyy',
      'date_format_long': 'MMMM d, yyyy',
      'date_format_full': 'EEEE, MMMM d, yyyy',
      'edit_comment': 'Edit Comment',
      'highlight': 'Highlight',
      'highlighted': 'Highlighted',
      'daily_highlight_limit_reached': 'You have reached the daily highlight limit. You can try again tomorrow.',
      'post_highlighted_success': 'Post has been successfully highlighted!',
      'post_highlight_error': 'An error occurred while highlighting the post',
      'no_highlights': 'No highlights yet',
      'highlights': 'Highlights',
      'highlights_load_error': 'Failed to load highlights',
      'view_highlighted_post': 'View highlighted post',
      'discover_highlighted_posts': 'Discover posts highlighted by all users',
      'view_post': 'View Post',
      'user_highlights': 'User Highlights',
      'no_highlights_for_user': 'User has no highlighted content yet',
      'no_image_available': 'No image available',
      'summarize_post': 'Summarize Post',
      'post_summary': 'Post Summary',
      'ai_summary': 'AI Summary',
      'ai_summary_creating': 'Creating AI summary...',
      'ai_generated': 'Generated by artificial intelligence',
      'close': 'Close',
      'summary_creating': 'Creating summary...',
      'regenerate_summary': 'Regenerate',
      'ai_complete': 'Complete with AI',
      'ai_generating': 'Generating content...',
      'ai_generated_content': 'AI Generated Content',
      'ai_apply': 'Apply',
      'ai_error_empty_fields': 'Please fill at least one field for AI to assist you.',
      'ai_error_generation': 'An error occurred while generating content. Please try again.',
      'dark_mode': 'Dark Mode',
      'light_mode': 'Light Mode',
      'theme_changed': 'Theme changed',
      'theme_toggle': 'Toggle Theme',
    }
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const storedLang = localStorage.getItem('lang') || 'tr';
      this.currentLang.next(storedLang);
    }
  }

  setLanguage(lang: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('lang', lang);
      this.currentLang.next(lang);
    }
  }

  getTranslation(key: string): string {
    const currentLang = this.currentLang.getValue();
    
    // Önce mevcut dilde çeviriyi kontrol et
    if (this.translations[currentLang] && this.translations[currentLang][key]) {
      return this.translations[currentLang][key];
    }
    
    // Eğer mevcut dilde çeviri bulunamazsa varsayılan olarak Türkçe'yi kontrol et
    if (currentLang !== 'tr' && this.translations['tr'] && this.translations['tr'][key]) {
      return this.translations['tr'][key];
    }
    
    // Hiçbir çeviri bulunamazsa anahtarı döndür
    return key;
  }

  getCurrentLang(): string {
    return this.currentLang.getValue();
  }
} 