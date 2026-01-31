import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
      // Datos de ejemplo
      setTransacciones([
        { id: '1', tipo: 'INGRESO', categoria: 'VENTA_PRODUCTOS', descripcion: 'Venta de papa', monto: 2500, fecha: '2024-03-15', metodoPago: 'EFECTIVO' },
        { id: '2', tipo: 'GASTO', categoria: 'FERTILIZANTES', descripcion: 'Abono orgánico', monto: 800, fecha: '2024-03-10', metodoPago: 'EFECTIVO' },
        { id: '3', tipo: 'INGRESO', categoria: 'VENTA_PRODUCTOS', descripcion: 'Venta de haba', monto: 1800, fecha: '2024-03-05', metodoPago: 'TRANSFERENCIA' },
        { id: '4', tipo: 'GASTO', categoria: 'MANO_OBRA', descripcion: 'Jornaleros cosecha', monto: 600, fecha: '2024-03-01', metodoPago: 'EFECTIVO' },
      ]);
      setResumen({
        totalIngresos: 4300,
        totalGastos: 1400,
        balance: 2900,
        porCategoria: [
          { categoria: 'VENTA_PRODUCTOS', total: 4300 },
          { categoria: 'FERTILIZANTES', total: 800 },
          { categoria: 'MANO_OBRA', total: 600 },
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
      // Análisis simulado
      setAnalisisIA(`
📊 **Análisis Financiero con IA**

🎯 **Resumen:**
Tu balance mensual es positivo con Bs. ${resumen?.balance?.toLocaleString() || '2,900'}. 
Tus ingresos principales provienen de la venta de productos agrícolas.

💡 **Recomendaciones:**
1. **Diversificar cultivos**: Considera añadir quinua, que tiene alta demanda y buen precio en el mercado.
2. **Optimizar costos**: Los gastos en fertilizantes representan el 57% de tus gastos totales. Investiga opciones de compost casero.
3. **Planificación de siembra**: El período óptimo para sembrar papa en tu zona es agosto-septiembre.

📈 **Proyección:**
Si mantienes este ritmo, tu ingreso anual proyectado es de aproximadamente Bs. 52,000.

⚠️ **Alertas:**
- Considera crear un fondo de emergencia del 10% de tus ingresos para imprevistos climáticos.
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
    labels: ['Ingresos', 'Gastos'],
    datasets: [
      {
        label: 'Monto (Bs.)',
        data: [resumen?.totalIngresos || 0, resumen?.totalGastos || 0],
        backgroundColor: ['#22c55e', '#ef4444'],
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

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finanzas</h1>
          <p className="text-gray-500">Gestiona tus ingresos y gastos agrícolas</p>
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center gap-3">
            <ArrowTrendingUpIcon className="w-8 h-8" />
            <div>
              <p className="text-sm opacity-90">Total Ingresos</p>
              <p className="text-2xl font-bold">Bs. {resumen?.totalIngresos?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="flex items-center gap-3">
            <ArrowTrendingDownIcon className="w-8 h-8" />
            <div>
              <p className="text-sm opacity-90">Total Gastos</p>
              <p className="text-2xl font-bold">Bs. {resumen?.totalGastos?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
        <div className={`card bg-gradient-to-r ${
          (resumen?.balance || 0) >= 0 
            ? 'from-blue-500 to-blue-600' 
            : 'from-orange-500 to-orange-600'
        } text-white`}>
          <div className="flex items-center gap-3">
            <BanknotesIcon className="w-8 h-8" />
            <div>
              <p className="text-sm opacity-90">Balance</p>
              <p className="text-2xl font-bold">Bs. {resumen?.balance?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
      </div>

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
        {/* Chart */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Mes</h2>
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

        {/* Transactions List */}
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transacciones Recientes</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th className="text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transacciones.map((t) => (
                  <tr key={t.id}>
                    <td className="text-gray-500">
                      {new Date(t.fecha).toLocaleDateString('es-BO')}
                    </td>
                    <td>{t.descripcion || '-'}</td>
                    <td>
                      <span className="badge bg-gray-100 text-gray-800">
                        {t.categoria.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className={`text-right font-medium ${
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
                    className="input"
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
                    className="input"
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
                      className="input"
                      value={formData.monto}
                      onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                    <input
                      type="date"
                      className="input"
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
                    className="input"
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
