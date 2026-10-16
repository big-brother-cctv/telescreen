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
  ShieldAlert,
  LayoutGrid,
  List
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';

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

const DEFAULT_ROLE_PERMS: Record<UserRole, string[]> = {
  admin: ['cameras:read', 'cameras:write', 'cameras:delete', 'users:read', 'users:manage'],
  operator: ['cameras:read', 'cameras:write', 'cameras:delete', 'users:read'],
  viewer: ['cameras:read'],
};

export const UsersAdmin: React.FC<UsersAdminProps> = ({ users, currentUserId, onRefresh }) => {
  const { t, language } = useLanguage();
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  
  const allPermissions = [
    { id: 'cameras:read', label: t.usersAdmin.permCamerasRead, desc: t.usersAdmin.permCamerasReadDesc },
    { id: 'cameras:write', label: t.usersAdmin.permCamerasWrite, desc: t.usersAdmin.permCamerasWriteDesc },
    { id: 'cameras:delete', label: t.usersAdmin.permCamerasDelete, desc: t.usersAdmin.permCamerasDeleteDesc },
    { id: 'users:read', label: t.usersAdmin.permUsersRead, desc: t.usersAdmin.permUsersReadDesc },
    { id: 'users:manage', label: t.usersAdmin.permUsersManage, desc: t.usersAdmin.permUsersManageDesc },
  ];

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
      setError(t.usersAdmin.requiredError);
      return;
    }

    if (modalMode === 'create' && !formData.password) {
      setError(t.usersAdmin.passwordRequiredError);
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
      setError(err.message || t.common.save);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (user.id === currentUserId) {
      alert(t.usersAdmin.selfDeleteError);
      return;
    }

    const adminUsers = users.filter((u) => (u.role === 'admin' || u.username === 'admin'));
    if ((user.role === 'admin' || user.username === 'admin') && adminUsers.length <= 1) {
      alert(t.usersAdmin.lastAdminError);
      return;
    }

    if (window.confirm(t.usersAdmin.deleteConfirm.replace('{username}', user.username))) {
      try {
        await api.deleteUser(user.id);
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Error');
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
          {t.usersAdmin.roleAdmin}
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
          {t.usersAdmin.roleViewer}
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
        {t.usersAdmin.roleOperator}
      </span>
    );
  };

  return (
    <div className="responsive-container">
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '18px',
        flexWrap: 'wrap',
        gap: '12px'
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
            {t.usersAdmin.headerTag}
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, textTransform: 'uppercase', color: '#fff', letterSpacing: '0.02em', margin: 0 }}>
            {t.usersAdmin.title}
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px', marginBottom: 0 }}>
            {t.usersAdmin.subtitle}
          </p>
        </div>

        {/* Compact Integrated Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Compact Tactical Search */}
          <div style={{ position: 'relative', width: '150px' }}>
            <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.usersAdmin.searchPlaceholder}
              style={{
                width: '100%',
                paddingLeft: '28px',
                paddingRight: '8px',
                height: '34px',
                fontSize: '0.78rem',
                borderRadius: '6px',
                background: 'rgba(10, 13, 19, 0.75)',
                border: '1px solid var(--border-subtle)'
              }}
            />
          </div>

          {/* Role Filter: Mini segmented pills */}
          <div style={{
            display: 'inline-flex',
            background: 'rgba(10, 13, 19, 0.8)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '2px',
            gap: '2px'
          }}>
            {(['all', 'admin', 'operator', 'viewer'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                style={{
                  padding: '4px 7px',
                  borderRadius: '4px',
                  border: 'none',
                  background: roleFilter === r ? 'rgba(225, 29, 72, 0.25)' : 'transparent',
                  color: roleFilter === r ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.68rem',
                  fontWeight: roleFilter === r ? 800 : 500,
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  borderBottom: roleFilter === r ? '1px solid var(--accent-red)' : 'none'
                }}
              >
                {r === 'all' ? t.usersAdmin.filterAll : r === 'admin' ? 'Admin' : r === 'operator' ? 'Op' : 'Obs'}
              </button>
            ))}
          </div>

          {/* Desktop View Switcher */}
          <div className="desktop-only" style={{
            background: 'rgba(12, 15, 22, 0.85)',
            border: '1px solid var(--border-party)',
            borderRadius: '6px',
            padding: '2px',
            gap: '2px'
          }}>
            <button
              onClick={() => setViewMode('cards')}
              title={language === 'es' ? 'Vista Tarjetas' : 'Cards View'}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: 'none',
                background: viewMode === 'cards' ? 'var(--accent-red)' : 'transparent',
                color: viewMode === 'cards' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <LayoutGrid size={13} />
              <span>{language === 'es' ? 'Tarjetas' : 'Cards'}</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              title={language === 'es' ? 'Vista Tabla' : 'Table View'}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: 'none',
                background: viewMode === 'table' ? 'var(--accent-red)' : 'transparent',
                color: viewMode === 'table' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <List size={13} />
              <span>{language === 'es' ? 'Tabla' : 'Table'}</span>
            </button>
          </div>

          <button onClick={openCreateModal} className="btn-primary" style={{ height: '34px', padding: '0 14px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
            <UserPlus size={15} />
            <span>{t.usersAdmin.newUser}</span>
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      {viewMode === 'table' && (
      <div className="table-desktop-view glass-panel brutalist-border" style={{ overflow: 'hidden', boxShadow: '0 12px 36px rgba(0,0,0,0.5)', marginBottom: '16px' }}>
        <div className="table-responsive-wrapper">
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
              <th style={{ padding: '14px 18px' }}>{t.usersAdmin.colUser}</th>
              <th style={{ padding: '14px 18px' }}>{t.usersAdmin.colName}</th>
              <th style={{ padding: '14px 18px' }}>{t.usersAdmin.colEmail}</th>
              <th style={{ padding: '14px 18px' }}>{t.usersAdmin.colRole}</th>
              <th style={{ padding: '14px 18px' }}>{t.usersAdmin.colPermissions}</th>
              <th style={{ padding: '14px 18px', textAlign: 'right' }}>{t.usersAdmin.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {t.usersAdmin.noUsers}
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
                                {t.usersAdmin.youBadge}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            ID: #{u.id}
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
                            {t.usersAdmin.inheritedPermissions}
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
                          title={t.usersAdmin.editUserTitle}
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
                              ? t.usersAdmin.selfDeleteError
                              : isLastAdmin
                              ? t.usersAdmin.lastAdminError
                              : t.usersAdmin.deleteUserTitle
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
      </div>
      )}

      {/* Cards View (Cards on PC when selected, and always on Mobile) */}
      <div className={viewMode === 'table' ? 'mobile-only cards-grid-view' : 'cards-grid-view'}>
        {filteredUsers.length === 0 ? (
          <div className="glass-panel" style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {t.usersAdmin.noUsers}
          </div>
        ) : (
          filteredUsers.map((u) => {
            const isSelf = u.id === currentUserId;
            const isAdmin = u.role === 'admin' || u.username === 'admin';
            const adminCount = users.filter((x) => x.role === 'admin' || x.username === 'admin').length;
            const isLastAdmin = isAdmin && adminCount <= 1;

            return (
              <div
                key={u.id}
                className="mobile-entity-card glass-panel brutalist-border"
                style={{
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  background: isSelf ? 'rgba(225, 29, 72, 0.06)' : 'rgba(12, 14, 20, 0.85)',
                  borderLeft: isSelf ? '3px solid var(--accent-red)' : undefined,
                }}
              >
                {/* Header row: Avatar, Username, ID, Badge */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
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
                      border: `1px solid ${isAdmin ? 'var(--accent-red)' : 'var(--border-subtle)'}`,
                      flexShrink: 0
                    }}>
                      {u.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '0.02em', fontSize: '0.95rem' }}>
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
                            {t.usersAdmin.youBadge}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                        ID: #{u.id} {u.name ? `• ${u.name}` : ''}
                      </div>
                    </div>
                  </div>
                  <div>
                    {getRoleBadge(u.role, u.username)}
                  </div>
                </div>

                {/* Email row */}
                <div style={{
                  background: '#07090e',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-secondary)'
                }}>
                  <Mail size={13} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
                  <a href={`mailto:${u.email}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none', wordBreak: 'break-all' }}>
                    {u.email}
                  </a>
                </div>

                {/* Permissions row */}
                <div>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    {t.usersAdmin.colPermissions}
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
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
                        {t.usersAdmin.inheritedPermissions}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions row: Touch friendly */}
                <div style={{ display: 'flex', gap: '8px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    onClick={() => openEditModal(u)}
                    className="btn-ghost"
                    style={{ flex: 1, padding: '9px 12px', fontSize: '0.78rem', justifyContent: 'center', minHeight: '40px' }}
                  >
                    <Edit3 size={14} color="var(--accent-amber)" />
                    <span>{t.common.edit}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(u)}
                    disabled={isSelf || isLastAdmin}
                    className="btn-danger"
                    style={{
                      padding: '9px 16px',
                      fontSize: '0.78rem',
                      minHeight: '40px',
                      opacity: (isSelf || isLastAdmin) ? 0.35 : 1,
                      cursor: (isSelf || isLastAdmin) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Trash2 size={14} />
                    <span>{t.common.delete}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
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
          padding: '12px',
        }}>
          <div className="glass-panel brutalist-border" style={{
            width: '100%',
            maxWidth: '560px',
            background: '#0d1017',
            padding: '24px 18px',
            borderRadius: '12px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(225, 29, 72, 0.15)',
            maxHeight: '92vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', color: '#fff', margin: 0 }}>
                {modalMode === 'create' ? t.usersAdmin.modalAddTitle : t.usersAdmin.modalEditTitle}
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
                {t.usersAdmin.accessControlBadge}
              </span>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '18px' }}>
              {modalMode === 'create'
                ? t.usersAdmin.modalAddSubtitle
                : t.usersAdmin.modalEditSubtitle.replace('{username}', formData.username)}
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Username & Name */}
              <div className="responsive-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    {t.usersAdmin.usernameLabel}
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder={t.usersAdmin.usernamePlaceholder}
                    disabled={modalMode === 'edit'}
                    style={{ width: '100%', opacity: modalMode === 'edit' ? 0.7 : 1 }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    {t.usersAdmin.nameLabel}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t.usersAdmin.namePlaceholder}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  {t.usersAdmin.emailLabel}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t.usersAdmin.emailPlaceholder}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              {/* Hierarchy / Role Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  {t.usersAdmin.roleLabel}
                </label>
                <div className="responsive-grid-3">
                  {([
                    { id: 'admin', label: t.usersAdmin.roleAdmin, desc: t.usersAdmin.roleAdminDesc, color: 'var(--accent-red)', icon: Award },
                    { id: 'operator', label: t.usersAdmin.roleOperator, desc: t.usersAdmin.roleOperatorDesc, color: 'var(--accent-amber)', icon: ShieldCheck },
                    { id: 'viewer', label: t.usersAdmin.roleViewer, desc: t.usersAdmin.roleViewerDesc, color: '#38bdf8', icon: Eye },
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
                  {t.usersAdmin.permissionsLabel}
                </div>
                <div className="responsive-grid-2">
                  {allPermissions.map((perm) => {
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
                  {modalMode === 'create' ? t.usersAdmin.passwordLabel : t.usersAdmin.passwordPlaceholderEdit}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={modalMode === 'create' ? t.usersAdmin.passwordPlaceholderNew : t.usersAdmin.passwordPlaceholderEdit}
                    style={{ width: '100%', paddingLeft: '36px' }}
                    required={modalMode === 'create'}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button type="button" onClick={closeModal} className="btn-ghost">
                  {t.common.cancel}
                </button>
                <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '10px 20px' }}>
                  {loading
                    ? t.usersAdmin.processingBtn
                    : modalMode === 'create'
                    ? t.usersAdmin.createUserBtn
                    : t.usersAdmin.saveChangesBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
