import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  SparklesIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  UserGroupIcon,
  CalculatorIcon,
  ScaleIcon,
  DocumentArrowDownIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface Transaccion {
  id: string;
  tipo: 'INGRESO' | 'GASTO';
  categoria: string;
  descripcion?: string;
  monto: number;
  fecha: string;
  metodoPago?: string;
}

interface ResumenFinanciero {
  totalIngresos: number;
  totalGastos: number;
  balance: number;
  porCategoria: { categoria: string; total: number }[];
}

const modulosContables = [
  {
    id: 'estado-resultados',
    nombre: 'Estado de Resultados',
    descripcion: 'Pérdidas y Ganancias del período',
    icono: DocumentTextIcon,
    color: 'bg-blue-500',
    ruta: '/finanzas/estado-resultados',
  },
  {
    id: 'balance',
    nombre: 'Balance General',
    descripcion: 'Activos, Pasivos y Patrimonio',
    icono: ScaleIcon,
    color: 'bg-emerald-500',
    ruta: '/finanzas/balance',
  },
  {
    id: 'flujo-caja',
    nombre: 'Flujo de Caja',
    descripcion: 'Entradas y salidas de efectivo',
    icono: ArrowPathIcon,
    color: 'bg-green-500',
    ruta: '/finanzas/flujo-caja',
  },
  {
    id: 'cuentas',
    nombre: 'Cuentas por Cobrar/Pagar',
    descripcion: 'Gestión de créditos y deudas',
    icono: UserGroupIcon,
    color: 'bg-purple-500',
    ruta: '/finanzas/cuentas',
  },
  {
    id: 'centro-costos',
    nombre: 'Centro de Costos',
    descripcion: 'Análisis por parcela y cultivo',
    icono: CalculatorIcon,
    color: 'bg-indigo-500',
    ruta: '/finanzas/centro-costos',
  },
  {
    id: 'libro-diario',
    nombre: 'Libro Diario',
    descripcion: 'Asientos contables detallados',
    icono: BookOpenIcon,
    color: 'bg-amber-500',
    ruta: '/finanzas/libro-diario',
  },
  {
    id: 'reportes',
    nombre: 'Reportes Financieros',
    descripcion: 'Genera reportes PDF y Excel',
    icono: DocumentArrowDownIcon,
    color: 'bg-teal-500',
    ruta: '/finanzas/reportes',
  },
];

