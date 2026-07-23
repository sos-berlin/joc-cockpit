import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { CoreService } from '../../services/core.service';
import { VideoEntry } from './videos.config';

interface VideoListEntry extends VideoEntry {
  key: string;
}

@Component({
  standalone: false,
  selector: 'app-video-context',
  templateUrl: './video-context.component.html',
})
export class VideoContextComponent implements OnInit {
  videos: VideoListEntry[] = [];
  isLoading = true;
  notFound = false;

  private readonly modalRef = inject(NzModalRef);
  private readonly http = inject(HttpClient);
  private readonly coreService = inject(CoreService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.http.get<Record<string, VideoEntry>>('./assets/videos/videos.json').subscribe({
      next: (config) => {
        this.isLoading = false;
        this.videos = Object.entries(config)
          .filter(([key]) => key !== '_template')
          .map(([key, entry]) => ({ key, ...entry }));
        this.notFound = this.videos.length === 0;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.notFound = true;
        this.cdr.markForCheck();
      }
    });
  }

  openVideo(video: VideoListEntry): void {
    this.cancel();
    this.coreService.openVideoPage(video.key, video.title);
  }

  cancel(): void {
    this.modalRef.destroy();
  }
}
