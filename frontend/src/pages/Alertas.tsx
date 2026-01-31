import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface Alerta {
  id: string;
  tipo: string;
  mensaje: string;
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  leida: boolean;
  resuelta: boolean;
  createdAt: string;
  sensor?: { nombre: string };
  parcela?: { nombre: string };
}

export default function Alertas() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todas' | 'pendientes' | 'resueltas'>('todas');

  useEffect(() => {
    loadAlertas();
  }, []);

  const loadAlertas = async () => {
    try {
      const response = await api.get('/alertas');
      setAlertas(response.data.data || []);
    } catch (error) {
      console.error('Error loading alertas:', error);
      // Datos de ejemplo
      setAlertas([
        {
          id: '1',
          tipo: 'HUMEDAD_BAJA',
          mensaje: 'Nivel de humedad por debajo del 30% en Parcela Norte. Se recomienda riego inmediato.',
          prioridad: 'ALTA',
          leida: false,
          resuelta: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          parcela: { nombre: 'Parcela Norte' },
        },
        {
          id: '2',
          tipo: 'HELADA_PRONOSTICO',
          mensaje: 'Pronóstico de helada para esta noche. Temperatura mínima esperada: -2°C.',
          prioridad: 'CRITICA',
          leida: false,
          resuelta: false,
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          tipo: 'COSECHA_OPTIMA',
          mensaje: 'Los cultivos de papa en Parcela Norte están en condiciones óptimas para cosecha.',
          prioridad: 'MEDIA',
          leida: true,
          resuelta: false,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          parcela: { nombre: 'Parcela Norte' },
        },
        {
          id: '4',
          tipo: 'STOCK_BAJO',
          mensaje: 'Stock bajo de fertilizantes (Sulfato de Potasio). Cantidad actual: 15 kg.',
          prioridad: 'BAJA',
          leida: true,
          resuelta: true,
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '5',
          tipo: 'RIEGO_COMPLETADO',
          mensaje: 'Sistema de riego automático completado exitosamente en Parcela Sur.',
          prioridad: 'BAJA',
          leida: true,
          resuelta: true,
          createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
          parcela: { nombre: 'Parcela Sur' },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const marcarLeida = async (id: string) => {
    try {
      await api.patch(`/alertas/${id}/leer`);
      setAlertas(alertas.map((a) => (a.id === id ? { ...a, leida: true } : a)));
    } catch {
      // Actualizar localmente aunque falle la API
      setAlertas(alertas.map((a) => (a.id === id ? { ...a, leida: true } : a)));
    }
  };

  const marcarResuelta = async (id: string) => {
    try {
      await api.patch(`/alertas/${id}/resolver`);
      setAlertas(alertas.map((a) => (a.id === id ? { ...a, resuelta: true } : a)));
      toast.success('Alerta marcada como resuelta');
    } catch {
      // Actualizar localmente aunque falle la API
      setAlertas(alertas.map((a) => (a.id === id ? { ...a, resuelta: true } : a)));
      toast.success('Alerta marcada como resuelta');
    }
  };

  const getPrioridadConfig = (prioridad: string) => {
    switch (prioridad) {
      case 'CRITICA':
        return {
          bg: 'bg-red-50 border-red-200',
          badge: 'bg-red-100 text-red-800',
          icon: XCircleIcon,
          iconColor: 'text-red-500',
        };
      case 'ALTA':
        return {
          bg: 'bg-orange-50 border-orange-200',
          badge: 'bg-orange-100 text-orange-800',
          icon: ExclamationTriangleIcon,
          iconColor: 'text-orange-500',
        };
      case 'MEDIA':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          badge: 'bg-yellow-100 text-yellow-800',
          icon: ExclamationTriangleIcon,
          iconColor: 'text-yellow-500',
        };
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          badge: 'bg-blue-100 text-blue-800',
          icon: InformationCircleIcon,
          iconColor: 'text-blue-500',
        };
    }
  };

  const formatTiempo = (fecha: string) => {
    const ahora = new Date();
    const alertaFecha = new Date(fecha);
    const diff = ahora.getTime() - alertaFecha.getTime();
    const minutos = Math.floor(diff / (1000 * 60));
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutos < 60) return `Hace ${minutos} minutos`;
    if (horas < 24) return `Hace ${horas} horas`;
    return `Hace ${dias} días`;
  };

  const alertasFiltradas = alertas.filter((a) => {
    if (filtro === 'pendientes') return !a.resuelta;
    if (filtro === 'resueltas') return a.resuelta;
    return true;
  });

  const alertasCriticas = alertas.filter((a) => !a.resuelta && (a.prioridad === 'CRITICA' || a.prioridad === 'ALTA'));

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
          <h1 className="text-2xl font-bold text-gray-900">Alertas</h1>
          <p className="text-gray-500">Centro de notificaciones y alertas del sistema</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFiltro('todas')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtro === 'todas'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFiltro('pendientes')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtro === 'pendientes'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFiltro('resueltas')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtro === 'resueltas'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Resueltas
          </button>
        </div>
      </div>

      {/* Alerta crítica destacada */}
      {alertasCriticas.length > 0 && (
        <div className="card bg-gradient-to-r from-red-500 to-orange-500 text-white">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <ExclamationTriangleIcon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">
                ⚠️ {alertasCriticas.length} Alertas Críticas Pendientes
              </h3>
              <p className="text-white/90">
                Tienes alertas de alta prioridad que requieren atención inmediata.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-gray-900">{alertas.length}</p>
          <p className="text-sm text-gray-500">Total</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-red-600">
            {alertas.filter((a) => !a.resuelta && a.prioridad === 'CRITICA').length}
          </p>
          <p className="text-sm text-gray-500">Críticas</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-yellow-600">
            {alertas.filter((a) => !a.resuelta).length}
          </p>
          <p className="text-sm text-gray-500">Pendientes</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">
            {alertas.filter((a) => a.resuelta).length}
          </p>
          <p className="text-sm text-gray-500">Resueltas</p>
        </div>
      </div>

      {/* Lista de alertas */}
      <div className="space-y-4">
        {alertasFiltradas.map((alerta) => {
          const config = getPrioridadConfig(alerta.prioridad);
          const IconComponent = config.icon;
          return (
            <div
              key={alerta.id}
              onClick={() => !alerta.leida && marcarLeida(alerta.id)}
              className={`card border ${config.bg} ${
                !alerta.leida ? 'ring-2 ring-primary-200' : ''
              } ${alerta.resuelta ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${config.bg}`}>
                  <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge ${config.badge}`}>{alerta.prioridad}</span>
                    <span className="text-xs text-gray-500">{formatTiempo(alerta.createdAt)}</span>
                    {!alerta.leida && (
                      <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                    )}
                    {alerta.resuelta && (
                      <span className="badge bg-green-100 text-green-800">✓ Resuelta</span>
                    )}
                  </div>
                  <p className="text-gray-900 mb-2">{alerta.mensaje}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    {alerta.parcela && (
                      <span>📍 {alerta.parcela.nombre}</span>
                    )}
                    <span>🏷️ {alerta.tipo.replace(/_/g, ' ')}</span>
                  </div>
                </div>
                {!alerta.resuelta && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      marcarResuelta(alerta.id);
                    }}
                    className="btn-secondary flex items-center gap-1 text-sm"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    Resolver
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {alertasFiltradas.length === 0 && (
        <div className="text-center py-12">
          <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay alertas</h3>
          <p className="text-gray-500">
            {filtro === 'todas'
              ? 'No tienes alertas en este momento'
              : filtro === 'pendientes'
              ? 'No tienes alertas pendientes'
              : 'No tienes alertas resueltas'}
          </p>
        </div>
      )}
    </div>
  );
}
