import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  Doughnut,
} from 'react-chartjs-2';
import {
  ArrowLeftIcon,
  CalculatorIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

interface CentroCosto {
  id: string;
  nombre: string;
  tipo: 'PARCELA' | 'CULTIVO' | 'ACTIVIDAD';
  ingresos: number;
  costos: number;
  margen: number;
  porcentajeMargen: number;
}

interface DetalleCosto {
  categoria: string;
  monto: number;
  porcentaje: number;
}

export default function CentroCostos() {
  const [loading, setLoading] = useState(true);
  const [vistaActiva, setVistaActiva] = useState<'parcela' | 'cultivo' | 'actividad'>('parcela');

  const [centrosPorParcela] = useState<CentroCosto[]>([
    { id: '1', nombre: 'Parcela Norte - Tiwanaku', tipo: 'PARCELA', ingresos: 8500, costos: 4200, margen: 4300, porcentajeMargen: 50.6 },
    { id: '2', nombre: 'Parcela Sur - Viacha', tipo: 'PARCELA', ingresos: 6200, costos: 3800, margen: 2400, porcentajeMargen: 38.7 },
    { id: '3', nombre: 'Parcela Este - Achacachi', tipo: 'PARCELA', ingresos: 4800, costos: 2900, margen: 1900, porcentajeMargen: 39.6 },
  ]);

  const [centrosPorCultivo] = useState<CentroCosto[]>([
    { id: '1', nombre: 'Papa', tipo: 'CULTIVO', ingresos: 9500, costos: 4800, margen: 4700, porcentajeMargen: 49.5 },
    { id: '2', nombre: 'Quinua', tipo: 'CULTIVO', ingresos: 5200, costos: 3200, margen: 2000, porcentajeMargen: 38.5 },
    { id: '3', nombre: 'Haba', tipo: 'CULTIVO', ingresos: 4800, costos: 2900, margen: 1900, porcentajeMargen: 39.6 },
  ]);

  const [centrosPorActividad] = useState<CentroCosto[]>([
    { id: '1', nombre: 'Siembra', tipo: 'ACTIVIDAD', ingresos: 0, costos: 3200, margen: -3200, porcentajeMargen: 0 },
    { id: '2', nombre: 'Mantenimiento', tipo: 'ACTIVIDAD', ingresos: 0, costos: 2800, margen: -2800, porcentajeMargen: 0 },
    { id: '3', nombre: 'Cosecha', tipo: 'ACTIVIDAD', ingresos: 0, costos: 2100, margen: -2100, porcentajeMargen: 0 },
    { id: '4', nombre: 'Comercialización', tipo: 'ACTIVIDAD', ingresos: 19500, costos: 2800, margen: 16700, porcentajeMargen: 85.6 },
  ]);

  const [detallesCostos] = useState<DetalleCosto[]>([
    { categoria: 'Mano de Obra', monto: 3500, porcentaje: 32.1 },
    { categoria: 'Insumos (Semillas)', monto: 2200, porcentaje: 20.2 },
    { categoria: 'Fertilizantes', monto: 1800, porcentaje: 16.5 },
    { categoria: 'Transporte', monto: 1200, porcentaje: 11.0 },
    { categoria: 'Riego', monto: 900, porcentaje: 8.3 },
    { categoria: 'Pesticidas', monto: 700, porcentaje: 6.4 },
    { categoria: 'Otros', monto: 600, porcentaje: 5.5 },
  ]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const getCentrosActivos = () => {
    switch (vistaActiva) {
      case 'parcela':
        return centrosPorParcela;
      case 'cultivo':
        return centrosPorCultivo;
      case 'actividad':
        return centrosPorActividad;
    }
  };

  const chartComparativo = {
    labels: getCentrosActivos().map(c => c.nombre),
    datasets: [
      {
        label: 'Ingresos',
        data: getCentrosActivos().map(c => c.ingresos),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
      },
      {
        label: 'Costos',
        data: getCentrosActivos().map(c => c.costos),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
      },
      {
        label: 'Margen',
        data: getCentrosActivos().map(c => c.margen),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      },
    ],
  };

  const chartDesgloseCostos = {
    labels: detallesCostos.map(d => d.categoria),
    datasets: [
      {
        data: detallesCostos.map(d => d.monto),
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#EC4899',
          '#6B7280',
        ],
      },
    ],
  };

  const totalIngresos = getCentrosActivos().reduce((sum, c) => sum + c.ingresos, 0);
  const totalCostos = getCentrosActivos().reduce((sum, c) => sum + c.costos, 0);
  const totalMargen = totalIngresos - totalCostos;
  const margenPromedio = totalIngresos > 0 ? ((totalMargen / totalIngresos) * 100).toFixed(1) : 0;

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
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/finanzas" className="flex items-center gap-2 text-gray-600 hover:text-primary-600">
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Volver a Finanzas</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
          <CalculatorIcon className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Centro de Costos</h1>
          <p className="text-gray-500">Análisis de rentabilidad por parcela, cultivo y actividad</p>
        </div>
      </div>

      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Ingresos</p>
          <p className="text-2xl font-bold text-green-600">Bs. {totalIngresos.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Costos</p>
          <p className="text-2xl font-bold text-red-600">Bs. {totalCostos.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Margen Total</p>
          <p className={`text-2xl font-bold ${totalMargen >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            Bs. {totalMargen.toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Margen Promedio</p>
          <p className="text-2xl font-bold text-purple-600">{margenPromedio}%</p>
        </div>
      </div>

      {/* Selector de Vista */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setVistaActiva('parcela')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            vistaActiva === 'parcela'
              ? 'bg-white text-primary-600 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Por Parcela
        </button>
        <button
          onClick={() => setVistaActiva('cultivo')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            vistaActiva === 'cultivo'
              ? 'bg-white text-primary-600 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Por Cultivo
        </button>
        <button
          onClick={() => setVistaActiva('actividad')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            vistaActiva === 'actividad'
              ? 'bg-white text-primary-600 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Por Actividad
        </button>
      </div>

      {/* Gráfico Comparativo */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Comparativo de Rentabilidad - {vistaActiva === 'parcela' ? 'Por Parcela' : vistaActiva === 'cultivo' ? 'Por Cultivo' : 'Por Actividad'}
        </h3>
        <div className="h-72">
          <Bar
            data={chartComparativo}
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

      {/* Tabla de Centros de Costo */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalle por Centro de Costo</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 font-semibold text-gray-700">Centro de Costo</th>
                <th className="text-right py-3 font-semibold text-gray-700">Ingresos</th>
                <th className="text-right py-3 font-semibold text-gray-700">Costos</th>
                <th className="text-right py-3 font-semibold text-gray-700">Margen</th>
                <th className="text-right py-3 font-semibold text-gray-700">% Margen</th>
                <th className="text-center py-3 font-semibold text-gray-700">Tendencia</th>
              </tr>
            </thead>
            <tbody>
              {getCentrosActivos().map((centro) => (
                <tr key={centro.id} className="border-b hover:bg-gray-50">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-5 h-5 text-gray-400" />
                      <span className="font-medium">{centro.nombre}</span>
                    </div>
                  </td>
                  <td className="py-3 text-right text-green-600">
                    Bs. {centro.ingresos.toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-red-600">
                    Bs. {centro.costos.toLocaleString()}
                  </td>
                  <td className={`py-3 text-right font-bold ${centro.margen >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    Bs. {centro.margen.toLocaleString()}
                  </td>
                  <td className="py-3 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      centro.porcentajeMargen >= 40 ? 'bg-green-100 text-green-800' :
                      centro.porcentajeMargen >= 20 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {centro.porcentajeMargen}%
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    {centro.margen >= 0 ? (
                      <ArrowTrendingUpIcon className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-5 h-5 text-red-500 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-bold">
                <td className="py-3">TOTAL</td>
                <td className="py-3 text-right text-green-600">Bs. {totalIngresos.toLocaleString()}</td>
                <td className="py-3 text-right text-red-600">Bs. {totalCostos.toLocaleString()}</td>
                <td className={`py-3 text-right ${totalMargen >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  Bs. {totalMargen.toLocaleString()}
                </td>
                <td className="py-3 text-right">{margenPromedio}%</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Desglose de Costos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estructura de Costos</h3>
          <div className="h-64">
            <Doughnut
              data={chartDesgloseCostos}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                },
              }}
            />
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalle de Costos</h3>
          <div className="space-y-3">
            {detallesCostos.map((detalle) => (
              <div key={detalle.categoria} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-gray-700">{detalle.categoria}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${detalle.porcentaje}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 w-12 text-right">{detalle.porcentaje}%</span>
                  <span className="font-medium w-24 text-right">Bs. {detalle.monto.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Indicadores Clave */}
      <div className="card bg-gradient-to-r from-indigo-50 to-purple-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Análisis de Eficiencia</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-500">Costo por Hectárea</p>
            <p className="text-xl font-bold text-gray-900">Bs. 2,180</p>
            <p className="text-xs text-green-600">↓ 5% vs mes anterior</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-500">Ingreso por Hectárea</p>
            <p className="text-xl font-bold text-gray-900">Bs. 3,900</p>
            <p className="text-xs text-green-600">↑ 8% vs mes anterior</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-500">ROI General</p>
            <p className="text-xl font-bold text-gray-900">79%</p>
            <p className="text-xs text-green-600">Excelente rendimiento</p>
          </div>
        </div>
      </div>
    </div>
  );
}
