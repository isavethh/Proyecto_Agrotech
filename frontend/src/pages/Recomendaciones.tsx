import { useEffect, useState } from 'react';
import api from '../services/api';
import {
  LightBulbIcon,
  BeakerIcon,
  CloudIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface Recomendacion {
  id: string;
  tipo: 'RIEGO' | 'FERTILIZANTE' | 'COSECHA' | 'CLIMA' | 'MERCADO' | 'PLAGA' | 'GENERAL';
  titulo: string;
  descripcion: string;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  accion?: string;
  impactoEstimado?: string;
  fechaGenerada: string;
  aplicada: boolean;
}

export default function Recomendaciones() {
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>('TODAS');
  const [generandoIA, setGenerandoIA] = useState(false);

  useEffect(() => {
    loadRecomendaciones();
  }, []);

  const loadRecomendaciones = async () => {
    try {
      // En producción, esto vendría del backend
      await api.get('/dashboard');
      // Usar datos de ejemplo por ahora
      setRecomendaciones(getRecomendacionesDemo());
    } catch (error) {
      console.error('Error:', error);
      setRecomendaciones(getRecomendacionesDemo());
    } finally {
      setLoading(false);
    }
  };

  const getRecomendacionesDemo = (): Recomendacion[] => [
    {
      id: '1',
      tipo: 'RIEGO',
      titulo: 'Programar riego para mañana',
      descripcion: 'La humedad del suelo en la Parcela Norte está al 38%, por debajo del óptimo (45-55%). Se recomienda riego de 20mm antes del mediodía.',
      prioridad: 'ALTA',
      accion: 'Activar sistema de riego por goteo',
      impactoEstimado: 'Mejora del 15% en desarrollo del cultivo',
      fechaGenerada: new Date().toISOString(),
      aplicada: false,
    },
    {
      id: '2',
      tipo: 'COSECHA',
      titulo: 'Haba lista para cosecha',
      descripcion: 'El cultivo de Haba en Parcela Sur ha alcanzado madurez óptima. Las condiciones climáticas de los próximos 3 días son favorables para la cosecha.',
      prioridad: 'ALTA',
      accion: 'Planificar jornada de cosecha',
      impactoEstimado: 'Rendimiento estimado: 180-220 kg',
      fechaGenerada: new Date(Date.now() - 86400000).toISOString(),
      aplicada: false,
    },
    {
      id: '3',
      tipo: 'MERCADO',
      titulo: 'Buen momento para vender Papa',
      descripcion: 'El precio de la Papa Huaycha en el mercado de La Paz ha subido un 12% esta semana. Precio actual: Bs. 85/qq. Se espera estabilidad en los próximos 10 días.',
      prioridad: 'MEDIA',
      accion: 'Considerar venta anticipada',
      impactoEstimado: 'Ingreso adicional estimado: Bs. 450',
      fechaGenerada: new Date(Date.now() - 172800000).toISOString(),
      aplicada: false,
    },
    {
      id: '4',
      tipo: 'CLIMA',
      titulo: 'Alerta de helada para el jueves',
      descripcion: 'Se pronostica temperatura mínima de 2°C para el jueves. Los cultivos de Papa son sensibles a heladas. Considerar protección.',
      prioridad: 'ALTA',
      accion: 'Preparar cobertura o riego anti-helada',
      impactoEstimado: 'Prevención de pérdida del 20% del cultivo',
      fechaGenerada: new Date().toISOString(),
      aplicada: false,
    },
    {
      id: '5',
      tipo: 'FERTILIZANTE',
      titulo: 'Aplicar fertilizante foliar',
      descripcion: 'El cultivo de Papa está en etapa de tuberización. Es el momento óptimo para aplicar fertilizante foliar rico en potasio para mejorar el tamaño de los tubérculos.',
      prioridad: 'MEDIA',
      accion: 'Aplicar 2L/ha de fertilizante foliar',
      impactoEstimado: 'Mejora del 10-15% en tamaño de tubérculos',
      fechaGenerada: new Date(Date.now() - 259200000).toISOString(),
      aplicada: true,
    },
    {
      id: '6',
      tipo: 'PLAGA',
      titulo: 'Monitorear presencia de pulgones',
      descripcion: 'Las condiciones actuales (humedad 55%, temp 18°C) son favorables para la aparición de pulgones en cultivos de Haba. Realizar inspección visual.',
      prioridad: 'BAJA',
      accion: 'Inspeccionar hojas y tallos',
      impactoEstimado: 'Detección temprana previene pérdidas',
      fechaGenerada: new Date(Date.now() - 345600000).toISOString(),
      aplicada: false,
    },
    {
      id: '7',
      tipo: 'GENERAL',
      titulo: 'Optimizar rotación de cultivos',
      descripcion: 'Basado en el historial, se sugiere sembrar Quinua en Parcela Norte después de la cosecha de Papa. La rotación Papa→Quinua mejora la salud del suelo.',
      prioridad: 'BAJA',
      accion: 'Planificar siguiente temporada',
      impactoEstimado: 'Mejora del 20% en rendimiento a largo plazo',
      fechaGenerada: new Date(Date.now() - 432000000).toISOString(),
      aplicada: false,
    },
  ];

  const getTipoIcon = (tipo: string) => {
    const icons: Record<string, React.ReactNode> = {
      RIEGO: <BeakerIcon className="w-6 h-6" />,
      FERTILIZANTE: <BeakerIcon className="w-6 h-6" />,
      COSECHA: <CheckCircleIcon className="w-6 h-6" />,
      CLIMA: <CloudIcon className="w-6 h-6" />,
      MERCADO: <CurrencyDollarIcon className="w-6 h-6" />,
      PLAGA: <ExclamationTriangleIcon className="w-6 h-6" />,
      GENERAL: <LightBulbIcon className="w-6 h-6" />,
    };
    return icons[tipo] || <LightBulbIcon className="w-6 h-6" />;
  };

  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      RIEGO: 'bg-blue-100 text-blue-600',
      FERTILIZANTE: 'bg-green-100 text-green-600',
      COSECHA: 'bg-orange-100 text-orange-600',
      CLIMA: 'bg-sky-100 text-sky-600',
      MERCADO: 'bg-yellow-100 text-yellow-600',
      PLAGA: 'bg-red-100 text-red-600',
      GENERAL: 'bg-purple-100 text-purple-600',
    };
    return colors[tipo] || 'bg-gray-100 text-gray-600';
  };

  const getPrioridadColor = (prioridad: string) => {
    const colors: Record<string, string> = {
      ALTA: 'bg-red-100 text-red-800 border-red-200',
      MEDIA: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      BAJA: 'bg-green-100 text-green-800 border-green-200',
    };
    return colors[prioridad] || 'bg-gray-100 text-gray-800';
  };

  const marcarAplicada = (id: string) => {
    setRecomendaciones(prev =>
      prev.map(r => r.id === id ? { ...r, aplicada: true } : r)
    );
  };

  const generarNuevasRecomendaciones = async () => {
    setGenerandoIA(true);
    // Simular llamada a IA
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGenerandoIA(false);
  };

  const recomendacionesFiltradas = recomendaciones.filter(
    r => filtroTipo === 'TODAS' || r.tipo === filtroTipo
  );

  const tiposUnicos = ['TODAS', ...new Set(recomendaciones.map(r => r.tipo))];

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
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <SparklesIcon className="w-8 h-8 text-primary-600" />
            Recomendaciones IA
          </h1>
          <p className="text-gray-500">Sugerencias inteligentes basadas en tus datos agrícolas</p>
        </div>
        <button
          onClick={generarNuevasRecomendaciones}
          disabled={generandoIA}
          className="btn-primary flex items-center gap-2"
        >
          {generandoIA ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Analizando...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              Generar Nuevas
            </>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <p className="text-sm opacity-90">Total Recomendaciones</p>
          <p className="text-3xl font-bold">{recomendaciones.length}</p>
        </div>
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <p className="text-sm opacity-90">Alta Prioridad</p>
          <p className="text-3xl font-bold">{recomendaciones.filter(r => r.prioridad === 'ALTA' && !r.aplicada).length}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-sm opacity-90">Aplicadas</p>
          <p className="text-3xl font-bold">{recomendaciones.filter(r => r.aplicada).length}</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-sm opacity-90">Pendientes</p>
          <p className="text-3xl font-bold">{recomendaciones.filter(r => !r.aplicada).length}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {tiposUnicos.map(tipo => (
          <button
            key={tipo}
            onClick={() => setFiltroTipo(tipo)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filtroTipo === tipo
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tipo === 'TODAS' ? 'Todas' : tipo.charAt(0) + tipo.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Lista de Recomendaciones */}
      <div className="space-y-4">
        {recomendacionesFiltradas.map((rec) => (
          <div
            key={rec.id}
            className={`card border-l-4 ${
              rec.aplicada 
                ? 'border-l-green-500 bg-green-50/50' 
                : rec.prioridad === 'ALTA' 
                  ? 'border-l-red-500' 
                  : rec.prioridad === 'MEDIA' 
                    ? 'border-l-yellow-500' 
                    : 'border-l-blue-500'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getTipoColor(rec.tipo)}`}>
                {getTipoIcon(rec.tipo)}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className={`font-semibold text-gray-900 ${rec.aplicada ? 'line-through opacity-60' : ''}`}>
                    {rec.titulo}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPrioridadColor(rec.prioridad)}`}>
                    {rec.prioridad}
                  </span>
                  {rec.aplicada && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Aplicada
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 mb-3">{rec.descripcion}</p>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  {rec.accion && (
                    <div className="flex items-center gap-1 text-primary-600">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>{rec.accion}</span>
                    </div>
                  )}
                  {rec.impactoEstimado && (
                    <div className="flex items-center gap-1 text-green-600">
                      <ArrowTrendingUpIcon className="w-4 h-4" />
                      <span>{rec.impactoEstimado}</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Generada: {new Date(rec.fechaGenerada).toLocaleDateString('es-BO', { 
                    day: 'numeric', 
                    month: 'short', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>

              {/* Action */}
              {!rec.aplicada && (
                <button
                  onClick={() => marcarAplicada(rec.id)}
                  className="btn-secondary whitespace-nowrap"
                >
                  Marcar como aplicada
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {recomendacionesFiltradas.length === 0 && (
        <div className="text-center py-12">
          <LightBulbIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay recomendaciones de este tipo</p>
        </div>
      )}

      {/* Footer Info */}
      <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
        <div className="flex items-start gap-4">
          <SparklesIcon className="w-8 h-8 text-primary-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-primary-900">¿Cómo funcionan las recomendaciones?</h3>
            <p className="text-sm text-primary-700 mt-1">
              Nuestro sistema de IA analiza los datos de tus sensores IoT, el historial de tus cultivos, 
              las condiciones climáticas y los precios del mercado para generar recomendaciones personalizadas 
              que te ayuden a maximizar tu producción y ganancias.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