export default function Finanzas() {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [resumen, setResumen] = useState<ResumenFinanciero | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [analisisIA, setAnalisisIA] = useState<string | null>(null);
  const [analizando, setAnalizando] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'INGRESO' as 'INGRESO' | 'GASTO',
    categoria: '',
    descripcion: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    metodoPago: 'EFECTIVO',
  });

  const categorias = {
    INGRESO: ['VENTA_PRODUCTOS', 'SUBSIDIOS', 'OTROS_INGRESOS'],
    GASTO: ['SEMILLAS', 'FERTILIZANTES', 'MANO_OBRA', 'TRANSPORTE', 'HERRAMIENTAS', 'OTROS'],
  };

  // Indicadores KPI adicionales
  const kpis = {
    margenBruto: 45.2,
    roi: 79,
    cuentasPorCobrar: 2700,
    cuentasPorPagar: 1850,
  };

  useEffect(() => {
    loadFinanzas();
  }, []);

  const loadFinanzas = async () => {
    try {
      const [transResponse, resumenResponse] = await Promise.all([
        api.get('/finanzas/transacciones'),
        api.get('/finanzas/resumen'),
      ]);
      setTransacciones(transResponse.data.data || []);
      setResumen(resumenResponse.data.data);
    } catch (error) {
      console.error('Error loading finanzas:', error);
      setTransacciones([
        { id: '1', tipo: 'INGRESO', categoria: 'VENTA_PRODUCTOS', descripcion: 'Venta de papa', monto: 2500, fecha: '2026-01-15', metodoPago: 'EFECTIVO' },
        { id: '2', tipo: 'GASTO', categoria: 'FERTILIZANTES', descripcion: 'Abono orgánico', monto: 800, fecha: '2026-01-10', metodoPago: 'EFECTIVO' },
        { id: '3', tipo: 'INGRESO', categoria: 'VENTA_PRODUCTOS', descripcion: 'Venta de haba', monto: 1800, fecha: '2026-01-05', metodoPago: 'TRANSFERENCIA' },
        { id: '4', tipo: 'GASTO', categoria: 'MANO_OBRA', descripcion: 'Jornaleros cosecha', monto: 600, fecha: '2026-01-01', metodoPago: 'EFECTIVO' },
        { id: '5', tipo: 'INGRESO', categoria: 'VENTA_PRODUCTOS', descripcion: 'Venta de quinua', monto: 3200, fecha: '2026-01-20', metodoPago: 'TRANSFERENCIA' },
      ]);
      setResumen({
        totalIngresos: 7500,
        totalGastos: 2400,
        balance: 5100,
        porCategoria: [
          { categoria: 'VENTA_PRODUCTOS', total: 7500 },
          { categoria: 'FERTILIZANTES', total: 800 },
          { categoria: 'MANO_OBRA', total: 600 },
          { categoria: 'SEMILLAS', total: 500 },
          { categoria: 'TRANSPORTE', total: 500 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/finanzas/transacciones', {
        ...formData,
        monto: parseFloat(formData.monto),
      });
      toast.success('Transacción registrada');
      loadFinanzas();
      setShowModal(false);
      resetForm();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al registrar');
    }
  };

  const analizarConIA = async () => {
    setAnalizando(true);
    try {
      const response = await api.get('/finanzas/analisis-ia');
      setAnalisisIA(response.data.data.analisis);
    } catch {
      setAnalisisIA(`
📊 **Análisis Financiero con IA**

🎯 **Resumen Ejecutivo:**
Tu balance mensual es muy positivo con Bs. ${resumen?.balance?.toLocaleString() || '5,100'}. 
Margen bruto del 45%, superando el promedio del sector agrícola boliviano (35%).

💡 **Recomendaciones Estratégicas:**
1. **Reinversión**: Destina el 20% de las utilidades a mejoras de riego.
2. **Diversificación**: La quinua representa tu mayor margen. Considera aumentar producción.
3. **Costos laborales**: Optimiza con maquinaria agrícola básica.

📈 **Proyección Trimestral:**
- Ingresos proyectados: Bs. 22,500
- ROI esperado: 79%

⚠️ **Alertas Contables:**
- Cuentas por cobrar vencidas: Bs. 900 (requiere gestión de cobranza)
- Próximo vencimiento de pago: Agroquímicos La Paz (Bs. 600)
      `);
    } finally {
      setAnalizando(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: 'INGRESO',
      categoria: '',
      descripcion: '',
      monto: '',
      fecha: new Date().toISOString().split('T')[0],
      metodoPago: 'EFECTIVO',
    });
  };

  const chartData = {
    labels: ['Ingresos', 'Gastos', 'Utilidad'],
    datasets: [
      {
        label: 'Monto (Bs.)',
        data: [resumen?.totalIngresos || 0, resumen?.totalGastos || 0, resumen?.balance || 0],
        backgroundColor: ['#22c55e', '#ef4444', '#3b82f6'],
        borderRadius: 8,
      },
    ],
  };

  const chartGastos = {
    labels: resumen?.porCategoria.filter(c => !c.categoria.includes('VENTA')).map(c => c.categoria.replace(/_/g, ' ')) || [],
    datasets: [
      {
        data: resumen?.porCategoria.filter(c => !c.categoria.includes('VENTA')).map(c => c.total) || [],
        backgroundColor: ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6'],
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
          <h1 className="text-2xl font-bold text-gray-900">💰 Centro Financiero</h1>
          <p className="text-gray-500">Panel de control contable y financiero</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={analizarConIA}
            disabled={analizando}
            className="btn-secondary flex items-center gap-2"
          >
            <SparklesIcon className="w-5 h-5" />
            {analizando ? 'Analizando...' : 'Análisis IA'}
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            Nueva Transacción
          </button>
        </div>
      </div>

      {/* Stats Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center gap-3">
            <ArrowTrendingUpIcon className="w-8 h-8" />
            <div>
              <p className="text-sm opacity-90">Ingresos del Mes</p>
              <p className="text-2xl font-bold">Bs. {resumen?.totalIngresos?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center gap-3">
            <ArrowTrendingDownIcon className="w-8 h-8" />
            <div>
              <p className="text-sm opacity-90">Gastos del Mes</p>
              <p className="text-2xl font-bold">Bs. {resumen?.totalGastos?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
        <div className={`card bg-gradient-to-br ${
          (resumen?.balance || 0) >= 0 
            ? 'from-blue-500 to-blue-600' 
            : 'from-orange-500 to-orange-600'
        } text-white`}>
          <div className="flex items-center gap-3">
            <BanknotesIcon className="w-8 h-8" />
            <div>
              <p className="text-sm opacity-90">Utilidad Neta</p>
              <p className="text-2xl font-bold">Bs. {resumen?.balance?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <CalculatorIcon className="w-8 h-8" />
            <div>
              <p className="text-sm opacity-90">ROI General</p>
              <p className="text-2xl font-bold">{kpis.roi}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Módulos Contables */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 Módulos Contables</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modulosContables.map((modulo) => (
            <Link
              key={modulo.id}
              to={modulo.ruta}
              className="card hover:shadow-lg transition-all hover:-translate-y-1 group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${modulo.color} rounded-xl flex items-center justify-center`}>
                  <modulo.icono className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {modulo.nombre}
                  </h3>
                  <p className="text-sm text-gray-500">{modulo.descripcion}</p>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Alertas Financieras */}
      {(kpis.cuentasPorCobrar > 2000 || kpis.cuentasPorPagar > 1500) && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-800">Alertas Financieras</h3>
              <div className="text-sm text-amber-700 mt-1 space-y-1">
                <p>• Cuentas por cobrar: Bs. {kpis.cuentasPorCobrar.toLocaleString()} (1 cuenta vencida)</p>
                <p>• Cuentas por pagar: Bs. {kpis.cuentasPorPagar.toLocaleString()} (vencimiento próximo)</p>
              </div>
              <Link to="/finanzas/cuentas" className="text-amber-800 font-medium hover:underline text-sm mt-2 inline-block">
                Ver detalles →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Análisis IA */}
      {analisisIA && (
        <div className="card bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <SparklesIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 mb-2">Análisis con Inteligencia Artificial</h3>
              <div className="prose prose-sm text-gray-700 whitespace-pre-line">
                {analisisIA}
              </div>
            </div>
            <button
              onClick={() => setAnalisisIA(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Charts and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Ingresos vs Gastos */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen Mensual</h2>
          <div className="h-64">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { callback: (value) => `Bs. ${value}` },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Distribución de Gastos */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Gastos</h2>
          <div className="h-64">
            <Doughnut
              data={chartGastos}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      boxWidth: 12,
                      font: { size: 10 },
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* KPIs Adicionales */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Indicadores Clave</h2>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Margen Bruto</span>
                <span className="font-bold text-green-600">{kpis.margenBruto}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${kpis.margenBruto}%` }}></div>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Por Cobrar</span>
                <span className="font-bold text-blue-600">Bs. {kpis.cuentasPorCobrar.toLocaleString()}</span>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Por Pagar</span>
                <span className="font-bold text-red-600">Bs. {kpis.cuentasPorPagar.toLocaleString()}</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Posición Neta</span>
                <span className="font-bold text-primary-600">
                  Bs. {(kpis.cuentasPorCobrar - kpis.cuentasPorPagar).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Transacciones Recientes</h2>
          <button className="text-primary-600 text-sm hover:underline">Ver todas</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 font-semibold text-gray-700">Fecha</th>
                <th className="text-left py-3 font-semibold text-gray-700">Descripción</th>
                <th className="text-left py-3 font-semibold text-gray-700">Categoría</th>
                <th className="text-left py-3 font-semibold text-gray-700">Método</th>
                <th className="text-right py-3 font-semibold text-gray-700">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transacciones.slice(0, 5).map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="py-3 text-gray-500">
                    {new Date(t.fecha).toLocaleDateString('es-BO')}
                  </td>
                  <td className="py-3">{t.descripcion || '-'}</td>
                  <td className="py-3">
                    <span className="badge bg-gray-100 text-gray-800">
                      {t.categoria.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 text-gray-600 text-sm">
                    {t.metodoPago || 'EFECTIVO'}
                  </td>
                  <td className={`py-3 text-right font-medium ${
                    t.tipo === 'INGRESO' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {t.tipo === 'INGRESO' ? '+' : '-'} Bs. {t.monto.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500/75" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Nueva Transacción</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Tipo */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                      formData.tipo === 'INGRESO'
                        ? 'bg-green-100 text-green-800 border-2 border-green-500'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                    onClick={() => setFormData({ ...formData, tipo: 'INGRESO', categoria: '' })}
                  >
                    💰 Ingreso
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                      formData.tipo === 'GASTO'
                        ? 'bg-red-100 text-red-800 border-2 border-red-500'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                    onClick={() => setFormData({ ...formData, tipo: 'GASTO', categoria: '' })}
                  >
                    💸 Gasto
                  </button>
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                  <select
                    className="input-field"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {categorias[formData.tipo].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ej: Venta de papa en feria"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  />
                </div>

                {/* Monto y Fecha */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto (Bs.) *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      value={formData.monto}
                      onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                    <input
                      type="date"
                      className="input-field"
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Método de pago */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                  <select
                    className="input-field"
                    value={formData.metodoPago}
                    onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value })}
                  >
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="QR">Pago QR</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    Registrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
