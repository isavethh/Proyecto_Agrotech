import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  BookOpenIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface AsientoContable {
  id: string;
  numero: number;
  fecha: string;
  concepto: string;
  referencia?: string;
  estado: 'BORRADOR' | 'CONTABILIZADO' | 'ANULADO';
  detalles: DetalleAsiento[];
  totalDebe: number;
  totalHaber: number;
}

interface DetalleAsiento {
  id: string;
  codigoCuenta: string;
  nombreCuenta: string;
  debe: number;
  haber: number;
}

const planCuentas = [
  { codigo: '1.1.1', nombre: 'Caja y Bancos' },
  { codigo: '1.1.2', nombre: 'Cuentas por Cobrar' },
  { codigo: '1.1.3', nombre: 'Inventario de Productos' },
  { codigo: '1.1.4', nombre: 'Inventario de Insumos' },
  { codigo: '2.1.1', nombre: 'Cuentas por Pagar' },
  { codigo: '2.1.2', nombre: 'Sueldos por Pagar' },
  { codigo: '2.1.3', nombre: 'Impuestos por Pagar' },
  { codigo: '4.1.1', nombre: 'Ventas de Productos Agrícolas' },
  { codigo: '4.1.2', nombre: 'Otros Ingresos' },
  { codigo: '5.1.1', nombre: 'Costo de Ventas' },
  { codigo: '5.2.1', nombre: 'Gastos de Mano de Obra' },
  { codigo: '5.2.2', nombre: 'Gastos de Insumos' },
  { codigo: '5.2.3', nombre: 'Gastos de Transporte' },
  { codigo: '5.3.1', nombre: 'Depreciación' },
];

