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
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface LineaEstado {
  concepto: string;
  monto: number;
  porcentaje?: number;
  subcuentas?: { nombre: string; monto: number }[];
}

export default function EstadoResultados() {
  const [periodo, setPeriodo] = useState('mensual');
  const [mes, setMes] = useState(new Date().getMonth());
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  // Datos del Estado de Resultados
  const [datos, setDatos] = useState({
    ingresos: {
      ventaProductos: 12500,
      ventaPapa: 8000,
      ventaHaba: 3500,
      ventaQuinua: 1000,
      subsidios: 500,
      otrosIngresos: 300,
    },
    costoVentas: {
      semillas: 1200,
      fertilizantes: 2100,
      agroquimicos: 800,
      manoObraDirecta: 2500,
      agua: 400,
      depreciacionEquipo: 350,
    },
    gastosOperativos: {
      manoObraIndirecta: 800,
      transporte: 600,
      mantenimientoEquipos: 400,
      serviciosBasicos: 200,
      comunicaciones: 100,
    },
    gastosAdministrativos: {
      contabilidad: 300,
      tramites: 150,
      seguros: 200,
    },
    gastosFinancieros: {
      interesesPrestamos: 250,
      comisionesBancarias: 50,
    },
  });

  useEffect(() => {
    setLoading(false);
  }, []);

  const calcularTotales = () => {
    const totalIngresos = Object.values(datos.ingresos).reduce((a, b) => a + b, 0);
    const totalCostoVentas = Object.values(datos.costoVentas).reduce((a, b) => a + b, 0);
    const utilidadBruta = totalIngresos - totalCostoVentas;
    const totalGastosOperativos = Object.values(datos.gastosOperativos).reduce((a, b) => a + b, 0);
    const utilidadOperativa = utilidadBruta - totalGastosOperativos;
    const totalGastosAdmin = Object.values(datos.gastosAdministrativos).reduce((a, b) => a + b, 0);
    const totalGastosFinancieros = Object.values(datos.gastosFinancieros).reduce((a, b) => a + b, 0);
    const utilidadAntesImpuestos = utilidadOperativa - totalGastosAdmin - totalGastosFinancieros;
    const impuestos = utilidadAntesImpuestos > 0 ? utilidadAntesImpuestos * 0.25 : 0;
    const utilidadNeta = utilidadAntesImpuestos - impuestos;

    return {
      totalIngresos,
      totalCostoVentas,
      utilidadBruta,
      margenBruto: (utilidadBruta / totalIngresos * 100).toFixed(1),
      totalGastosOperativos,
      utilidadOperativa,
      margenOperativo: (utilidadOperativa / totalIngresos * 100).toFixed(1),
      totalGastosAdmin,
      totalGastosFinancieros,
      utilidadAntesImpuestos,
      impuestos,
      utilidadNeta,
      margenNeto: (utilidadNeta / totalIngresos * 100).toFixed(1),
    };
  };

  const totales = calcularTotales();

  const chartComparativo = {
    labels: ['Ingresos', 'Costos', 'Gastos Op.', 'Utilidad'],
    datasets: [
      {
        label: 'Bolivianos (Bs.)',
        data: [
          totales.totalIngresos,
          totales.totalCostoVentas,
          totales.totalGastosOperativos + totales.totalGastosAdmin + totales.totalGastosFinancieros,
          totales.utilidadNeta,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          totales.utilidadNeta >= 0 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)',
        ],
        borderRadius: 8,
      },
    ],
  };

  const chartCostos = {
    labels: ['Semillas', 'Fertilizantes', 'Agroquímicos', 'Mano de Obra', 'Agua', 'Otros'],
    datasets: [
      {
        data: [
          datos.costoVentas.semillas,
          datos.costoVentas.fertilizantes,
          datos.costoVentas.agroquimicos,
          datos.costoVentas.manoObraDirecta,
          datos.costoVentas.agua,
          datos.costoVentas.depreciacionEquipo,
        ],
        backgroundColor: [
          '#22c55e',
          '#3b82f6',
          '#f59e0b',
          '#8b5cf6',
          '#06b6d4',
          '#6b7280',
        ],
        borderWidth: 0,
      },
    ],
  };

  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

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
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <DocumentTextIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Estado de Resultados</h1>
            <p className="text-gray-500">Pérdidas y Ganancias (P&L)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="input w-auto"
            value={mes}
            onChange={(e) => setMes(parseInt(e.target.value))}
          >
            {meses.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
          <select
            className="input w-auto"
            value={anio}
            onChange={(e) => setAnio(parseInt(e.target.value))}
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
          </select>
          <button className="btn-secondary flex items-center gap-2">
            <PrinterIcon className="w-5 h-5" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Indicadores Clave */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-sm opacity-90">Ingresos Totales</p>
          <p className="text-2xl font-bold">Bs. {totales.totalIngresos.toLocaleString()}</p>
        </div>
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-sm opacity-90">Utilidad Bruta</p>
          <p className="text-2xl font-bold">Bs. {totales.utilidadBruta.toLocaleString()}</p>
          <p className="text-sm opacity-80">Margen: {totales.margenBruto}%</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-sm opacity-90">Utilidad Operativa</p>
          <p className="text-2xl font-bold">Bs. {totales.utilidadOperativa.toLocaleString()}</p>
          <p className="text-sm opacity-80">Margen: {totales.margenOperativo}%</p>
        </div>
        <div className={`card bg-gradient-to-br ${totales.utilidadNeta >= 0 ? 'from-emerald-500 to-teal-600' : 'from-red-500 to-red-600'} text-white`}>
          <p className="text-sm opacity-90">Utilidad Neta</p>
          <p className="text-2xl font-bold">Bs. {totales.utilidadNeta.toLocaleString()}</p>
          <p className="text-sm opacity-80">Margen: {totales.margenNeto}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Estado de Resultados Detallado */}
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            {meses[mes]} {anio}
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 font-semibold text-gray-700">Concepto</th>
                  <th className="text-right py-3 font-semibold text-gray-700">Monto (Bs.)</th>
                  <th className="text-right py-3 font-semibold text-gray-700">%</th>
                </tr>
              </thead>
              <tbody>
                {/* INGRESOS */}
                <tr className="bg-green-50 font-semibold">
                  <td className="py-2 text-green-800">INGRESOS</td>
                  <td className="text-right py-2 text-green-800">{totales.totalIngresos.toLocaleString()}</td>
                  <td className="text-right py-2 text-green-800">100%</td>
                </tr>
                <tr className="text-gray-600">
                  <td className="py-1 pl-4">Venta de Papa</td>
                  <td className="text-right py-1">{datos.ingresos.ventaPapa.toLocaleString()}</td>
                  <td className="text-right py-1">{(datos.ingresos.ventaPapa/totales.totalIngresos*100).toFixed(1)}%</td>
                </tr>
                <tr className="text-gray-600">
                  <td className="py-1 pl-4">Venta de Haba</td>
                  <td className="text-right py-1">{datos.ingresos.ventaHaba.toLocaleString()}</td>
                  <td className="text-right py-1">{(datos.ingresos.ventaHaba/totales.totalIngresos*100).toFixed(1)}%</td>
                </tr>
                <tr className="text-gray-600">
                  <td className="py-1 pl-4">Venta de Quinua</td>
                  <td className="text-right py-1">{datos.ingresos.ventaQuinua.toLocaleString()}</td>
                  <td className="text-right py-1">{(datos.ingresos.ventaQuinua/totales.totalIngresos*100).toFixed(1)}%</td>
                </tr>
                <tr className="text-gray-600">
                  <td className="py-1 pl-4">Subsidios</td>
                  <td className="text-right py-1">{datos.ingresos.subsidios.toLocaleString()}</td>
                  <td className="text-right py-1">{(datos.ingresos.subsidios/totales.totalIngresos*100).toFixed(1)}%</td>
                </tr>
                <tr className="text-gray-600 border-b">
                  <td className="py-1 pl-4">Otros Ingresos</td>
                  <td className="text-right py-1">{datos.ingresos.otrosIngresos.toLocaleString()}</td>
                  <td className="text-right py-1">{(datos.ingresos.otrosIngresos/totales.totalIngresos*100).toFixed(1)}%</td>
                </tr>

                {/* COSTO DE VENTAS */}
                <tr className="bg-red-50 font-semibold">
                  <td className="py-2 text-red-800">(-) COSTO DE VENTAS</td>
                  <td className="text-right py-2 text-red-800">({totales.totalCostoVentas.toLocaleString()})</td>
                  <td className="text-right py-2 text-red-800">{(totales.totalCostoVentas/totales.totalIngresos*100).toFixed(1)}%</td>
                </tr>
                <tr className="text-gray-600">
                  <td className="py-1 pl-4">Semillas</td>
                  <td className="text-right py-1">({datos.costoVentas.semillas.toLocaleString()})</td>
                  <td className="text-right py-1"></td>
                </tr>
                <tr className="text-gray-600">
                  <td className="py-1 pl-4">Fertilizantes</td>
                  <td className="text-right py-1">({datos.costoVentas.fertilizantes.toLocaleString()})</td>
                  <td className="text-right py-1"></td>
                </tr>
                <tr className="text-gray-600">
                  <td className="py-1 pl-4">Agroquímicos</td>
                  <td className="text-right py-1">({datos.costoVentas.agroquimicos.toLocaleString()})</td>
                  <td className="text-right py-1"></td>
                </tr>
                <tr className="text-gray-600">
                  <td className="py-1 pl-4">Mano de Obra Directa</td>
                  <td className="text-right py-1">({datos.costoVentas.manoObraDirecta.toLocaleString()})</td>
                  <td className="text-right py-1"></td>
                </tr>
                <tr className="text-gray-600 border-b">
                  <td className="py-1 pl-4">Agua y Riego</td>
                  <td className="text-right py-1">({datos.costoVentas.agua.toLocaleString()})</td>
                  <td className="text-right py-1"></td>
                </tr>

                {/* UTILIDAD BRUTA */}
                <tr className="bg-blue-50 font-bold text-lg">
                  <td className="py-3 text-blue-800">UTILIDAD BRUTA</td>
                  <td className="text-right py-3 text-blue-800">{totales.utilidadBruta.toLocaleString()}</td>
                  <td className="text-right py-3 text-blue-800">{totales.margenBruto}%</td>
                </tr>

                {/* GASTOS OPERATIVOS */}
                <tr className="bg-orange-50 font-semibold">
                  <td className="py-2 text-orange-800">(-) GASTOS OPERATIVOS</td>
                  <td className="text-right py-2 text-orange-800">({totales.totalGastosOperativos.toLocaleString()})</td>
                  <td className="text-right py-2 text-orange-800">{(totales.totalGastosOperativos/totales.totalIngresos*100).toFixed(1)}%</td>
                </tr>
                <tr className="text-gray-600">
                  <td className="py-1 pl-4">Transporte</td>
                  <td className="text-right py-1">({datos.gastosOperativos.transporte.toLocaleString()})</td>
                  <td className="text-right py-1"></td>
                </tr>
                <tr className="text-gray-600 border-b">
                  <td className="py-1 pl-4">Mantenimiento</td>
                  <td className="text-right py-1">({datos.gastosOperativos.mantenimientoEquipos.toLocaleString()})</td>
                  <td className="text-right py-1"></td>
                </tr>

                {/* UTILIDAD OPERATIVA */}
                <tr className="bg-purple-50 font-bold text-lg">
                  <td className="py-3 text-purple-800">UTILIDAD OPERATIVA</td>
                  <td className="text-right py-3 text-purple-800">{totales.utilidadOperativa.toLocaleString()}</td>
                  <td className="text-right py-3 text-purple-800">{totales.margenOperativo}%</td>
                </tr>

                {/* GASTOS ADMIN Y FINANCIEROS */}
                <tr className="text-gray-600">
                  <td className="py-1">(-) Gastos Administrativos</td>
                  <td className="text-right py-1">({totales.totalGastosAdmin.toLocaleString()})</td>
                  <td className="text-right py-1"></td>
                </tr>
                <tr className="text-gray-600 border-b">
                  <td className="py-1">(-) Gastos Financieros</td>
                  <td className="text-right py-1">({totales.totalGastosFinancieros.toLocaleString()})</td>
                  <td className="text-right py-1"></td>
                </tr>

                {/* UTILIDAD ANTES DE IMPUESTOS */}
                <tr className="font-semibold">
                  <td className="py-2">UTILIDAD ANTES DE IMPUESTOS</td>
                  <td className="text-right py-2">{totales.utilidadAntesImpuestos.toLocaleString()}</td>
                  <td className="text-right py-2"></td>
                </tr>
                <tr className="text-gray-600 border-b">
                  <td className="py-1">(-) Impuestos (25%)</td>
                  <td className="text-right py-1">({totales.impuestos.toLocaleString()})</td>
                  <td className="text-right py-1"></td>
                </tr>

                {/* UTILIDAD NETA */}
                <tr className={`font-bold text-xl ${totales.utilidadNeta >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  <td className="py-4">UTILIDAD NETA</td>
                  <td className="text-right py-4">Bs. {totales.utilidadNeta.toLocaleString()}</td>
                  <td className="text-right py-4">{totales.margenNeto}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Gráficos */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Visual</h3>
            <Bar
              data={chartComparativo}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
              }}
            />
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Costos</h3>
            <Doughnut
              data={chartCostos}
              options={{
                responsive: true,
                plugins: { legend: { position: 'bottom' } },
              }}
            />
          </div>
        </div>
      </div>

      {/* Análisis Comparativo */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Análisis Comparativo vs Mes Anterior</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Ingresos</span>
            </div>
            <p className="text-xl font-bold text-gray-900">+12%</p>
            <p className="text-xs text-green-600">+Bs. 1,340</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <ArrowTrendingDownIcon className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Costos</span>
            </div>
            <p className="text-xl font-bold text-gray-900">-5%</p>
            <p className="text-xs text-green-600">-Bs. 380</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Margen Bruto</span>
            </div>
            <p className="text-xl font-bold text-gray-900">+3.2%</p>
            <p className="text-xs text-gray-500">vs {parseFloat(totales.margenBruto) - 3.2}% anterior</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Utilidad Neta</span>
            </div>
            <p className="text-xl font-bold text-gray-900">+18%</p>
            <p className="text-xs text-green-600">+Bs. 720</p>
          </div>
        </div>
      </div>
    </div>
  );
}
