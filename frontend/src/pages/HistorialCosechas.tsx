import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { Bar, Line } from 'react-chartjs-2';
import {
  ArrowLeftIcon,
  CalendarIcon,
  ScaleIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FunnelIcon,
  TableCellsIcon,
  ChartBarIcon,
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

interface Cosecha {
  id: string;
  cultivo: string;
  variedad: string;
  parcela: string;
  fechaSiembra: string;
  fechaCosecha: string;
  rendimientoKg: number;
  rendimientoEsperadoKg: number;
  precioVentaKg: number;
  totalVenta: number;
  costoProduccion: number;
  utilidad: number;
  calidad: 'excelente' | 'buena' | 'regular' | 'mala';
  notas?: string;
  clima: string;
  temporada: string;
}

export default function HistorialCosechas() {
  const [cosechas, setCosechas] = useState<Cosecha[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroAño, setFiltroAño] = useState('2025');
  const [filtroCultivo, setFiltroCultivo] = useState('todos');
  const [vistaActual, setVistaActual] = useState<'tabla' | 'graficos'>('tabla');

  useEffect(() => {
    // Datos de ejemplo
    const datosHistoricos: Cosecha[] = [
      {
        id: '1',
        cultivo: 'Papa',
        variedad: 'Huaycha',
        parcela: 'Parcela Norte',
        fechaSiembra: '2025-02-15',
        fechaCosecha: '2025-07-20',
        rendimientoKg: 4500,
        rendimientoEsperadoKg: 5000,
        precioVentaKg: 1.4,
        totalVenta: 6300,
        costoProduccion: 2800,
        utilidad: 3500,
        calidad: 'buena',
        clima: 'Normal con lluvias moderadas',
        temporada: '2025',
        notas: 'Buen rendimiento a pesar de algunas heladas tardías',
      },
      {
        id: '2',
        cultivo: 'Haba',
        variedad: 'Criolla',
        parcela: 'Parcela Sur',
        fechaSiembra: '2025-03-01',
        fechaCosecha: '2025-08-15',
        rendimientoKg: 850,
        rendimientoEsperadoKg: 900,
        precioVentaKg: 3.8,
        totalVenta: 3230,
        costoProduccion: 1200,
        utilidad: 2030,
        calidad: 'excelente',
        clima: 'Condiciones ideales',
        temporada: '2025',
      },
      {
        id: '3',
        cultivo: 'Quinua',
        variedad: 'Real Blanca',
        parcela: 'Parcela Este',
        fechaSiembra: '2024-09-15',
        fechaCosecha: '2025-04-10',
        rendimientoKg: 580,
        rendimientoEsperadoKg: 700,
        precioVentaKg: 11.5,
        totalVenta: 6670,
        costoProduccion: 2500,
        utilidad: 4170,
        calidad: 'buena',
        clima: 'Sequía moderada',
        temporada: '2024-2025',
        notas: 'Afectada por falta de lluvias en enero',
      },
      {
        id: '4',
        cultivo: 'Papa',
        variedad: 'Imilla Negra',
        parcela: 'Parcela Oeste',
        fechaSiembra: '2024-02-10',
        fechaCosecha: '2024-07-25',
        rendimientoKg: 3800,
        rendimientoEsperadoKg: 4000,
        precioVentaKg: 1.6,
        totalVenta: 6080,
        costoProduccion: 2600,
        utilidad: 3480,
        calidad: 'buena',
        clima: 'Normal',
        temporada: '2024',
      },
      {
        id: '5',
        cultivo: 'Maíz',
        variedad: 'Kulli',
        parcela: 'Parcela Norte',
        fechaSiembra: '2024-10-01',
        fechaCosecha: '2025-05-15',
        rendimientoKg: 1100,
        rendimientoEsperadoKg: 1400,
        precioVentaKg: 2.3,
        totalVenta: 2530,
        costoProduccion: 1500,
        utilidad: 1030,
        calidad: 'regular',
        clima: 'Granizada afectó parte del cultivo',
        temporada: '2024-2025',
        notas: 'Pérdida parcial por granizada en febrero',
      },
      {
        id: '6',
        cultivo: 'Cebolla',
        variedad: 'Roja',
        parcela: 'Parcela Sur',
        fechaSiembra: '2024-04-15',
        fechaCosecha: '2024-10-20',
        rendimientoKg: 2200,
        rendimientoEsperadoKg: 2500,
        precioVentaKg: 2.0,
        totalVenta: 4400,
        costoProduccion: 1800,
        utilidad: 2600,
        calidad: 'buena',
        clima: 'Normal',
        temporada: '2024',
      },
    ];
    setCosechas(datosHistoricos);
    setLoading(false);
  }, []);

  // Filtrar cosechas
  const cosechasFiltradas = cosechas.filter((c) => {
    const cumpleAño = filtroAño === 'todos' || c.temporada.includes(filtroAño);
    const cumpleCultivo = filtroCultivo === 'todos' || c.cultivo === filtroCultivo;
    return cumpleAño && cumpleCultivo;
  });

  // Calcular estadísticas
  const estadisticas = {
    totalCosechas: cosechasFiltradas.length,
    rendimientoTotal: cosechasFiltradas.reduce((acc, c) => acc + c.rendimientoKg, 0),
    ingresoTotal: cosechasFiltradas.reduce((acc, c) => acc + c.totalVenta, 0),
    utilidadTotal: cosechasFiltradas.reduce((acc, c) => acc + c.utilidad, 0),
    promedioRoi: cosechasFiltradas.length > 0
      ? cosechasFiltradas.reduce((acc, c) => acc + (c.utilidad / c.costoProduccion) * 100, 0) / cosechasFiltradas.length
      : 0,
  };

  // Obtener cultivos únicos para filtro
  const cultivosUnicos = [...new Set(cosechas.map((c) => c.cultivo))];

  // Datos para gráficos
  const rendimientoPorCultivo = {
    labels: cultivosUnicos,
    datasets: [
      {
        label: 'Rendimiento Obtenido (kg)',
        data: cultivosUnicos.map((cultivo) =>
          cosechasFiltradas
            .filter((c) => c.cultivo === cultivo)
            .reduce((acc, c) => acc + c.rendimientoKg, 0)
        ),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderRadius: 8,
      },
      {
        label: 'Rendimiento Esperado (kg)',
        data: cultivosUnicos.map((cultivo) =>
          cosechasFiltradas
            .filter((c) => c.cultivo === cultivo)
            .reduce((acc, c) => acc + c.rendimientoEsperadoKg, 0)
        ),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderRadius: 8,
      },
    ],
  };

  const evolucionUtilidad = {
    labels: cosechasFiltradas.map((c) => `${c.cultivo} (${new Date(c.fechaCosecha).toLocaleDateString('es-BO', { month: 'short', year: '2-digit' })})`),
    datasets: [
      {
        label: 'Utilidad (Bs)',
        data: cosechasFiltradas.map((c) => c.utilidad),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const getCalidadBadge = (calidad: string) => {
    const estilos: Record<string, string> = {
      excelente: 'bg-green-100 text-green-800',
      buena: 'bg-blue-100 text-blue-800',
      regular: 'bg-yellow-100 text-yellow-800',
      mala: 'bg-red-100 text-red-800',
    };
    return estilos[calidad] || 'bg-gray-100 text-gray-800';
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
        <div className="flex items-center gap-4">
          <Link
            to="/parcelas"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="w-7 h-7 text-primary-600" />
              Historial de Cosechas
            </h1>
            <p className="text-gray-500">Registro histórico de todas tus cosechas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle vista */}
          <div className="flex rounded-lg overflow-hidden border">
            <button
              onClick={() => setVistaActual('tabla')}
              className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1 ${
                vistaActual === 'tabla'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <TableCellsIcon className="w-4 h-4" />
              Tabla
            </button>
            <button
              onClick={() => setVistaActual('graficos')}
              className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1 ${
                vistaActual === 'graficos'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ChartBarIcon className="w-4 h-4" />
              Gráficos
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card flex flex-wrap items-center gap-4">
        <FunnelIcon className="w-5 h-5 text-gray-400" />
        <select
          className="input w-auto bg-white"
          value={filtroAño}
          onChange={(e) => setFiltroAño(e.target.value)}
        >
          <option value="todos">Todos los años</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
        </select>
        <select
          className="input w-auto bg-white"
          value={filtroCultivo}
          onChange={(e) => setFiltroCultivo(e.target.value)}
        >
          <option value="todos">Todos los cultivos</option>
          {cultivosUnicos.map((cultivo) => (
            <option key={cultivo} value={cultivo}>
              {cultivo}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-500">
          {cosechasFiltradas.length} cosecha(s) encontrada(s)
        </span>
      </div>

      {/* Estadísticas resumen */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-sm opacity-90">Total Cosechas</p>
          <p className="text-2xl font-bold">{estadisticas.totalCosechas}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-sm opacity-90">Rendimiento Total</p>
          <p className="text-2xl font-bold">{(estadisticas.rendimientoTotal / 1000).toFixed(1)}t</p>
        </div>
        <div className="card bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <p className="text-sm opacity-90">Ingresos Totales</p>
          <p className="text-2xl font-bold">Bs. {estadisticas.ingresoTotal.toLocaleString()}</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-sm opacity-90">Utilidad Total</p>
          <p className="text-2xl font-bold">Bs. {estadisticas.utilidadTotal.toLocaleString()}</p>
        </div>
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <p className="text-sm opacity-90">ROI Promedio</p>
          <p className="text-2xl font-bold">{estadisticas.promedioRoi.toFixed(0)}%</p>
        </div>
      </div>

      {vistaActual === 'tabla' ? (
        /* Tabla de cosechas */
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Cultivo</th>
                  <th>Parcela</th>
                  <th>Fechas</th>
                  <th className="text-right">Rendimiento</th>
                  <th className="text-right">Venta</th>
                  <th className="text-right">Utilidad</th>
                  <th>Calidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cosechasFiltradas.map((cosecha) => {
                  const cumplimiento = ((cosecha.rendimientoKg / cosecha.rendimientoEsperadoKg) * 100);
                  return (
                    <tr key={cosecha.id} className="hover:bg-gray-50">
                      <td>
                        <div>
                          <p className="font-medium text-gray-900">
                            🌱 {cosecha.cultivo}
                          </p>
                          <p className="text-xs text-gray-500">{cosecha.variedad}</p>
                        </div>
                      </td>
                      <td className="text-gray-600">{cosecha.parcela}</td>
                      <td>
                        <div className="text-sm">
                          <p className="text-gray-900">
                            {new Date(cosecha.fechaCosecha).toLocaleDateString('es-BO')}
                          </p>
                          <p className="text-xs text-gray-500">
                            Siembra: {new Date(cosecha.fechaSiembra).toLocaleDateString('es-BO')}
                          </p>
                        </div>
                      </td>
                      <td className="text-right">
                        <div>
                          <p className="font-medium text-gray-900">
                            {cosecha.rendimientoKg.toLocaleString()} kg
                          </p>
                          <p className={`text-xs ${cumplimiento >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {cumplimiento >= 100 ? (
                              <span className="flex items-center justify-end gap-1">
                                <ArrowTrendingUpIcon className="w-3 h-3" />
                                {cumplimiento.toFixed(0)}%
                              </span>
                            ) : (
                              <span className="flex items-center justify-end gap-1">
                                <ArrowTrendingDownIcon className="w-3 h-3" />
                                {cumplimiento.toFixed(0)}%
                              </span>
                            )}
                          </p>
                        </div>
                      </td>
                      <td className="text-right">
                        <p className="font-medium text-gray-900">
                          Bs. {cosecha.totalVenta.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          @ Bs. {cosecha.precioVentaKg}/kg
                        </p>
                      </td>
                      <td className="text-right">
                        <p className={`font-bold ${cosecha.utilidad > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Bs. {cosecha.utilidad.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          ROI: {((cosecha.utilidad / cosecha.costoProduccion) * 100).toFixed(0)}%
                        </p>
                      </td>
                      <td>
                        <span className={`badge ${getCalidadBadge(cosecha.calidad)}`}>
                          {cosecha.calidad}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Vista de gráficos */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ScaleIcon className="w-5 h-5 text-green-600" />
              Rendimiento por Cultivo
            </h3>
            <div className="h-64">
              <Bar
                data={rendimientoPorCultivo}
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
                        callback: (value) => `${value} kg`,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
              Evolución de Utilidades
            </h3>
            <div className="h-64">
              <Line
                data={evolucionUtilidad}
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
                      ticks: {
                        callback: (value) => `Bs. ${value}`,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mejores cosechas */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrophyIcon className="w-5 h-5 text-yellow-500" />
          Mejores Cosechas (por utilidad)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...cosechasFiltradas]
            .sort((a, b) => b.utilidad - a.utilidad)
            .slice(0, 3)
            .map((cosecha, index) => (
              <div
                key={cosecha.id}
                className={`p-4 rounded-xl border-2 ${
                  index === 0
                    ? 'bg-yellow-50 border-yellow-300'
                    : index === 1
                    ? 'bg-gray-50 border-gray-300'
                    : 'bg-amber-50 border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    index === 0 ? 'bg-yellow-200 text-yellow-800' :
                    index === 1 ? 'bg-gray-200 text-gray-800' :
                    'bg-amber-200 text-amber-800'
                  }`}>
                    #{index + 1}
                  </span>
                </div>
                <p className="font-bold text-gray-900">{cosecha.cultivo} ({cosecha.variedad})</p>
                <p className="text-sm text-gray-500">{cosecha.parcela}</p>
                <p className="text-xl font-bold text-green-600 mt-2">
                  Bs. {cosecha.utilidad.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(cosecha.fechaCosecha).toLocaleDateString('es-BO', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
