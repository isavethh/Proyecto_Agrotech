import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PhoneIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

interface CuentaPorCobrar {
  id: string;
  cliente: string;
  telefono?: string;
  concepto: string;
  montoOriginal: number;
  montoPagado: number;
  saldo: number;
  fechaVenta: string;
  fechaVencimiento: string;
  estado: 'PENDIENTE' | 'PARCIAL' | 'VENCIDA' | 'PAGADA';
  diasVencido: number;
}

interface CuentaPorPagar {
  id: string;
  proveedor: string;
  concepto: string;
  montoOriginal: number;
  montoPagado: number;
  saldo: number;
  fechaCompra: string;
  fechaVencimiento: string;
  estado: 'PENDIENTE' | 'PARCIAL' | 'VENCIDA' | 'PAGADA';
  diasVencido: number;
}

export default function CuentasCobrarPagar() {
  const [tab, setTab] = useState<'cobrar' | 'pagar'>('cobrar');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'cobrar' | 'pagar'>('cobrar');

  const [cuentasCobrar] = useState<CuentaPorCobrar[]>([
    {
      id: '1',
      cliente: 'Restaurante El Sabor',
      telefono: '71234567',
      concepto: 'Venta de papa - 5qq',
      montoOriginal: 1500,
      montoPagado: 500,
      saldo: 1000,
      fechaVenta: '2026-01-15',
      fechaVencimiento: '2026-02-15',
      estado: 'PARCIAL',
      diasVencido: 0,
    },
    {
      id: '2',
      cliente: 'Sr. Carlos Quispe',
      telefono: '72345678',
      concepto: 'Venta de haba - 3qq',
      montoOriginal: 900,
      montoPagado: 0,
      saldo: 900,
      fechaVenta: '2026-01-10',
      fechaVencimiento: '2026-01-25',
      estado: 'VENCIDA',
      diasVencido: 6,
    },
    {
      id: '3',
      cliente: 'Mercado Central - Puesto 45',
      telefono: '73456789',
      concepto: 'Venta de quinua - 2qq',
      montoOriginal: 800,
      montoPagado: 0,
      saldo: 800,
      fechaVenta: '2026-01-20',
      fechaVencimiento: '2026-02-20',
      estado: 'PENDIENTE',
      diasVencido: 0,
    },
    {
      id: '4',
      cliente: 'Sra. María Condori',
      telefono: '74567890',
      concepto: 'Venta de papa - 2qq',
      montoOriginal: 600,
      montoPagado: 600,
      saldo: 0,
      fechaVenta: '2026-01-05',
      fechaVencimiento: '2026-01-20',
      estado: 'PAGADA',
      diasVencido: 0,
    },
  ]);

  const [cuentasPagar] = useState<CuentaPorPagar[]>([
    {
      id: '1',
      proveedor: 'Agroquímicos La Paz',
      concepto: 'Fertilizante NPK - 10 bolsas',
      montoOriginal: 1200,
      montoPagado: 600,
      saldo: 600,
      fechaCompra: '2026-01-10',
      fechaVencimiento: '2026-02-10',
      estado: 'PARCIAL',
      diasVencido: 0,
    },
    {
      id: '2',
      proveedor: 'Semillería Boliviana',
      concepto: 'Semilla de papa certificada',
      montoOriginal: 800,
      montoPagado: 0,
      saldo: 800,
      fechaCompra: '2026-01-05',
      fechaVencimiento: '2026-01-20',
      estado: 'VENCIDA',
      diasVencido: 11,
    },
    {
      id: '3',
      proveedor: 'Transporte Altiplano',
      concepto: 'Flete cosecha enero',
      montoOriginal: 450,
      montoPagado: 0,
      saldo: 450,
      fechaVenta: '2026-01-25',
      fechaVencimiento: '2026-02-25',
      estado: 'PENDIENTE',
      diasVencido: 0,
    },
    {
      id: '4',
      proveedor: 'Banco Agrícola',
      concepto: 'Cuota préstamo mensual',
      montoOriginal: 800,
      montoPagado: 800,
      saldo: 0,
      fechaVenta: '2026-01-01',
      fechaVencimiento: '2026-01-31',
      estado: 'PAGADA',
      diasVencido: 0,
    },
  ]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PAGADA':
        return 'bg-green-100 text-green-800';
      case 'PENDIENTE':
        return 'bg-blue-100 text-blue-800';
      case 'PARCIAL':
        return 'bg-yellow-100 text-yellow-800';
      case 'VENCIDA':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalCobrar = cuentasCobrar.reduce((sum, c) => sum + c.saldo, 0);
  const totalVencidoCobrar = cuentasCobrar.filter(c => c.estado === 'VENCIDA').reduce((sum, c) => sum + c.saldo, 0);
  const totalPagar = cuentasPagar.reduce((sum, c) => sum + c.saldo, 0);
  const totalVencidoPagar = cuentasPagar.filter(c => c.estado === 'VENCIDA').reduce((sum, c) => sum + c.saldo, 0);

  const registrarPago = (id: string, tipo: 'cobrar' | 'pagar') => {
    toast.success(`Pago registrado para cuenta ${id}`);
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
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <UserGroupIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cuentas por Cobrar y Pagar</h1>
            <p className="text-gray-500">Gestión de créditos otorgados y recibidos</p>
          </div>
        </div>
        <button
          onClick={() => {
            setModalType(tab);
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Nueva Cuenta
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-sm opacity-90">Total por Cobrar</p>
          <p className="text-2xl font-bold">Bs. {totalCobrar.toLocaleString()}</p>
          <p className="text-sm opacity-80">{cuentasCobrar.filter(c => c.estado !== 'PAGADA').length} cuentas activas</p>
        </div>
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <p className="text-sm opacity-90">Vencido por Cobrar</p>
          <p className="text-2xl font-bold">Bs. {totalVencidoCobrar.toLocaleString()}</p>
          <p className="text-sm opacity-80">{cuentasCobrar.filter(c => c.estado === 'VENCIDA').length} cuentas</p>
        </div>
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <p className="text-sm opacity-90">Total por Pagar</p>
          <p className="text-2xl font-bold">Bs. {totalPagar.toLocaleString()}</p>
          <p className="text-sm opacity-80">{cuentasPagar.filter(c => c.estado !== 'PAGADA').length} cuentas activas</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-sm opacity-90">Vencido por Pagar</p>
          <p className="text-2xl font-bold">Bs. {totalVencidoPagar.toLocaleString()}</p>
          <p className="text-sm opacity-80">{cuentasPagar.filter(c => c.estado === 'VENCIDA').length} cuentas</p>
        </div>
      </div>

      {/* Alerta de Vencidos */}
      {(totalVencidoCobrar > 0 || totalVencidoPagar > 0) && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-800">Cuentas Vencidas</h3>
            <p className="text-red-700 text-sm">
              Tienes Bs. {totalVencidoCobrar.toLocaleString()} por cobrar vencidos y 
              Bs. {totalVencidoPagar.toLocaleString()} por pagar vencidos. 
              Es importante gestionar estas cuentas para mantener una buena salud financiera.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setTab('cobrar')}
          className={`px-6 py-3 font-medium transition-all border-b-2 ${
            tab === 'cobrar'
              ? 'text-primary-600 border-primary-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          Por Cobrar ({cuentasCobrar.filter(c => c.estado !== 'PAGADA').length})
        </button>
        <button
          onClick={() => setTab('pagar')}
          className={`px-6 py-3 font-medium transition-all border-b-2 ${
            tab === 'pagar'
              ? 'text-primary-600 border-primary-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          Por Pagar ({cuentasPagar.filter(c => c.estado !== 'PAGADA').length})
        </button>
      </div>

      {/* Lista de Cuentas por Cobrar */}
      {tab === 'cobrar' && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 font-semibold text-gray-700">Cliente</th>
                  <th className="text-left py-3 font-semibold text-gray-700">Concepto</th>
                  <th className="text-right py-3 font-semibold text-gray-700">Monto</th>
                  <th className="text-right py-3 font-semibold text-gray-700">Pagado</th>
                  <th className="text-right py-3 font-semibold text-gray-700">Saldo</th>
                  <th className="text-center py-3 font-semibold text-gray-700">Vencimiento</th>
                  <th className="text-center py-3 font-semibold text-gray-700">Estado</th>
                  <th className="text-center py-3 font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cuentasCobrar.map((cuenta) => (
                  <tr key={cuenta.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">
                      <div>
                        <p className="font-medium">{cuenta.cliente}</p>
                        {cuenta.telefono && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <PhoneIcon className="w-3 h-3" />
                            {cuenta.telefono}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-gray-600">{cuenta.concepto}</td>
                    <td className="py-3 text-right font-medium">Bs. {cuenta.montoOriginal.toLocaleString()}</td>
                    <td className="py-3 text-right text-green-600">Bs. {cuenta.montoPagado.toLocaleString()}</td>
                    <td className="py-3 text-right font-bold text-primary-600">Bs. {cuenta.saldo.toLocaleString()}</td>
                    <td className="py-3 text-center">
                      <div>
                        <p>{new Date(cuenta.fechaVencimiento).toLocaleDateString('es-BO')}</p>
                        {cuenta.diasVencido > 0 && (
                          <p className="text-xs text-red-600">{cuenta.diasVencido} días vencido</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(cuenta.estado)}`}>
                        {cuenta.estado}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      {cuenta.estado !== 'PAGADA' && (
                        <button
                          onClick={() => registrarPago(cuenta.id, 'cobrar')}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 flex items-center gap-1 mx-auto"
                        >
                          <BanknotesIcon className="w-4 h-4" />
                          Cobrar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lista de Cuentas por Pagar */}
      {tab === 'pagar' && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 font-semibold text-gray-700">Proveedor</th>
                  <th className="text-left py-3 font-semibold text-gray-700">Concepto</th>
                  <th className="text-right py-3 font-semibold text-gray-700">Monto</th>
                  <th className="text-right py-3 font-semibold text-gray-700">Pagado</th>
                  <th className="text-right py-3 font-semibold text-gray-700">Saldo</th>
                  <th className="text-center py-3 font-semibold text-gray-700">Vencimiento</th>
                  <th className="text-center py-3 font-semibold text-gray-700">Estado</th>
                  <th className="text-center py-3 font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cuentasPagar.map((cuenta) => (
                  <tr key={cuenta.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-medium">{cuenta.proveedor}</td>
                    <td className="py-3 text-gray-600">{cuenta.concepto}</td>
                    <td className="py-3 text-right font-medium">Bs. {cuenta.montoOriginal.toLocaleString()}</td>
                    <td className="py-3 text-right text-green-600">Bs. {cuenta.montoPagado.toLocaleString()}</td>
                    <td className="py-3 text-right font-bold text-red-600">Bs. {cuenta.saldo.toLocaleString()}</td>
                    <td className="py-3 text-center">
                      <div>
                        <p>{new Date(cuenta.fechaVencimiento).toLocaleDateString('es-BO')}</p>
                        {cuenta.diasVencido > 0 && (
                          <p className="text-xs text-red-600">{cuenta.diasVencido} días vencido</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(cuenta.estado)}`}>
                        {cuenta.estado}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      {cuenta.estado !== 'PAGADA' && (
                        <button
                          onClick={() => registrarPago(cuenta.id, 'pagar')}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 flex items-center gap-1 mx-auto"
                        >
                          <BanknotesIcon className="w-4 h-4" />
                          Pagar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resumen de Antigüedad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-blue-600" />
            Antigüedad Cuentas por Cobrar
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span>Vigentes (0-30 días)</span>
              <span className="font-bold text-green-700">Bs. 1,800</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span>Vencido 1-30 días</span>
              <span className="font-bold text-yellow-700">Bs. 900</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span>Vencido +30 días</span>
              <span className="font-bold text-red-700">Bs. 0</span>
            </div>
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-orange-600" />
            Antigüedad Cuentas por Pagar
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span>Vigentes (0-30 días)</span>
              <span className="font-bold text-green-700">Bs. 1,050</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span>Vencido 1-30 días</span>
              <span className="font-bold text-yellow-700">Bs. 800</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span>Vencido +30 días</span>
              <span className="font-bold text-red-700">Bs. 0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
