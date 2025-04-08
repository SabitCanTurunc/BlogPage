import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../services/translation.service';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'translate',
  standalone: true
})
export class TranslatePipe implements PipeTransform {
  constructor(private translationService: TranslationService) {}

  transform(key: string): string {
    return this.translationService.getTranslation(key);
  }
}

@Pipe({
  name: 'localDate',
  standalone: true
})
export class LocalDatePipe implements PipeTransform {
  constructor(private translationService: TranslationService) {}

  transform(value: string | Date | null | undefined, format: string = 'mediumDate'): string {
    if (!value) return '';
    
    const date = new Date(value);
    const locale = this.translationService.getCurrentLang() === 'tr' ? 'tr-TR' : 'en-US';
    const datePipe = new DatePipe(locale);
    
    return datePipe.transform(date, format) || '';
  }
} 