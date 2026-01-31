import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Parcelas from './pages/Parcelas';
import Finanzas from './pages/Finanzas';
import Inventario from './pages/Inventario';
import IoT from './pages/IoT';
import Alertas from './pages/Alertas';
import Security from './pages/Security';
import Perfil from './pages/Perfil';

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
        <Route path="finanzas" element={<Finanzas />} />
        <Route path="inventario" element={<Inventario />} />
        <Route path="iot" element={<IoT />} />
        <Route path="alertas" element={<Alertas />} />
        <Route path="seguridad" element={<Security />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
