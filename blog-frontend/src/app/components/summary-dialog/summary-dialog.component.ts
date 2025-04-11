import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { SummaryService } from '../../services/summary.service';

export interface SummaryDialogData {
  postTitle: string;
  summary: string;
  postId: number;
  loading?: boolean;
}

@Component({
  selector: 'app-summary-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatProgressSpinnerModule, 
    MatIconModule,
    TranslatePipe
  ],
  templateUrl: './summary-dialog.component.html',
  styleUrls: ['./summary-dialog.component.css']
})
export class SummaryDialogComponent implements OnInit {
  loading = false;
  isClosing = false;

  constructor(
    public dialogRef: MatDialogRef<SummaryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SummaryDialogData,
    private translationService: TranslationService,
    private summaryService: SummaryService
  ) {
    this.loading = data.loading || false;
    
    // Dialog dışına tıklandığında kapanma animasyonunu tetikle
    this.dialogRef.backdropClick().subscribe(() => {
      this.closeDialog();
    });

    // ESC tuşuna basıldığında kapanma animasyonunu tetikle
    this.dialogRef.keydownEvents().subscribe(event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.closeDialog();
      }
    });
  }

  ngOnInit(): void {
    // Additional initialization logic if needed
  }

  closeDialog(): void {
    if (!this.isClosing) {
      this.isClosing = true;
      setTimeout(() => {
        this.dialogRef.close();
      }, 300);
    }
  }

  handleImageError(event: any): void {
    // Resim yüklenemediğinde resim öğesini gizle
    if (event.target) {
      event.target.style.display = 'none';
    }
  }

  regenerateSummary(): void {
    this.loading = true;
    this.summaryService.regenerateSummary(this.data.postId).subscribe({
      next: (response) => {
        this.data.summary = response.summary;
        this.loading = false;
        this.dialogRef.close(this.data);
      },
      error: (error) => {
        console.error('Özet yeniden oluşturulurken hata oluştu:', error);
        this.loading = false;
      }
    });
  }
} 