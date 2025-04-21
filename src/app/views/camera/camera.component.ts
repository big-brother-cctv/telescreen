import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import Hls from 'hls.js';

@Component({
  selector: 'app-camera',
  standalone: true,
  templateUrl: './camera.component.html',
  imports: []
})
export class CameraComponent implements AfterViewInit {
  @ViewChild('video', { static: false }) videoRef!: ElementRef<HTMLVideoElement>;

  ngAfterViewInit(): void {
    const video = this.videoRef?.nativeElement;
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource('http://mediamtx:8888/stream/index.m3u8');
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = 'http://mediamtx:8888/stream/index.m3u8';
    }
  }
}
