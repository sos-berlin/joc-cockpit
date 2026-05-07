import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { VideoEntry } from './videos.config';

@Component({
  standalone: false,
  selector: 'app-video-viewer',
  templateUrl: './video-viewer.component.html',
})
export class VideoViewerComponent implements OnInit {
  readonly modalData: any = inject(NZ_MODAL_DATA);

  videoKey!: string;
  entry: VideoEntry | null = null;
  embedUrl: SafeResourceUrl | null = null;
  isLoading = true;
  notFound = false;

  private readonly sanitizer = inject(DomSanitizer);
  private readonly modalRef = inject(NzModalRef);
  private readonly http = inject(HttpClient);

  ngOnInit(): void {
    this.videoKey = this.modalData.videoKey;

    this.http.get<Record<string, VideoEntry>>('./assets/videos/videos.json').subscribe({
      next: (config) => {
        this.isLoading = false;
        this.entry = config[this.videoKey] ?? null;

        if (!this.entry) {
          this.notFound = true;
          return;
        }

        this.buildEmbedUrl();
      },
      error: () => {
        this.isLoading = false;
        this.notFound = true;
      }
    });
  }

  private buildEmbedUrl(): void {
    if (!this.entry) return;

    // Validate the video ID contains only safe characters (alphanumeric, hyphen, underscore).
    // Guards against URL injection if videos.json asset is tampered with.
    if (!this.entry.id || !/^[\w-]{1,64}$/.test(this.entry.id)) {
      this.notFound = true;
      return;
    }

    const params = new URLSearchParams({
      rel: '0',
      modestbranding: '1',
      enablejsapi: '0',
    });

    if (this.entry.start) {
      params.set('start', String(this.entry.start));
    }
    if (this.entry.playlist) {
      params.set('list', this.entry.playlist);
    }

    const url = `https://www.youtube.com/embed/${this.entry.id}?${params.toString()}`;
    this.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  get displayTitle(): string {
    return this.modalData.title || this.entry?.title || 'Video';
  }

  cancel(): void {
    this.modalRef.destroy();
  }
}
