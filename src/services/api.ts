import type { Camera, User, AuthResponse, MotionAlert } from '../types';

const API_BASE = '/api';

export const authStorage = {
  getToken: () => localStorage.getItem('bb_token') || '',
  setToken: (token: string) => localStorage.setItem('bb_token', token),
  clearToken: () => localStorage.removeItem('bb_token'),
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    authStorage.clearToken();
    window.dispatchEvent(new CustomEvent('bb_auth_expired'));
    throw new Error('Sesión expirada o credenciales inválidas');
  }

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMsg = isJson ? (data.message || data.error || 'Error en la petición') : data;
    throw new Error(errorMsg || `Error HTTP ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  register: (user: Partial<User> & { password: string }) =>
    request<string>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(user),
    }),

  // Cameras
  getCameras: () => request<Camera[]>('/cameras'),
  
  getCameraById: (id: number) => request<Camera>(`/cameras/${id}`),

  createCamera: (camera: Partial<Camera>) =>
    request<Camera>('/cameras', {
      method: 'POST',
      body: JSON.stringify(camera),
    }),

  updateCamera: (id: number, camera: Partial<Camera>) =>
    request<Camera>(`/cameras/${id}`, {
      method: 'PUT',
      body: JSON.stringify(camera),
    }),

  deleteCamera: (id: number) =>
    request<void>(`/cameras/${id}`, {
      method: 'DELETE',
    }),

  searchCameras: (query: string) =>
    request<Camera[]>(`/cameras/search?name=${encodeURIComponent(query)}`),

  // Users
  getUsers: () => request<User[]>('/users'),
  
  getMe: () => request<User>('/users/me'),
  
  createUser: (user: Partial<User> & { password: string }) =>
    request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    }),

  updateUser: (id: number, user: Partial<User> & { password?: string }) =>
    request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    }),

  deleteUser: (id: number) =>
    request<void>(`/users/${id}`, {
      method: 'DELETE',
    }),

  // Health
  checkHealth: async () => {
    try {
      const res = await fetch('/actuator/health');
      return res.ok;
    } catch {
      return false;
    }
  },

  // Motion Alerts
  getAlerts: (params?: { limit?: number; offset?: number; camera_name?: string; acknowledged?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.offset) query.set('offset', params.offset.toString());
    if (params?.camera_name) query.set('camera_name', params.camera_name);
    if (params?.acknowledged !== undefined) query.set('acknowledged', String(params.acknowledged));
    const qs = query.toString();
    return request<{ alerts: MotionAlert[]; total: number }>(`/alerts${qs ? `?${qs}` : ''}`);
  },

  getUnreadAlertsCount: () => request<{ unreadCount: number }>('/alerts/unread-count'),

  ackAlert: (id: number) =>
    request<{ message: string }>(`/alerts/${id}/ack`, {
      method: 'PUT',
    }),

  ackAllAlerts: () =>
    request<{ message: string }>('/alerts/ack-all', {
      method: 'PUT',
    }),

  deleteAlert: (id: number) =>
    request<void>(`/alerts/${id}`, {
      method: 'DELETE',
    }),

  clearAllAlerts: () =>
    request<{ message: string }>('/alerts', {
      method: 'DELETE',
    }),

  createAlert: (formData: FormData) =>
    request<MotionAlert>('/alerts', {
      method: 'POST',
      body: formData,
    }),
};
