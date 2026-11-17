import React, { useState, useEffect } from 'react';
import type { Camera, User } from './types';
import { api, authStorage } from './services/api';
import { Navbar } from './components/Navbar';
import { DashboardView } from './views/DashboardView';
import { AlertsView } from './views/AlertsView';
import { LiveGrid } from './views/LiveGrid';
import { CamerasAdmin } from './views/CamerasAdmin';
import { UsersAdmin } from './views/UsersAdmin';
import { LoginView } from './views/LoginView';
import { CameraModal } from './components/CameraModal';
import { AlertsProvider } from './context/AlertsContext';
import { MotionToastContainer } from './components/MotionToast';
import { SnapshotModal } from './components/SnapshotModal';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(Boolean(authStorage.getToken()));
  const [currentView, setCurrentView] = useState<'dashboard' | 'grid' | 'alerts' | 'admin' | 'users'>('dashboard');
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  // Los reproductores, snapshots y el SSE necesitan la cookie de medios antes de pedir nada
  const [mediaReady, setMediaReady] = useState<boolean>(false);

  // Modal de edición / creación de cámara
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingCamera, setEditingCamera] = useState<Partial<Camera> | null>(null);

  // Escuchar evento de expiración de sesión
  useEffect(() => {
    const handleAuthExpired = () => {
      api.endMediaSession();
      setIsAuthenticated(false);
      setCurrentUser(null);
      setMediaReady(false);
    };
    window.addEventListener('bb_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('bb_auth_expired', handleAuthExpired);
  }, []);

  const loadData = async () => {
    if (!authStorage.getToken()) return;
    try {
      setLoading(true);
      const [cams, userMe, allUsers] = await Promise.allSettled([
        api.getCameras(),
        api.getMe(),
        api.getUsers(),
      ]);

      if (cams.status === 'fulfilled') setCameras(cams.value || []);
      if (userMe.status === 'fulfilled') setCurrentUser(userMe.value);
      if (allUsers.status === 'fulfilled') setUsers(allUsers.value || []);
    } catch (e) {
      console.error('Error loading initial data:', e);
    } finally {
      setLoading(false);
    }
  };

  // Abrir y renovar la sesión de medios (cookie HttpOnly, TTL 2h) mientras haya sesión
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    const startMedia = () =>
      api.startMediaSession()
        .catch((e) => console.warn('No se pudo abrir la sesión de medios:', e))
        .finally(() => {
          if (!cancelled) setMediaReady(true);
        });

    startMedia();
    const interval = setInterval(startMedia, 30 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      const interval = setInterval(() => {
        api.getCameras().then((cams) => {
          if (cams) setCameras(cams);
        }).catch(() => {});
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    api.endMediaSession();
    authStorage.clearToken();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setMediaReady(false);
  };

  const handleSaveCamera = async (cameraData: Partial<Camera>) => {
    if (editingCamera?.id) {
      await api.updateCamera(editingCamera.id, cameraData);
    } else {
      await api.createCamera(cameraData);
    }
    await loadData();
  };

  const handleDeleteCamera = async (id: number) => {
    await api.deleteCamera(id);
    await loadData();
  };

  if (!isAuthenticated) {
    return <LoginView onSuccess={() => setIsAuthenticated(true)} />;
  }

  if (!mediaReady) {
    return null;
  }

  return (
    <AlertsProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar
          currentView={currentView}
          onNavigate={setCurrentView}
          user={currentUser}
          onLogout={handleLogout}
        />

        <main style={{ flex: 1 }}>
          {currentView === 'dashboard' && (
            <DashboardView
              cameras={cameras}
              isLoading={loading}
              onRefresh={loadData}
              onNavigate={setCurrentView}
              onAddCamera={() => {
                setEditingCamera(null);
                setModalOpen(true);
              }}
            />
          )}

          {currentView === 'alerts' && (
            <AlertsView cameras={cameras} />
          )}

          {currentView === 'grid' && (
            <LiveGrid
              cameras={cameras}
              isLoading={loading}
              onRefresh={loadData}
              onAddCamera={() => {
                setEditingCamera(null);
                setModalOpen(true);
              }}
            />
          )}

          {currentView === 'admin' && (
            <CamerasAdmin
              cameras={cameras}
              onAdd={() => {
                setEditingCamera(null);
                setModalOpen(true);
              }}
              onEdit={(cam) => {
                setEditingCamera(cam);
                setModalOpen(true);
              }}
              onDelete={handleDeleteCamera}
            />
          )}

          {currentView === 'users' && (
            <UsersAdmin
              users={users}
              currentUserId={currentUser?.id}
              onRefresh={loadData}
            />
          )}
        </main>

        <CameraModal
          isOpen={modalOpen}
          camera={editingCamera}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveCamera}
        />

        {/* Global Motion Notification Toasts & Snapshot Lightbox */}
        <MotionToastContainer />
        <SnapshotModal />
      </div>
    </AlertsProvider>
  );
};

export default App;
