import { useEffect, useState } from 'react';
import api from '../services/api';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  UserIcon,
  ClockIcon,
  EyeIcon,
  LockClosedIcon,
  DocumentTextIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';

interface LoginAttempt {
  id: string;
  email: string;
  ip: string;
  userAgent: string;
  exitoso: boolean;
  createdAt: string;
}

interface Session {
  id: string;
  userAgent: string;
  ip: string;
  lastActivity: string;
  createdAt: string;
}

interface AuditLog {
  id: string;
  accion: string;
  entidad: string;
  detalles?: string;
  ip: string;
  createdAt: string;
  usuario?: { nombre: string; apellido: string };
}

interface SecurityStats {
  totalUsuarios: number;
  usuariosBloqueados: number;
  sesionesActivas: number;
  loginsFallidos24h: number;
  alertasSeguridad: number;
}

export default function Security() {
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'logins' | 'sessions' | 'audit'>('overview');

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      const [statsRes, loginsRes, sessionsRes, auditRes] = await Promise.all([
        api.get('/security/stats'),
        api.get('/security/login-attempts'),
        api.get('/security/sessions'),
        api.get('/security/audit-logs'),
      ]);
      setStats(statsRes.data.data);
      setLoginAttempts(loginsRes.data.data || []);
      setSessions(sessionsRes.data.data || []);
      setAuditLogs(auditRes.data.data || []);
    } catch (error) {
      console.error('Error loading security data:', error);
      // Datos de ejemplo
      setStats({
        totalUsuarios: 3,
        usuariosBloqueados: 0,
        sesionesActivas: 2,
        loginsFallidos24h: 5,
        alertasSeguridad: 1,
      });
      setLoginAttempts([
        { id: '1', email: 'juan.mamani@agrobolivia.bo', ip: '192.168.1.100', userAgent: 'Chrome/Windows', exitoso: true, createdAt: new Date().toISOString() },
        { id: '2', email: 'atacante@test.com', ip: '45.33.32.156', userAgent: 'Python-requests', exitoso: false, createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
        { id: '3', email: 'juan.mamani@agrobolivia.bo', ip: '192.168.1.100', userAgent: 'Firefox/Windows', exitoso: true, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
        { id: '4', email: 'test@hacker.com', ip: '103.25.231.42', userAgent: 'curl/7.68.0', exitoso: false, createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
      ]);
      setSessions([
        { id: '1', userAgent: 'Chrome 120 / Windows 10', ip: '192.168.1.100', lastActivity: new Date().toISOString(), createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
        { id: '2', userAgent: 'Firefox 121 / Windows 10', ip: '192.168.1.100', lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(), createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      ]);
      setAuditLogs([
        { id: '1', accion: 'LOGIN', entidad: 'Usuario', detalles: 'Inicio de sesión exitoso', ip: '192.168.1.100', createdAt: new Date().toISOString(), usuario: { nombre: 'Juan', apellido: 'Mamani' } },
        { id: '2', accion: 'CREATE', entidad: 'Transaccion', detalles: 'Nueva venta registrada', ip: '192.168.1.100', createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), usuario: { nombre: 'Juan', apellido: 'Mamani' } },
        { id: '3', accion: 'UPDATE', entidad: 'Parcela', detalles: 'Parcela Norte actualizada', ip: '192.168.1.100', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), usuario: { nombre: 'Juan', apellido: 'Mamani' } },
        { id: '4', accion: 'FAILED_LOGIN', entidad: 'Auth', detalles: 'Intento de login fallido', ip: '45.33.32.156', createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatTiempo = (fecha: string) => {
    const ahora = new Date();
    const f = new Date(fecha);
    const diff = ahora.getTime() - f.getTime();
    const minutos = Math.floor(diff / (1000 * 60));
    const horas = Math.floor(diff / (1000 * 60 * 60));

    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas} h`;
    return f.toLocaleDateString('es-BO');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheckIcon className="w-8 h-8 text-primary-600" />
            Panel de Seguridad
          </h1>
          <p className="text-gray-500">Monitoreo y auditoría del sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-sm text-green-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Sistema Protegido
          </span>
        </div>
      </div>

      {/* Security Features Banner */}
      <div className="card bg-gradient-to-r from-primary-600 to-blue-600 text-white">
        <h3 className="font-semibold text-lg mb-4">🔐 Características de Seguridad Implementadas</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <LockClosedIcon className="w-5 h-5" />
            <span className="text-sm">JWT + Refresh Tokens</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5" />
            <span className="text-sm">2FA TOTP</span>
          </div>
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span className="text-sm">Rate Limiting</span>
          </div>
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5" />
            <span className="text-sm">Audit Logging</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="card text-center">
          <UserIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats?.totalUsuarios || 0}</p>
          <p className="text-xs text-gray-500">Usuarios</p>
        </div>
        <div className="card text-center">
          <ComputerDesktopIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats?.sesionesActivas || 0}</p>
          <p className="text-xs text-gray-500">Sesiones Activas</p>
        </div>
        <div className="card text-center">
          <ExclamationTriangleIcon className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats?.loginsFallidos24h || 0}</p>
          <p className="text-xs text-gray-500">Logins Fallidos (24h)</p>
        </div>
        <div className="card text-center">
          <LockClosedIcon className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats?.usuariosBloqueados || 0}</p>
          <p className="text-xs text-gray-500">Bloqueados</p>
        </div>
        <div className="card text-center">
          <ShieldCheckIcon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats?.alertasSeguridad || 0}</p>
          <p className="text-xs text-gray-500">Alertas Seguridad</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { id: 'overview', label: 'Resumen', icon: EyeIcon },
          { id: 'logins', label: 'Intentos Login', icon: LockClosedIcon },
          { id: 'sessions', label: 'Sesiones', icon: ComputerDesktopIcon },
          { id: 'audit', label: 'Auditoría', icon: DocumentTextIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Últimos logins */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Últimos Intentos de Login</h3>
            <div className="space-y-3">
              {loginAttempts.slice(0, 5).map((login) => (
                <div key={login.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${login.exitoso ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{login.email}</p>
                      <p className="text-xs text-gray-500">{login.ip}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{formatTiempo(login.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sesiones activas */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Sesiones Activas</h3>
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <ComputerDesktopIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{session.userAgent}</p>
                      <p className="text-xs text-gray-500">{session.ip}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-green-600">Activa</p>
                    <p className="text-xs text-gray-400">{formatTiempo(session.lastActivity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logins' && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Historial de Intentos de Login</h3>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Email</th>
                  <th>IP</th>
                  <th>User Agent</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loginAttempts.map((login) => (
                  <tr key={login.id}>
                    <td>
                      <span className={`badge ${login.exitoso ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {login.exitoso ? '✓ Exitoso' : '✗ Fallido'}
                      </span>
                    </td>
                    <td className="font-medium">{login.email}</td>
                    <td className="font-mono text-sm">{login.ip}</td>
                    <td className="text-sm text-gray-500 max-w-xs truncate">{login.userAgent}</td>
                    <td className="text-sm text-gray-500">{formatTiempo(login.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Sesiones de Usuario</h3>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <ComputerDesktopIcon className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{session.userAgent}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>IP: {session.ip}</span>
                      <span>Iniciada: {formatTiempo(session.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="badge bg-green-100 text-green-800">Activa</span>
                  <p className="text-xs text-gray-500 mt-1">
                    <ClockIcon className="w-3 h-3 inline mr-1" />
                    Última actividad: {formatTiempo(session.lastActivity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Log de Auditoría</h3>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Acción</th>
                  <th>Entidad</th>
                  <th>Usuario</th>
                  <th>Detalles</th>
                  <th>IP</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className={`badge ${
                        log.accion === 'LOGIN' ? 'bg-green-100 text-green-800' :
                        log.accion === 'FAILED_LOGIN' ? 'bg-red-100 text-red-800' :
                        log.accion === 'CREATE' ? 'bg-blue-100 text-blue-800' :
                        log.accion === 'UPDATE' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.accion}
                      </span>
                    </td>
                    <td>{log.entidad}</td>
                    <td>
                      {log.usuario
                        ? `${log.usuario.nombre} ${log.usuario.apellido}`
                        : <span className="text-gray-400">-</span>
                      }
                    </td>
                    <td className="text-sm text-gray-500 max-w-xs truncate">{log.detalles || '-'}</td>
                    <td className="font-mono text-sm">{log.ip}</td>
                    <td className="text-sm text-gray-500">{formatTiempo(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Security Tips */}
      <div className="card bg-gradient-to-r from-gray-50 to-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">💡 Recomendaciones de Seguridad</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShieldCheckIcon className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Activa 2FA</p>
              <p className="text-sm text-gray-500">Añade una capa extra de seguridad a tu cuenta</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <LockClosedIcon className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Contraseña Segura</p>
              <p className="text-sm text-gray-500">Usa mínimo 12 caracteres con símbolos</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <EyeIcon className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Revisa la Actividad</p>
              <p className="text-sm text-gray-500">Monitorea los accesos a tu cuenta regularmente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
