import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ScaleIcon,
  BuildingLibraryIcon,
  CubeIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

interface CuentaBalance {
  codigo: string;
  nombre: string;
  saldo: number;
  tipo: 'ACTIVO' | 'PASIVO' | 'PATRIMONIO';
  subcuenta?: boolean;
}

export default function BalanceGeneral() {
  const [loading, setLoading] = useState(true);
  const [fechaCorte, setFechaCorte] = useState('2026-01-31');

  const [activos] = useState<CuentaBalance[]>([
    // Activo Corriente
    { codigo: '1.1', nombre: 'ACTIVO CORRIENTE', saldo: 0, tipo: 'ACTIVO' },
    { codigo: '1.1.1', nombre: 'Caja y Bancos', saldo: 8500, tipo: 'ACTIVO', subcuenta: true },
    { codigo: '1.1.2', nombre: 'Cuentas por Cobrar', saldo: 2700, tipo: 'ACTIVO', subcuenta: true },
    { codigo: '1.1.3', nombre: 'Inventario de Productos', saldo: 12500, tipo: 'ACTIVO', subcuenta: true },
    { codigo: '1.1.4', nombre: 'Inventario de Insumos', saldo: 3200, tipo: 'ACTIVO', subcuenta: true },
    { codigo: '1.1.5', nombre: 'Cultivos en Proceso', saldo: 8900, tipo: 'ACTIVO', subcuenta: true },
    // Activo No Corriente
    { codigo: '1.2', nombre: 'ACTIVO NO CORRIENTE', saldo: 0, tipo: 'ACTIVO' },
    { codigo: '1.2.1', nombre: 'Terrenos Agrícolas', saldo: 45000, tipo: 'ACTIVO', subcuenta: true },
    { codigo: '1.2.2', nombre: 'Maquinaria y Equipo', saldo: 15000, tipo: 'ACTIVO', subcuenta: true },
    { codigo: '1.2.3', nombre: 'Sistema de Riego', saldo: 8500, tipo: 'ACTIVO', subcuenta: true },
    { codigo: '1.2.4', nombre: 'Depreciación Acumulada', saldo: -5200, tipo: 'ACTIVO', subcuenta: true },
    { codigo: '1.2.5', nombre: 'Sensores IoT', saldo: 4500, tipo: 'ACTIVO', subcuenta: true },
  ]);

  const [pasivos] = useState<CuentaBalance[]>([
    // Pasivo Corriente
    { codigo: '2.1', nombre: 'PASIVO CORRIENTE', saldo: 0, tipo: 'PASIVO' },
    { codigo: '2.1.1', nombre: 'Cuentas por Pagar', saldo: 1850, tipo: 'PASIVO', subcuenta: true },
    { codigo: '2.1.2', nombre: 'Sueldos por Pagar', saldo: 2400, tipo: 'PASIVO', subcuenta: true },
    { codigo: '2.1.3', nombre: 'Impuestos por Pagar', saldo: 1200, tipo: 'PASIVO', subcuenta: true },
    { codigo: '2.1.4', nombre: 'Préstamos Corto Plazo', saldo: 5000, tipo: 'PASIVO', subcuenta: true },
    // Pasivo No Corriente
    { codigo: '2.2', nombre: 'PASIVO NO CORRIENTE', saldo: 0, tipo: 'PASIVO' },
    { codigo: '2.2.1', nombre: 'Préstamo Banco Agrícola', saldo: 18000, tipo: 'PASIVO', subcuenta: true },
    { codigo: '2.2.2', nombre: 'Crédito FINPRO', saldo: 8000, tipo: 'PASIVO', subcuenta: true },
  ]);

  const [patrimonio] = useState<CuentaBalance[]>([
    { codigo: '3.1', nombre: 'CAPITAL', saldo: 0, tipo: 'PATRIMONIO' },
    { codigo: '3.1.1', nombre: 'Capital Social', saldo: 50000, tipo: 'PATRIMONIO', subcuenta: true },
    { codigo: '3.1.2', nombre: 'Aporte de Socios', saldo: 10000, tipo: 'PATRIMONIO', subcuenta: true },
    { codigo: '3.2', nombre: 'RESULTADOS', saldo: 0, tipo: 'PATRIMONIO' },
    { codigo: '3.2.1', nombre: 'Resultados Acumulados', saldo: 5250, tipo: 'PATRIMONIO', subcuenta: true },
    { codigo: '3.2.2', nombre: 'Resultado del Ejercicio', saldo: 2900, tipo: 'PATRIMONIO', subcuenta: true },
  ]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const calcularTotal = (cuentas: CuentaBalance[]) => {
    return cuentas
      .filter(c => c.subcuenta)
      .reduce((sum, c) => sum + c.saldo, 0);
  };

  const totalActivos = calcularTotal(activos);
  const totalPasivos = calcularTotal(pasivos);
  const totalPatrimonio = calcularTotal(patrimonio);
  const diferencia = totalActivos - (totalPasivos + totalPatrimonio);

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
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <ScaleIcon className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Balance General</h1>
            <p className="text-gray-500">Estado de Situación Financiera</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Fecha de corte:</label>
          <input
            type="date"
            value={fechaCorte}
            onChange={(e) => setFechaCorte(e.target.value)}
            className="input-field w-40"
          />
        </div>
      </div>

      {/* Encabezado del Balance */}
      <div className="card text-center bg-gradient-to-r from-emerald-50 to-teal-50">
        <h2 className="text-xl font-bold text-gray-900">AGROBOLIVIA S.R.L.</h2>
        <h3 className="text-lg font-semibold text-gray-700">BALANCE GENERAL</h3>
        <p className="text-gray-600">Al {new Date(fechaCorte).toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p className="text-sm text-gray-500">(Expresado en Bolivianos)</p>
      </div>

      {/* Resumen Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-blue-50 border-l-4 border-blue-500">
          <div className="flex items-center gap-2 mb-1">
            <CubeIcon className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-gray-600">Total Activos</p>
          </div>
          <p className="text-2xl font-bold text-blue-700">Bs. {totalActivos.toLocaleString()}</p>
        </div>
        <div className="card bg-red-50 border-l-4 border-red-500">
          <div className="flex items-center gap-2 mb-1">
            <BuildingLibraryIcon className="w-5 h-5 text-red-600" />
            <p className="text-sm text-gray-600">Total Pasivos</p>
          </div>
          <p className="text-2xl font-bold text-red-700">Bs. {totalPasivos.toLocaleString()}</p>
        </div>
        <div className="card bg-green-50 border-l-4 border-green-500">
          <div className="flex items-center gap-2 mb-1">
            <BanknotesIcon className="w-5 h-5 text-green-600" />
            <p className="text-sm text-gray-600">Patrimonio</p>
          </div>
          <p className="text-2xl font-bold text-green-700">Bs. {totalPatrimonio.toLocaleString()}</p>
        </div>
        <div className={`card ${Math.abs(diferencia) < 1 ? 'bg-emerald-50 border-l-4 border-emerald-500' : 'bg-yellow-50 border-l-4 border-yellow-500'}`}>
          <div className="flex items-center gap-2 mb-1">
            <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-600" />
            <p className="text-sm text-gray-600">Ecuación</p>
          </div>
          <p className={`text-sm font-medium ${Math.abs(diferencia) < 1 ? 'text-emerald-700' : 'text-yellow-700'}`}>
            A = P + Pat {Math.abs(diferencia) < 1 ? '✓ Cuadrado' : '⚠ Diferencia: Bs.' + diferencia}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ACTIVOS */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
            ACTIVOS
          </h3>
          <div className="space-y-1">
            {activos.map((cuenta) => (
              <div
                key={cuenta.codigo}
                className={`flex justify-between py-2 ${
                  cuenta.subcuenta ? 'pl-6' : 'font-bold bg-gray-50 -mx-2 px-2'
                }`}
              >
                <div className="flex gap-2">
                  <span className="text-gray-400 text-sm">{cuenta.codigo}</span>
                  <span className={cuenta.subcuenta ? 'text-gray-700' : 'text-gray-900'}>
                    {cuenta.nombre}
                  </span>
                </div>
                {cuenta.subcuenta && (
                  <span className={`font-medium ${cuenta.saldo < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {cuenta.saldo < 0 ? `(${Math.abs(cuenta.saldo).toLocaleString()})` : cuenta.saldo.toLocaleString()}
                  </span>
                )}
              </div>
            ))}
            <div className="flex justify-between py-3 mt-4 border-t-2 border-blue-500 font-bold text-lg">
              <span>TOTAL ACTIVOS</span>
              <span className="text-blue-700">Bs. {totalActivos.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* PASIVOS Y PATRIMONIO */}
        <div className="space-y-6">
          {/* Pasivos */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-red-500">
              PASIVOS
            </h3>
            <div className="space-y-1">
              {pasivos.map((cuenta) => (
                <div
                  key={cuenta.codigo}
                  className={`flex justify-between py-2 ${
                    cuenta.subcuenta ? 'pl-6' : 'font-bold bg-gray-50 -mx-2 px-2'
                  }`}
                >
                  <div className="flex gap-2">
                    <span className="text-gray-400 text-sm">{cuenta.codigo}</span>
                    <span className={cuenta.subcuenta ? 'text-gray-700' : 'text-gray-900'}>
                      {cuenta.nombre}
                    </span>
                  </div>
                  {cuenta.subcuenta && (
                    <span className="font-medium text-gray-900">
                      {cuenta.saldo.toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
              <div className="flex justify-between py-3 mt-4 border-t-2 border-red-500 font-bold">
                <span>TOTAL PASIVOS</span>
                <span className="text-red-700">Bs. {totalPasivos.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Patrimonio */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-green-500">
              PATRIMONIO
            </h3>
            <div className="space-y-1">
              {patrimonio.map((cuenta) => (
                <div
                  key={cuenta.codigo}
                  className={`flex justify-between py-2 ${
                    cuenta.subcuenta ? 'pl-6' : 'font-bold bg-gray-50 -mx-2 px-2'
                  }`}
                >
                  <div className="flex gap-2">
                    <span className="text-gray-400 text-sm">{cuenta.codigo}</span>
                    <span className={cuenta.subcuenta ? 'text-gray-700' : 'text-gray-900'}>
                      {cuenta.nombre}
                    </span>
                  </div>
                  {cuenta.subcuenta && (
                    <span className="font-medium text-gray-900">
                      {cuenta.saldo.toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
              <div className="flex justify-between py-3 mt-4 border-t-2 border-green-500 font-bold">
                <span>TOTAL PATRIMONIO</span>
                <span className="text-green-700">Bs. {totalPatrimonio.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Total Pasivo + Patrimonio */}
          <div className="card bg-gradient-to-r from-purple-50 to-indigo-50">
            <div className="flex justify-between py-2 font-bold text-lg">
              <span>TOTAL PASIVO + PATRIMONIO</span>
              <span className="text-purple-700">Bs. {(totalPasivos + totalPatrimonio).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Indicadores Financieros */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DocumentTextIcon className="w-5 h-5 text-gray-600" />
          Indicadores Financieros
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Razón Corriente</p>
            <p className="text-xl font-bold text-gray-900">
              {(calcularTotal(activos.slice(0, 6)) / calcularTotal(pasivos.slice(0, 5))).toFixed(2)}
            </p>
            <p className="text-xs text-green-600">Buena liquidez</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Endeudamiento</p>
            <p className="text-xl font-bold text-gray-900">
              {((totalPasivos / totalActivos) * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-yellow-600">Nivel moderado</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Solvencia</p>
            <p className="text-xl font-bold text-gray-900">
              {(totalActivos / totalPasivos).toFixed(2)}
            </p>
            <p className="text-xs text-green-600">Empresa solvente</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Capital de Trabajo</p>
            <p className="text-xl font-bold text-gray-900">
              Bs. {(calcularTotal(activos.slice(0, 6)) - calcularTotal(pasivos.slice(0, 5))).toLocaleString()}
            </p>
            <p className="text-xs text-green-600">Positivo</p>
          </div>
        </div>
      </div>

      {/* Nota */}
      <div className="card bg-gray-50 text-sm text-gray-600">
        <p className="font-medium mb-2">Notas al Balance:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Los terrenos agrícolas están valuados al costo histórico según NIC 16.</li>
          <li>La depreciación se calcula por el método de línea recta.</li>
          <li>Los cultivos en proceso se valúan al costo de producción acumulado.</li>
          <li>El inventario de productos se valúa al costo promedio ponderado.</li>
        </ul>
      </div>
    </div>
  );
}
