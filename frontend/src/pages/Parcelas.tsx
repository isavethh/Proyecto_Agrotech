import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

interface Parcela {
  id: string;
  nombre: string;
  ubicacion: string;
  areaHectareas: number;
  tipoSuelo?: string;
  latitud?: number;
  longitud?: number;
  altitud?: number;
  activa: boolean;
  cultivos?: Cultivo[];
  sensores?: { id: string }[];
}

interface Cultivo {
  id: string;
  nombre: string;
  variedad?: string;
  estado: string;
  fechaSiembra: string;
  fechaCosechaEstimada?: string;
}

export default function Parcelas() {
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedParcela, setSelectedParcela] = useState<Parcela | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    areaHectareas: '',
    tipoSuelo: '',
    latitud: '',
    longitud: '',
    altitud: '',
  });

  useEffect(() => {
    loadParcelas();
  }, []);

  const loadParcelas = async () => {
    try {
      const response = await api.get('/parcelas');
      setParcelas(response.data.data || []);
    } catch (error) {
      console.error('Error loading parcelas:', error);
      // Datos de ejemplo si falla
      setParcelas([
        {
          id: '1',
          nombre: 'Parcela Norte',
          ubicacion: 'Achocalla, La Paz',
          areaHectareas: 1,
          tipoSuelo: 'Franco arcilloso',
          altitud: 3800,
          activa: true,
          cultivos: [
            { id: '1', nombre: 'Papa', variedad: 'Huaycha', estado: 'CRECIMIENTO', fechaSiembra: '2024-01-15' },
          ],
        },
        {
          id: '2',
          nombre: 'Parcela Sur',
          ubicacion: 'Achocalla, La Paz',
          areaHectareas: 0.5,
          tipoSuelo: 'Franco arenoso',
          altitud: 3790,
          activa: true,
          cultivos: [
            { id: '2', nombre: 'Haba', variedad: 'Criolla', estado: 'FLORACION', fechaSiembra: '2024-02-01' },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedParcela) {
        await api.put(`/parcelas/${selectedParcela.id}`, formData);
        toast.success('Parcela actualizada');
      } else {
        await api.post('/parcelas', formData);
        toast.success('Parcela creada');
      }
      loadParcelas();
      closeModal();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta parcela?')) return;
    try {
      await api.delete(`/parcelas/${id}`);
      toast.success('Parcela eliminada');
      loadParcelas();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const openModal = (parcela?: Parcela) => {
    if (parcela) {
      setSelectedParcela(parcela);
      setFormData({
        nombre: parcela.nombre,
        ubicacion: parcela.ubicacion,
        areaHectareas: parcela.areaHectareas.toString(),
        tipoSuelo: parcela.tipoSuelo || '',
        latitud: parcela.latitud?.toString() || '',
        longitud: parcela.longitud?.toString() || '',
        altitud: parcela.altitud?.toString() || '',
      });
    } else {
      setSelectedParcela(null);
      setFormData({
        nombre: '',
        ubicacion: '',
        areaHectareas: '',
        tipoSuelo: '',
        latitud: '',
        longitud: '',
        altitud: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedParcela(null);
  };

  const getEstadoColor = (estado: string) => {
    const colors: Record<string, string> = {
      SEMBRADO: 'bg-blue-100 text-blue-800',
      GERMINACION: 'bg-green-100 text-green-800',
      CRECIMIENTO: 'bg-emerald-100 text-emerald-800',
      FLORACION: 'bg-pink-100 text-pink-800',
      MADURACION: 'bg-yellow-100 text-yellow-800',
      COSECHADO: 'bg-orange-100 text-orange-800',
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Parcelas</h1>
          <p className="text-gray-500">Gestiona tus parcelas y cultivos</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Nueva Parcela
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <p className="text-sm opacity-90">Total Parcelas</p>
          <p className="text-3xl font-bold">{parcelas.length}</p>
        </div>
        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <p className="text-sm opacity-90">Área Total</p>
          <p className="text-3xl font-bold">
            {parcelas.reduce((sum, p) => sum + p.areaHectareas, 0).toFixed(2)} ha
          </p>
        </div>
        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <p className="text-sm opacity-90">Cultivos Activos</p>
          <p className="text-3xl font-bold">
            {parcelas.reduce((sum, p) => sum + (p.cultivos?.length || 0), 0)}
          </p>
        </div>
      </div>

      {/* Parcelas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parcelas.map((parcela) => (
          <div key={parcela.id} className="card card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <MapPinIcon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{parcela.nombre}</h3>
                  <p className="text-sm text-gray-500">{parcela.ubicacion}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openModal(parcela)}
                  className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(parcela.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Área:</span>
                <span className="font-medium">{parcela.areaHectareas} hectáreas</span>
              </div>
              {parcela.tipoSuelo && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Suelo:</span>
                  <span className="font-medium">{parcela.tipoSuelo}</span>
                </div>
              )}
              {parcela.altitud && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Altitud:</span>
                  <span className="font-medium">{parcela.altitud} msnm</span>
                </div>
              )}
            </div>

            {/* Cultivos */}
            {parcela.cultivos && parcela.cultivos.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-2">Cultivos:</p>
                <div className="space-y-2">
                  {parcela.cultivos.map((cultivo) => (
                    <div key={cultivo.id} className="flex items-center justify-between">
                      <span className="text-sm">
                        🌱 {cultivo.nombre} {cultivo.variedad && `(${cultivo.variedad})`}
                      </span>
                      <span className={`badge ${getEstadoColor(cultivo.estado)}`}>
                        {cultivo.estado}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button className="w-full mt-4 btn-secondary flex items-center justify-center gap-2">
              <EyeIcon className="w-4 h-4" />
              Ver Detalles
            </button>
          </div>
        ))}
      </div>

      {parcelas.length === 0 && (
        <div className="text-center py-12">
          <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes parcelas</h3>
          <p className="text-gray-500 mb-4">Comienza agregando tu primera parcela</p>
          <button onClick={() => openModal()} className="btn-primary">
            Agregar Parcela
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500/75" onClick={closeModal} />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {selectedParcela ? 'Editar Parcela' : 'Nueva Parcela'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicación *
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Área (ha) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={formData.areaHectareas}
                      onChange={(e) => setFormData({ ...formData, areaHectareas: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Suelo
                    </label>
                    <select
                      className="input"
                      value={formData.tipoSuelo}
                      onChange={(e) => setFormData({ ...formData, tipoSuelo: e.target.value })}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Franco">Franco</option>
                      <option value="Franco arcilloso">Franco arcilloso</option>
                      <option value="Franco arenoso">Franco arenoso</option>
                      <option value="Arcilloso">Arcilloso</option>
                      <option value="Arenoso">Arenoso</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Altitud (msnm)
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={formData.altitud}
                    onChange={(e) => setFormData({ ...formData, altitud: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    {selectedParcela ? 'Guardar Cambios' : 'Crear Parcela'}
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