export default function LibroDiario() {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroFecha, setFiltroFecha] = useState({
    inicio: '2026-01-01',
    fin: '2026-01-31',
  });

  const [asientos, setAsientos] = useState<AsientoContable[]>([
    {
      id: '1',
      numero: 1,
      fecha: '2026-01-05',
      concepto: 'Venta de productos agrícolas al contado',
      referencia: 'FAC-001',
      estado: 'CONTABILIZADO',
      detalles: [
        { id: '1a', codigoCuenta: '1.1.1', nombreCuenta: 'Caja y Bancos', debe: 1800, haber: 0 },
        { id: '1b', codigoCuenta: '4.1.1', nombreCuenta: 'Ventas de Productos Agrícolas', debe: 0, haber: 1800 },
      ],
      totalDebe: 1800,
      totalHaber: 1800,
    },
    {
      id: '2',
      numero: 2,
      fecha: '2026-01-10',
      concepto: 'Compra de fertilizantes a crédito',
      referencia: 'COMP-015',
      estado: 'CONTABILIZADO',
      detalles: [
        { id: '2a', codigoCuenta: '1.1.4', nombreCuenta: 'Inventario de Insumos', debe: 800, haber: 0 },
        { id: '2b', codigoCuenta: '2.1.1', nombreCuenta: 'Cuentas por Pagar', debe: 0, haber: 800 },
      ],
      totalDebe: 800,
      totalHaber: 800,
    },
    {
      id: '3',
      numero: 3,
      fecha: '2026-01-15',
      concepto: 'Venta de papa - 50% contado, 50% crédito',
      referencia: 'FAC-002',
      estado: 'CONTABILIZADO',
      detalles: [
        { id: '3a', codigoCuenta: '1.1.1', nombreCuenta: 'Caja y Bancos', debe: 1250, haber: 0 },
        { id: '3b', codigoCuenta: '1.1.2', nombreCuenta: 'Cuentas por Cobrar', debe: 1250, haber: 0 },
        { id: '3c', codigoCuenta: '4.1.1', nombreCuenta: 'Ventas de Productos Agrícolas', debe: 0, haber: 2500 },
      ],
      totalDebe: 2500,
      totalHaber: 2500,
    },
    {
      id: '4',
      numero: 4,
      fecha: '2026-01-20',
      concepto: 'Pago de jornaleros por cosecha',
      referencia: 'REC-008',
      estado: 'CONTABILIZADO',
      detalles: [
        { id: '4a', codigoCuenta: '5.2.1', nombreCuenta: 'Gastos de Mano de Obra', debe: 600, haber: 0 },
        { id: '4b', codigoCuenta: '1.1.1', nombreCuenta: 'Caja y Bancos', debe: 0, haber: 600 },
      ],
      totalDebe: 600,
      totalHaber: 600,
    },
    {
      id: '5',
      numero: 5,
      fecha: '2026-01-25',
      concepto: 'Cobro de cuenta pendiente',
      referencia: 'REC-009',
      estado: 'BORRADOR',
      detalles: [
        { id: '5a', codigoCuenta: '1.1.1', nombreCuenta: 'Caja y Bancos', debe: 500, haber: 0 },
        { id: '5b', codigoCuenta: '1.1.2', nombreCuenta: 'Cuentas por Cobrar', debe: 0, haber: 500 },
      ],
      totalDebe: 500,
      totalHaber: 500,
    },
  ]);

  const [nuevoAsiento, setNuevoAsiento] = useState({
    fecha: new Date().toISOString().split('T')[0],
    concepto: '',
    referencia: '',
    detalles: [
      { codigoCuenta: '', debe: 0, haber: 0 },
      { codigoCuenta: '', debe: 0, haber: 0 },
    ],
  });

  useEffect(() => {
    setLoading(false);
  }, []);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'CONTABILIZADO':
        return 'bg-green-100 text-green-800';
      case 'BORRADOR':
        return 'bg-yellow-100 text-yellow-800';
      case 'ANULADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const contabilizarAsiento = (id: string) => {
    setAsientos(asientos.map(a => 
      a.id === id ? { ...a, estado: 'CONTABILIZADO' as const } : a
    ));
    toast.success('Asiento contabilizado exitosamente');
  };

  const duplicarAsiento = (asiento: AsientoContable) => {
    const nuevo: AsientoContable = {
      ...asiento,
      id: Date.now().toString(),
      numero: asientos.length + 1,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'BORRADOR',
    };
    setAsientos([...asientos, nuevo]);
    toast.success('Asiento duplicado');
  };

  const totalDebeGeneral = asientos.reduce((sum, a) => sum + a.totalDebe, 0);
  const totalHaberGeneral = asientos.reduce((sum, a) => sum + a.totalHaber, 0);

  const asientosFiltrados = asientos.filter(a => {
    const cumpleBusqueda = a.concepto.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.referencia?.toLowerCase().includes(busqueda.toLowerCase());
    const cumpleFecha = a.fecha >= filtroFecha.inicio && a.fecha <= filtroFecha.fin;
    return cumpleBusqueda && cumpleFecha;
  });

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
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <BookOpenIcon className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Libro Diario</h1>
            <p className="text-gray-500">Registro de asientos contables</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Nuevo Asiento
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Asientos</p>
          <p className="text-2xl font-bold text-gray-900">{asientos.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total DEBE</p>
          <p className="text-2xl font-bold text-blue-600">Bs. {totalDebeGeneral.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total HABER</p>
          <p className="text-2xl font-bold text-green-600">Bs. {totalHaberGeneral.toLocaleString()}</p>
        </div>
        <div className={`card ${totalDebeGeneral === totalHaberGeneral ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className="text-sm text-gray-500">Balance</p>
          <p className={`text-2xl font-bold ${totalDebeGeneral === totalHaberGeneral ? 'text-green-600' : 'text-red-600'}`}>
            {totalDebeGeneral === totalHaberGeneral ? '✓ Cuadrado' : '⚠ Descuadre'}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por concepto o referencia..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={filtroFecha.inicio}
              onChange={(e) => setFiltroFecha({ ...filtroFecha, inicio: e.target.value })}
              className="input-field w-36"
            />
            <span className="text-gray-500">a</span>
            <input
              type="date"
              value={filtroFecha.fin}
              onChange={(e) => setFiltroFecha({ ...filtroFecha, fin: e.target.value })}
              className="input-field w-36"
            />
          </div>
        </div>
      </div>

      {/* Lista de Asientos */}
      <div className="space-y-4">
        {asientosFiltrados.map((asiento) => (
          <div key={asiento.id} className="card">
            {/* Encabezado del Asiento */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-primary-600">#{asiento.numero}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{asiento.concepto}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{new Date(asiento.fecha).toLocaleDateString('es-BO')}</span>
                    {asiento.referencia && (
                      <>
                        <span>•</span>
                        <span>Ref: {asiento.referencia}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(asiento.estado)}`}>
                  {asiento.estado}
                </span>
                {asiento.estado === 'BORRADOR' && (
                  <button
                    onClick={() => contabilizarAsiento(asiento.id)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    title="Contabilizar"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => duplicarAsiento(asiento)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="Duplicar"
                >
                  <DocumentDuplicateIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Detalle del Asiento */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500">
                    <th className="text-left py-2 font-medium">Código</th>
                    <th className="text-left py-2 font-medium">Cuenta</th>
                    <th className="text-right py-2 font-medium">DEBE</th>
                    <th className="text-right py-2 font-medium">HABER</th>
                  </tr>
                </thead>
                <tbody>
                  {asiento.detalles.map((detalle) => (
                    <tr key={detalle.id} className="border-t">
                      <td className="py-2 text-gray-600">{detalle.codigoCuenta}</td>
                      <td className="py-2">{detalle.nombreCuenta}</td>
                      <td className="py-2 text-right font-medium text-blue-600">
                        {detalle.debe > 0 ? `Bs. ${detalle.debe.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-2 text-right font-medium text-green-600">
                        {detalle.haber > 0 ? `Bs. ${detalle.haber.toLocaleString()}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-bold">
                    <td colSpan={2} className="py-2 text-right">TOTALES:</td>
                    <td className="py-2 text-right text-blue-700">Bs. {asiento.totalDebe.toLocaleString()}</td>
                    <td className="py-2 text-right text-green-700">Bs. {asiento.totalHaber.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Información del Plan de Cuentas */}
      <div className="card bg-blue-50">
        <h3 className="font-semibold text-blue-900 mb-3">📘 Plan de Cuentas Resumido</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {planCuentas.slice(0, 8).map((cuenta) => (
            <div key={cuenta.codigo} className="flex gap-2">
              <span className="text-blue-600 font-mono">{cuenta.codigo}</span>
              <span className="text-gray-700">{cuenta.nombre}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
