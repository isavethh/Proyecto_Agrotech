import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import api from '../services/api';
import {
  MapIcon,
  CurrencyDollarIcon,
  CubeIcon,
  SignalIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardData {
  usuario: {
    nombre: string;
    ultimoLogin: string | null;
  };
  resumen: {
    parcelas: {
      total: number;
      areaTotal: string;
    };
    cultivos: {
      activos: number;
      proximosCosecha: number;
    };
    alertas: {
      total: number;
      criticas: number;
    };
    inventario: {
      stockBajo: number;
    };
  };
  finanzasMes: {
    ingresos: number;
    gastos: number;
    utilidad: number;
    margen: number | string;
  };
  cultivosActivos: {
    id: string;
    nombre: string;
    variedad: string;
    parcela: string;
    estado: string;
    fechaCosecha: string | null;
    diasParaCosecha: number | null;
  }[];
  alertasRecientes: {
    id: string;
    tipo: string;
    mensaje: string;
    prioridad: string;
    createdAt: string;
  }[];
  tareasPendientes: {
    id: string;
    titulo: string;
    prioridad: string;
    fechaLimite: string | null;
    vencida: boolean;
  }[];
  stockBajo: {
    id: string;
    nombre: string;
    cantidad: number;
    unidad: string;
    stockMinimo: number;
  }[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.get('/dashboard');
      setData(response.data.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Extraer datos del backend con valores por defecto
  const totalParcelas = data?.resumen?.parcelas?.total ?? 0;
  const areaTotal = data?.resumen?.parcelas?.areaTotal ?? '0';
  const cultivosActivos = data?.resumen?.cultivos?.activos ?? 0;
  const alertasPendientes = data?.resumen?.alertas?.total ?? 0;
  const ingresosMes = data?.finanzasMes?.ingresos ?? 0;
  const gastosMes = data?.finanzasMes?.gastos ?? 0;
  const balanceMes = ingresosMes - gastosMes;

  const finanzasData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Ingresos',
        data: [2500, 2800, 3200, 3500, 3800, 3200],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Gastos',
        data: [1500, 1700, 1400, 1800, 1600, 1800],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const cultivosData = {
    labels: ['Papa', 'Haba', 'Quinua', 'Maíz'],
    datasets: [
      {
        data: [35, 25, 20, 20],
        backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'],
        borderWidth: 0,
      },
    ],
  };

  const sensoresData = {
    labels: ['Humedad', 'Temperatura', 'pH Suelo', 'Lluvia'],
    datasets: [
      {
        label: 'Último valor',
        data: [65, 22, 6.5, 15],
        backgroundColor: ['#3b82f6', '#ef4444', '#22c55e', '#8b5cf6'],
        borderRadius: 8,
      },
    ],
  };

  const stats = [
    {
      name: 'Parcelas',
      value: totalParcelas,
      subvalue: `${areaTotal} ha total`,
      icon: MapIcon,
      color: 'bg-blue-500',
      link: '/parcelas',
    },
    {
      name: 'Balance del Mes',
      value: `Bs. ${balanceMes.toLocaleString()}`,
      subvalue: balanceMes >= 0 ? 'Ganancia' : 'Pérdida',
      icon: balanceMes >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon,
      color: balanceMes >= 0 ? 'bg-green-500' : 'bg-red-500',
      link: '/finanzas',
    },
    {
      name: 'Cultivos Activos',
      value: cultivosActivos,
      subvalue: 'En producción',
      icon: SignalIcon,
      color: 'bg-purple-500',
      link: '/parcelas',
    },
    {
      name: 'Alertas',
      value: alertasPendientes,
      subvalue: 'Pendientes',
      icon: ExclamationTriangleIcon,
      color: alertasPendientes > 0 ? 'bg-orange-500' : 'bg-gray-400',
      link: '/alertas',
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Resumen general de tu actividad agrícola</p>
        </div>
        <div className="flex gap-2">
          <select className="input w-auto bg-white">
            <option>Últimos 30 días</option>
            <option>Últimos 7 días</option>
            <option>Este mes</option>
            <option>Este año</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.link}
            className="card card-hover flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.name}</p>
              <p className="text-xs text-gray-400">{stat.subvalue}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Finanzas Chart */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Ingresos vs Gastos</h2>
            <Link to="/finanzas" className="text-sm text-primary-600 hover:text-primary-700">
              Ver detalles →
            </Link>
          </div>
          <div className="h-64">
            <Line
              data={finanzasData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `Bs. ${value}`,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Cultivos Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Cultivos</h2>
            <Link to="/parcelas" className="text-sm text-primary-600 hover:text-primary-700">
              Ver todos →
            </Link>
          </div>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={cultivosData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
                cutout: '60%',
              }}
            />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sensores Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Sensores IoT</h2>
            <Link to="/iot" className="text-sm text-primary-600 hover:text-primary-700">
              Ver dashboard →
            </Link>
          </div>
          <div className="h-64">
            <Bar
              data={sensoresData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Alertas recientes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Alertas Recientes</h2>
            <Link to="/alertas" className="text-sm text-primary-600 hover:text-primary-700">
              Ver todas →
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { tipo: 'warning', mensaje: 'Humedad baja en Parcela Norte', tiempo: 'Hace 2 horas' },
              { tipo: 'info', mensaje: 'Temperatura óptima para cosecha', tiempo: 'Hace 5 horas' },
              { tipo: 'danger', mensaje: 'Posible helada esta noche', tiempo: 'Hace 1 día' },
              { tipo: 'success', mensaje: 'Riego automático completado', tiempo: 'Hace 2 días' },
            ].map((alerta, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  alerta.tipo === 'danger'
                    ? 'bg-red-50'
                    : alerta.tipo === 'warning'
                    ? 'bg-yellow-50'
                    : alerta.tipo === 'success'
                    ? 'bg-green-50'
                    : 'bg-blue-50'
                }`}
              >
                <span className="text-xl">
                  {alerta.tipo === 'danger'
                    ? '🚨'
                    : alerta.tipo === 'warning'
                    ? '⚠️'
                    : alerta.tipo === 'success'
                    ? '✅'
                    : 'ℹ️'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{alerta.mensaje}</p>
                  <p className="text-xs text-gray-500">{alerta.tiempo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to="/parcelas"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            <MapIcon className="w-8 h-8 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Nueva Parcela</span>
          </Link>
          <Link
            to="/finanzas"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors"
          >
            <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
            <span className="text-sm font-medium text-green-900">Registrar Venta</span>
          </Link>
          <Link
            to="/inventario"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors"
          >
            <CubeIcon className="w-8 h-8 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Ver Inventario</span>
          </Link>
          <Link
            to="/iot"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors"
          >
            <SignalIcon className="w-8 h-8 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">IoT Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
