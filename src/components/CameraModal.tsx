import React, { useState, useEffect } from 'react';
import { X, Save, Radio, Globe, Tv, HardDrive, Share2, Terminal, Copy, Check, Info, ShieldAlert } from 'lucide-react';
import type { Camera } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface CameraModalProps {
  camera: Partial<Camera> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (cameraData: Partial<Camera>) => Promise<void>;
}

export const CameraModal: React.FC<CameraModalProps> = ({ camera, isOpen, onClose, onSave }) => {
  const { t } = useLanguage();
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
    motionEnabled: true,
    motionThreshold: 350,
    motionFrames: 2,
    motionCooldown: 15,
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
        motionEnabled: camera.motionEnabled !== undefined ? camera.motionEnabled : true,
        motionThreshold: camera.motionThreshold || 350,
        motionFrames: camera.motionFrames || 2,
        motionCooldown: camera.motionCooldown || 15,
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
        motionEnabled: true,
        motionThreshold: 350,
        motionFrames: 2,
        motionCooldown: 15,
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
      setError(t.cameraModal.nameRequiredError);
      return;
    }
    if (activeTab === 'ip' && !formData.sourceUrl?.trim()) {
      setError(t.cameraModal.urlRequiredError);
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || t.cameraModal.defaultSaveError);
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
                {camera?.id ? t.cameraModal.editTitle.replace('{name}', camera.name || '') : t.cameraModal.addTitle}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-party)', fontFamily: 'var(--font-mono)' }}>
                {t.cameraModal.modesHelp}
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
            <span>{t.cameraModal.tabIp.toUpperCase()}</span>
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
            <span>{t.cameraModal.tabPush.toUpperCase()}</span>
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
            <span>{t.cameraModal.tabEdge.toUpperCase()}</span>
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
            <span>{t.cameraModal.tabUsb.toUpperCase()}</span>
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
            <span>{t.cameraModal.tabTest.toUpperCase()}</span>
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
              {t.cameraModal.nameLabel}
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-') })}
              placeholder={t.cameraModal.namePlaceholder}
              disabled={Boolean(camera?.id)}
              style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
              required
            />
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
              {t.cameraModal.namePathNote} <code className="mono">/stream/{formData.name || '{stream}'}/index.m3u8</code>
            </div>
          </div>

          {/* TAB 1: CÁMARA IP (PULL) */}
          {activeTab === 'ip' && (
            <div style={{ background: 'rgba(225, 29, 72, 0.05)', padding: '14px', borderRadius: '6px', border: '1px solid var(--border-party)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Info size={16} color="var(--accent-red)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>{t.cameraModal.ipHelpTitle}</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.5 }}>
                {t.cameraModal.ipHelpDesc}
              </p>

              <label style={{ display: 'block', fontSize: '0.72rem', color: '#fda4af', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>
                {t.cameraModal.sourceUrlLabel}
              </label>
              <input
                type="text"
                value={formData.sourceUrl || ''}
                onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                placeholder={t.cameraModal.sourceUrlPlaceholder}
                style={{ width: '100%', marginBottom: '8px' }}
                required
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{t.cameraModal.rtspPresetsTitle}</span>
                <button type="button" onClick={() => setRtsPreset('hikvision')} className="btn-ghost" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>Hikvision</button>
                <button type="button" onClick={() => setRtsPreset('dahua')} className="btn-ghost" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>Dahua</button>
                <button type="button" onClick={() => setRtsPreset('tapo')} className="btn-ghost" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>TP-Link Tapo</button>
                <button type="button" onClick={() => setRtsPreset('demo')} className="btn-ghost" style={{ padding: '2px 8px', fontSize: '0.65rem', color: 'var(--accent-amber)' }}>RTSP Demo</button>
              </div>
            </div>
          )}

          {/* TAB 2: AUTOCONEXIÓN REMOTA (PUSH) */}
          {activeTab === 'push' && (
            <div style={{ background: 'rgba(56, 189, 248, 0.05)', padding: '14px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.3)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Share2 size={16} color="var(--accent-cyan)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>{t.cameraModal.pushHelpTitle}</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
                {t.cameraModal.pushHelpDesc}
              </p>

              {/* RTSP Push URL */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>{t.cameraModal.pushRtspHelp}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(rtspPushUrl, 'rtsp')}
                    className="btn-ghost"
                    style={{ padding: '2px 6px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedKey === 'rtsp' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    {copiedKey === 'rtsp' ? t.common.copied : t.common.copy}
                  </button>
                </div>
                <code style={{ display: 'block', padding: '8px 10px', background: '#05070a', borderRadius: '4px', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                  {rtspPushUrl}
                </code>
              </div>

              {/* RTMP Push URL */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-amber)', fontWeight: 700 }}>{t.cameraModal.pushRtmpHelp}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(rtmpPushUrl, 'rtmp')}
                    className="btn-ghost"
                    style={{ padding: '2px 6px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedKey === 'rtmp' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    {copiedKey === 'rtmp' ? t.common.copied : t.common.copy}
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
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>{t.cameraModal.edgeHelpTitle}</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.5 }}>
                {t.cameraModal.edgeHelpDesc}
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
                  {copiedKey === 'docker' ? t.common.copied : t.cameraModal.copyCommand}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: USB LOCAL */}
          {activeTab === 'usb' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>
                {t.cameraModal.deviceLabel}
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
              {t.cameraModal.testHelpDesc}
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
                {t.cameraModal.resolutionLabel}
              </label>
              <select
                value={formData.resolution || '1280x720'}
                onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="640x480">640x480 (SD)</option>
                <option value="1280x720">1280x720 (720p HD)</option>
                <option value="1920x1080">1920x1080 (1080p Full HD)</option>
              </select>
            </div>

            {/* FPS */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>
                {t.cameraModal.fpsLabel}
              </label>
              <select
                value={formData.fps || '25'}
                onChange={(e) => setFormData({ ...formData, fps: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="15">15 FPS</option>
                <option value="20">20 FPS</option>
                <option value="25">25 FPS</option>
                <option value="30">30 FPS</option>
                <option value="60">60 FPS</option>
              </select>
            </div>

            {/* Códec */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>
                {t.cameraModal.codecLabel}
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
                {t.cameraModal.rotationLabel}
              </label>
              <select
                value={formData.rotation || '0'}
                onChange={(e) => setFormData({ ...formData, rotation: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="0">0°</option>
                <option value="90">90°</option>
                <option value="180">180°</option>
                <option value="270">270°</option>
              </select>
            </div>
          </div>

          {/* Parámetros de Vigilancia Táctica y Detección de Movimiento (Motion Daemon) */}
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: 'rgba(15, 18, 26, 0.75)',
            border: `1px solid ${formData.motionEnabled !== false ? 'rgba(225, 29, 72, 0.4)' : 'var(--border-subtle)'}`,
            borderRadius: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={16} color={formData.motionEnabled !== false ? 'var(--accent-red)' : 'var(--text-muted)'} />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {t.cameraModal.motionDetectionTitle}
                </span>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: formData.motionEnabled !== false ? 'var(--accent-teal)' : 'var(--text-muted)', fontWeight: 700 }}>
                  {formData.motionEnabled !== false ? t.cameraModal.motionActive : t.cameraModal.motionPaused}
                </span>
                <input
                  type="checkbox"
                  checked={formData.motionEnabled !== false}
                  onChange={(e) => setFormData({ ...formData, motionEnabled: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent-red)', cursor: 'pointer' }}
                />
              </label>
            </div>

            {formData.motionEnabled !== false && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Selector de Sensibilidad con presets */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                      {t.cameraModal.motionSensitivity.replace('{t}', String(formData.motionThreshold || 350))}
                    </label>
                    <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {(formData.motionThreshold || 350) <= 200 ? t.cameraModal.motionSensitivityHigh : (formData.motionThreshold || 350) <= 450 ? t.cameraModal.motionSensitivityMedium : t.cameraModal.motionSensitivityLow}
                    </span>
                  </div>

                  {/* Presets rápidos */}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                    {[
                      { label: t.cameraModal.motionSensitivityHigh, val: 150 },
                      { label: t.cameraModal.motionSensitivityMedium, val: 350 },
                      { label: t.cameraModal.motionSensitivityLow, val: 600 },
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => setFormData({ ...formData, motionThreshold: p.val })}
                        style={{
                          flex: 1,
                          padding: '4px 8px',
                          fontSize: '0.68rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          borderRadius: '4px',
                          border: `1px solid ${formData.motionThreshold === p.val ? 'var(--accent-red)' : 'var(--border-subtle)'}`,
                          background: formData.motionThreshold === p.val ? 'rgba(225, 29, 72, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                          color: formData.motionThreshold === p.val ? '#fff' : 'var(--text-secondary)',
                          cursor: 'pointer',
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <input
                    type="range"
                    min="50"
                    max="1200"
                    step="25"
                    value={formData.motionThreshold || 350}
                    onChange={(e) => setFormData({ ...formData, motionThreshold: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--accent-red)' }}
                  />
                </div>

                <div className="responsive-grid-2">
                  {/* Frames mínimos consecutivos */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>
                      {t.cameraModal.motionPersistence}
                    </label>
                    <select
                      value={formData.motionFrames || 2}
                      onChange={(e) => setFormData({ ...formData, motionFrames: Number(e.target.value) })}
                      style={{ width: '100%' }}
                    >
                      <option value="1">{t.cameraModal.motionFrame1}</option>
                      <option value="2">{t.cameraModal.motionFrame2}</option>
                      <option value="3">{t.cameraModal.motionFrame3}</option>
                      <option value="5">{t.cameraModal.motionFrame5}</option>
                    </select>
                  </div>

                  {/* Cooldown entre alertas */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>
                      {t.cameraModal.motionCooldown}
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="120"
                      value={formData.motionCooldown || 15}
                      onChange={(e) => setFormData({ ...formData, motionCooldown: Number(e.target.value) })}
                      placeholder="15"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            )}
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
              {t.cameraModal.cancelBtn}
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              <Save size={16} />
              {loading ? t.cameraModal.savingBtn : (camera?.id ? t.cameraModal.saveChangesBtn : t.cameraModal.addCameraBtn)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
