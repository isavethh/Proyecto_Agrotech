import { useState, useEffect } from 'react';
import {
  SunIcon,
  CloudIcon,
  MoonIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

interface DiaPronostico {
  fecha: Date;
  tempMax: number;
  tempMin: number;
  condicion: 'soleado' | 'parcialmente_nublado' | 'nublado' | 'lluvia' | 'tormenta' | 'nevada';
  precipitacion: number;
  humedad: number;
  viento: number;
  uv: number;
  alertaHelada: boolean;
  faseLunar: string;
}

interface AlertaClima {
  tipo: 'helada' | 'lluvia_intensa' | 'sequia' | 'granizo' | 'viento';
  mensaje: string;
  severidad: 'baja' | 'media' | 'alta';
  fecha: Date;
}

interface PronosticoClimaProps {
  ubicacion?: string;
  mostrarExtendido?: boolean;
}

const CONDICIONES = {
  soleado: { icono: '☀️', color: 'from-yellow-400 to-orange-400', label: 'Soleado' },
  parcialmente_nublado: { icono: '⛅', color: 'from-blue-300 to-blue-400', label: 'Parcialmente Nublado' },
  nublado: { icono: '☁️', color: 'from-gray-400 to-gray-500', label: 'Nublado' },
  lluvia: { icono: '🌧️', color: 'from-blue-500 to-blue-700', label: 'Lluvia' },
  tormenta: { icono: '⛈️', color: 'from-gray-600 to-purple-700', label: 'Tormenta' },
  nevada: { icono: '❄️', color: 'from-blue-200 to-cyan-300', label: 'Nevada' },
};

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function PronosticoClima({
  ubicacion = 'Achocalla, La Paz',
  mostrarExtendido = true,
}: PronosticoClimaProps) {
  const [pronostico, setPronostico] = useState<DiaPronostico[]>([]);
  const [alertas, setAlertas] = useState<AlertaClima[]>([]);
  const [horaActual, setHoraActual] = useState(new Date());
  const [animando, setAnimando] = useState(false);

  // Generar pronóstico simulado
  useEffect(() => {
    generarPronostico();
    const interval = setInterval(() => setHoraActual(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const generarPronostico = () => {
    setAnimando(true);
    const hoy = new Date();
    const diasPronostico: DiaPronostico[] = [];
    const condiciones: DiaPronostico['condicion'][] = [
      'soleado', 'parcialmente_nublado', 'nublado', 'lluvia', 'soleado', 
      'parcialmente_nublado', 'lluvia', 'soleado', 'parcialmente_nublado', 
      'nublado', 'soleado', 'parcialmente_nublado', 'lluvia', 'soleado'
    ];
    const fasesLunares = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];

    for (let i = 0; i < 14; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() + i);
      
      const tempBase = 18 - Math.abs(7 - i) * 0.5;
      const tempMax = Math.round(tempBase + 5 + Math.random() * 5);
      const tempMin = Math.round(tempBase - 5 - Math.random() * 3);
      
      diasPronostico.push({
        fecha,
        tempMax,
        tempMin,
        condicion: condiciones[i],
        precipitacion: condiciones[i] === 'lluvia' ? Math.round(10 + Math.random() * 30) : 
                       condiciones[i] === 'tormenta' ? Math.round(30 + Math.random() * 40) : 0,
        humedad: Math.round(40 + Math.random() * 40),
        viento: Math.round(5 + Math.random() * 20),
        uv: condiciones[i] === 'soleado' ? Math.round(6 + Math.random() * 5) : Math.round(2 + Math.random() * 3),
        alertaHelada: tempMin <= 2,
        faseLunar: fasesLunares[i % 8],
      });
    }

    setPronostico(diasPronostico);

    // Generar alertas
    const alertasGeneradas: AlertaClima[] = [];
    diasPronostico.forEach(dia => {
      if (dia.alertaHelada) {
        alertasGeneradas.push({
          tipo: 'helada',
          mensaje: `Posible helada el ${DIAS_SEMANA[dia.fecha.getDay()]} - Temperatura mínima de ${dia.tempMin}°C`,
          severidad: dia.tempMin <= 0 ? 'alta' : 'media',
          fecha: dia.fecha,
        });
      }
      if (dia.precipitacion > 25) {
        alertasGeneradas.push({
          tipo: 'lluvia_intensa',
          mensaje: `Lluvia intensa esperada el ${DIAS_SEMANA[dia.fecha.getDay()]} - ${dia.precipitacion}mm`,
          severidad: dia.precipitacion > 40 ? 'alta' : 'media',
          fecha: dia.fecha,
        });
      }
    });
    setAlertas(alertasGeneradas);

    setTimeout(() => setAnimando(false), 500);
  };

  const climaHoy = pronostico[0];
  const esDeNoche = horaActual.getHours() >= 19 || horaActual.getHours() < 6;

  if (!climaHoy) {
    return (
      <div className="card animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${animando ? 'animate-fadeIn' : ''}`}>
      {/* Clima actual */}
      <div className={`card overflow-hidden bg-gradient-to-br ${CONDICIONES[climaHoy.condicion].color} text-white relative`}>
        {/* Animación de fondo */}
        <div className="absolute inset-0 overflow-hidden">
          {climaHoy.condicion === 'soleado' && (
            <>
              <div className="absolute top-4 right-4 w-20 h-20 bg-yellow-300/30 rounded-full blur-xl animate-pulse-slow" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200/20 rounded-full blur-2xl animate-spin-slow" />
            </>
          )}
          {(climaHoy.condicion === 'lluvia' || climaHoy.condicion === 'tormenta') && (
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-0.5 h-8 bg-white/30 animate-rain"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${0.5 + Math.random() * 0.5}s`,
                  }}
                />
              ))}
            </div>
          )}
          {climaHoy.condicion === 'nublado' && (
            <>
              <div className="absolute top-4 left-10 w-32 h-16 bg-white/20 rounded-full blur-xl animate-float" />
              <div className="absolute top-8 right-20 w-40 h-20 bg-white/15 rounded-full blur-xl animate-float-delayed" />
            </>
          )}
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-80 flex items-center gap-1">
                📍 {ubicacion}
              </p>
              <p className="text-xs opacity-60">
                {horaActual.toLocaleDateString('es-BO', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-80">Actualizado</p>
              <p className="text-sm font-medium">
                {horaActual.toLocaleTimeString('es-BO', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-end gap-2">
                <span className="text-6xl font-light">{climaHoy.tempMax}</span>
                <span className="text-2xl mb-2">°C</span>
              </div>
              <p className="text-lg opacity-90">{CONDICIONES[climaHoy.condicion].label}</p>
              <p className="text-sm opacity-70 mt-1">
                Mín: {climaHoy.tempMin}°C | Máx: {climaHoy.tempMax}°C
              </p>
            </div>
            <div className="text-right">
              <span className="text-7xl animate-bounce-slow">{CONDICIONES[climaHoy.condicion].icono}</span>
              {esDeNoche && <span className="text-4xl ml-2">🌙</span>}
            </div>
          </div>

          {/* Métricas adicionales */}
          <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-white/20">
            <div className="text-center">
              <p className="text-2xl">💧</p>
              <p className="text-sm font-medium">{climaHoy.humedad}%</p>
              <p className="text-xs opacity-70">Humedad</p>
            </div>
            <div className="text-center">
              <p className="text-2xl">💨</p>
              <p className="text-sm font-medium">{climaHoy.viento} km/h</p>
              <p className="text-xs opacity-70">Viento</p>
            </div>
            <div className="text-center">
              <p className="text-2xl">🌧️</p>
              <p className="text-sm font-medium">{climaHoy.precipitacion}mm</p>
              <p className="text-xs opacity-70">Precipitación</p>
            </div>
            <div className="text-center">
              <p className="text-2xl">☀️</p>
              <p className="text-sm font-medium">{climaHoy.uv}</p>
              <p className="text-xs opacity-70">Índice UV</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="space-y-2">
          {alertas.slice(0, 3).map((alerta, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg flex items-center gap-3 animate-slideRight ${
                alerta.severidad === 'alta'
                  ? 'bg-red-100 border-l-4 border-red-500'
                  : alerta.severidad === 'media'
                  ? 'bg-yellow-100 border-l-4 border-yellow-500'
                  : 'bg-blue-100 border-l-4 border-blue-500'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ExclamationTriangleIcon className={`w-5 h-5 flex-shrink-0 ${
                alerta.severidad === 'alta' ? 'text-red-600' :
                alerta.severidad === 'media' ? 'text-yellow-600' : 'text-blue-600'
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {alerta.tipo === 'helada' && '🥶'} 
                  {alerta.tipo === 'lluvia_intensa' && '🌊'} 
                  {alerta.mensaje}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                alerta.severidad === 'alta' ? 'bg-red-200 text-red-800' :
                alerta.severidad === 'media' ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-200 text-blue-800'
              }`}>
                {alerta.severidad.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Pronóstico extendido */}
      {mostrarExtendido && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CloudIcon className="w-5 h-5 text-blue-500" />
            Pronóstico 14 días
          </h3>
          <div className="space-y-2">
            {pronostico.map((dia, index) => {
              const esHoy = index === 0;
              const esMañana = index === 1;
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all hover:bg-gray-50 ${
                    esHoy ? 'bg-primary-50 border border-primary-200' : ''
                  } ${dia.alertaHelada ? 'border-l-4 border-blue-400' : ''}`}
                >
                  <div className="flex items-center gap-3 w-32">
                    <span className="text-2xl">{CONDICIONES[dia.condicion].icono}</span>
                    <div>
                      <p className="font-medium text-sm text-gray-900">
                        {esHoy ? 'Hoy' : esMañana ? 'Mañana' : DIAS_SEMANA[dia.fecha.getDay()].slice(0, 3)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {dia.fecha.getDate()}/{dia.fecha.getMonth() + 1}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 mx-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-400 via-green-400 to-red-400 rounded-full"
                          style={{ 
                            marginLeft: `${((dia.tempMin + 10) / 50) * 100}%`,
                            width: `${((dia.tempMax - dia.tempMin) / 50) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-blue-600 font-medium flex items-center gap-1">
                      <ArrowTrendingDownIcon className="w-3 h-3" />
                      {dia.tempMin}°
                    </span>
                    <span className="text-red-600 font-medium flex items-center gap-1">
                      <ArrowTrendingUpIcon className="w-3 h-3" />
                      {dia.tempMax}°
                    </span>
                    {dia.precipitacion > 0 && (
                      <span className="text-blue-500 text-xs">
                        💧 {dia.precipitacion}mm
                      </span>
                    )}
                    {dia.alertaHelada && (
                      <span className="text-blue-600 text-xs animate-pulse" title="Posible helada">
                        ❄️
                      </span>
                    )}
                    <span className="text-lg" title="Fase lunar">{dia.faseLunar}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recomendaciones agrícolas basadas en el clima */}
      <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
        <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
          🌱 Recomendaciones para tu cultivo
        </h3>
        <div className="space-y-2 text-sm text-green-800">
          {climaHoy.condicion === 'soleado' && (
            <p>• ☀️ Día ideal para aplicar fertilizantes foliares. Riega temprano o al atardecer.</p>
          )}
          {climaHoy.precipitacion > 0 && (
            <p>• 🌧️ Se esperan lluvias. Posterga el riego y aprovecha el agua natural.</p>
          )}
          {climaHoy.alertaHelada && (
            <p>• ❄️ <strong>¡Alerta de helada!</strong> Cubre tus cultivos sensibles esta noche.</p>
          )}
          {climaHoy.uv >= 8 && (
            <p>• ☀️ UV muy alto. Evita trasplantar y protege plántulas jóvenes.</p>
          )}
          {climaHoy.humedad > 70 && (
            <p>• 💧 Humedad alta. Vigila hongos y enfermedades en las hojas.</p>
          )}
          {climaHoy.viento > 15 && (
            <p>• 💨 Viento fuerte. Asegura tutores y evita fumigar hoy.</p>
          )}
          <p>• {climaHoy.faseLunar} Luna actual - Buen momento para {
            ['🌑', '🌒'].includes(pronostico[0]?.faseLunar || '') ? 'preparar terreno' :
            ['🌓', '🌔'].includes(pronostico[0]?.faseLunar || '') ? 'sembrar cultivos de hoja' :
            ['🌕', '🌖'].includes(pronostico[0]?.faseLunar || '') ? 'cosechar y podar' :
            'sembrar tubérculos y raíces'
          }</p>
        </div>
      </div>
    </div>
  );
}
