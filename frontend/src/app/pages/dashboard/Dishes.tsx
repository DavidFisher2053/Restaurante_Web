import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Filter, Plus, Eye, Edit, DollarSign, Tag, CheckCircle, XCircle } from 'lucide-react';
import { apiFetch, readApiError } from '@/lib/api';

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1765100778802-f684a4b7fd20?w=1080',
  'https://images.unsplash.com/photo-1652690772694-ac68867c30f1?w=1080',
  'https://images.unsplash.com/photo-1575835638288-74138ce93c0e?w=1080',
  'https://images.unsplash.com/photo-1739436776460-35f309e3f887?w=1080',
  'https://images.unsplash.com/photo-1736840334919-aac2d5af73e4?w=1080',
  'https://images.unsplash.com/photo-1648889095175-1757165415e5?w=1080',
];

interface CategoryRow {
  id: number;
  category_description: string | null;
  category_status: boolean;
}

interface DishApi {
  id: number;
  dishes_name: string;
  dishes_description: string | null;
  price: number;
  discount: number | null;
  category_id: number;
  dishes_state: boolean;
  image: string | null;
}

interface DishUi {
  id: number;
  name: string;
  description: string;
  price: number;
  discount: number;
  categoryId: number;
  type: string;
  status: 'Disponible' | 'No Disponible';
  image: string;
}

function mapToUi(row: DishApi, categories: CategoryRow[]): DishUi {
  const cat = categories.find((c) => c.id === row.category_id);
  const label = cat?.category_description ?? `Categoría ${row.category_id}`;
  
  const img = row.image 
    ? `/${row.image}` 
    : PLACEHOLDER_IMAGES[row.id % PLACEHOLDER_IMAGES.length];
    
  return {
    id: row.id,
    name: row.dishes_name,
    description: row.dishes_description ?? '',
    price: row.price,
    discount: row.discount ?? 0,
    categoryId: row.category_id,
    type: label,
    status: row.dishes_state ? 'Disponible' : 'No Disponible',
    image: img,
  };
}

