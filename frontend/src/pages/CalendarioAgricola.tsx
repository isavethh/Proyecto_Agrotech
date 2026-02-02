import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  CalendarDaysIcon,
  SunIcon,
  CloudIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface EventoAgricola {
  id: string;
  titulo: string;
  tipo: 'siembra' | 'riego' | 'fertilizacion' | 'cosecha' | 'fumigacion' | 'poda' | 'otro';
  fecha: Date;
  parcela: string;
  cultivo?: string;
  completado: boolean;
  notas?: string;
  prioridad: 'baja' | 'media' | 'alta';
  recordatorio?: boolean;
}

interface FaseLunar {
  fase: 'nueva' | 'creciente' | 'llena' | 'menguante';
  icono: string;
  recomendacion: string;
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const TIPOS_EVENTO = {
  siembra: { color: 'bg-green-500', icono: '🌱', label: 'Siembra' },
  riego: { color: 'bg-blue-500', icono: '💧', label: 'Riego' },
  fertilizacion: { color: 'bg-amber-500', icono: '🧪', label: 'Fertilización' },
  cosecha: { color: 'bg-orange-500', icono: '🌾', label: 'Cosecha' },
  fumigacion: { color: 'bg-purple-500', icono: '🔬', label: 'Fumigación' },
  poda: { color: 'bg-teal-500', icono: '✂️', label: 'Poda' },
  otro: { color: 'bg-gray-500', icono: '📋', label: 'Otro' },
};

export default function CalendarioAgricola() {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [vistaActual, setVistaActual] = useState<'mes' | 'semana' | 'dia'>('mes');
  const [eventos, setEventos] = useState<EventoAgricola[]>([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [nuevoEvento, setNuevoEvento] = useState({
    titulo: '',
    tipo: 'siembra' as EventoAgricola['tipo'],
    parcela: '',
    cultivo: '',
    notas: '',
    prioridad: 'media' as EventoAgricola['prioridad'],
    recordatorio: true,
  });

  // Cargar eventos de ejemplo
  useEffect(() => {
    const hoy = new Date();
    const eventosEjemplo: EventoAgricola[] = [
      {
        id: '1',
        titulo: 'Riego Parcela Norte',
        tipo: 'riego',
        fecha: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1),
        parcela: 'Parcela Norte',
        cultivo: 'Papa',
        completado: false,
        prioridad: 'alta',
        recordatorio: true,
      },
      {
        id: '2',
        titulo: 'Fertilización quincenal',
        tipo: 'fertilizacion',
        fecha: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 3),
        parcela: 'Parcela Sur',
        cultivo: 'Haba',
        completado: false,
        prioridad: 'media',
      },
      {
        id: '3',
        titulo: 'Cosecha de quinua',
        tipo: 'cosecha',
        fecha: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 7),
        parcela: 'Parcela Este',
        cultivo: 'Quinua',
        completado: false,
        prioridad: 'alta',
        notas: 'Preparar sacos y transporte',
      },
      {
        id: '4',
        titulo: 'Siembra de zanahoria',
        tipo: 'siembra',
        fecha: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 5),
        parcela: 'Parcela Oeste',
        completado: false,
        prioridad: 'media',
      },
      {
        id: '5',
        titulo: 'Fumigación preventiva',
        tipo: 'fumigacion',
        fecha: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 10),
        parcela: 'Todas',
        completado: false,
        prioridad: 'baja',
      },
      {
        id: '6',
        titulo: 'Riego completado',
        tipo: 'riego',
        fecha: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 1),
        parcela: 'Parcela Norte',
        completado: true,
        prioridad: 'media',
      },
    ];
    setEventos(eventosEjemplo);
  }, []);

  // Calcular fase lunar (simplificado)
  const getFaseLunar = (fecha: Date): FaseLunar => {
    const cicloLunar = 29.5;
    const referencia = new Date(2000, 0, 6); // Luna nueva conocida
    const dias = Math.floor((fecha.getTime() - referencia.getTime()) / (1000 * 60 * 60 * 24));
    const fase = (dias % cicloLunar) / cicloLunar;

    if (fase < 0.125) return { fase: 'nueva', icono: '🌑', recomendacion: 'Ideal para preparar terreno y planificar' };
    if (fase < 0.375) return { fase: 'creciente', icono: '🌓', recomendacion: 'Buen momento para sembrar cultivos de hoja' };
    if (fase < 0.625) return { fase: 'llena', icono: '🌕', recomendacion: 'Momento óptimo para cosechar y podar' };
    return { fase: 'menguante', icono: '🌗', recomendacion: 'Ideal para sembrar tubérculos y raíces' };
  };

  // Generar días del mes
  const getDiasDelMes = () => {
    const año = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasPrevios = primerDia.getDay();
    const totalDias = ultimoDia.getDate();

    const dias: { fecha: Date; esDelMes: boolean }[] = [];

    // Días del mes anterior
    for (let i = diasPrevios - 1; i >= 0; i--) {
      dias.push({
        fecha: new Date(año, mes, -i),
        esDelMes: false,
      });
    }

    // Días del mes actual
    for (let i = 1; i <= totalDias; i++) {
      dias.push({
        fecha: new Date(año, mes, i),
        esDelMes: true,
      });
    }

    // Días del mes siguiente para completar la grilla
    const diasRestantes = 42 - dias.length;
    for (let i = 1; i <= diasRestantes; i++) {
      dias.push({
        fecha: new Date(año, mes + 1, i),
        esDelMes: false,
      });
    }

    return dias;
  };

  // Obtener eventos de un día
  const getEventosDia = (fecha: Date) => {
    return eventos.filter(
      (e) =>
        e.fecha.getDate() === fecha.getDate() &&
        e.fecha.getMonth() === fecha.getMonth() &&
        e.fecha.getFullYear() === fecha.getFullYear()
    );
  };

  // Navegación
  const irMesAnterior = () => {
    setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 1, 1));
  };

  const irMesSiguiente = () => {
    setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 1));
  };

  const irHoy = () => {
    setFechaActual(new Date());
  };

  // Marcar evento como completado
  const toggleCompletado = (id: string) => {
    setEventos(eventos.map(e => 
      e.id === id ? { ...e, completado: !e.completado } : e
    ));
    toast.success('Estado actualizado');
  };

  // Agregar nuevo evento
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diaSeleccionado) return;

    const nuevo: EventoAgricola = {
      id: Date.now().toString(),
      ...nuevoEvento,
      fecha: diaSeleccionado,
      completado: false,
    };
    setEventos([...eventos, nuevo]);
    setShowModal(false);
    setNuevoEvento({
      titulo: '',
      tipo: 'siembra',
      parcela: '',
      cultivo: '',
      notas: '',
      prioridad: 'media',
      recordatorio: true,
    });
    toast.success('Evento agregado al calendario');
  };

  const hoy = new Date();
  const diasDelMes = getDiasDelMes();
  const faseLunar = getFaseLunar(fechaActual);

  // Próximas tareas (próximos 7 días)
  const proximasTareas = eventos
    .filter(e => !e.completado && e.fecha >= hoy && e.fecha <= new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000))
    .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CalendarDaysIcon className="w-7 h-7 text-primary-600" />
              Calendario Agrícola
            </h1>
            <p className="text-gray-500">Planifica siembras, riegos y cosechas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={irHoy} className="btn-secondary text-sm">
            Hoy
          </button>
          <div className="flex rounded-lg overflow-hidden border">
            {(['mes', 'semana', 'dia'] as const).map((vista) => (
              <button
                key={vista}
                onClick={() => setVistaActual(vista)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  vistaActual === vista
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {vista.charAt(0).toUpperCase() + vista.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendario principal */}
        <div className="lg:col-span-3">
          <div className="card">
            {/* Navegación del mes */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={irMesAnterior}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-xl font-bold text-gray-900">
                {MESES[fechaActual.getMonth()]} {fechaActual.getFullYear()}
              </h2>
              <button
                onClick={irMesSiguiente}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DIAS_SEMANA.map((dia) => (
                <div
                  key={dia}
                  className="text-center text-sm font-medium text-gray-500 py-2"
                >
                  {dia}
                </div>
              ))}
            </div>

            {/* Grilla de días */}
            <div className="grid grid-cols-7 gap-1">
              {diasDelMes.map(({ fecha, esDelMes }, index) => {
                const eventosDia = getEventosDia(fecha);
                const esHoy =
                  fecha.getDate() === hoy.getDate() &&
                  fecha.getMonth() === hoy.getMonth() &&
                  fecha.getFullYear() === hoy.getFullYear();
                const esDomingo = fecha.getDay() === 0;

                return (
                  <div
                    key={index}
                    onClick={() => {
                      setDiaSeleccionado(fecha);
                      setShowModal(true);
                    }}
                    className={`min-h-24 p-2 rounded-lg border cursor-pointer transition-all hover:shadow-md hover:border-primary-300 ${
                      esDelMes ? 'bg-white' : 'bg-gray-50 opacity-50'
                    } ${esHoy ? 'ring-2 ring-primary-500 border-primary-500' : 'border-gray-200'}`}
                  >
                    <div className="flex justify-between items-start">
                      <span
                        className={`text-sm font-medium ${
                          esHoy
                            ? 'bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center'
                            : esDomingo
                            ? 'text-red-500'
                            : 'text-gray-700'
                        }`}
                      >
                        {fecha.getDate()}
                      </span>
                      {esDelMes && (
                        <span className="text-xs">{getFaseLunar(fecha).icono}</span>
                      )}
                    </div>
                    {esDelMes && eventosDia.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {eventosDia.slice(0, 2).map((evento) => (
                          <div
                            key={evento.id}
                            className={`text-xs px-1.5 py-0.5 rounded truncate ${
                              evento.completado
                                ? 'bg-gray-200 text-gray-500 line-through'
                                : TIPOS_EVENTO[evento.tipo].color + ' text-white'
                            }`}
                            title={evento.titulo}
                          >
                            {TIPOS_EVENTO[evento.tipo].icono} {evento.titulo}
                          </div>
                        ))}
                        {eventosDia.length > 2 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{eventosDia.length - 2} más
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-4">
          {/* Fase lunar */}
          <div className="card bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
            <h3 className="text-sm font-medium opacity-80 mb-2">Fase Lunar</h3>
            <div className="flex items-center gap-4">
              <span className="text-5xl animate-pulse-slow">{faseLunar.icono}</span>
              <div>
                <p className="font-bold capitalize">{faseLunar.fase}</p>
                <p className="text-xs opacity-80 mt-1">{faseLunar.recomendacion}</p>
              </div>
            </div>
          </div>

          {/* Próximas tareas */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-primary-600" />
              Próximas Tareas
            </h3>
            {proximasTareas.length > 0 ? (
              <div className="space-y-2">
                {proximasTareas.map((tarea) => (
                  <div
                    key={tarea.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      tarea.prioridad === 'alta'
                        ? 'bg-red-50 border-red-500'
                        : tarea.prioridad === 'media'
                        ? 'bg-yellow-50 border-yellow-500'
                        : 'bg-gray-50 border-gray-400'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900 flex items-center gap-1">
                          {TIPOS_EVENTO[tarea.tipo].icono} {tarea.titulo}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          📍 {tarea.parcela}
                          {tarea.cultivo && ` • 🌱 ${tarea.cultivo}`}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          📅 {tarea.fecha.toLocaleDateString('es-BO', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleCompletado(tarea.id)}
                        className="p-1 hover:bg-white rounded transition-colors"
                        title="Marcar como completado"
                      >
                        <CheckCircleIcon className="w-5 h-5 text-gray-400 hover:text-green-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                No hay tareas pendientes próximas
              </p>
            )}
          </div>

          {/* Leyenda */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Tipos de Actividad</h3>
            <div className="space-y-2">
              {Object.entries(TIPOS_EVENTO).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${value.color}`} />
                  <span className="text-sm">{value.icono}</span>
                  <span className="text-sm text-gray-600">{value.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clima de la semana */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CloudIcon className="w-5 h-5 text-blue-500" />
              Clima Semanal
            </h3>
            <div className="grid grid-cols-7 gap-1">
              {[...Array(7)].map((_, i) => {
                const dia = new Date(hoy.getTime() + i * 24 * 60 * 60 * 1000);
                const temp = Math.floor(15 + Math.random() * 10);
                const lluvia = Math.random() > 0.7;
                return (
                  <div key={i} className="text-center">
                    <p className="text-xs text-gray-500">
                      {DIAS_SEMANA[dia.getDay()].slice(0, 1)}
                    </p>
                    <div className="my-1">
                      {lluvia ? (
                        <CloudIcon className="w-5 h-5 mx-auto text-gray-400" />
                      ) : (
                        <SunIcon className="w-5 h-5 mx-auto text-yellow-500" />
                      )}
                    </div>
                    <p className="text-xs font-medium">{temp}°</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para agregar evento */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500/75 transition-opacity" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-slideUp">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Nueva Actividad Agrícola
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                📅 {diaSeleccionado?.toLocaleDateString('es-BO', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Ej: Riego de parcela norte"
                    value={nuevoEvento.titulo}
                    onChange={(e) => setNuevoEvento({ ...nuevoEvento, titulo: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo *
                    </label>
                    <select
                      className="input"
                      value={nuevoEvento.tipo}
                      onChange={(e) => setNuevoEvento({ ...nuevoEvento, tipo: e.target.value as EventoAgricola['tipo'] })}
                    >
                      {Object.entries(TIPOS_EVENTO).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value.icono} {value.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridad
                    </label>
                    <select
                      className="input"
                      value={nuevoEvento.prioridad}
                      onChange={(e) => setNuevoEvento({ ...nuevoEvento, prioridad: e.target.value as EventoAgricola['prioridad'] })}
                    >
                      <option value="baja">🟢 Baja</option>
                      <option value="media">🟡 Media</option>
                      <option value="alta">🔴 Alta</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parcela *
                    </label>
                    <select
                      className="input"
                      value={nuevoEvento.parcela}
                      onChange={(e) => setNuevoEvento({ ...nuevoEvento, parcela: e.target.value })}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Parcela Norte">Parcela Norte</option>
                      <option value="Parcela Sur">Parcela Sur</option>
                      <option value="Parcela Este">Parcela Este</option>
                      <option value="Parcela Oeste">Parcela Oeste</option>
                      <option value="Todas">Todas las parcelas</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cultivo
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Ej: Papa"
                      value={nuevoEvento.cultivo}
                      onChange={(e) => setNuevoEvento({ ...nuevoEvento, cultivo: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas adicionales
                  </label>
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="Instrucciones especiales..."
                    value={nuevoEvento.notas}
                    onChange={(e) => setNuevoEvento({ ...nuevoEvento, notas: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="recordatorio"
                    checked={nuevoEvento.recordatorio}
                    onChange={(e) => setNuevoEvento({ ...nuevoEvento, recordatorio: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="recordatorio" className="text-sm text-gray-600">
                    Enviar recordatorio el día anterior
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    <PlusIcon className="w-5 h-5 inline mr-1" />
                    Agregar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
