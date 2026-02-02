import { useEffect, useRef, useState } from 'react';
import {
  MapPinIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  GlobeAmericasIcon,
  ViewfinderCircleIcon,
  SunIcon,
  CloudIcon,
} from '@heroicons/react/24/outline';

interface Parcela {
  id: string;
  nombre: string;
  latitud?: number;
  longitud?: number;
  tamanioHectareas?: number;
  cultivo?: string;
  estado?: string;
}

interface MapaInteractivoProps {
  parcelas?: Parcela[];
  centroLat?: number;
  centroLng?: number;
  zoom?: number;
  onParcelaClick?: (parcela: Parcela) => void;
  mostrarControles?: boolean;
  altura?: string;
}

export default function MapaInteractivo({
  parcelas = [],
  centroLat: _centroLat = -16.5,
  centroLng: _centroLng = -68.15,
  zoom = 12,
  onParcelaClick,
  mostrarControles = true,
  altura = 'h-96',
}: MapaInteractivoProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [vistaMode, setVistaMode] = useState<'satelite' | 'terreno' | 'hibrido'>('satelite');
  const [selectedParcela, setSelectedParcela] = useState<Parcela | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [climaActual, setClimaActual] = useState({ temp: 18, condicion: 'soleado' });

  // Simular datos de clima
  useEffect(() => {
    const interval = setInterval(() => {
      setClimaActual({
        temp: Math.floor(15 + Math.random() * 10),
        condicion: ['soleado', 'nublado', 'parcial'][Math.floor(Math.random() * 3)],
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleZoomIn = () => setCurrentZoom((z) => Math.min(z + 1, 18));
  const handleZoomOut = () => setCurrentZoom((z) => Math.max(z - 1, 5));

  const handleParcelaClick = (parcela: Parcela) => {
    setSelectedParcela(parcela);
    onParcelaClick?.(parcela);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getEstadoColor = (estado?: string) => {
    const colores: Record<string, string> = {
      'EN_CRECIMIENTO': 'from-green-400 to-green-600',
      'FLORACION': 'from-pink-400 to-pink-600',
      'MADURACION': 'from-yellow-400 to-yellow-600',
      'COSECHADO': 'from-orange-400 to-orange-600',
      'SEMBRADO': 'from-blue-400 to-blue-600',
    };
    return colores[estado || ''] || 'from-green-400 to-green-600';
  };

  // Generar parcelas de ejemplo si no hay
  const parcelasDisplay = parcelas.length > 0 ? parcelas : [
    { id: '1', nombre: 'Parcela Norte', latitud: -16.58, longitud: -68.16, tamanioHectareas: 1.2, cultivo: 'Papa', estado: 'EN_CRECIMIENTO' },
    { id: '2', nombre: 'Parcela Sur', latitud: -16.59, longitud: -68.17, tamanioHectareas: 0.8, cultivo: 'Haba', estado: 'FLORACION' },
    { id: '3', nombre: 'Parcela Este', latitud: -16.575, longitud: -68.14, tamanioHectareas: 1.5, cultivo: 'Quinua', estado: 'SEMBRADO' },
    { id: '4', nombre: 'Parcela Oeste', latitud: -16.585, longitud: -68.18, tamanioHectareas: 0.6, cultivo: 'Maíz', estado: 'MADURACION' },
  ];

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : ''} ${altura} rounded-xl overflow-hidden`}>
      {/* Fondo del mapa simulado */}
      <div
        ref={mapRef}
        className={`absolute inset-0 transition-all duration-500 ${
          vistaMode === 'satelite'
            ? 'bg-gradient-to-br from-green-800 via-green-700 to-emerald-800'
            : vistaMode === 'terreno'
            ? 'bg-gradient-to-br from-amber-200 via-green-300 to-blue-200'
            : 'bg-gradient-to-br from-green-600 via-blue-500 to-green-700'
        }`}
      >
        {/* Texturas de terreno simuladas */}
        <div className="absolute inset-0 opacity-30">
          {/* Ríos */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <path
              d="M0,50 Q100,80 200,60 T400,70 T600,50"
              fill="none"
              stroke="rgba(59, 130, 246, 0.5)"
              strokeWidth="3"
              className="animate-pulse"
            />
            <path
              d="M100,0 Q150,100 120,200 T180,400"
              fill="none"
              stroke="rgba(59, 130, 246, 0.4)"
              strokeWidth="2"
            />
          </svg>
          
          {/* Montañas */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-700 to-transparent opacity-40" />
          
          {/* Nubes animadas */}
          <div className="absolute top-4 left-10 w-20 h-8 bg-white/20 rounded-full blur-xl animate-float" />
          <div className="absolute top-8 right-20 w-32 h-12 bg-white/15 rounded-full blur-xl animate-float-delayed" />
        </div>

        {/* Grid de referencia */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 grid-rows-8 h-full">
            {[...Array(64)].map((_, i) => (
              <div key={i} className="border border-white/20" />
            ))}
          </div>
        </div>

        {/* Marcadores de parcelas */}
        {parcelasDisplay.map((parcela, index) => {
          // Posicionar marcadores de forma relativa
          const left = 20 + (index % 3) * 25 + Math.random() * 10;
          const top = 20 + Math.floor(index / 2) * 25 + Math.random() * 10;
          
          return (
            <div
              key={parcela.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ left: `${left}%`, top: `${top}%` }}
              onClick={() => handleParcelaClick(parcela)}
            >
              {/* Área de la parcela */}
              <div
                className={`w-16 h-16 rounded-lg bg-gradient-to-br ${getEstadoColor(parcela.estado)} 
                  opacity-60 group-hover:opacity-90 transition-all duration-300 transform group-hover:scale-110
                  border-2 border-white/50 shadow-lg animate-pulse-slow`}
                style={{
                  width: `${Math.max(40, (parcela.tamanioHectareas || 1) * 40)}px`,
                  height: `${Math.max(40, (parcela.tamanioHectareas || 1) * 40)}px`,
                }}
              />
              
              {/* Pin central */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <MapPinIcon className="w-8 h-8 text-white drop-shadow-lg group-hover:scale-125 transition-transform" />
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-ping" />
                </div>
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-white rounded-lg shadow-xl p-3 whitespace-nowrap">
                  <p className="font-semibold text-gray-900">{parcela.nombre}</p>
                  <p className="text-sm text-gray-600">🌱 {parcela.cultivo || 'Sin cultivo'}</p>
                  <p className="text-xs text-gray-500">{parcela.tamanioHectareas} ha</p>
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-white" />
              </div>
            </div>
          );
        })}

        {/* Indicador de norte */}
        <div className="absolute top-4 right-4 bg-white/90 rounded-full p-2 shadow-lg">
          <div className="w-8 h-8 relative">
            <span className="absolute top-0 left-1/2 transform -translate-x-1/2 text-xs font-bold text-red-600">N</span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-0.5 h-4 bg-gradient-to-b from-red-600 to-gray-400" />
            </div>
          </div>
        </div>

        {/* Escala */}
        <div className="absolute bottom-4 left-4 bg-white/90 rounded-lg px-3 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-16 h-1 bg-gray-800 relative">
              <div className="absolute left-0 top-0 w-0.5 h-2 bg-gray-800 -translate-y-0.5" />
              <div className="absolute right-0 top-0 w-0.5 h-2 bg-gray-800 -translate-y-0.5" />
            </div>
            <span className="text-xs font-medium text-gray-700">{Math.round(500 / currentZoom)}m</span>
          </div>
        </div>

        {/* Widget de clima */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-lg px-4 py-2 shadow-lg flex items-center gap-3">
          {climaActual.condicion === 'soleado' ? (
            <SunIcon className="w-6 h-6 text-yellow-500 animate-spin-slow" />
          ) : (
            <CloudIcon className="w-6 h-6 text-gray-500" />
          )}
          <div>
            <p className="text-lg font-bold text-gray-900">{climaActual.temp}°C</p>
            <p className="text-xs text-gray-500 capitalize">{climaActual.condicion}</p>
          </div>
        </div>
      </div>

      {/* Controles del mapa */}
      {mostrarControles && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="bg-white hover:bg-gray-100 rounded-lg p-2 shadow-lg transition-colors"
            title="Acercar"
          >
            <span className="text-xl font-bold text-gray-700">+</span>
          </button>
          <div className="bg-white rounded-lg px-2 py-1 shadow-lg text-center">
            <span className="text-xs font-medium text-gray-600">{currentZoom}x</span>
          </div>
          <button
            onClick={handleZoomOut}
            className="bg-white hover:bg-gray-100 rounded-lg p-2 shadow-lg transition-colors"
            title="Alejar"
          >
            <span className="text-xl font-bold text-gray-700">−</span>
          </button>
        </div>
      )}

      {/* Selector de vista */}
      {mostrarControles && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button
            onClick={() => setVistaMode('satelite')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              vistaMode === 'satelite'
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
            }`}
          >
            <GlobeAmericasIcon className="w-4 h-4 inline mr-1" />
            Satélite
          </button>
          <button
            onClick={() => setVistaMode('terreno')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              vistaMode === 'terreno'
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
            }`}
          >
            <ViewfinderCircleIcon className="w-4 h-4 inline mr-1" />
            Terreno
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white rounded-lg shadow hover:bg-gray-100 transition-colors"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? (
              <ArrowsPointingInIcon className="w-5 h-5 text-gray-700" />
            ) : (
              <ArrowsPointingOutIcon className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>
      )}

      {/* Panel de información de parcela seleccionada */}
      {selectedParcela && (
        <div className="absolute left-4 bottom-20 bg-white rounded-xl shadow-2xl p-4 max-w-xs animate-slideUp">
          <button
            onClick={() => setSelectedParcela(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getEstadoColor(selectedParcela.estado)} flex items-center justify-center`}>
              <MapPinIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{selectedParcela.nombre}</h3>
              <p className="text-sm text-gray-500">{selectedParcela.tamanioHectareas} hectáreas</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Cultivo:</span>
              <span className="font-medium">{selectedParcela.cultivo || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Estado:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${getEstadoColor(selectedParcela.estado)} text-white`}>
                {selectedParcela.estado?.replace('_', ' ') || 'N/A'}
              </span>
            </div>
            {selectedParcela.latitud && selectedParcela.longitud && (
              <div className="flex justify-between">
                <span className="text-gray-500">Coordenadas:</span>
                <span className="font-mono text-xs">
                  {selectedParcela.latitud.toFixed(4)}, {selectedParcela.longitud.toFixed(4)}
                </span>
              </div>
            )}
          </div>
          <button className="w-full mt-3 btn-primary text-sm">
            Ver Detalles Completos
          </button>
        </div>
      )}

      {/* Leyenda */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur rounded-lg px-4 py-2 shadow-lg">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-green-400 to-green-600" />
            <span>Crecimiento</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-pink-400 to-pink-600" />
            <span>Floración</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-yellow-400 to-yellow-600" />
            <span>Maduración</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-400 to-blue-600" />
            <span>Sembrado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
