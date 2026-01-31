import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  UserCircleIcon,
  ShieldCheckIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

export default function Perfil() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'perfil' | 'seguridad' | '2fa'>('perfil');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [perfilData, setPerfilData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [twoFAData, setTwoFAData] = useState({
    qrCode: '',
    secret: '',
    token: '',
  });

  const handleUpdatePerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/profile', perfilData);
      toast.success('Perfil actualizado');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Contraseña cambiada exitosamente');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/2fa/setup');
      const data = response.data.data;
      setTwoFAData({
        qrCode: data.qrCode,
        secret: data.secret,
        token: '',
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al configurar 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/2fa/enable', { token: twoFAData.token });
      toast.success('2FA activado exitosamente');
      setTwoFAData({ qrCode: '', secret: '', token: '' });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Código inválido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-3xl font-bold text-primary-600">
              {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.nombre} {user?.apellido}
            </h1>
            <p className="text-gray-500">{user?.email}</p>
            <span className="badge bg-primary-100 text-primary-800 mt-2">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { id: 'perfil', label: 'Mi Perfil', icon: UserCircleIcon },
          { id: 'seguridad', label: 'Seguridad', icon: KeyIcon },
          { id: '2fa', label: 'Autenticación 2FA', icon: DevicePhoneMobileIcon },
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

      {/* Perfil Tab */}
      {activeTab === 'perfil' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Información Personal</h2>
          <form onSubmit={handleUpdatePerfil} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                className="input"
                value={perfilData.nombre}
                onChange={(e) => setPerfilData({ ...perfilData, nombre: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input
                type="text"
                className="input"
                value={perfilData.apellido}
                onChange={(e) => setPerfilData({ ...perfilData, apellido: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="input bg-gray-50"
                value={perfilData.email}
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">El email no puede ser modificado</p>
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>
      )}

      {/* Seguridad Tab */}
      {activeTab === 'seguridad' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Cambiar Contraseña</h2>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
          </form>

          <hr className="my-8" />

          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cerrar Sesión en Todos los Dispositivos</h2>
          <p className="text-gray-600 mb-4">
            Esto cerrará tu sesión en todos los dispositivos donde hayas iniciado sesión.
          </p>
          <button onClick={logout} className="btn-danger">
            Cerrar Todas las Sesiones
          </button>
        </div>
      )}

      {/* 2FA Tab */}
      {activeTab === '2fa' && (
        <div className="card">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-primary-100 rounded-xl">
              <ShieldCheckIcon className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Autenticación de Dos Factores (2FA)</h2>
              <p className="text-gray-600">
                Añade una capa extra de seguridad a tu cuenta usando una aplicación autenticadora.
              </p>
            </div>
          </div>

          {user?.twoFactorEnabled ? (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <ShieldCheckIcon className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">2FA Activado</p>
                  <p className="text-sm text-green-600">Tu cuenta está protegida con autenticación de dos factores.</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {!twoFAData.qrCode ? (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-3">
                      <ShieldCheckIcon className="w-6 h-6 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-800">2FA No Configurado</p>
                        <p className="text-sm text-yellow-600">Recomendamos activar 2FA para mayor seguridad.</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={handleSetup2FA} disabled={loading} className="btn-primary">
                    {loading ? 'Configurando...' : 'Configurar 2FA'}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-4">Escanea el código QR</h3>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <img src={twoFAData.qrCode} alt="QR Code 2FA" className="w-48 h-48" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-4">
                          Escanea este código QR con tu aplicación autenticadora (Google Authenticator, Authy, etc.)
                        </p>
                        <div className="p-3 bg-gray-100 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Clave secreta (manual):</p>
                          <code className="text-sm font-mono text-gray-900 break-all">{twoFAData.secret}</code>
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleEnable2FA} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código de Verificación
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        className="input text-center text-xl tracking-widest"
                        placeholder="000000"
                        value={twoFAData.token}
                        onChange={(e) => setTwoFAData({ ...twoFAData, token: e.target.value })}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Ingresa el código de 6 dígitos de tu aplicación autenticadora
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setTwoFAData({ qrCode: '', secret: '', token: '' })}
                      >
                        Cancelar
                      </button>
                      <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Verificando...' : 'Activar 2FA'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
