import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Filter, Calendar, MapPin, Eye, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { apiFetch, readApiError } from '@/lib/api';
import { useOutletContext } from 'react-router';

interface UserInfo {
  id: number;
  user_name: string;
  user_role: number;
  user_full_name?: string;
}

interface OrderApi {
  id: number;
  order_code: string;
  total_price: number;
  place_delivery: string;
  latitude: number | null;
  longitude: number | null;
  creation_time: string;
  delivery_time: string;
  order_state: number;
  pay_method: number;
}

type OrderStatusUi =
  | 'Pendiente'
  | 'En Preparación'
  | 'En Camino'
  | 'Entregado'
  | 'Cancelado'
  | string;

interface OrderItem {
  dish_name: string;
  amount: number;
  price: number;
  total: number;
}

interface OrderUi {
  id: string;
  apiId: number;
  customer: string;
  items: OrderItem[];
  total: number;
  status: OrderStatusUi;
  createdDate: string;
  deliveryDate: string;
  address: string;
  payMethod: number;
  coordinates: { lat: number; lng: number };
}

const DEFAULT_COORDS = { lat: 4.651, lng: -74.083 };

function payMethodLabel(n: number): string {
  const map: Record<number, string> = {
    1: 'Efectivo',
    2: 'Tarjeta de Crédito',
    3: 'Transferencia Bancaria',
    4: 'Nequi/Daviplata',
  };
  return map[n] ?? `Método ${n}`;
}

function orderStateToLabel(n: number): OrderStatusUi {
  const map: Record<number, OrderStatusUi> = {
    0: 'Pendiente',
    1: 'En Preparación',
    2: 'En Camino',
    3: 'Entregado',
    4: 'Cancelado',
  };
  return map[n] ?? `Estado ${n}`;
}

function datePart(raw: string): string {
  if (!raw) return '';
  const t = raw.trim();
  if (t.includes('T')) return t.slice(0, 10);
  return t.length >= 10 ? t.slice(0, 10) : t;
}

function todayLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function Orders() {
  const { user } = useOutletContext<{ user: UserInfo | null }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewOrder, setViewOrder] = useState<OrderUi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<OrderUi[]>([]);

  const itemsPerPage = 8;

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const ordRes = await apiFetch('/orders_user/');
      if (!ordRes.ok) throw new Error(await readApiError(ordRes));
      
      const customerName = user?.user_full_name || user?.user_name || 'Cliente';
      const raw = (await ordRes.json()) as OrderApi[];
      const mapped: OrderUi[] = raw.map((o) => ({
        id: o.order_code || `ORD-${o.id}`,
        apiId: o.id,
        customer: customerName,
        items: [],
        total: o.total_price,
        status: orderStateToLabel(o.order_state),
        createdDate: o.creation_time,
        deliveryDate: o.delivery_time,
        address: o.place_delivery,
        payMethod: o.pay_method,
        coordinates: { 
            lat: o.latitude || DEFAULT_COORDS.lat, 
            lng: o.longitude || DEFAULT_COORDS.lng 
        },
      }));
      setOrders(mapped);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar pedidos');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      const dp = datePart(order.createdDate);
      const matchesDate = !filterDate || dp === filterDate;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchTerm, filterStatus, filterDate]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const today = todayLocal();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return <Clock className="w-4 h-4" />;
      case 'En Preparación':
        return <Package className="w-4 h-4" />;
      case 'En Camino':
        return <Truck className="w-4 h-4" />;
      case 'Entregado':
        return <CheckCircle className="w-4 h-4" />;
      case 'Cancelado':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'En Preparación':
        return 'bg-blue-100 text-blue-800';
      case 'En Camino':
        return 'bg-purple-100 text-purple-800';
      case 'Entregado':
        return 'bg-green-100 text-green-800';
      case 'Cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mis Pedidos</h1>
        <p className="text-gray-600 mt-1">Consulta el historial y estado de tus pedidos</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Pendientes</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {!loading ? orders.filter((o) => o.status === 'Pendiente').length : '—'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">En Preparación</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {!loading ? orders.filter((o) => o.status === 'En Preparación').length : '—'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Truck className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">En Camino</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {!loading ? orders.filter((o) => o.status === 'En Camino').length : '—'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Entregados (hoy)</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {!loading
              ? orders.filter((o) => o.status === 'Entregado' && datePart(o.createdDate) === today).length
              : '—'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número de orden..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="all">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Preparación">En Preparación</option>
              <option value="En Camino">En Camino</option>
              <option value="Entregado">Entregado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Número de Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Creación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Cargando pedidos…
                  </td>
                </tr>
              ) : paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <tr key={order.apiId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono font-medium text-gray-900">{order.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {order.customer
                            .split(/\s+/)
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{order.customer}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">—</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">${order.total}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{order.createdDate}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={() => setViewOrder(order)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm text-accent hover:bg-accent/10 rounded-lg transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-gray-500">No hay pedidos o no coinciden con los filtros</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredOrders.length)} de{' '}
              {filteredOrders.length} pedidos
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
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
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
      </div>

      {viewOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Detalles del Pedido</h2>
                  <p className="text-sm text-gray-600 mt-1">{viewOrder.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Información del Cliente</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Cliente</p>
                      <p className="font-medium text-gray-900">{viewOrder.customer}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Dirección de Entrega</p>
                      <p className="font-medium text-gray-900">{viewOrder.address}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Información del Pedido</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Fecha de Creación</p>
                      <p className="font-medium text-gray-900">{viewOrder.createdDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fecha de Entrega prevista</p>
                      <p className="font-medium text-gray-900">
                        {viewOrder.status === 'Entregado' 
                          ? new Date(viewOrder.deliveryDate).toLocaleString() 
                          : 'Pendiente'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estado</p>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(viewOrder.status)}`}
                      >
                        {getStatusIcon(viewOrder.status)}
                        {viewOrder.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Items del Pedido</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {viewOrder.items.length === 0 ? (
                    <p className="text-sm text-gray-600">
                      El API no devuelve líneas de pedido todavía. Total registrado:{' '}
                      <strong>${viewOrder.total}</strong>
                    </p>
                  ) : (
                    viewOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-900">{item}</span>
                        <span className="text-sm font-medium text-gray-600">1x</span>
                      </div>
                    ))
                  )}
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-blue-600">${viewOrder.total}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Ubicación del Pedido</h3>
                </div>
                <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ height: '300px' }}>
                  <iframe
                    title="mapa"
                    width="100%"
                    height="100%"
                    frameBorder={0}
                    style={{ border: 0 }}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${viewOrder.coordinates.lng - 0.005},${viewOrder.coordinates.lat - 0.005},${viewOrder.coordinates.lng + 0.005},${viewOrder.coordinates.lat + 0.005}&layer=mapnik&marker=${viewOrder.coordinates.lat},${viewOrder.coordinates.lng}`}
                    allowFullScreen
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2 italic">
                  Ubicación exacta basada en coordenadas del pedido: {viewOrder.coordinates.lat.toFixed(4)}, {viewOrder.coordinates.lng.toFixed(4)}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setViewOrder(null)}
                className="px-4 py-2 gradient-accent text-white rounded-lg hover:opacity-90 shadow-accent transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
