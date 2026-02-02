import { useState, useEffect } from 'react';
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
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  ArrowLeftIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ScaleIcon,
  BeakerIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  CalendarIcon,
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

interface CultivoRentabilidad {
  id: string;
  nombre: string;
  variedad: string;
  parcela: string;
  temporada: string;
  areaCultivada: number;
  inversion: {
    semillas: number;
    fertilizantes: number;
    pesticidas: number;
    manoObra: number;
    riego: number;
    otros: number;
  };
  produccion: {
    rendimientoKg: number;
    rendimientoEsperadoKg: number;
    precioVentaKg: number;
    totalVentas: number;
    merma: number;
  };
  rentabilidad: {
    costoTotal: number;
    ingresoTotal: number;
    utilidadNeta: number;
    margenUtilidad: number;
    roi: number;
    costoKg: number;
  };
  historico: {
    temporada: string;
    utilidad: number;
    rendimiento: number;
  }[];
}

export default function AnalisisRentabilidad() {
  const [cultivos, setCultivos] = useState<CultivoRentabilidad[]>([]);
  const [cultivoSeleccionado, setCultivoSeleccionado] = useState<CultivoRentabilidad | null>(null);
  const [periodoComparacion, setPeriodoComparacion] = useState<'temporada' | 'anual'>('temporada');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Datos de ejemplo
    const datosEjemplo: CultivoRentabilidad[] = [
      {
        id: '1',
        nombre: 'Papa',
        variedad: 'Huaycha',
        parcela: 'Parcela Norte',
        temporada: '2025-2026',
        areaCultivada: 0.8,
        inversion: {
          semillas: 800,
          fertilizantes: 450,
          pesticidas: 200,
          manoObra: 1200,
          riego: 300,
          otros: 150,
        },
        produccion: {
          rendimientoKg: 4800,
          rendimientoEsperadoKg: 5000,
          precioVentaKg: 1.5,
          totalVentas: 7200,
          merma: 4,
        },
        rentabilidad: {
          costoTotal: 3100,
          ingresoTotal: 7200,
          utilidadNeta: 4100,
          margenUtilidad: 56.9,
          roi: 132.3,
          costoKg: 0.65,
        },
        historico: [
          { temporada: '2023-2024', utilidad: 3200, rendimiento: 4200 },
          { temporada: '2024-2025', utilidad: 3800, rendimiento: 4600 },
          { temporada: '2025-2026', utilidad: 4100, rendimiento: 4800 },
        ],
      },
      {
        id: '2',
        nombre: 'Haba',
        variedad: 'Criolla',
        parcela: 'Parcela Sur',
        temporada: '2025-2026',
        areaCultivada: 0.5,
        inversion: {
          semillas: 300,
          fertilizantes: 200,
          pesticidas: 100,
          manoObra: 600,
          riego: 150,
          otros: 50,
        },
        produccion: {
          rendimientoKg: 800,
          rendimientoEsperadoKg: 900,
          precioVentaKg: 4.0,
          totalVentas: 3200,
          merma: 11,
        },
        rentabilidad: {
          costoTotal: 1400,
          ingresoTotal: 3200,
          utilidadNeta: 1800,
          margenUtilidad: 56.3,
          roi: 128.6,
          costoKg: 1.75,
        },
        historico: [
          { temporada: '2023-2024', utilidad: 1400, rendimiento: 700 },
          { temporada: '2024-2025', utilidad: 1600, rendimiento: 750 },
          { temporada: '2025-2026', utilidad: 1800, rendimiento: 800 },
        ],
      },
      {
        id: '3',
        nombre: 'Quinua',
        variedad: 'Real Blanca',
        parcela: 'Parcela Este',
        temporada: '2025-2026',
        areaCultivada: 1.0,
        inversion: {
          semillas: 400,
          fertilizantes: 300,
          pesticidas: 150,
          manoObra: 1500,
          riego: 200,
          otros: 100,
        },
        produccion: {
          rendimientoKg: 600,
          rendimientoEsperadoKg: 700,
          precioVentaKg: 12.0,
          totalVentas: 7200,
          merma: 14,
        },
        rentabilidad: {
          costoTotal: 2650,
          ingresoTotal: 7200,
          utilidadNeta: 4550,
          margenUtilidad: 63.2,
          roi: 171.7,
          costoKg: 4.42,
        },
        historico: [
          { temporada: '2023-2024', utilidad: 3800, rendimiento: 520 },
          { temporada: '2024-2025', utilidad: 4200, rendimiento: 560 },
          { temporada: '2025-2026', utilidad: 4550, rendimiento: 600 },
        ],
      },
      {
        id: '4',
        nombre: 'Maíz',
        variedad: 'Kulli',
        parcela: 'Parcela Oeste',
        temporada: '2025-2026',
        areaCultivada: 0.6,
        inversion: {
          semillas: 200,
          fertilizantes: 250,
          pesticidas: 100,
          manoObra: 800,
          riego: 250,
          otros: 80,
        },
        produccion: {
          rendimientoKg: 1200,
          rendimientoEsperadoKg: 1400,
          precioVentaKg: 2.5,
          totalVentas: 3000,
          merma: 14,
        },
        rentabilidad: {
          costoTotal: 1680,
          ingresoTotal: 3000,
          utilidadNeta: 1320,
          margenUtilidad: 44.0,
          roi: 78.6,
          costoKg: 1.40,
        },
        historico: [
          { temporada: '2023-2024', utilidad: 1000, rendimiento: 1000 },
          { temporada: '2024-2025', utilidad: 1150, rendimiento: 1100 },
          { temporada: '2025-2026', utilidad: 1320, rendimiento: 1200 },
        ],
      },
    ];
    setCultivos(datosEjemplo);
    setCultivoSeleccionado(datosEjemplo[0]);
    setLoading(false);
  }, []);

  // Calcular totales
  const totales = cultivos.reduce(
    (acc, c) => ({
      inversion: acc.inversion + c.rentabilidad.costoTotal,
      ingresos: acc.ingresos + c.rentabilidad.ingresoTotal,
      utilidad: acc.utilidad + c.rentabilidad.utilidadNeta,
    }),
    { inversion: 0, ingresos: 0, utilidad: 0 }
  );

  // Datos para gráficos
  const rentabilidadPorCultivo = {
    labels: cultivos.map((c) => c.nombre),
    datasets: [
      {
        label: 'Inversión',
        data: cultivos.map((c) => c.rentabilidad.costoTotal),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderRadius: 8,
      },
      {
        label: 'Ingresos',
        data: cultivos.map((c) => c.rentabilidad.ingresoTotal),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderRadius: 8,
      },
    ],
  };

  const distribucionCostos = cultivoSeleccionado ? {
    labels: ['Semillas', 'Fertilizantes', 'Pesticidas', 'Mano de Obra', 'Riego', 'Otros'],
    datasets: [
      {
        data: [
          cultivoSeleccionado.inversion.semillas,
          cultivoSeleccionado.inversion.fertilizantes,
          cultivoSeleccionado.inversion.pesticidas,
          cultivoSeleccionado.inversion.manoObra,
          cultivoSeleccionado.inversion.riego,
          cultivoSeleccionado.inversion.otros,
        ],
        backgroundColor: [
          '#22c55e',
          '#f59e0b',
          '#8b5cf6',
          '#3b82f6',
          '#06b6d4',
          '#6b7280',
        ],
        borderWidth: 0,
      },
    ],
  } : null;

  const evolucionHistorica = cultivoSeleccionado ? {
    labels: cultivoSeleccionado.historico.map((h) => h.temporada),
    datasets: [
      {
        label: 'Utilidad (Bs)',
        data: cultivoSeleccionado.historico.map((h) => h.utilidad),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Rendimiento (kg)',
        data: cultivoSeleccionado.historico.map((h) => h.rendimiento),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  } : null;

  // Ranking de cultivos por ROI
  const cultivosRanking = [...cultivos].sort((a, b) => b.rentabilidad.roi - a.rentabilidad.roi);

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
            to="/finanzas"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ChartBarIcon className="w-7 h-7 text-primary-600" />
              Análisis de Rentabilidad
            </h1>
            <p className="text-gray-500">Compara el rendimiento financiero de tus cultivos</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="input w-auto bg-white"
            value={periodoComparacion}
            onChange={(e) => setPeriodoComparacion(e.target.value as 'temporada' | 'anual')}
          >
            <option value="temporada">Esta Temporada</option>
            <option value="anual">Año Completo</option>
          </select>
        </div>
      </div>

      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Inversión Total</p>
              <p className="text-2xl font-bold">Bs. {totales.inversion.toLocaleString()}</p>
            </div>
            <CurrencyDollarIcon className="w-10 h-10 opacity-50" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Ingresos Totales</p>
              <p className="text-2xl font-bold">Bs. {totales.ingresos.toLocaleString()}</p>
            </div>
            <ArrowTrendingUpIcon className="w-10 h-10 opacity-50" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Utilidad Neta</p>
              <p className="text-2xl font-bold">Bs. {totales.utilidad.toLocaleString()}</p>
            </div>
            <ScaleIcon className="w-10 h-10 opacity-50" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">ROI Promedio</p>
              <p className="text-2xl font-bold">
                {(cultivos.reduce((acc, c) => acc + c.rentabilidad.roi, 0) / cultivos.length).toFixed(1)}%
              </p>
            </div>
            <ChartBarIcon className="w-10 h-10 opacity-50" />
          </div>
        </div>
      </div>

      {/* Ranking y Gráfico comparativo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ranking */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrophyIcon className="w-5 h-5 text-yellow-500" />
            Ranking por Rentabilidad (ROI)
          </h3>
          <div className="space-y-3">
            {cultivosRanking.map((cultivo, index) => (
              <div
                key={cultivo.id}
                onClick={() => setCultivoSeleccionado(cultivo)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                  cultivoSeleccionado?.id === cultivo.id
                    ? 'bg-primary-100 border-2 border-primary-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                  index === 0 ? 'bg-yellow-500' :
                  index === 1 ? 'bg-gray-400' :
                  index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{cultivo.nombre}</p>
                  <p className="text-xs text-gray-500">{cultivo.parcela}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${cultivo.rentabilidad.roi > 100 ? 'text-green-600' : 'text-gray-700'}`}>
                    {cultivo.rentabilidad.roi.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">ROI</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico comparativo */}
        <div className="lg:col-span-2 card">
          <h3 className="font-semibold text-gray-900 mb-4">Inversión vs Ingresos por Cultivo</h3>
          <div className="h-64">
            <Bar
              data={rentabilidadPorCultivo}
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
      </div>

      {/* Detalle del cultivo seleccionado */}
      {cultivoSeleccionado && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Info del cultivo */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-2xl">
                  🌱
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {cultivoSeleccionado.nombre} ({cultivoSeleccionado.variedad})
                  </h3>
                  <p className="text-sm text-gray-500">
                    {cultivoSeleccionado.parcela} • {cultivoSeleccionado.areaCultivada} ha
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                {cultivoSeleccionado.temporada}
              </span>
            </div>

            {/* Métricas principales */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Costo por kg</p>
                <p className="text-xl font-bold text-gray-900">
                  Bs. {cultivoSeleccionado.rentabilidad.costoKg.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Precio venta por kg</p>
                <p className="text-xl font-bold text-green-600">
                  Bs. {cultivoSeleccionado.produccion.precioVentaKg.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Rendimiento</p>
                <p className="text-xl font-bold text-gray-900">
                  {cultivoSeleccionado.produccion.rendimientoKg.toLocaleString()} kg
                </p>
                <p className="text-xs text-gray-400">
                  de {cultivoSeleccionado.produccion.rendimientoEsperadoKg.toLocaleString()} kg esperados
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Margen de utilidad</p>
                <p className={`text-xl font-bold ${
                  cultivoSeleccionado.rentabilidad.margenUtilidad > 50 ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {cultivoSeleccionado.rentabilidad.margenUtilidad.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Progreso de rendimiento */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Cumplimiento de meta</span>
                <span className="font-medium">
                  {((cultivoSeleccionado.produccion.rendimientoKg / cultivoSeleccionado.produccion.rendimientoEsperadoKg) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    cultivoSeleccionado.produccion.rendimientoKg >= cultivoSeleccionado.produccion.rendimientoEsperadoKg
                      ? 'bg-gradient-to-r from-green-400 to-green-600'
                      : 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                  }`}
                  style={{
                    width: `${Math.min(100, (cultivoSeleccionado.produccion.rendimientoKg / cultivoSeleccionado.produccion.rendimientoEsperadoKg) * 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Merma */}
            {cultivoSeleccionado.produccion.merma > 10 && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Merma del {cultivoSeleccionado.produccion.merma}% - Considera mejorar almacenamiento
                </p>
              </div>
            )}
          </div>

          {/* Distribución de costos */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BeakerIcon className="w-5 h-5 text-purple-600" />
              Distribución de Costos
            </h3>
            {distribucionCostos && (
              <div className="h-64 flex items-center justify-center">
                <Doughnut
                  data={distribucionCostos}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                    },
                    cutout: '50%',
                  }}
                />
              </div>
            )}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {Object.entries(cultivoSeleccionado.inversion).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                  <span className="font-medium">Bs. {value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Evolución histórica */}
      {cultivoSeleccionado && evolucionHistorica && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            Evolución Histórica - {cultivoSeleccionado.nombre}
          </h3>
          <div className="h-64">
            <Line
              data={evolucionHistorica}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  mode: 'index',
                  intersect: false,
                },
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
                scales: {
                  y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                      display: true,
                      text: 'Utilidad (Bs)',
                    },
                  },
                  y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                      display: true,
                      text: 'Rendimiento (kg)',
                    },
                    grid: {
                      drawOnChartArea: false,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      <div className="card bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
        <h3 className="font-semibold text-amber-900 mb-4 flex items-center gap-2">
          <LightBulbIcon className="w-5 h-5 text-amber-600" />
          Recomendaciones para Mejorar Rentabilidad
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cultivosRanking[cultivosRanking.length - 1] && (
            <div className="p-4 bg-white rounded-lg">
              <p className="font-medium text-gray-900 mb-2">📉 Cultivo menos rentable</p>
              <p className="text-sm text-gray-600">
                <strong>{cultivosRanking[cultivosRanking.length - 1].nombre}</strong> tiene el ROI más bajo ({cultivosRanking[cultivosRanking.length - 1].rentabilidad.roi.toFixed(1)}%).
                Considera reducir costos de mano de obra o mejorar el precio de venta.
              </p>
            </div>
          )}
          {cultivosRanking[0] && (
            <div className="p-4 bg-white rounded-lg">
              <p className="font-medium text-gray-900 mb-2">📈 Mayor potencial</p>
              <p className="text-sm text-gray-600">
                <strong>{cultivosRanking[0].nombre}</strong> es tu cultivo más rentable.
                Considera aumentar el área de cultivo para la próxima temporada.
              </p>
            </div>
          )}
          <div className="p-4 bg-white rounded-lg">
            <p className="font-medium text-gray-900 mb-2">💡 Reducción de costos</p>
            <p className="text-sm text-gray-600">
              La mano de obra representa el mayor costo. Evalúa automatización de riego
              o asociación con otros agricultores para compartir recursos.
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <p className="font-medium text-gray-900 mb-2">🎯 Mejora de precios</p>
            <p className="text-sm text-gray-600">
              Considera venta directa en ferias o mercados locales para mejorar
              el precio de venta y eliminar intermediarios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
