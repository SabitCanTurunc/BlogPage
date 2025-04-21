deleteBlog() {
  Swal.fire({
    title: 'Blogu Sil',
    text: 'Bu blogu silmek istediğinizden emin misiniz?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Evet, Sil',
    cancelButtonText: 'İptal',
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    customClass: {
      popup: 'modern-swal-popup',
      title: 'modern-swal-title text-white',
      htmlContainer: 'modern-swal-content text-white',
      confirmButton: 'modern-swal-confirm',
      cancelButton: 'modern-swal-cancel'
    }
  }).then((result) => {
    if (result.isConfirmed) {
      this.blogService.deleteBlog(this.blog.id).subscribe({
        next: () => {
          Swal.fire({
            title: 'Başarılı',
            text: 'Blog başarıyla silindi',
            icon: 'success',
            timer: 3000,
            showConfirmButton: false,
            customClass: {
              popup: 'modern-swal-popup',
              title: 'modern-swal-title text-white',
              htmlContainer: 'modern-swal-content text-white'
            }
          });
          this.router.navigate(['/']);
        },
        error: (err) => {
          let errorMessage = 'Blog silinirken bir hata oluştu';
          
          if (err.error?.message) {
            errorMessage = err.error.message;
          }
          
          Swal.fire({
            title: 'Hata',
            text: errorMessage,
            icon: 'error',
            customClass: {
              popup: 'modern-swal-popup',
              title: 'modern-swal-title text-white',
              htmlContainer: 'modern-swal-content text-white'
            }
          });
        }
      });
    }
  });
} 