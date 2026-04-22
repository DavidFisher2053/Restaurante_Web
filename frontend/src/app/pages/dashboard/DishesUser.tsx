import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Filter, Eye, DollarSign, XCircle, ShoppingCart, Trash, Plus, Minus } from 'lucide-react';
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

interface CartItem {
  dishId: number;
  name: string;
  price: number;
  discount: number;
  quantity: number;
  image: string;
}

function mapToUi(row: DishApi, categories: CategoryRow[]): DishUi {
  const cat = categories.find((c) => c.id === row.category_id);
  const label = cat?.category_description ?? `Categoría ${row.category_id}`;
  
  // Las imágenes se sirven desde la raíz /static si row.image ya incluye 'static/'
  // O podemos construir la URL base.
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
  const [listError, setListError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [rows, setRows] = useState<DishApi[]>([]);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [itemQuantities, setItemQuantities] = useState<Record<number, number>>({});

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

  const dishes: DishUi[] = useMemo(
    () => rows.map((r) => mapToUi(r, categories)),
    [rows, categories],
  );

  const addToCart = (dish: DishUi) => {
    const qty = itemQuantities[dish.id] || 1;
    setCart((prev) => {
      const existing = prev.find((item) => item.dishId === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.dishId === dish.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [
        ...prev,
        {
          dishId: dish.id,
          name: dish.name,
          price: dish.price,
          discount: dish.discount,
          quantity: qty,
          image: dish.image,
        },
      ];
    });
    // Reset local quantity for this dish
    setItemQuantities((prev) => ({ ...prev, [dish.id]: 1 }));
  };

  const removeFromCart = (dishId: number) => {
    setCart((prev) => prev.filter((item) => item.dishId !== dishId));
  };

  const updateCartQuantity = (dishId: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.dishId === dishId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const handlePlaceOrder = async () => {
    setListError('');
    try {
      const res = await apiFetch('/orders_user/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((item) => ({ dish_id: item.dishId, amount: item.quantity })),
          place_delivery: 'Local del Restaurante',
        }),
      });
      if (!res.ok) throw new Error(await readApiError(res));
      
      setShowSuccess(true);
      setCart([]);
      setIsCartOpen(false);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'Error al realizar el pedido');
    }
  };

  const cartTotal = cart.reduce((sum, item) => {
    const price = Math.round(item.price * (1 - item.discount / 100));
    return sum + price * item.quantity;
  }, 0);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Nuestros Platos</h1>
          <p className="text-gray-600 mt-1">Explora nuestra selección de exquisita comida europea</p>
        </div>
      </div>

      {listError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">{listError}</div>
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
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setItemQuantities(prev => ({ ...prev, [dish.id]: Math.max(1, (prev[dish.id] || 1) - 1) }))}
                        className="p-1.5 hover:bg-gray-100 text-gray-600"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={itemQuantities[dish.id] || 1}
                        onChange={(e) => setItemQuantities(prev => ({ ...prev, [dish.id]: Math.max(1, parseInt(e.target.value) || 1) }))}
                        className="w-10 text-center border-x border-gray-300 py-1 text-sm focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setItemQuantities(prev => ({ ...prev, [dish.id]: (prev[dish.id] || 1) + 1 }))}
                        className="p-1.5 hover:bg-gray-100 text-gray-600"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      disabled={dish.status !== 'Disponible'}
                      onClick={() => addToCart(dish)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Añadir al Carrito
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewDish(dish)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Detalles
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

      {/* Floating Cart Button */}
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-110 z-40 flex items-center gap-2"
      >
        <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          {cartItemsCount > 0 && (
            <span className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
              {cartItemsCount}
            </span>
          )}
        </div>
        <span className="font-semibold hidden sm:inline">Carrito</span>
      </button>

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                Tu Carrito
              </h2>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="text-lg font-medium">Tu carrito está vacío</p>
                  <p className="text-sm">¡Añade algunos platos deliciosos!</p>
                </div>
              ) : (
                cart.map((item) => {
                  const unitPrice = Math.round(item.price * (1 - item.discount / 100));
                  return (
                    <div key={item.dishId} className="flex gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <button
                            onClick={() => removeFromCart(item.dishId)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-500">${unitPrice} por unidad</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white">
                            <button
                              onClick={() => updateCartQuantity(item.dishId, -1)}
                              className="p-1 hover:bg-gray-100 text-gray-600"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 py-1 text-sm font-medium w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.dishId, 1)}
                              className="p-1 hover:bg-gray-100 text-gray-600"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="font-bold text-gray-900">${unitPrice * item.quantity}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t bg-gray-50 rounded-b-lg">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600 font-medium text-lg">Total a pagar:</span>
                <span className="text-3xl font-bold text-blue-600">${cartTotal}</span>
              </div>
              <button
                disabled={cart.length === 0}
                onClick={handlePlaceOrder}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                Realizar Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
