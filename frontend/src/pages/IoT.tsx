import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import api from '../services/api';
import {
  SignalIcon,
  CloudIcon,
  SunIcon,
  BeakerIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Sensor {
  id: string;
  tipo: string;
  nombre: string;
  parcela?: { nombre: string };
  activo: boolean;
  ultimaLectura?: {
    valor: number;
    unidad: string;
    timestamp: string;
  };
}

interface LecturaHistorica {
  timestamp: string;
  valor: number;
}

export default function IoT() {
  const [sensores, setSensores] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  const [historico, setHistorico] = useState<LecturaHistorica[]>([]);

  useEffect(() => {
    loadSensores();
  }, []);

  useEffect(() => {
    if (selectedSensor) {
      loadHistorico(selectedSensor);
    }
  }, [selectedSensor]);

  const loadSensores = async () => {
    try {
      const response = await api.get('/iot/sensores');
      setSensores(response.data.data || []);
    } catch (error) {
      console.error('Error loading sensores:', error);
      // Datos de ejemplo
      setSensores([
        {
          id: '1',
          tipo: 'HUMEDAD_SUELO',
          nombre: 'Sensor Humedad - Parcela Norte',
          parcela: { nombre: 'Parcela Norte' },
          activo: true,
          ultimaLectura: { valor: 65, unidad: '%', timestamp: new Date().toISOString() },
        },
        {
          id: '2',
          tipo: 'TEMPERATURA',
          nombre: 'Sensor Temperatura - Parcela Norte',
          parcela: { nombre: 'Parcela Norte' },
          activo: true,
          ultimaLectura: { valor: 18, unidad: '°C', timestamp: new Date().toISOString() },
        },
        {
          id: '3',
          tipo: 'PH_SUELO',
          nombre: 'Sensor pH - Parcela Norte',
          parcela: { nombre: 'Parcela Norte' },
          activo: true,
          ultimaLectura: { valor: 6.5, unidad: 'pH', timestamp: new Date().toISOString() },
        },
        {
          id: '4',
          tipo: 'LLUVIA',
          nombre: 'Pluviómetro - General',
          parcela: { nombre: 'Parcela Sur' },
          activo: true,
          ultimaLectura: { valor: 12, unidad: 'mm', timestamp: new Date().toISOString() },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadHistorico = async (sensorId: string) => {
    try {
      const response = await api.get(`/iot/sensores/${sensorId}/lecturas`);
      setHistorico(response.data.data || []);
    } catch {
      // Datos históricos de ejemplo
      const now = new Date();
      const data: LecturaHistorica[] = [];
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now);
        time.setHours(time.getHours() - i);
        data.push({
          timestamp: time.toISOString(),
          valor: Math.round(50 + Math.random() * 30),
        });
      }
      setHistorico(data);
    }
  };

  const getSensorIcon = (tipo: string) => {
    switch (tipo) {
      case 'HUMEDAD_SUELO':
        return <CloudIcon className="w-8 h-8" />;
      case 'TEMPERATURA':
        return <SunIcon className="w-8 h-8" />;
      case 'PH_SUELO':
        return <BeakerIcon className="w-8 h-8" />;
      case 'LLUVIA':
        return <CloudIcon className="w-8 h-8" />;
      default:
        return <SignalIcon className="w-8 h-8" />;
    }
  };

  const getSensorColor = (tipo: string) => {
    switch (tipo) {
      case 'HUMEDAD_SUELO':
        return 'from-blue-500 to-blue-600';
      case 'TEMPERATURA':
        return 'from-orange-500 to-red-500';
      case 'PH_SUELO':
        return 'from-green-500 to-green-600';
      case 'LLUVIA':
        return 'from-indigo-500 to-purple-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getValorStatus = (tipo: string, valor: number) => {
    switch (tipo) {
      case 'HUMEDAD_SUELO':
        if (valor < 30) return { status: 'Bajo', color: 'text-red-600' };
        if (valor > 80) return { status: 'Alto', color: 'text-yellow-600' };
        return { status: 'Óptimo', color: 'text-green-600' };
      case 'TEMPERATURA':
        if (valor < 10) return { status: 'Frío', color: 'text-blue-600' };
        if (valor > 30) return { status: 'Caliente', color: 'text-red-600' };
        return { status: 'Óptimo', color: 'text-green-600' };
      case 'PH_SUELO':
        if (valor < 5.5) return { status: 'Ácido', color: 'text-yellow-600' };
        if (valor > 7.5) return { status: 'Alcalino', color: 'text-yellow-600' };
        return { status: 'Óptimo', color: 'text-green-600' };
      default:
        return { status: 'Normal', color: 'text-gray-600' };
    }
  };

  const chartData = {
    labels: historico.map((h) =>
      new Date(h.timestamp).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
    ),
    datasets: [
      {
        label: 'Valor',
        data: historico.map((h) => h.valor),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
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

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sensores IoT</h1>
          <p className="text-gray-500">Monitoreo en tiempo real de tus parcelas</p>
        </div>
        <button onClick={loadSensores} className="btn-secondary flex items-center gap-2">
          <ArrowPathIcon className="w-5 h-5" />
          Actualizar
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-gray-900">{sensores.length}</p>
          <p className="text-sm text-gray-500">Total Sensores</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">
            {sensores.filter((s) => s.activo).length}
          </p>
          <p className="text-sm text-gray-500">Activos</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-red-600">
            {sensores.filter((s) => !s.activo).length}
          </p>
          <p className="text-sm text-gray-500">Inactivos</p>
        </div>
        <div className="card text-center">
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-green-600">En línea</p>
          </div>
          <p className="text-sm text-gray-500">Estado del sistema</p>
        </div>
      </div>

      {/* Sensores Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sensores.map((sensor) => {
          const valorStatus = sensor.ultimaLectura
            ? getValorStatus(sensor.tipo, sensor.ultimaLectura.valor)
            : null;
          return (
            <div
              key={sensor.id}
              onClick={() => setSelectedSensor(sensor.id)}
              className={`card card-hover cursor-pointer relative overflow-hidden ${
                selectedSensor === sensor.id ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${getSensorColor(sensor.tipo)} opacity-10 rounded-bl-full`}></div>
              
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${getSensorColor(sensor.tipo)} text-white`}>
                  {getSensorIcon(sensor.tipo)}
                </div>
                <div className={`w-3 h-3 rounded-full ${sensor.activo ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1">{sensor.nombre}</h3>
              {sensor.parcela && (
                <p className="text-xs text-gray-500 mb-3">📍 {sensor.parcela.nombre}</p>
              )}

              {sensor.ultimaLectura && (
                <div className="mt-auto">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {sensor.ultimaLectura.valor}
                    </span>
                    <span className="text-lg text-gray-500">{sensor.ultimaLectura.unidad}</span>
                  </div>
                  {valorStatus && (
                    <p className={`text-sm font-medium ${valorStatus.color}`}>
                      {valorStatus.status}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Actualizado:{' '}
                    {new Date(sensor.ultimaLectura.timestamp).toLocaleString('es-BO')}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Gráfico Histórico */}
      {selectedSensor && historico.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Historial de Lecturas (24 horas)
            </h2>
            <button
              onClick={() => setSelectedSensor(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="h-64">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: { beginAtZero: false },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Info IoT */}
      <div className="card bg-gradient-to-r from-primary-50 to-blue-50">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <SignalIcon className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Sistema IoT AgroBolivia</h3>
            <p className="text-sm text-gray-600 mb-3">
              Los sensores IoT están configurados para enviar datos cada 15 minutos.
              El sistema genera alertas automáticas cuando los valores están fuera del rango óptimo.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="badge bg-blue-100 text-blue-800">💧 Humedad 40-70%</span>
              <span className="badge bg-orange-100 text-orange-800">🌡️ Temp 15-25°C</span>
              <span className="badge bg-green-100 text-green-800">🧪 pH 5.5-7.0</span>
            </div>
          </div>
        </div>
      </div>

      {sensores.length === 0 && (
        <div className="text-center py-12">
          <SignalIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay sensores configurados</h3>
          <p className="text-gray-500">
            Los sensores IoT serán detectados automáticamente cuando se conecten.
          </p>
        </div>
      )}
    </div>
  );
}
