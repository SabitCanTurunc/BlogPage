import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

export interface SummaryDialogData {
  postTitle: string;
  summary: string;
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
export class SummaryDialogComponent {
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<SummaryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SummaryDialogData,
    private translationService: TranslationService
  ) {
    this.loading = data.loading || false;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  handleImageError(event: any): void {
    // Resim yüklenemediğinde resim öğesini gizle
    if (event.target) {
      event.target.style.display = 'none';
    }
  }
} 