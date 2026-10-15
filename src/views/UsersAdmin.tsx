import React, { useState } from 'react';
import type { User } from '../types';
import { UserPlus, Trash2, Mail, ShieldCheck, Award } from 'lucide-react';
import { api } from '../services/api';

interface UsersAdminProps {
  users: User[];
  currentUserId?: number;
  onRefresh: () => void;
}

export const UsersAdmin: React.FC<UsersAdminProps> = ({ users, currentUserId, onRefresh }) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    password: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      setError('Todos los campos son obligatorios para el registro en el censo');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await api.register(formData);
      setShowAddModal(false);
      setFormData({ username: '', email: '', name: '', password: '' });
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Error al incorporar camarada');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, username: string) => {
    if (id === currentUserId) {
      alert('Un miembro del Partido Interior no puede vaporizarse a sí mismo.');
      return;
    }
    if (window.confirm(`¿Confirmas la vaporización del camarada "${username}"? Sus registros serán borrados de la historia.`)) {
      try {
        await api.deleteUser(id);
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Error en el procedimiento');
      }
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, textTransform: 'uppercase', color: '#fff', letterSpacing: '0.02em' }}>
            Miembros del Partido
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
            CENSO OFICIAL DE OPERADORES Y NIVELES DE AUTORIZACIÓN EN LA RED DE VIGILANCIA
          </p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          <UserPlus size={16} />
          Afiliar Camarada
        </button>
      </div>

      {/* Table */}
      <div className="glass-panel brutalist-border" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{
              background: 'rgba(225, 29, 72, 0.08)',
              borderBottom: '1px solid var(--border-party)',
              color: '#fda4af',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-display)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              <th style={{ padding: '14px 18px' }}>Camarada</th>
              <th style={{ padding: '14px 18px' }}>Nombre Completo</th>
              <th style={{ padding: '14px 18px' }}>Dirección de Red</th>
              <th style={{ padding: '14px 18px' }}>Rango en Oceanía</th>
              <th style={{ padding: '14px 18px', textAlign: 'right' }}>Directivas</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <td style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '4px',
                      background: 'linear-gradient(135deg, #be123c, #e11d48)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem',
                      color: '#fff',
                      boxShadow: '0 0 10px rgba(225, 29, 72, 0.4)'
                    }}>
                      {u.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>{u.username.toUpperCase()}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-party)', fontFamily: 'var(--font-mono)' }}>CITIZEN #{u.id}</div>
                    </div>
                  </div>
                </td>

                <td style={{ padding: '16px 18px', color: 'var(--text-secondary)' }}>
                  {u.name || '—'}
                </td>

                <td style={{ padding: '16px 18px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={13} />
                    {u.email}
                  </span>
                </td>

                <td style={{ padding: '16px 18px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 8px',
                    borderRadius: '3px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    background: u.username === 'admin' ? 'rgba(225, 29, 72, 0.2)' : 'rgba(245, 158, 11, 0.15)',
                    color: u.username === 'admin' ? '#fff' : 'var(--accent-amber)',
                    border: `1px solid ${u.username === 'admin' ? 'var(--accent-red)' : 'rgba(245, 158, 11, 0.3)'}`
                  }}>
                    {u.username === 'admin' ? <Award size={12} color="var(--accent-red)" /> : <ShieldCheck size={12} />}
                    {u.username === 'admin' ? 'PARTIDO INTERIOR (SUPREMO)' : 'PARTIDO EXTERIOR (OPERADOR)'}
                  </span>
                </td>

                <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleDelete(u.id, u.username)}
                    disabled={u.id === currentUserId}
                    className="btn-danger"
                    style={{ padding: '6px' }}
                    title={u.id === currentUserId ? 'No puedes vaporizar tu propio usuario' : 'Vaporizar Camarada'}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Crear Usuario */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          padding: '16px',
        }}>
          <div className="glass-panel brutalist-border" style={{ width: '100%', maxWidth: '440px', background: '#0e1118', padding: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px', color: '#fff' }}>
              Afiliar Nuevo Miembro
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '18px' }}>
              Se otorgará acceso de televigilancia bajo juramento a INGSOC.
            </p>

            {error && (
              <div style={{ padding: '8px 12px', background: 'rgba(225, 29, 72, 0.15)', border: '1px solid rgba(225, 29, 72, 0.4)', color: 'var(--text-party)', borderRadius: '4px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', marginBottom: '14px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Nombre y Apellidos</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ej: Winston Smith"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Identificador de Usuario *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="ej: winston"
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Dirección Postal/Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="winston@minitrue.oceania"
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Clave de Acceso *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-ghost">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'REGISTRANDO...' : 'INCORPORAR AL CENSO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
