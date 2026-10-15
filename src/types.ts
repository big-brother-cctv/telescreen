export interface Camera {
  id: number;
  name: string;
  sourceType?: 'v4l2' | 'rtsp' | 'http' | 'mjpeg' | 'test' | string;
  connectionMode?: 'pull' | 'push' | 'local' | 'test' | string;
  sourceUrl?: string;
  device: string;
  resolution: string;
  fps: string;
  postUrl?: string;
  codec: string;
  preset: string;
  tune: string;
  buffer: string;
  rotation: string;
  status?: 'online' | 'offline' | 'standby' | string;
  lastSeen?: string;
  streamUrl?: string;
  ingestUrl?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  photo?: string;
}

export interface AuthResponse {
  token: string;
}
