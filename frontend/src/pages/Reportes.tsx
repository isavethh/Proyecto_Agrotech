import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  CalendarIcon,
  DocumentTextIcon,
  TableCellsIcon,
  ChartBarIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

type TipoReporte = 'estado-resultados' | 'balance' | 'flujo-caja' | 'inventario' | 'ventas' | 'costos';

interface Reporte {
  id: string;
  nombre: string;
  tipo: TipoReporte;
  descripcion: string;
  ultimaGeneracion: string;
  formatos: string[];
}

export default function Reportes() {
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState<string | null>(null);
  const [periodoInicio, setPeriodoInicio] = useState('2026-01-01');
  const [periodoFin, setPeriodoFin] = useState('2026-01-31');

  const [reportesDisponibles] = useState<Reporte[]>([
    {
      id: '1',
      nombre: 'Estado de Resultados',
      tipo: 'estado-resultados',
      descripcion: 'Reporte de ingresos, costos y utilidades del período seleccionado.',
      ultimaGeneracion: '2026-01-25',
      formatos: ['PDF', 'Excel', 'CSV'],
    },
    {
      id: '2',
      nombre: 'Balance General',
      tipo: 'balance',
      descripcion: 'Estado de situación financiera con activos, pasivos y patrimonio.',
      ultimaGeneracion: '2026-01-20',
      formatos: ['PDF', 'Excel'],
    },
    {
      id: '3',
      nombre: 'Flujo de Caja',
      tipo: 'flujo-caja',
      descripcion: 'Movimiento de efectivo con entradas, salidas y saldo proyectado.',
      ultimaGeneracion: '2026-01-28',
      formatos: ['PDF', 'Excel', 'CSV'],
    },
    {
      id: '4',
      nombre: 'Reporte de Inventario',
      tipo: 'inventario',
      descripcion: 'Estado actual del inventario con valorización y movimientos.',
      ultimaGeneracion: '2026-01-30',
      formatos: ['PDF', 'Excel'],
    },
    {
      id: '5',
      nombre: 'Análisis de Ventas',
      tipo: 'ventas',
      descripcion: 'Detalle de ventas por producto, cliente y canal de distribución.',
      ultimaGeneracion: '2026-01-29',
      formatos: ['PDF', 'Excel', 'CSV'],
    },
    {
      id: '6',
      nombre: 'Centro de Costos',
      tipo: 'costos',
      descripcion: 'Análisis de costos por parcela, cultivo y actividad productiva.',
      ultimaGeneracion: '2026-01-27',
      formatos: ['PDF', 'Excel'],
    },
  ]);

  const [reportesGenerados] = useState([
    { id: '1', nombre: 'Estado_Resultados_Enero_2026.pdf', fecha: '2026-01-25', tamaño: '245 KB', tipo: 'PDF' },
    { id: '2', nombre: 'Flujo_Caja_Enero_2026.xlsx', fecha: '2026-01-28', tamaño: '180 KB', tipo: 'Excel' },
    { id: '3', nombre: 'Inventario_Semana4.pdf', fecha: '2026-01-30', tamaño: '320 KB', tipo: 'PDF' },
    { id: '4', nombre: 'Ventas_Enero_2026.csv', fecha: '2026-01-29', tamaño: '95 KB', tipo: 'CSV' },
  ]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const getIconoTipo = (tipo: TipoReporte) => {
    switch (tipo) {
      case 'estado-resultados':
      case 'balance':
        return <DocumentTextIcon className="w-6 h-6" />;
      case 'flujo-caja':
        return <ChartBarIcon className="w-6 h-6" />;
      case 'inventario':
        return <TableCellsIcon className="w-6 h-6" />;
      case 'ventas':
      case 'costos':
        return <FunnelIcon className="w-6 h-6" />;
      default:
        return <DocumentTextIcon className="w-6 h-6" />;
    }
  };

  const getColorTipo = (tipo: TipoReporte) => {
    switch (tipo) {
      case 'estado-resultados':
        return 'bg-blue-100 text-blue-600';
      case 'balance':
        return 'bg-purple-100 text-purple-600';
      case 'flujo-caja':
        return 'bg-green-100 text-green-600';
      case 'inventario':
        return 'bg-orange-100 text-orange-600';
      case 'ventas':
        return 'bg-pink-100 text-pink-600';
      case 'costos':
        return 'bg-indigo-100 text-indigo-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const generarReporte = async (reporte: Reporte, formato: string) => {
    setGenerando(`${reporte.id}-${formato}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGenerando(null);
    toast.success(`Reporte "${reporte.nombre}" generado en formato ${formato}`);
  };

  const descargarReporte = (nombre: string) => {
    toast.success(`Descargando ${nombre}...`);
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
          <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
            <DocumentArrowDownIcon className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reportes Financieros</h1>
            <p className="text-gray-500">Genera y descarga reportes contables</p>
          </div>
        </div>
      </div>

      {/* Filtro de Período */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Período:</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={periodoInicio}
              onChange={(e) => setPeriodoInicio(e.target.value)}
              className="input-field w-40"
            />
            <span className="text-gray-500">hasta</span>
            <input
              type="date"
              value={periodoFin}
              onChange={(e) => setPeriodoFin(e.target.value)}
              className="input-field w-40"
            />
          </div>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => {
                setPeriodoInicio('2026-01-01');
                setPeriodoFin('2026-01-31');
              }}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Este mes
            </button>
            <button
              onClick={() => {
                setPeriodoInicio('2025-10-01');
                setPeriodoFin('2025-12-31');
              }}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Trimestre anterior
            </button>
            <button
              onClick={() => {
                setPeriodoInicio('2025-01-01');
                setPeriodoFin('2025-12-31');
              }}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Año anterior
            </button>
          </div>
        </div>
      </div>

      {/* Reportes Disponibles */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Reportes Disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportesDisponibles.map((reporte) => (
            <div key={reporte.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorTipo(reporte.tipo)}`}>
                  {getIconoTipo(reporte.tipo)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{reporte.nombre}</h3>
                  <p className="text-sm text-gray-500">Última: {new Date(reporte.ultimaGeneracion).toLocaleDateString('es-BO')}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">{reporte.descripcion}</p>
              <div className="flex flex-wrap gap-2">
                {reporte.formatos.map((formato) => (
                  <button
                    key={formato}
                    onClick={() => generarReporte(reporte, formato)}
                    disabled={generando === `${reporte.id}-${formato}`}
                    className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 ${
                      formato === 'PDF' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                      formato === 'Excel' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                      'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    } ${generando === `${reporte.id}-${formato}` ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    {generando === `${reporte.id}-${formato}` ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                    ) : (
                      <DocumentArrowDownIcon className="w-4 h-4" />
                    )}
                    {formato}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reportes Generados Recientemente */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Reportes Generados Recientemente</h2>
          <button className="text-primary-600 text-sm hover:underline">Ver todos</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 font-semibold text-gray-700">Nombre del archivo</th>
                <th className="text-center py-3 font-semibold text-gray-700">Tipo</th>
                <th className="text-center py-3 font-semibold text-gray-700">Fecha</th>
                <th className="text-center py-3 font-semibold text-gray-700">Tamaño</th>
                <th className="text-center py-3 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reportesGenerados.map((reporte) => (
                <tr key={reporte.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 font-medium">{reporte.nombre}</td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      reporte.tipo === 'PDF' ? 'bg-red-100 text-red-700' :
                      reporte.tipo === 'Excel' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {reporte.tipo}
                    </span>
                  </td>
                  <td className="py-3 text-center text-gray-600">
                    {new Date(reporte.fecha).toLocaleDateString('es-BO')}
                  </td>
                  <td className="py-3 text-center text-gray-600">{reporte.tamaño}</td>
                  <td className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => descargarReporte(reporte.nombre)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Descargar"
                      >
                        <DocumentArrowDownIcon className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Imprimir"
                      >
                        <PrinterIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Programar Reportes */}
      <div className="card bg-gradient-to-r from-primary-50 to-blue-50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <CalendarIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">Programar Reportes Automáticos</h3>
            <p className="text-sm text-gray-600 mb-4">
              Configura la generación automática de reportes y recíbelos por correo electrónico.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <input type="checkbox" id="semanal" className="rounded text-primary-600" />
                  <label htmlFor="semanal" className="font-medium text-sm">Reporte Semanal</label>
                </div>
                <p className="text-xs text-gray-500">Flujo de caja e inventario cada lunes</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <input type="checkbox" id="mensual" className="rounded text-primary-600" defaultChecked />
                  <label htmlFor="mensual" className="font-medium text-sm">Reporte Mensual</label>
                </div>
                <p className="text-xs text-gray-500">Estado de resultados completo el 1ro de cada mes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tip de Contabilidad */}
      <div className="card bg-yellow-50 border border-yellow-200">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-semibold text-yellow-800">Tip Contable</h3>
            <p className="text-sm text-yellow-700">
              Para cumplir con las normativas bolivianas (Ley 843), se recomienda generar el Estado de Resultados
              y el Balance General mensualmente. Estos documentos son requeridos para la presentación de
              declaraciones de IVA e IT ante el SIN.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
