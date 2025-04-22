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
    const streamUrl = 'http://mediamtx.local/stream/index.m3u8';

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    }
  }
}
