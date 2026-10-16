import React, { useState, useEffect } from 'react';
import { X, Save, Radio, Globe, Tv, HardDrive, Share2, Terminal, Copy, Check, Info } from 'lucide-react';
import type { Camera } from '../types';

interface CameraModalProps {
  camera: Partial<Camera> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (cameraData: Partial<Camera>) => Promise<void>;
}

export const CameraModal: React.FC<CameraModalProps> = ({ camera, isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'ip' | 'push' | 'edge' | 'usb' | 'test'>('ip');
  const [formData, setFormData] = useState<Partial<Camera>>({
    name: '',
    sourceType: 'rtsp',
    connectionMode: 'pull',
    sourceUrl: '',
    device: '/dev/video0',
    resolution: '1280x720',
    fps: '25',
    codec: 'libx264',
    preset: 'ultrafast',
    tune: 'zerolatency',
    buffer: '1000000',
    rotation: '0',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const serverHost = window.location.hostname || 'localhost';

  useEffect(() => {
    if (camera) {
      const mode = camera.connectionMode || (camera.sourceUrl ? 'pull' : (camera.sourceType === 'test' ? 'test' : 'local'));
      setFormData({
        name: camera.name || '',
        sourceType: camera.sourceType || (camera.sourceUrl ? 'rtsp' : 'v4l2'),
        connectionMode: mode,
        sourceUrl: camera.sourceUrl || '',
        device: camera.device || '/dev/video0',
        resolution: camera.resolution || '1280x720',
        fps: camera.fps || '25',
        codec: camera.codec || 'libx264',
        preset: camera.preset || 'ultrafast',
        tune: camera.tune || 'zerolatency',
        buffer: camera.buffer || '1000000',
        rotation: camera.rotation || '0',
      });
      if (mode === 'push') setActiveTab('push');
      else if (mode === 'test' || camera.sourceType === 'test') setActiveTab('test');
      else if (mode === 'local' || camera.sourceType === 'v4l2') setActiveTab('usb');
      else setActiveTab('ip');
    } else {
      setFormData({
        name: '',
        sourceType: 'rtsp',
        connectionMode: 'pull',
        sourceUrl: '',
        device: '/dev/video0',
        resolution: '1280x720',
        fps: '25',
        codec: 'libx264',
        preset: 'ultrafast',
        tune: 'zerolatency',
        buffer: '1000000',
        rotation: '0',
      });
      setActiveTab('ip');
    }
    setError('');
  }, [camera, isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTabChange = (tab: 'ip' | 'push' | 'edge' | 'usb' | 'test') => {
    setActiveTab(tab);
    if (tab === 'ip') {
      setFormData(prev => ({ ...prev, sourceType: 'rtsp', connectionMode: 'pull' }));
    } else if (tab === 'push') {
      setFormData(prev => ({ ...prev, sourceType: 'rtsp', connectionMode: 'push' }));
    } else if (tab === 'edge') {
      setFormData(prev => ({ ...prev, sourceType: 'v4l2', connectionMode: 'push' }));
    } else if (tab === 'usb') {
      setFormData(prev => ({ ...prev, sourceType: 'v4l2', connectionMode: 'local' }));
    } else if (tab === 'test') {
      setFormData(prev => ({ ...prev, sourceType: 'test', connectionMode: 'test' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setError('El nombre de la cámara es obligatorio');
      return;
    }
    if (activeTab === 'ip' && !formData.sourceUrl?.trim()) {
      setError('Debes indicar la URL RTSP o HTTP de la cámara IP');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la configuración de la cámara');
    } finally {
      setLoading(false);
    }
  };

  const setRtsPreset = (presetType: string) => {
    if (presetType === 'hikvision') {
      setFormData(prev => ({ ...prev, sourceUrl: 'rtsp://admin:12345@192.168.1.64:554/Streaming/Channels/101' }));
    } else if (presetType === 'dahua') {
      setFormData(prev => ({ ...prev, sourceUrl: 'rtsp://admin:admin@192.168.1.108:554/cam/realmonitor?channel=1&subtype=0' }));
    } else if (presetType === 'tapo') {
      setFormData(prev => ({ ...prev, sourceUrl: 'rtsp://admin:admin123@192.168.1.50:554/stream1' }));
    } else if (presetType === 'demo') {
      setFormData(prev => ({ ...prev, sourceUrl: 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4' }));
    }
  };

  const streamName = formData.name?.trim() || 'nueva-camara';
  const rtspPushUrl = `rtsp://${serverHost}:8554/${streamName}`;
  const rtmpPushUrl = `rtmp://${serverHost}:1935/${streamName}`;
  const edgeDockerCmd = `docker run -d --restart=unless-stopped --device=/dev/video0 \\
  -e CAMERA_NAME="${streamName}" \\
  -e API_URL="http://${serverHost}:8080/api" \\
  -e MEDIAMTX_URL="rtsp://${serverHost}:8554/${streamName}" \\
  big-brother-cctv-camera`;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.88)',
      backdropFilter: 'blur(10px)',
      padding: '12px',
    }}>
      <div className="glass-panel brutalist-border" style={{
        width: '100%',
        maxWidth: '680px',
        maxHeight: '94vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0d14',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(225, 29, 72, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-party)',
          background: 'rgba(225, 29, 72, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #be123c, #e11d48)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 14px rgba(225, 29, 72, 0.6)',
              flexShrink: 0
            }}>
              <Radio size={18} color="#fff" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#fff', textTransform: 'uppercase', fontFamily: 'var(--font-display)', letterSpacing: '0.03em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {camera?.id ? `Editar Cámara: ${camera.name}` : 'Añadir Nueva Cámara'}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-party)', fontFamily: 'var(--font-mono)' }}>
                MODOS: CÁMARA IP • PUSH (MÓVIL/OBS) • DOCKER EDGE • WEBCAM USB • TEST
              </div>
            </div>
          </div>

          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector de Método de Conexión (Scrollable táctil en móvil) */}
        <div className="responsive-tabs" style={{
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(15, 20, 30, 0.6)',
          width: '100%',
        }}>
          <button
            type="button"
            onClick={() => handleTabChange('ip')}
            style={{
              padding: '12px 10px',
              border: 'none',
              background: activeTab === 'ip' ? 'rgba(225, 29, 72, 0.15)' : 'transparent',
              borderBottom: `2px solid ${activeTab === 'ip' ? 'var(--accent-red)' : 'transparent'}`,
              color: activeTab === 'ip' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              flex: 1,
              minWidth: '110px',
              flexShrink: 0,
              transition: 'all 0.15s ease'
            }}
          >
            <Globe size={16} color={activeTab === 'ip' ? 'var(--accent-red)' : 'var(--text-muted)'} />
            <span>CÁMARA IP (PULL)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('push')}
            style={{
              padding: '12px 10px',
              border: 'none',
              background: activeTab === 'push' ? 'rgba(225, 29, 72, 0.15)' : 'transparent',
              borderBottom: `2px solid ${activeTab === 'push' ? 'var(--accent-red)' : 'transparent'}`,
              color: activeTab === 'push' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              flex: 1,
              minWidth: '130px',
              flexShrink: 0,
              transition: 'all 0.15s ease'
            }}
          >
            <Share2 size={16} color={activeTab === 'push' ? 'var(--accent-red)' : 'var(--text-muted)'} />
            <span>AUTOCONEXIÓN (PUSH)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('edge')}
            style={{
              padding: '12px 10px',
              border: 'none',
              background: activeTab === 'edge' ? 'rgba(225, 29, 72, 0.15)' : 'transparent',
              borderBottom: `2px solid ${activeTab === 'edge' ? 'var(--accent-red)' : 'transparent'}`,
              color: activeTab === 'edge' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              flex: 1,
              minWidth: '135px',
              flexShrink: 0,
              transition: 'all 0.15s ease'
            }}
          >
            <Terminal size={16} color={activeTab === 'edge' ? 'var(--accent-red)' : 'var(--text-muted)'} />
            <span>AGENTE EDGE (PI)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('usb')}
            style={{
              padding: '12px 10px',
              border: 'none',
              background: activeTab === 'usb' ? 'rgba(225, 29, 72, 0.15)' : 'transparent',
              borderBottom: `2px solid ${activeTab === 'usb' ? 'var(--accent-red)' : 'transparent'}`,
              color: activeTab === 'usb' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              flex: 1,
              minWidth: '110px',
              flexShrink: 0,
              transition: 'all 0.15s ease'
            }}
          >
            <HardDrive size={16} color={activeTab === 'usb' ? 'var(--accent-red)' : 'var(--text-muted)'} />
            <span>USB LOCAL</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('test')}
            style={{
              padding: '12px 10px',
              border: 'none',
              background: activeTab === 'test' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              borderBottom: `2px solid ${activeTab === 'test' ? 'var(--accent-amber)' : 'transparent'}`,
              color: activeTab === 'test' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              flex: 1,
              minWidth: '115px',
              flexShrink: 0,
              transition: 'all 0.15s ease'
            }}
          >
            <Tv size={16} color={activeTab === 'test' ? 'var(--accent-amber)' : 'var(--text-muted)'} />
            <span>TEST SINTÉTICO</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', maxHeight: '72vh', overflowY: 'auto' }}>
          {error && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '4px',
              background: 'rgba(225, 29, 72, 0.15)',
              border: '1px solid rgba(225, 29, 72, 0.4)',
              color: 'var(--text-party)',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-mono)',
              marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          {/* Nombre identificador */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', color: '#fda4af', marginBottom: '6px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Identificador del Stream / Canal *
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-') })}
              placeholder="ej: pasillo-norte, cam-dahua, entrada-garaje"
              disabled={Boolean(camera?.id)}
              style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
              required
            />
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
              Este nombre definirá la ruta de streaming en Oceanía: <code className="mono">/stream/{formData.name || '{nombre}'}/index.m3u8</code>
            </div>
          </div>

          {/* TAB 1: CÁMARA IP (PULL) */}
          {activeTab === 'ip' && (
            <div style={{ background: 'rgba(225, 29, 72, 0.05)', padding: '14px', borderRadius: '6px', border: '1px solid var(--border-party)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Info size={16} color="var(--accent-red)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>Sintonización Automática por Servidor (PULL)</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.5 }}>
                El servidor Big Brother se conecta directamente a la cámara IP en tu red local o internet. No necesitas ejecutar ningún script ni ffmpeg en tu ordenador.
              </p>

              <label style={{ display: 'block', fontSize: '0.72rem', color: '#fda4af', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>
                URL del Flujo RTSP / RTMP / HTTP *
              </label>
              <input
                type="text"
                value={formData.sourceUrl || ''}
                onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                placeholder="rtsp://usuario:password@192.168.1.100:554/stream1"
                style={{ width: '100%', marginBottom: '8px' }}
                required
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Cargar formato típico:</span>
                <button type="button" onClick={() => setRtsPreset('hikvision')} className="btn-ghost" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>Hikvision</button>
                <button type="button" onClick={() => setRtsPreset('dahua')} className="btn-ghost" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>Dahua</button>
                <button type="button" onClick={() => setRtsPreset('tapo')} className="btn-ghost" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>TP-Link Tapo</button>
                <button type="button" onClick={() => setRtsPreset('demo')} className="btn-ghost" style={{ padding: '2px 8px', fontSize: '0.65rem', color: 'var(--accent-amber)' }}>RTSP Demo Público</button>
              </div>
            </div>
          )}

          {/* TAB 2: AUTOCONEXIÓN REMOTA (PUSH) */}
          {activeTab === 'push' && (
            <div style={{ background: 'rgba(56, 189, 248, 0.05)', padding: '14px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.3)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Share2 size={16} color="var(--accent-cyan)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>Ingesta Directa (Broadcast / Push)</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
                Cualquier dispositivo (teléfono móvil con app <i>Larix Broadcaster</i>, OBS Studio, cámara Wi-Fi autónoma o dron) puede emitir directamente hacia Big Brother. ¡Al enviar señal, el stream se sintoniza al instante!
              </p>

              {/* RTSP Push URL */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>URL de Ingesta RTSP:</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(rtspPushUrl, 'rtsp')}
                    className="btn-ghost"
                    style={{ padding: '2px 6px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedKey === 'rtsp' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    {copiedKey === 'rtsp' ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <code style={{ display: 'block', padding: '8px 10px', background: '#05070a', borderRadius: '4px', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                  {rtspPushUrl}
                </code>
              </div>

              {/* RTMP Push URL */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-amber)', fontWeight: 700 }}>URL de Ingesta RTMP (OBS Studio / Twitch format):</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(rtmpPushUrl, 'rtmp')}
                    className="btn-ghost"
                    style={{ padding: '2px 6px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedKey === 'rtmp' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    {copiedKey === 'rtmp' ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <code style={{ display: 'block', padding: '8px 10px', background: '#05070a', borderRadius: '4px', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                  {rtmpPushUrl}
                </code>
              </div>
            </div>
          )}

          {/* TAB 3: AGENTE EDGE (RASPBERRY PI / REMOTO) */}
          {activeTab === 'edge' && (
            <div style={{ background: 'rgba(168, 85, 247, 0.05)', padding: '14px', borderRadius: '6px', border: '1px solid rgba(168, 85, 247, 0.3)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Terminal size={16} color="#c084fc" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>Despliegue de Agente Autónomo (Raspberry Pi / Linux Edge)</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.5 }}>
                Copia este comando y ejecútalo en cualquier Raspberry Pi u ordenador remoto con cámara. El agente se conectará solo a Big Brother, enviará heartbeats y sincronizará parámetros:
              </p>

              <div style={{ position: 'relative' }}>
                <pre style={{
                  background: '#040508',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  fontSize: '0.7rem',
                  color: '#e9d5ff',
                  overflowX: 'auto',
                  fontFamily: 'var(--font-mono)',
                  lineHeight: 1.4
                }}>
                  {edgeDockerCmd}
                </pre>
                <button
                  type="button"
                  onClick={() => copyToClipboard(edgeDockerCmd, 'docker')}
                  className="btn-ghost"
                  style={{ position: 'absolute', top: '8px', right: '8px', padding: '3px 8px', fontSize: '0.65rem' }}
                >
                  {copiedKey === 'docker' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                  {copiedKey === 'docker' ? 'Copiado' : 'Copiar Comando'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: USB LOCAL */}
          {activeTab === 'usb' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>
                Dispositivo Hardware Local (/dev/video*)
              </label>
              <input
                type="text"
                value={formData.device || ''}
                onChange={(e) => setFormData({ ...formData, device: e.target.value })}
                placeholder="/dev/video0"
                style={{ width: '100%' }}
              />
            </div>
          )}

          {/* TAB 5: TEST SINTÉTICO */}
          {activeTab === 'test' && (
            <div style={{ padding: '12px 14px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', marginBottom: '16px' }}>
              📡 Generador sintético de pruebas de Oceanía: Barras SMPTE militares y reloj de tiempo real. Ideal para validar la transmisión sin necesidad de hardware.
            </div>
          )}

          {/* Parámetros de Calidad y Codificación */}
          <div className="responsive-grid-2" style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '16px'
          }}>
            {/* Resolución */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>
                Resolución
              </label>
              <select
                value={formData.resolution || '1280x720'}
                onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="640x480">640x480 (SD Estándar de Oceanía)</option>
                <option value="1280x720">1280x720 (720p HD)</option>
                <option value="1920x1080">1920x1080 (1080p Full HD)</option>
              </select>
            </div>

            {/* FPS */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>
                Cuadros por segundo (FPS)
              </label>
              <select
                value={formData.fps || '25'}
                onChange={(e) => setFormData({ ...formData, fps: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="15">15 FPS (Bajo consumo)</option>
                <option value="20">20 FPS</option>
                <option value="25">25 FPS (Estándar)</option>
                <option value="30">30 FPS</option>
                <option value="60">60 FPS (Alta Fluidez)</option>
              </select>
            </div>

            {/* Códec */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>
                Códec de Vídeo
              </label>
              <input
                type="text"
                value={formData.codec || ''}
                onChange={(e) => setFormData({ ...formData, codec: e.target.value })}
                placeholder="libx264"
                style={{ width: '100%' }}
              />
            </div>

            {/* Rotación */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>
                Rotación de Imagen
              </label>
              <select
                value={formData.rotation || '0'}
                onChange={(e) => setFormData({ ...formData, rotation: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="0">0° (Normal)</option>
                <option value="90">90°</option>
                <option value="180">180° (Invertida)</option>
                <option value="270">270°</option>
              </select>
            </div>
          </div>

          {/* Footer actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              <Save size={16} />
              {loading ? 'GUARDANDO...' : (camera?.id ? 'GUARDAR CAMBIOS' : 'AÑADIR CÁMARA')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
