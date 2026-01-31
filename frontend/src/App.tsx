import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Parcelas from './pages/Parcelas';
import ParcelaDetalle from './pages/ParcelaDetalle';
import Finanzas from './pages/Finanzas';
import EstadoResultados from './pages/EstadoResultados';
import FlujoCaja from './pages/FlujoCaja';
import CuentasCobrarPagar from './pages/CuentasCobrarPagar';
import CentroCostos from './pages/CentroCostos';
import BalanceGeneral from './pages/BalanceGeneral';
import Reportes from './pages/Reportes';
import LibroDiario from './pages/LibroDiario';
import Inventario from './pages/Inventario';
import IoT from './pages/IoT';
import Alertas from './pages/Alertas';
import Security from './pages/Security';
import Perfil from './pages/Perfil';
import Recomendaciones from './pages/Recomendaciones';

// Componente para rutas protegidas
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// Componente para rutas públicas (redirige si ya está autenticado)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Rutas protegidas con Layout */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="parcelas" element={<Parcelas />} />
        <Route path="parcelas/:id" element={<ParcelaDetalle />} />
        <Route path="finanzas" element={<Finanzas />} />
        <Route path="finanzas/estado-resultados" element={<EstadoResultados />} />
        <Route path="finanzas/flujo-caja" element={<FlujoCaja />} />
        <Route path="finanzas/cuentas" element={<CuentasCobrarPagar />} />
        <Route path="finanzas/centro-costos" element={<CentroCostos />} />
        <Route path="finanzas/balance" element={<BalanceGeneral />} />
        <Route path="finanzas/libro-diario" element={<LibroDiario />} />
        <Route path="finanzas/reportes" element={<Reportes />} />
        <Route path="inventario" element={<Inventario />} />
        <Route path="iot" element={<IoT />} />
        <Route path="alertas" element={<Alertas />} />
        <Route path="recomendaciones" element={<Recomendaciones />} />
        <Route path="seguridad" element={<Security />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
