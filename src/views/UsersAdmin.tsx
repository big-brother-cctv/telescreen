import React, { useState, useMemo } from 'react';
import type { User, UserRole } from '../types';
import { 
  UserPlus, 
  Trash2, 
  Mail, 
  ShieldCheck, 
  Award, 
  Eye, 
  Edit3, 
  Search, 
  Lock, 
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';

interface UsersAdminProps {
  users: User[];
  currentUserId?: number;
  onRefresh: () => void;
}

interface FormState {
  id?: number;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: string[];
  password: string;
}

const ALL_AVAILABLE_PERMISSIONS = [
  { id: 'cameras:read', label: 'Ver Telepantallas', desc: 'Acceso a streams en directo' },
  { id: 'cameras:write', label: 'Gestionar Nodos', desc: 'Añadir y configurar cámaras' },
  { id: 'cameras:delete', label: 'Vaporizar Nodos', desc: 'Eliminar cámaras del sistema' },
  { id: 'users:read', label: 'Consultar Censo', desc: 'Ver lista de miembros' },
  { id: 'users:manage', label: 'Comando Supremo', desc: 'Crear, editar y vaporizar usuarios' },
];

const DEFAULT_ROLE_PERMS: Record<UserRole, string[]> = {
  admin: ['cameras:read', 'cameras:write', 'cameras:delete', 'users:read', 'users:manage'],
  operator: ['cameras:read', 'cameras:write', 'cameras:delete', 'users:read'],
  viewer: ['cameras:read'],
};

export const UsersAdmin: React.FC<UsersAdminProps> = ({ users, currentUserId, onRefresh }) => {
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  
  const [formData, setFormData] = useState<FormState>({
    username: '',
    email: '',
    name: '',
    role: 'operator',
    permissions: DEFAULT_ROLE_PERMS['operator'],
    password: '',
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        u.username.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q) || 
        (u.name && u.name.toLowerCase().includes(q));

      const matchesRole = roleFilter === 'all' || (u.role || 'operator') === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const openCreateModal = () => {
    setFormData({
      username: '',
      email: '',
      name: '',
      role: 'operator',
      permissions: DEFAULT_ROLE_PERMS['operator'],
      password: '',
    });
    setError('');
    setModalMode('create');
  };

  const openEditModal = (u: User) => {
    const rawRole = (u.role as UserRole) || (u.username === 'admin' ? 'admin' : 'operator');
    let perms: string[] = [];
    if (u.permissions && u.permissions.trim()) {
      perms = u.permissions.split(',').map((p) => p.trim()).filter(Boolean);
    } else {
      perms = DEFAULT_ROLE_PERMS[rawRole] || DEFAULT_ROLE_PERMS['operator'];
    }

    setFormData({
      id: u.id,
      username: u.username,
      email: u.email,
      name: u.name || '',
      role: rawRole,
      permissions: perms,
      password: '',
    });
    setError('');
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setError('');
  };

  const handleRoleChange = (newRole: UserRole) => {
    setFormData((prev) => ({
      ...prev,
      role: newRole,
      permissions: DEFAULT_ROLE_PERMS[newRole] || [],
    }));
  };

  const togglePermission = (permId: string) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(permId);
      const updated = exists 
        ? prev.permissions.filter((p) => p !== permId) 
        : [...prev.permissions, permId];
      return { ...prev, permissions: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.email.trim()) {
      setError('El identificador de usuario y el email son obligatorios');
      return;
    }

    if (modalMode === 'create' && !formData.password) {
      setError('Es obligatoria una clave de acceso para nuevos camaradas');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const permissionsStr = formData.permissions.join(',');

      if (modalMode === 'create') {
        await api.createUser({
          username: formData.username.trim(),
          email: formData.email.trim(),
          name: formData.name.trim(),
          role: formData.role,
          permissions: permissionsStr,
          password: formData.password,
        });
      } else if (modalMode === 'edit' && formData.id) {
        const updatePayload: any = {
          username: formData.username.trim(),
          email: formData.email.trim(),
          name: formData.name.trim(),
          role: formData.role,
          permissions: permissionsStr,
        };
        if (formData.password.trim()) {
          updatePayload.password = formData.password.trim();
        }
        await api.updateUser(formData.id, updatePayload);
      }

      closeModal();
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Error en el procedimiento ante el Ministerio del Amor');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (user.id === currentUserId) {
      alert('Un miembro del Partido no puede vaporizarse a sí mismo.');
      return;
    }

    const adminUsers = users.filter((u) => (u.role === 'admin' || u.username === 'admin'));
    if ((user.role === 'admin' || user.username === 'admin') && adminUsers.length <= 1) {
      alert('Imposible vaporizar: este camarada es el único Administrador Supremo de Oceanía.');
      return;
    }

    if (window.confirm(`¿Confirmas la vaporización definitiva del camarada "${user.username.toUpperCase()}"? Todo registro de su existencia será eliminado del censo.`)) {
      try {
        await api.deleteUser(user.id);
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Fallo en la orden de vaporización');
      }
    }
  };

  const getRoleBadge = (roleName?: string, username?: string) => {
    const effectiveRole = roleName || (username === 'admin' ? 'admin' : 'operator');

    if (effectiveRole === 'admin') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '4px',
          fontSize: '0.72rem',
          fontWeight: 800,
          fontFamily: 'var(--font-mono)',
          background: 'rgba(225, 29, 72, 0.22)',
          color: '#fff',
          border: '1px solid var(--accent-red)',
          boxShadow: '0 0 10px rgba(225, 29, 72, 0.3)',
          letterSpacing: '0.04em'
        }}>
          <Award size={13} color="var(--accent-red)" />
          PARTIDO INTERIOR (SUPREMO)
        </span>
      );
    }

    if (effectiveRole === 'viewer') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '4px',
          fontSize: '0.72rem',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          background: 'rgba(14, 165, 233, 0.15)',
          color: '#38bdf8',
          border: '1px solid rgba(14, 165, 233, 0.4)',
          letterSpacing: '0.04em'
        }}>
          <Eye size={13} />
          PROLE (OBSERVADOR)
        </span>
      );
    }

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '4px',
        fontSize: '0.72rem',
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        background: 'rgba(245, 158, 11, 0.15)',
        color: 'var(--accent-amber)',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        letterSpacing: '0.04em'
      }}>
        <ShieldCheck size={13} />
        PARTIDO EXTERIOR (OPERADOR)
      </span>
    );
  };

  return (
    <div style={{ padding: '28px 24px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--accent-red)',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}>
            MINILUV // MINISTERIO DEL AMOR & SEGURIDAD DEL ESTADO
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, textTransform: 'uppercase', color: '#fff', letterSpacing: '0.02em', margin: 0 }}>
            Censo de Miembros del Partido
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            REGISTRO OFICIAL DE OPERADORES, ROLES JERÁRQUICOS Y PERMISOS DE TELEVIGILANCIA
          </p>
        </div>

        <button onClick={openCreateModal} className="btn-primary" style={{ padding: '10px 18px' }}>
          <UserPlus size={16} />
          <span>Afiliar Camarada</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel brutalist-border" style={{
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        background: 'rgba(12, 14, 20, 0.75)'
      }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '420px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por usuario, nombre o email..."
            style={{ width: '100%', paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Filtrar Rango:
          </span>
          {(['all', 'admin', 'operator', 'viewer'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className="btn-ghost"
              style={{
                fontSize: '0.72rem',
                padding: '6px 12px',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
                background: roleFilter === r ? 'rgba(225, 29, 72, 0.18)' : 'transparent',
                borderColor: roleFilter === r ? 'var(--accent-red)' : 'var(--border-subtle)',
                color: roleFilter === r ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {r === 'all' ? 'Todos' : r === 'admin' ? 'Interior' : r === 'operator' ? 'Exterior' : 'Prole'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel brutalist-border" style={{ overflow: 'hidden', boxShadow: '0 12px 36px rgba(0,0,0,0.5)' }}>
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
              <th style={{ padding: '14px 18px' }}>Rango Jerárquico</th>
              <th style={{ padding: '14px 18px' }}>Directivas & Permisos</th>
              <th style={{ padding: '14px 18px', textAlign: 'right' }}>Operaciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  NO SE ENCONTRARON REGISTROS QUE COINCIDAN CON LOS CRITERIOS
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isSelf = u.id === currentUserId;
                const isAdmin = u.role === 'admin' || u.username === 'admin';
                const adminCount = users.filter((x) => x.role === 'admin' || x.username === 'admin').length;
                const isLastAdmin = isAdmin && adminCount <= 1;

                return (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: isSelf ? 'rgba(225, 29, 72, 0.04)' : 'transparent',
                      transition: 'background 0.2s',
                    }}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '6px',
                          background: isAdmin ? 'linear-gradient(135deg, #be123c, #e11d48)' : 'linear-gradient(135deg, #1e293b, #334155)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.9rem',
                          color: '#fff',
                          boxShadow: isAdmin ? '0 0 12px rgba(225, 29, 72, 0.4)' : 'none',
                          border: `1px solid ${isAdmin ? 'var(--accent-red)' : 'var(--border-subtle)'}`
                        }}>
                          {u.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>
                              {u.username.toUpperCase()}
                            </span>
                            {isSelf && (
                              <span style={{
                                fontSize: '0.62rem',
                                padding: '1px 6px',
                                background: 'rgba(225, 29, 72, 0.2)',
                                color: 'var(--accent-red)',
                                borderRadius: '3px',
                                fontWeight: 700,
                                fontFamily: 'var(--font-mono)'
                              }}>
                                TÚ
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            CITIZEN #{u.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {u.name || '—'}
                    </td>

                    <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={13} color="var(--text-secondary)" />
                        {u.email}
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      {getRoleBadge(u.role, u.username)}
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '320px' }}>
                        {u.permissions ? (
                          u.permissions.split(',').map((p) => p.trim()).filter(Boolean).map((p) => (
                            <span
                              key={p}
                              style={{
                                fontSize: '0.65rem',
                                padding: '2px 6px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '3px',
                                color: 'var(--text-secondary)',
                                fontFamily: 'var(--font-mono)'
                              }}
                            >
                              {p}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            Heredados por rango
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => openEditModal(u)}
                          className="btn-ghost"
                          style={{ padding: '7px', borderRadius: '4px' }}
                          title="Modificar directivas y credenciales de este camarada"
                        >
                          <Edit3 size={15} color="var(--text-secondary)" />
                        </button>

                        <button
                          onClick={() => handleDelete(u)}
                          disabled={isSelf || isLastAdmin}
                          className="btn-danger"
                          style={{
                            padding: '7px',
                            opacity: (isSelf || isLastAdmin) ? 0.35 : 1,
                            cursor: (isSelf || isLastAdmin) ? 'not-allowed' : 'pointer'
                          }}
                          title={
                            isSelf
                              ? 'No puedes vaporizar tu propio usuario'
                              : isLastAdmin
                              ? 'No se puede vaporizar al único administrador del sistema'
                              : 'Vaporizar Camarada'
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Unificado (Creación / Edición) */}
      {modalMode && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          padding: '20px',
        }}>
          <div className="glass-panel brutalist-border" style={{
            width: '100%',
            maxWidth: '560px',
            background: '#0d1017',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(225, 29, 72, 0.15)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, textTransform: 'uppercase', color: '#fff', margin: 0 }}>
                {modalMode === 'create' ? 'Afiliar Nuevo Miembro' : 'Expediente del Camarada'}
              </h2>
              <span style={{
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent-amber)',
                background: 'rgba(245, 158, 11, 0.12)',
                padding: '2px 8px',
                borderRadius: '3px',
                border: '1px solid rgba(245, 158, 11, 0.3)'
              }}>
                CLASIFICADO
              </span>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '20px' }}>
              {modalMode === 'create'
                ? 'El ingreso en el censo oficial concede credenciales de televigilancia bajo juramento a INGSOC.'
                : `Actualización de rango, directivas y permisos para @${formData.username}.`}
            </p>

            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                background: 'rgba(225, 29, 72, 0.15)',
                border: '1px solid rgba(225, 29, 72, 0.4)',
                color: 'var(--text-party)',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                marginBottom: '16px'
              }}>
                <ShieldAlert size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Username & Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Usuario *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="ej: winston"
                    disabled={modalMode === 'edit'}
                    style={{ width: '100%', opacity: modalMode === 'edit' ? 0.7 : 1 }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ej: Winston Smith"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Dirección Postal / Red *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="winston@minitrue.oceania"
                  style={{ width: '100%' }}
                  required
                />
              </div>

              {/* Hierarchy / Role Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Rango en Oceanía (Rol de Acceso)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {([
                    { id: 'admin', label: 'Partido Interior', desc: 'Supremo / Total', color: 'var(--accent-red)', icon: Award },
                    { id: 'operator', label: 'Partido Exterior', desc: 'Operador Nodos', color: 'var(--accent-amber)', icon: ShieldCheck },
                    { id: 'viewer', label: 'Proles', desc: 'Solo Observador', color: '#38bdf8', icon: Eye },
                  ] as const).map((r) => {
                    const isSelected = formData.role === r.id;
                    const IconComp = r.icon;
                    return (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => handleRoleChange(r.id)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          padding: '12px 8px',
                          borderRadius: '6px',
                          border: `1px solid ${isSelected ? r.color : 'var(--border-subtle)'}`,
                          background: isSelected ? `${r.color}1c` : 'rgba(255, 255, 255, 0.02)',
                          color: isSelected ? '#fff' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <IconComp size={18} color={r.color} style={{ marginBottom: '6px' }} />
                        <div style={{ fontSize: '0.78rem', fontWeight: 800 }}>{r.label}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                          {r.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Granular Permissions Checkboxes */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '14px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Directivas y Permisos Granulares
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {ALL_AVAILABLE_PERMISSIONS.map((perm) => {
                    const isChecked = formData.permissions.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          cursor: 'pointer',
                          fontSize: '0.76rem',
                          color: isChecked ? '#fff' : 'var(--text-muted)',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(perm.id)}
                          style={{ marginTop: '2px' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600 }}>{perm.label}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {perm.desc}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  {modalMode === 'create' ? 'Clave de Acceso Inicial *' : 'Restablecer Clave de Acceso (Opcional)'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={modalMode === 'create' ? '••••••••' : 'Dejar en blanco para conservar clave actual'}
                    style={{ width: '100%', paddingLeft: '36px' }}
                    required={modalMode === 'create'}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button type="button" onClick={closeModal} className="btn-ghost">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '10px 20px' }}>
                  {loading
                    ? 'PROCESANDO...'
                    : modalMode === 'create'
                    ? 'INCORPORAR AL CENSO'
                    : 'GUARDAR EXPEDIENTE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
