import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  CubeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface ItemInventario {
  id: string;
  nombre: string;
  categoria: string;
  cantidad: number;
  unidad: string;
  stockMinimo: number;
  ubicacion?: string;
  fechaVencimiento?: string;
  notas?: string;
}

export default function Inventario() {
  const [items, setItems] = useState<ItemInventario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMovimientoModal, setShowMovimientoModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemInventario | null>(null);
  const [filtro, setFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'INSUMOS',
    cantidad: '',
    unidad: 'KG',
    stockMinimo: '',
    ubicacion: '',
    fechaVencimiento: '',
    notas: '',
  });

  const [movimientoData, setMovimientoData] = useState({
    tipo: 'ENTRADA' as 'ENTRADA' | 'SALIDA',
    cantidad: '',
    motivo: '',
  });

  const categorias = [
    'INSUMOS',
    'SEMILLAS',
    'FERTILIZANTES',
    'HERRAMIENTAS',
    'COSECHA',
    'OTROS',
  ];

  const unidades = ['KG', 'LB', 'UNIDAD', 'LITRO', 'SACO', 'CAJA', 'QUINTAL'];

  useEffect(() => {
    loadInventario();
  }, []);

  const loadInventario = async () => {
    try {
      const response = await api.get('/inventario');
      setItems(response.data.data || []);
    } catch (error) {
      console.error('Error loading inventario:', error);
      // Datos de ejemplo
      setItems([
        { id: '1', nombre: 'Semilla Papa Huaycha', categoria: 'SEMILLAS', cantidad: 50, unidad: 'KG', stockMinimo: 20, ubicacion: 'Almacén 1' },
        { id: '2', nombre: 'Abono Orgánico', categoria: 'FERTILIZANTES', cantidad: 100, unidad: 'KG', stockMinimo: 30, ubicacion: 'Almacén 1' },
        { id: '3', nombre: 'Sulfato de Potasio', categoria: 'FERTILIZANTES', cantidad: 15, unidad: 'KG', stockMinimo: 10, ubicacion: 'Almacén 2' },
        { id: '4', nombre: 'Azadón', categoria: 'HERRAMIENTAS', cantidad: 5, unidad: 'UNIDAD', stockMinimo: 2 },
        { id: '5', nombre: 'Papa (Cosecha)', categoria: 'COSECHA', cantidad: 200, unidad: 'KG', stockMinimo: 0 },
        { id: '6', nombre: 'Haba (Cosecha)', categoria: 'COSECHA', cantidad: 80, unidad: 'KG', stockMinimo: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await api.put(`/inventario/${selectedItem.id}`, formData);
        toast.success('Item actualizado');
      } else {
        await api.post('/inventario', {
          ...formData,
          cantidad: parseFloat(formData.cantidad),
          stockMinimo: parseFloat(formData.stockMinimo) || 0,
        });
        toast.success('Item agregado');
      }
      loadInventario();
      closeModal();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleMovimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    
    try {
      await api.post(`/inventario/${selectedItem.id}/movimiento`, {
        tipo: movimientoData.tipo,
        cantidad: parseFloat(movimientoData.cantidad),
        motivo: movimientoData.motivo,
      });
      toast.success(`${movimientoData.tipo === 'ENTRADA' ? 'Entrada' : 'Salida'} registrada`);
      loadInventario();
      setShowMovimientoModal(false);
      setMovimientoData({ tipo: 'ENTRADA', cantidad: '', motivo: '' });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al registrar movimiento');
    }
  };

  const openModal = (item?: ItemInventario) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        nombre: item.nombre,
        categoria: item.categoria,
        cantidad: item.cantidad.toString(),
        unidad: item.unidad,
        stockMinimo: item.stockMinimo.toString(),
        ubicacion: item.ubicacion || '',
        fechaVencimiento: item.fechaVencimiento || '',
        notas: item.notas || '',
      });
    } else {
      setSelectedItem(null);
      setFormData({
        nombre: '',
        categoria: 'INSUMOS',
        cantidad: '',
        unidad: 'KG',
        stockMinimo: '',
        ubicacion: '',
        fechaVencimiento: '',
        notas: '',
      });
    }
    setShowModal(true);
  };

  const openMovimientoModal = (item: ItemInventario) => {
    setSelectedItem(item);
    setShowMovimientoModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const filteredItems = items.filter((item) => {
    const matchesNombre = item.nombre.toLowerCase().includes(filtro.toLowerCase());
    const matchesCategoria = !categoriaFiltro || item.categoria === categoriaFiltro;
    return matchesNombre && matchesCategoria;
  });

  const getStockStatus = (item: ItemInventario) => {
    if (item.cantidad <= 0) return { color: 'bg-red-100 text-red-800', text: 'Sin stock' };
    if (item.cantidad <= item.stockMinimo) return { color: 'bg-yellow-100 text-yellow-800', text: 'Stock bajo' };
    return { color: 'bg-green-100 text-green-800', text: 'OK' };
  };

  const getCategoriaIcon = (categoria: string) => {
    const icons: Record<string, string> = {
      SEMILLAS: '🌱',
      FERTILIZANTES: '🧪',
      HERRAMIENTAS: '🔧',
      COSECHA: '🌾',
      INSUMOS: '📦',
      OTROS: '📋',
    };
    return icons[categoria] || '📦';
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
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-500">Gestiona tus insumos, semillas y productos</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Nuevo Item
        </button>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              className="input pl-10"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
          <select
            className="input w-auto"
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-gray-900">{items.length}</p>
          <p className="text-sm text-gray-500">Total Items</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">
            {items.filter((i) => i.cantidad > i.stockMinimo).length}
          </p>
          <p className="text-sm text-gray-500">Stock OK</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-yellow-600">
            {items.filter((i) => i.cantidad > 0 && i.cantidad <= i.stockMinimo).length}
          </p>
          <p className="text-sm text-gray-500">Stock Bajo</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-red-600">
            {items.filter((i) => i.cantidad <= 0).length}
          </p>
          <p className="text-sm text-gray-500">Sin Stock</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Categoría</th>
                <th>Cantidad</th>
                <th>Stock Mínimo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map((item) => {
                const status = getStockStatus(item);
                return (
                  <tr key={item.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getCategoriaIcon(item.categoria)}</span>
                        <div>
                          <p className="font-medium text-gray-900">{item.nombre}</p>
                          {item.ubicacion && (
                            <p className="text-xs text-gray-500">{item.ubicacion}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-gray-100 text-gray-800">{item.categoria}</span>
                    </td>
                    <td className="font-medium">
                      {item.cantidad} {item.unidad}
                    </td>
                    <td className="text-gray-500">
                      {item.stockMinimo} {item.unidad}
                    </td>
                    <td>
                      <span className={`badge ${status.color}`}>{status.text}</span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openMovimientoModal(item)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Registrar movimiento"
                        >
                          <ArrowUpIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal(item)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                          title="Editar"
                        >
                          <CubeIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <CubeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay items</h3>
          <p className="text-gray-500 mb-4">Agrega tu primer item al inventario</p>
          <button onClick={() => openModal()} className="btn-primary">
            Agregar Item
          </button>
        </div>
      )}

      {/* Modal Nuevo/Editar Item */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500/75" onClick={closeModal} />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {selectedItem ? 'Editar Item' : 'Nuevo Item'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                    <select
                      className="input"
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    >
                      {categorias.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unidad *</label>
                    <select
                      className="input"
                      value={formData.unidad}
                      onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                    >
                      {unidades.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={formData.cantidad}
                      onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={formData.stockMinimo}
                      onChange={(e) => setFormData({ ...formData, stockMinimo: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Ej: Almacén 1"
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    {selectedItem ? 'Guardar' : 'Agregar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Movimiento */}
      {showMovimientoModal && selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500/75" onClick={() => setShowMovimientoModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Registrar Movimiento</h2>
              <p className="text-gray-500 mb-6">{selectedItem.nombre}</p>

              <form onSubmit={handleMovimiento} className="space-y-4">
                <div className="flex gap-4">
                  <button
                    type="button"
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      movimientoData.tipo === 'ENTRADA'
                        ? 'bg-green-100 text-green-800 border-2 border-green-500'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                    onClick={() => setMovimientoData({ ...movimientoData, tipo: 'ENTRADA' })}
                  >
                    <ArrowUpIcon className="w-5 h-5" />
                    Entrada
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      movimientoData.tipo === 'SALIDA'
                        ? 'bg-red-100 text-red-800 border-2 border-red-500'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                    onClick={() => setMovimientoData({ ...movimientoData, tipo: 'SALIDA' })}
                  >
                    <ArrowDownIcon className="w-5 h-5" />
                    Salida
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad ({selectedItem.unidad}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={movimientoData.cantidad}
                    onChange={(e) => setMovimientoData({ ...movimientoData, cantidad: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Stock actual: {selectedItem.cantidad} {selectedItem.unidad}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Ej: Compra de insumos"
                    value={movimientoData.motivo}
                    onChange={(e) => setMovimientoData({ ...movimientoData, motivo: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowMovimientoModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    Registrar
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
