import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import {
  ArrowLeftIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface MovimientoCaja {
  fecha: string;
  concepto: string;
  tipo: 'ENTRADA' | 'SALIDA';
  categoria: string;
  monto: number;
  saldoAcumulado: number;
}

export default function FlujoCaja() {
  const [periodo, setPeriodo] = useState<'semanal' | 'mensual' | 'anual'>('mensual');
  const [loading, setLoading] = useState(true);

  // Datos del flujo de caja
  const [datosMensuales] = useState({
    saldoInicial: 5000,
    entradas: {
      ventasContado: 8500,
      cobrosCuentasPorCobrar: 2800,
      subsidiosRecibidos: 500,
      prestamosRecibidos: 0,
      otrasEntradas: 200,
    },
    salidas: {
      compraSemillas: 1200,
      compraFertilizantes: 2100,
      pagoManoObra: 2500,
      pagoServicios: 600,
      pagoProveedores: 1800,
      pagoImpuestos: 400,
      pagoPrestamos: 800,
      otrassSalidas: 350,
    },
  });

  const [proyeccion] = useState([
    { mes: 'Feb', entradas: 11000, salidas: 8500, saldo: 7500 },
    { mes: 'Mar', entradas: 15000, salidas: 9000, saldo: 13500 },
    { mes: 'Abr', entradas: 8000, salidas: 7500, saldo: 14000 },
    { mes: 'May', entradas: 6000, salidas: 8000, saldo: 12000 },
    { mes: 'Jun', entradas: 12000, salidas: 7000, saldo: 17000 },
  ]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const totalEntradas = Object.values(datosMensuales.entradas).reduce((a, b) => a + b, 0);
  const totalSalidas = Object.values(datosMensuales.salidas).reduce((a, b) => a + b, 0);
  const flujoNeto = totalEntradas - totalSalidas;
  const saldoFinal = datosMensuales.saldoInicial + flujoNeto;

  // Movimientos detallados
  const movimientos: MovimientoCaja[] = [
    { fecha: '2026-01-28', concepto: 'Venta de Papa - Mercado Central', tipo: 'ENTRADA', categoria: 'Ventas', monto: 3500, saldoAcumulado: 8500 },
    { fecha: '2026-01-27', concepto: 'Pago jornaleros - Cosecha', tipo: 'SALIDA', categoria: 'Mano de Obra', monto: 800, saldoAcumulado: 5000 },
    { fecha: '2026-01-25', concepto: 'Venta de Haba - Sr. Quispe', tipo: 'ENTRADA', categoria: 'Ventas', monto: 1800, saldoAcumulado: 5800 },
    { fecha: '2026-01-24', concepto: 'Compra fertilizante orgánico', tipo: 'SALIDA', categoria: 'Insumos', monto: 650, saldoAcumulado: 4000 },
    { fecha: '2026-01-22', concepto: 'Cobro cuenta Sr. Mamani', tipo: 'ENTRADA', categoria: 'Cobranzas', monto: 1200, saldoAcumulado: 4650 },
    { fecha: '2026-01-20', concepto: 'Pago transporte cosecha', tipo: 'SALIDA', categoria: 'Transporte', monto: 350, saldoAcumulado: 3450 },
    { fecha: '2026-01-18', concepto: 'Venta quinua - Exportadora', tipo: 'ENTRADA', categoria: 'Ventas', monto: 2500, saldoAcumulado: 3800 },
    { fecha: '2026-01-15', concepto: 'Pago cuota préstamo agrícola', tipo: 'SALIDA', categoria: 'Préstamos', monto: 800, saldoAcumulado: 1300 },
  ];

  const chartFlujoMensual = {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    datasets: [
      {
        label: 'Entradas',
        data: [2800, 3200, 2500, 3500],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderRadius: 8,
      },
      {
        label: 'Salidas',
        data: [2100, 2800, 2200, 2650],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderRadius: 8,
      },
    ],
  };

  const chartProyeccion = {
    labels: proyeccion.map(p => p.mes),
    datasets: [
      {
        label: 'Saldo Proyectado',
        data: proyeccion.map(p => p.saldo),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Entradas',
        data: proyeccion.map(p => p.entradas),
        borderColor: '#22c55e',
        borderDash: [5, 5],
        tension: 0.4,
      },
      {
        label: 'Salidas',
        data: proyeccion.map(p => p.salidas),
        borderColor: '#ef4444',
        borderDash: [5, 5],
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
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/finanzas" className="flex items-center gap-2 text-gray-600 hover:text-primary-600">
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Volver a Finanzas</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <BanknotesIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Flujo de Caja</h1>
            <p className="text-gray-500">Control de entradas y salidas de efectivo</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['semanal', 'mensual', 'anual'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                periodo === p
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Resumen de Caja */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card bg-gradient-to-br from-gray-600 to-gray-700 text-white">
          <p className="text-sm opacity-90">Saldo Inicial</p>
          <p className="text-2xl font-bold">Bs. {datosMensuales.saldoInicial.toLocaleString()}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-sm opacity-90">Total Entradas</p>
          <p className="text-2xl font-bold">Bs. {totalEntradas.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowTrendingUpIcon className="w-4 h-4" />
            <span className="text-sm">+15% vs anterior</span>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <p className="text-sm opacity-90">Total Salidas</p>
          <p className="text-2xl font-bold">Bs. {totalSalidas.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowTrendingDownIcon className="w-4 h-4" />
            <span className="text-sm">-8% vs anterior</span>
          </div>
        </div>
        <div className={`card bg-gradient-to-br ${flujoNeto >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} text-white`}>
          <p className="text-sm opacity-90">Flujo Neto</p>
          <p className="text-2xl font-bold">Bs. {flujoNeto.toLocaleString()}</p>
          <span className={`text-sm ${flujoNeto >= 0 ? 'text-green-200' : 'text-red-200'}`}>
            {flujoNeto >= 0 ? 'Positivo ✓' : 'Negativo ⚠'}
          </span>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-sm opacity-90">Saldo Final</p>
          <p className="text-2xl font-bold">Bs. {saldoFinal.toLocaleString()}</p>
        </div>
      </div>

      {/* Alerta de Liquidez */}
      {saldoFinal < 3000 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg flex items-start gap-3">
          <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-yellow-800">Alerta de Liquidez</h3>
            <p className="text-yellow-700 text-sm">
              Tu saldo proyectado está por debajo del mínimo recomendado de Bs. 3,000. 
              Considera acelerar cobranzas o diferir gastos no urgentes.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detalle de Entradas y Salidas */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
            Detalle de Entradas
          </h2>
          <div className="space-y-3">
            {Object.entries(datosMensuales.entradas).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
                <span className="font-semibold text-green-700">Bs. {value.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg font-bold">
              <span className="text-green-800">TOTAL ENTRADAS</span>
              <span className="text-green-800">Bs. {totalEntradas.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />
            Detalle de Salidas
          </h2>
          <div className="space-y-3">
            {Object.entries(datosMensuales.salidas).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-gray-700">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
                <span className="font-semibold text-red-700">Bs. {value.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex items-center justify-between p-3 bg-red-100 rounded-lg font-bold">
              <span className="text-red-800">TOTAL SALIDAS</span>
              <span className="text-red-800">Bs. {totalSalidas.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Flujo Semanal</h2>
          <Bar
            data={chartFlujoMensual}
            options={{
              responsive: true,
              plugins: { legend: { position: 'bottom' } },
              scales: { y: { beginAtZero: true } },
            }}
          />
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📈 Proyección 5 Meses</h2>
          <Line
            data={chartProyeccion}
            options={{
              responsive: true,
              plugins: { legend: { position: 'bottom' } },
              scales: { y: { beginAtZero: true } },
            }}
          />
        </div>
      </div>

      {/* Movimientos Recientes */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
            Movimientos Recientes
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 font-semibold text-gray-700">Fecha</th>
                <th className="text-left py-3 font-semibold text-gray-700">Concepto</th>
                <th className="text-left py-3 font-semibold text-gray-700">Categoría</th>
                <th className="text-right py-3 font-semibold text-gray-700">Monto</th>
                <th className="text-right py-3 font-semibold text-gray-700">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((mov, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="py-3 text-gray-600">
                    {new Date(mov.fecha).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })}
                  </td>
                  <td className="py-3">{mov.concepto}</td>
                  <td className="py-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                      {mov.categoria}
                    </span>
                  </td>
                  <td className={`py-3 text-right font-semibold ${mov.tipo === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}`}>
                    {mov.tipo === 'ENTRADA' ? '+' : '-'} Bs. {mov.monto.toLocaleString()}
                  </td>
                  <td className="py-3 text-right font-medium">
                    Bs. {mov.saldoAcumulado.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
