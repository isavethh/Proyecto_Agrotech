import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface LoginForm {
  email: string;
  password: string;
}

interface TwoFactorForm {
  code: string;
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, verify2FA } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const {
    register: register2FA,
    handleSubmit: handleSubmit2FA,
    formState: { errors: errors2FA },
  } = useForm<TwoFactorForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const result = await login(data.email, data.password);
      
      if (result.requires2FA && result.tempToken) {
        setTempToken(result.tempToken);
        setShow2FA(true);
        toast.success('Ingresa el código de autenticación');
      } else {
        toast.success('¡Bienvenido!');
        navigate('/');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const on2FASubmit = async (data: TwoFactorForm) => {
    if (!tempToken) return;
    
    setIsLoading(true);
    try {
      await verify2FA(tempToken, data.code);
      toast.success('¡Bienvenido!');
      navigate('/');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Código inválido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Imagen/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 text-white p-12 flex-col justify-between">
        <div>
          <h1 className="text-4xl font-bold">🌱 AgroBolivia</h1>
          <p className="mt-2 text-primary-100">Sistema de Gestión Agrícola Inteligente</p>
        </div>
        
        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              📊
            </div>
            <div>
              <h3 className="font-semibold text-lg">Monitoreo en Tiempo Real</h3>
              <p className="text-primary-100 text-sm">
                Sensores IoT que monitorean tus cultivos 24/7
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              🤖
            </div>
            <div>
              <h3 className="font-semibold text-lg">Inteligencia Artificial</h3>
              <p className="text-primary-100 text-sm">
                Predicciones y recomendaciones personalizadas
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              🔒
            </div>
            <div>
              <h3 className="font-semibold text-lg">Seguridad Avanzada</h3>
              <p className="text-primary-100 text-sm">
                Autenticación 2FA y encriptación de datos
              </p>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-primary-200">
          © 2024 AgroBolivia. Hecho con ❤️ en Bolivia
        </p>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo móvil */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-600">🌱 AgroBolivia</h1>
            <p className="text-gray-500">Sistema de Gestión Agrícola</p>
          </div>

          {!show2FA ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
              <p className="mt-2 text-gray-600">
                Ingresa tus credenciales para acceder al sistema
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={`input ${errors.email ? 'input-error' : ''}`}
                    placeholder="tucorreo@ejemplo.com"
                    {...register('email', {
                      required: 'El correo es requerido',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Correo electrónico inválido',
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                      placeholder="••••••••"
                      {...register('password', {
                        required: 'La contraseña es requerida',
                        minLength: {
                          value: 8,
                          message: 'La contraseña debe tener al menos 8 caracteres',
                        },
                      })}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Ingresando...
                    </span>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-gray-600">
                ¿No tienes cuenta?{' '}
                <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                  Regístrate aquí
                </Link>
              </p>

              {/* Credenciales de demo */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-2">Credenciales de demostración:</p>
                <div className="space-y-1 text-xs text-gray-600">
                  <p><strong>Usuario:</strong> juan.mamani@agrobolivia.bo</p>
                  <p><strong>Contraseña:</strong> JuanMamani2024!</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="w-8 h-8 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Verificación 2FA</h2>
                <p className="mt-2 text-gray-600">
                  Ingresa el código de 6 dígitos de tu aplicación autenticadora
                </p>
              </div>

              <form onSubmit={handleSubmit2FA(on2FASubmit)} className="space-y-6">
                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    className={`input text-center text-2xl tracking-widest ${errors2FA.code ? 'input-error' : ''}`}
                    placeholder="000000"
                    {...register2FA('code', {
                      required: 'El código es requerido',
                      pattern: {
                        value: /^\d{6}$/,
                        message: 'El código debe tener 6 dígitos',
                      },
                    })}
                  />
                  {errors2FA.code && (
                    <p className="mt-1 text-sm text-red-600 text-center">{errors2FA.code.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full"
                >
                  {isLoading ? 'Verificando...' : 'Verificar'}
                </button>

                <button
                  type="button"
                  className="btn-secondary w-full"
                  onClick={() => {
                    setShow2FA(false);
                    setTempToken(null);
                  }}
                >
                  Volver al login
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
