import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  MapPinIcon,
  SignalIcon,
  BeakerIcon,
  SunIcon,
  CloudIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Cultivo {
  id: string;
  nombre: string;
  variedad?: string;
  estado: string;
  fechaSiembra: string;
  fechaCosechaEstimada?: string;
  areaCultivada?: number;
  rendimientoEsperado?: number;
  notas?: string;
}

interface Sensor {
  id: string;
  nombre: string;
  tipo: string;
  ultimaLectura?: number;
  unidad?: string;
  activo: boolean;
  lecturas?: { valor: number; timestamp: string }[];
}

interface Alerta {
  id: string;
  tipo: string;
  mensaje: string;
  prioridad: string;
  createdAt: string;
}

interface ParcelaDetalle {
  id: string;
  nombre: string;
  ubicacion: string;
  tamanioHectareas: number;
  tipoSuelo?: string;
  latitud?: number;
  longitud?: number;
  altitudMsnm?: number;
  activa: boolean;
  cultivos: Cultivo[];
  sensores: Sensor[];
  alertas: Alerta[];
}

export default function ParcelaDetalle() {
  const { id } = useParams<{ id: string }>();
  const [parcela, setParcela] = useState<ParcelaDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [clima, setClima] = useState<{
    temperatura: number;
    humedad: number;
    condicion: string;
    probabilidadLluvia: number;
  } | null>(null);

  useEffect(() => {
    loadParcela();
    loadClima();
  }, [id]);

  const loadParcela = async () => {
    try {
      const response = await api.get(`/parcelas/${id}`);
      setParcela(response.data.data);
    } catch (error) {
      console.error('Error loading parcela:', error);
      toast.error('Error al cargar la parcela');
      // Datos de ejemplo
      setParcela({
        id: id || '1',
        nombre: 'Parcela Norte',
        ubicacion: 'Sector Norte, Achocalla',
        tamanioHectareas: 1.0,
        tipoSuelo: 'Franco arcilloso',
        latitud: -16.5833,
        longitud: -68.1667,
        altitudMsnm: 3850,
        activa: true,
        cultivos: [
          {
            id: '1',
            nombre: 'Papa',
            variedad: 'Huaycha',
            estado: 'EN_CRECIMIENTO',
            fechaSiembra: '2025-10-15',
            fechaCosechaEstimada: '2026-03-15',
            areaCultivada: 0.8,
            rendimientoEsperado: 800,
            notas: 'Buen desarrollo inicial',
          },
        ],
        sensores: [
          { id: '1', nombre: 'Sensor Humedad 1', tipo: 'HUMEDAD_SUELO', ultimaLectura: 45, unidad: '%', activo: true },
          { id: '2', nombre: 'Sensor Temp 1', tipo: 'TEMPERATURA', ultimaLectura: 18, unidad: '°C', activo: true },
          { id: '3', nombre: 'Sensor pH', tipo: 'PH_SUELO', ultimaLectura: 6.5, unidad: 'pH', activo: true },
        ],
        alertas: [
          { id: '1', tipo: 'HUMEDAD_BAJA', mensaje: 'Humedad del suelo por debajo del óptimo', prioridad: 'MEDIA', createdAt: new Date().toISOString() },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const loadClima = async () => {
    try {
      const response = await api.get('/dashboard/clima');
      setClima(response.data.data?.actual);
    } catch {
      setClima({
        temperatura: 18,
        humedad: 55,
        condicion: 'Parcialmente nublado',
        probabilidadLluvia: 20,
      });
    }
  };

  const getEstadoInfo = (estado: string) => {
    const estados: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
      SEMBRADO: { color: 'bg-blue-100 text-blue-800', label: 'Sembrado', icon: <BeakerIcon className="w-4 h-4" /> },
      GERMINACION: { color: 'bg-cyan-100 text-cyan-800', label: 'Germinación', icon: <BeakerIcon className="w-4 h-4" /> },
      EN_CRECIMIENTO: { color: 'bg-green-100 text-green-800', label: 'En Crecimiento', icon: <SunIcon className="w-4 h-4" /> },
      FLORACION: { color: 'bg-pink-100 text-pink-800', label: 'Floración', icon: <SunIcon className="w-4 h-4" /> },
      MADURACION: { color: 'bg-yellow-100 text-yellow-800', label: 'Maduración', icon: <ClockIcon className="w-4 h-4" /> },
      LISTO_COSECHA: { color: 'bg-orange-100 text-orange-800', label: 'Listo para Cosecha', icon: <CheckCircleIcon className="w-4 h-4" /> },
      COSECHADO: { color: 'bg-gray-100 text-gray-800', label: 'Cosechado', icon: <CheckCircleIcon className="w-4 h-4" /> },
    };
    return estados[estado] || { color: 'bg-gray-100 text-gray-800', label: estado, icon: null };
  };

  const getSensorIcon = (tipo: string) => {
    const icons: Record<string, string> = {
      HUMEDAD_SUELO: '💧',
      TEMPERATURA: '🌡️',
      PH_SUELO: '🧪',
      LLUVIA: '🌧️',
      LUZ: '☀️',
      VIENTO: '💨',
    };
    return icons[tipo] || '📡';
  };

  const diasParaCosecha = (fecha?: string) => {
    if (!fecha) return null;
    const dias = Math.ceil((new Date(fecha).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return dias > 0 ? dias : 0;
  };

  // Datos para gráficos
  const humedadHistorica = {
    labels: ['Hace 7d', 'Hace 6d', 'Hace 5d', 'Hace 4d', 'Hace 3d', 'Hace 2d', 'Ayer', 'Hoy'],
    datasets: [
      {
        label: 'Humedad del Suelo (%)',
        data: [42, 45, 48, 44, 40, 38, 42, 45],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const temperaturaHistorica = {
    labels: ['6:00', '9:00', '12:00', '15:00', '18:00', '21:00'],
    datasets: [
      {
        label: 'Temperatura (°C)',
        data: [8, 14, 22, 24, 18, 12],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
        borderRadius: 8,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!parcela) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Parcela no encontrada</p>
        <Link to="/parcelas" className="text-primary-600 hover:underline mt-2 block">
          Volver a Parcelas
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link
          to="/parcelas"
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Volver</span>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <MapPinIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{parcela.nombre}</h1>
              <p className="text-gray-500">{parcela.ubicacion}</p>
            </div>
          </div>
        </div>
        {parcela.activa && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Activa
          </span>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-sm opacity-90">Área Total</p>
          <p className="text-2xl font-bold">{parcela.tamanioHectareas} ha</p>
        </div>
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-sm opacity-90">Altitud</p>
          <p className="text-2xl font-bold">{parcela.altitudMsnm || 'N/A'} msnm</p>
        </div>
        <div className="card bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <p className="text-sm opacity-90">Tipo de Suelo</p>
          <p className="text-lg font-bold">{parcela.tipoSuelo || 'No especificado'}</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-sm opacity-90">Sensores Activos</p>
          <p className="text-2xl font-bold">{parcela.sensores?.filter(s => s.activo).length || 0}</p>
        </div>
      </div>

      {/* Clima Actual */}
      {clima && (
        <div className="card bg-gradient-to-r from-sky-400 to-blue-500 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CloudIcon className="w-12 h-12" />
              <div>
                <p className="text-sm opacity-90">Clima Actual</p>
                <p className="text-3xl font-bold">{clima.temperatura}°C</p>
                <p className="text-sm">{clima.condicion}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Humedad: {clima.humedad}%</p>
              <p className="text-sm opacity-90">Prob. Lluvia: {clima.probabilidadLluvia}%</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cultivos */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            🌱 Cultivos Activos
          </h2>
          {parcela.cultivos && parcela.cultivos.length > 0 ? (
            <div className="space-y-4">
              {parcela.cultivos.map((cultivo) => {
                const estadoInfo = getEstadoInfo(cultivo.estado);
                const dias = diasParaCosecha(cultivo.fechaCosechaEstimada);
                return (
                  <div key={cultivo.id} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {cultivo.nombre} {cultivo.variedad && `(${cultivo.variedad})`}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${estadoInfo.color}`}>
                          {estadoInfo.icon}
                          {estadoInfo.label}
                        </span>
                      </div>
                      {dias !== null && dias > 0 && (
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary-600">{dias}</p>
                          <p className="text-xs text-gray-500">días para cosecha</p>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Área:</span>
                        <span className="ml-1 font-medium">{cultivo.areaCultivada || 'N/A'} ha</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Rendimiento esperado:</span>
                        <span className="ml-1 font-medium">{cultivo.rendimientoEsperado || 'N/A'} kg</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Siembra:</span>
                        <span className="ml-1 font-medium">
                          {new Date(cultivo.fechaSiembra).toLocaleDateString('es-BO')}
                        </span>
                      </div>
                      {cultivo.fechaCosechaEstimada && (
                        <div>
                          <span className="text-gray-500">Cosecha est.:</span>
                          <span className="ml-1 font-medium">
                            {new Date(cultivo.fechaCosechaEstimada).toLocaleDateString('es-BO')}
                          </span>
                        </div>
                      )}
                    </div>
                    {cultivo.notas && (
                      <p className="mt-2 text-sm text-gray-600 italic">📝 {cultivo.notas}</p>
                    )}
                    {/* Barra de progreso */}
                    {cultivo.fechaCosechaEstimada && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progreso del cultivo</span>
                          <span>
                            {Math.min(100, Math.max(0, Math.round(
                              ((Date.now() - new Date(cultivo.fechaSiembra).getTime()) /
                              (new Date(cultivo.fechaCosechaEstimada).getTime() - new Date(cultivo.fechaSiembra).getTime())) * 100
                            )))}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, Math.max(0, 
                                ((Date.now() - new Date(cultivo.fechaSiembra).getTime()) /
                                (new Date(cultivo.fechaCosechaEstimada).getTime() - new Date(cultivo.fechaSiembra).getTime())) * 100
                              ))}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay cultivos activos</p>
          )}
        </div>

        {/* Sensores */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <SignalIcon className="w-5 h-5 text-purple-600" />
            Sensores IoT
          </h2>
          {parcela.sensores && parcela.sensores.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {parcela.sensores.map((sensor) => (
                <div
                  key={sensor.id}
                  className={`p-4 rounded-xl border-2 ${
                    sensor.activo ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{getSensorIcon(sensor.tipo)}</span>
                    <span className={`w-2 h-2 rounded-full ${sensor.activo ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                  </div>
                  <p className="text-sm text-gray-600">{sensor.nombre}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sensor.ultimaLectura ?? 'N/A'} {sensor.unidad}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay sensores instalados</p>
          )}
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Humedad del Suelo (Últimos 7 días)</h2>
          <Line
            data={humedadHistorica}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: { min: 0, max: 100, title: { display: true, text: '%' } },
              },
            }}
          />
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🌡️ Temperatura Hoy</h2>
          <Bar
            data={temperaturaHistorica}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: { title: { display: true, text: '°C' } },
              },
            }}
          />
        </div>
      </div>

      {/* Alertas */}
      {parcela.alertas && parcela.alertas.length > 0 && (
        <div className="card border-l-4 border-orange-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
            Alertas Activas
          </h2>
          <div className="space-y-2">
            {parcela.alertas.map((alerta) => (
              <div key={alerta.id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <ExclamationTriangleIcon className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{alerta.mensaje}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(alerta.createdAt).toLocaleString('es-BO')}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  alerta.prioridad === 'ALTA' || alerta.prioridad === 'CRITICA' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {alerta.prioridad}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mapa placeholder */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPinIcon className="w-5 h-5 text-blue-600" />
          Ubicación
        </h2>
        <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-xl h-64 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-green-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-blue-400 rounded-full blur-3xl"></div>
          </div>
          <div className="text-center z-10">
            <MapPinIcon className="w-12 h-12 text-primary-600 mx-auto mb-2" />
            <p className="font-semibold text-gray-700">
              {parcela.latitud && parcela.longitud 
                ? `${parcela.latitud.toFixed(4)}, ${parcela.longitud.toFixed(4)}`
                : 'Coordenadas no disponibles'}
            </p>
            <p className="text-sm text-gray-500">{parcela.ubicacion}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
