import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { SummaryService } from '../../services/summary.service';

interface SummaryResponse {
  summary: string;
}

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
export class SummaryDialogComponent implements OnInit, OnDestroy {
  loading = false;
  displayedSummary = '';
  currentIndex = 0;
  private typewriterInterval: any;
  isClosing = false;

  constructor(
    public dialogRef: MatDialogRef<SummaryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SummaryDialogData,
    private summaryService: SummaryService
  ) {
    this.loading = this.data.loading || false;
  }

  ngOnInit(): void {
    if (this.data.summary) {
      this.startTypewriterEffect();
    }
  }

  ngOnDestroy(): void {
    if (this.typewriterInterval) {
      clearInterval(this.typewriterInterval);
    }
  }

  startTypewriterEffect(): void {
    this.displayedSummary = '';
    this.currentIndex = 0;
    
    if (this.typewriterInterval) {
      clearInterval(this.typewriterInterval);
    }

    this.typewriterInterval = setInterval(() => {
      if (this.currentIndex < this.data.summary.length) {
        this.displayedSummary += this.data.summary[this.currentIndex];
        this.currentIndex++;
      } else {
        clearInterval(this.typewriterInterval);
      }
    }, 30);
  }

  closeDialog(): void {
    this.isClosing = true;
    setTimeout(() => {
      this.dialogRef.close();
    }, 300);
  }

  handleImageError(event: any): void {
    // Resim yüklenemediğinde resim öğesini gizle
    if (event.target) {
      event.target.style.display = 'none';
    }
  }

  regenerateSummary(): void {
    this.loading = true;
    this.displayedSummary = '';
    this.currentIndex = 0;
    
    if (this.typewriterInterval) {
      clearInterval(this.typewriterInterval);
    }

    this.summaryService.regenerateSummary(this.data.postId).subscribe({
      next: (response: SummaryResponse) => {
        this.data.summary = response.summary;
        this.loading = false;
        this.startTypewriterEffect();
      },
      error: (error: Error) => {
        console.error('Özet oluşturma hatası:', error);
        this.loading = false;
      }
    });
  }
} 