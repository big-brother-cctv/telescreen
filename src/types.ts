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
  motionEnabled?: boolean;
  motionThreshold?: number;
  motionFrames?: number;
  motionCooldown?: number;
  aiMode?: 'all' | 'person' | 'vehicles' | 'animals' | 'none';
  aiConfidence?: number;
}

export type UserRole = 'admin' | 'operator' | 'viewer';

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role?: UserRole | string;
  permissions?: string;
  disabled?: boolean;
  photo?: string;
}

export interface AuthResponse {
  token: string;
}

export interface MotionAlert {
  id: number;
  cameraId?: number;
  cameraName: string;
  snapshotPath: string;
  detectedAt: string;
  label: string;
  confidence: number;
  acknowledged: boolean;
  severity: string;
  /** false si el modo casa/fuera decidió no avisar (se guarda igualmente) */
  notified?: boolean;
  /** clip de vídeo del evento (aparece ~10-40 s después de la alerta) */
  clipPath?: string;
}

export type AlarmMode = 'home' | 'away';

export interface NotificationSettings {
  mode: AlarmMode;
  home: string[];
  away: string[];
  updatedAt?: string;
  updatedBy?: string;
}

export interface NotificationSettingsResponse {
  settings: NotificationSettings;
  classes: string[];
}
