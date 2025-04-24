import { Component, OnInit, AfterViewInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import Hls from 'hls.js';

@Component({
  selector: 'app-camera',
  standalone: true,
  templateUrl: './camera.component.html',
  imports: [CommonModule]
})
export class CameraComponent implements OnInit, AfterViewInit {
  cameras: any[] = [];

  @ViewChildren('video') videoRefs!: QueryList<ElementRef<HTMLVideoElement>>;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('/api/cameras').subscribe(cameras => {
      this.cameras = cameras || [];
    });
  }

  ngAfterViewInit(): void {
    this.videoRefs.changes.subscribe(() => {
      this.initStreams();
    });
    this.initStreams();
  }

  private initStreams() {
    this.videoRefs.forEach((videoRef, idx) => {
      const video = videoRef.nativeElement;
      const camera = this.cameras[idx];
      if (!camera) return;
      const streamUrl = `/stream/${camera.name}/index.m3u8`;

      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      }
    });
  }
}