export default function Dishes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPrice, setFilterPrice] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewDish, setViewDish] = useState<DishUi | null>(null);
  const [editDish, setEditDish] = useState<DishUi | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [listError, setListError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [rows, setRows] = useState<DishApi[]>([]);

  const [editDraft, setEditDraft] = useState({
    name: '',
    description: '',
    price: 0,
    discount: 0,
    categoryId: 1,
    status: 'Disponible' as 'Disponible' | 'No Disponible',
  });

  const [addDraft, setAddDraft] = useState({
    name: '',
    description: '',
    price: 0,
    discount: 0,
    categoryId: 1,
    imageFile: null as File | null,
    imagePreview: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setListError('');
    try {
      const [catRes, dishRes] = await Promise.all([
        apiFetch('/categories/'),
        apiFetch('/products/'),
      ]);
      if (!catRes.ok) throw new Error(await readApiError(catRes));
      if (!dishRes.ok) throw new Error(await readApiError(dishRes));
      const cats = (await catRes.json()) as CategoryRow[];
      const dishes = (await dishRes.json()) as DishApi[];
      setCategories(cats);
      setRows(dishes);
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (categories.length > 0) {
      setAddDraft((d) => ({ ...d, categoryId: categories[0].id }));
    }
  }, [categories]);

  useEffect(() => {
    if (editDish) {
      setEditDraft({
        name: editDish.name,
        description: editDish.description,
        price: editDish.price,
        discount: editDish.discount,
        categoryId: editDish.categoryId,
        status: editDish.status,
      });
    }
  }, [editDish]);

  const dishes: DishUi[] = useMemo(
    () => rows.map((r) => mapToUi(r, categories)),
    [rows, categories],
  );

  const filteredDishes = dishes.filter((dish) => {
    const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === 'all' || String(dish.categoryId) === filterType;
    const matchesStatus = filterStatus === 'all' || dish.status === filterStatus;
    const matchesPrice =
      filterPrice === 'all' ||
      (filterPrice === 'low' && dish.price < 1000) ||
      (filterPrice === 'medium' && dish.price >= 1000 && dish.price < 2000) ||
      (filterPrice === 'high' && dish.price >= 2000);
    return matchesSearch && matchesType && matchesStatus && matchesPrice;
  });

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredDishes.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDishes = filteredDishes.slice(startIndex, startIndex + itemsPerPage);

  const handleSaveEdit = async () => {
    if (!editDish) return;
    setSaving(true);
    setListError('');
    try {
      const res = await apiFetch(`/products/${editDish.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dishes_name: editDraft.name.trim(),
          dishes_description: editDraft.description.trim() || null,
          price: Number(editDraft.price),
          discount: Number(editDraft.discount) || null,
          dishes_state: editDraft.status === 'Disponible',
          category_id: Number(editDraft.categoryId),
        }),
      });
      if (!res.ok) throw new Error(await readApiError(res));
      setShowSuccess(true);
      setEditDish(null);
      await loadData();
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    setListError('');
    try {
      const formData = new FormData();
      formData.append('dishes_name', addDraft.name.trim());
      formData.append('dishes_description', addDraft.description.trim() || '');
      formData.append('price', String(addDraft.price));
      formData.append('discount', String(addDraft.discount || 0));
      formData.append('category_id', String(addDraft.categoryId));
      if (addDraft.imageFile) {
        formData.append('image', addDraft.imageFile);
      }

      const res = await apiFetch('/products/', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(await readApiError(res));
      setShowSuccess(true);
      setShowAdd(false);
      setAddDraft({
        name: '',
        description: '',
        price: 0,
        discount: 0,
        categoryId: categories[0]?.id ?? 1,
        imageFile: null,
        imagePreview: '',
      });
      await loadData();
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'Error al crear');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Platos</h1>
          <p className="text-gray-600 mt-1">Administra el menú del restaurante</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 gradient-vibrant text-white rounded-lg hover:opacity-90 shadow-vibrant transition-all"
        >
          <Plus className="w-4 h-4" />
          Agregar Plato
        </button>
      </div>

      {listError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">{listError}</div>
      )}

      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-800 font-medium">Operación realizada correctamente</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar platos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="all">Todos los tipos</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.category_description ?? `Categoría ${c.id}`}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterPrice}
              onChange={(e) => setFilterPrice(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="all">Todos los precios</option>
              <option value="low">Menos de $1,000</option>
              <option value="medium">$1,000 - $2,000</option>
              <option value="high">Más de $2,000</option>
            </select>
          </div>

          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="all">Todos los estados</option>
              <option value="Disponible">Disponible</option>
              <option value="No Disponible">No Disponible</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">Cargando platos…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedDishes.map((dish) => (
            <div
              key={dish.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative h-48">
                <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                {dish.discount > 0 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    -{dish.discount}%
                  </div>
                )}
                <div
                  className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
                    dish.status === 'Disponible' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {dish.status}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{dish.name}</h3>
                    <p className="text-sm text-gray-500">{dish.type}</p>
                  </div>
                  <div className="text-right">
                    {dish.discount > 0 ? (
                      <>
                        <p className="text-sm text-gray-400 line-through">${dish.price}</p>
                        <p className="text-lg font-bold text-blue-600">
                          ${Math.round(dish.price * (1 - dish.discount / 100))}
                        </p>
                      </>
                    ) : (
                      <p className="text-lg font-bold text-gray-900">${dish.price}</p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{dish.description}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setViewDish(dish)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditDish(dish)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 text-sm transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredDishes.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No se encontraron platos con los filtros seleccionados</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredDishes.length)} de{' '}
            {filteredDishes.length} platos
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    currentPage === page ? 'bg-accent text-white shadow-accent' : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {viewDish && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative h-64">
              <img src={viewDish.image} alt={viewDish.name} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setViewDish(null)}
                className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{viewDish.name}</h2>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      viewDish.status === 'Disponible' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {viewDish.status}
                  </span>
                </div>
                <div className="text-right">
                  {viewDish.discount > 0 ? (
                    <>
                      <p className="text-lg text-gray-400 line-through">${viewDish.price}</p>
                      <p className="text-3xl font-bold text-blue-600">
                        ${Math.round(viewDish.price * (1 - viewDish.discount / 100))}
                      </p>
                      <p className="text-sm text-red-600">-{viewDish.discount}% descuento</p>
                    </>
                  ) : (
                    <p className="text-3xl font-bold text-gray-900">${viewDish.price}</p>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Tipo de Plato</h3>
                  <p className="text-gray-600">{viewDish.type}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
                  <p className="text-gray-600 leading-relaxed">{viewDish.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editDish && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Editar Plato</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={editDraft.name}
                  onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  rows={3}
                  value={editDraft.description}
                  onChange={(e) => setEditDraft((d) => ({ ...d, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Categoría
                </label>
                <select
                  value={editDraft.categoryId}
                  onChange={(e) => setEditDraft((d) => ({ ...d, categoryId: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.category_description ?? `Categoría ${c.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Precio ($)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={editDraft.price}
                  onChange={(e) => setEditDraft((d) => ({ ...d, price: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descuento (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={editDraft.discount}
                  onChange={(e) => setEditDraft((d) => ({ ...d, discount: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={editDraft.status}
                  onChange={(e) =>
                    setEditDraft((d) => ({
                      ...d,
                      status: e.target.value as 'Disponible' | 'No Disponible',
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="Disponible">Disponible</option>
                  <option value="No Disponible">No Disponible</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setEditDish(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleSaveEdit()}
                disabled={saving}
                className="px-4 py-2 gradient-vibrant text-white rounded-lg hover:opacity-90 shadow-vibrant transition-all disabled:opacity-50"
              >
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Nuevo plato</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={addDraft.name}
                  onChange={(e) => setAddDraft((d) => ({ ...d, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  rows={3}
                  value={addDraft.description}
                  onChange={(e) => setAddDraft((d) => ({ ...d, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                <select
                  value={addDraft.categoryId}
                  onChange={(e) => setAddDraft((d) => ({ ...d, categoryId: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.category_description ?? `Categoría ${c.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Precio ($)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={addDraft.price}
                  onChange={(e) => setAddDraft((d) => ({ ...d, price: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descuento (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={addDraft.discount}
                  onChange={(e) => setAddDraft((d) => ({ ...d, discount: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Plato</label>
                <div className="flex flex-col gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setAddDraft((d) => ({
                            ...d,
                            imageFile: file,
                            imagePreview: reader.result as string,
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {addDraft.imagePreview && (
                    <div className="relative h-40 w-full rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={addDraft.imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setAddDraft((d) => ({ ...d, imageFile: null, imagePreview: '' }))}
                        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
                      >
                        <XCircle className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleCreate()}
                disabled={saving || !addDraft.name.trim()}
                className="px-4 py-2 gradient-vibrant text-white rounded-lg hover:opacity-90 shadow-vibrant transition-all disabled:opacity-50"
              >
                {saving ? 'Creando…' : 'Crear plato'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
