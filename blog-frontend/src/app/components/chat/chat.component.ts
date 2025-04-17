import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, AfterViewInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class ChatComponent implements OnInit, AfterViewChecked, AfterViewInit {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  
  messages: { text: string; isUser: boolean }[] = [];
  userInput: string = '';
  isLoading: boolean = false;
  errorMessage: string | null = null;
  currentAiResponse: string = '';
  messageContainerReady: boolean = false;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.messageContainerReady = true;
    this.scrollToBottom();
  }

  ngAfterViewChecked(): void {
    if (this.messageContainerReady) {
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messageContainer && this.messageContainer.nativeElement) {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Scroll hatası:', err);
    }
  }

  adjustTextareaHeight(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  // SSE formatındaki yanıtları işleme
  private processSSEResponse(text: string): string {
    let content = '';
    
    if (!text) return content;
    
    // SSE formatını işle: "data:" metin" satırlarını ayıkla
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.startsWith('data:')) {
        // "data:" önekini kaldır ve içeriğe ekle
        content += line.substring(5).trim();
      }
    }
    
    return content;
  }

  sendMessage(): void {
    if (!this.userInput.trim()) return;

    const userMessage = this.userInput.trim();
    this.messages.push({ text: userMessage, isUser: true });
    this.isLoading = true;
    this.errorMessage = null;
    this.currentAiResponse = '';
    this.userInput = '';

    this.chatService.sendMessage(userMessage)
      .pipe(
        catchError(error => {
          console.error('Mesaj gönderme hatası:', error);
          this.isLoading = false;
          this.errorMessage = error.message || 'Bir hata oluştu';
          this.messages.push({ 
            text: error.message || 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.', 
            isUser: false 
          });
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.DownloadProgress) {
            const progressEvent = event as any;
            
            if (progressEvent.partialText) {
              // SSE formatını işle
              const processedContent = this.processSSEResponse(progressEvent.partialText);
              
              if (processedContent) {
                this.currentAiResponse = processedContent;
                this.scrollToBottom();
              }
            }
          } 
          else if (event.type === HttpEventType.Response) {
            const response = event as HttpResponse<any>;
            this.isLoading = false;
            
            if (response.body) {
              let responseText = '';
              
              if (typeof response.body === 'string') {
                // SSE formatını işle
                responseText = this.processSSEResponse(response.body);
              } else {
                responseText = JSON.stringify(response.body);
              }
              
              if (responseText) {
                this.messages.push({ 
                  text: responseText, 
                  isUser: false 
                });
              }
            } 
            else if (this.currentAiResponse) {
              this.messages.push({ 
                text: this.currentAiResponse, 
                isUser: false 
              });
            }
            
            this.currentAiResponse = '';
            this.scrollToBottom();
          }
        },
        error: (error) => {
          console.error('SSE hatası:', error);
          this.isLoading = false;
          this.errorMessage = error.message || 'Bir hata oluştu';
          this.messages.push({ 
            text: error.message || 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.', 
            isUser: false 
          });
          this.scrollToBottom();
        },
        complete: () => {
          this.isLoading = false;
          this.scrollToBottom();
        }
      });
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
} 