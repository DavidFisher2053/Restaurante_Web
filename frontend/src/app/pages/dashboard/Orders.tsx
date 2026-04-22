import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Filter, Calendar, MapPin, Eye, Package, Truck, CheckCircle, Clock, XCircle, Loader2, Users, Printer, FileText } from 'lucide-react';
import { apiFetch, readApiError } from '@/lib/api';
import React from 'react';

interface OrderApi {
  id: number;
  order_code: string;
  total_price: number;
  place_delivery: string;
  creation_time: string;
  delivery_time: string;
  order_state: number;
  pay_method: number;
}

interface OrderItem {
  dish_name: string;
  amount: number;
  price: number;
  total: number;
}

type OrderStatusUi =
  | 'Pendiente'
  | 'En Preparación'
  | 'En Camino'
  | 'Entregado'
  | 'Cancelado'
  | string;

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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewOrder, setViewOrder] = useState<OrderUi | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<OrderUi[]>([]);

  const itemsPerPage = 8;

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const ordRes = await apiFetch('/orders_admin/');
      if (!ordRes.ok) throw new Error(await readApiError(ordRes));
      
      const raw = (await ordRes.json()) as OrderApi[];
      const mapped: OrderUi[] = raw.map((o) => ({
        id: o.order_code || `ORD-${o.id}`,
        apiId: o.id,
        customer: 'Cliente',
        items: [],
        total: o.total_price,
        status: orderStateToLabel(o.order_state),
        createdDate: o.creation_time,
        deliveryDate: o.delivery_time,
        address: o.place_delivery,
        payMethod: o.pay_method,
        coordinates: DEFAULT_COORDS,
      }));
      setOrders(mapped);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar pedidos');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const loadOrderDetails = async (order: OrderUi) => {
    try {
      const res = await apiFetch(`/orders_admin/${order.apiId}/details`);
      if (!res.ok) throw new Error(await readApiError(res));
      const data = await res.json();
      const updated = { ...order, items: data.items };
      setViewOrder(updated);
    } catch (e) {
      alert('No se pudieron cargar los platos de la orden');
      setViewOrder(order);
    }
  };

  const handlePrintInvoice = (order: OrderUi) => {
    const subtotal = order.total / 1.16;
    const iva = order.total - subtotal;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Factura ${order.id}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; margin: 0; color: #000; }
            .info { display: flex; justify-content: space-between; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; border-bottom: 1px solid #eee; padding: 10px; color: #666; font-size: 12px; text-transform: uppercase; }
            td { padding: 15px 10px; border-bottom: 1px solid #f9f9f9; }
            .totals { float: right; width: 300px; }
            .totals div { display: flex; justify-content: space-between; padding: 5px 0; }
            .grand-total { border-top: 2px solid #eee; margin-top: 10px; padding-top: 10px; font-size: 20px; font-weight: bold; color: #000; }
            .footer { margin-top: 100px; text-align: center; color: #999; font-size: 12px; clear: both; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">Factura Electronica de Venta</h1>
            <p style="margin: 5px 0;">NIT Empresa: 900.123.456-7</p>
            <p style="margin: 5px 0;">Europa Restaurant - Calle Falsa 123, Bogotá</p>
          </div>
          
          <div class="info">
            <div>
              <p><strong>CLIENTE:</strong> ${order.customer}</p>
              <p><strong>DIRECCIÓN:</strong> ${order.address}</p>
            </div>
            <div style="text-align: right">
              <p><strong>NÚMERO:</strong> ${order.id}</p>
              <p><strong>FECHA:</strong> ${new Date(order.createdDate).toLocaleDateString()}</p>
              <p><strong>METODO PAGO:</strong> ${payMethodLabel(order.payMethod)}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Plato</th>
                <th style="text-align: center">Cant.</th>
                <th style="text-align: right">Precio Unit.</th>
                <th style="text-align: right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.dish_name}</td>
                  <td style="text-align: center">${item.amount}</td>
                  <td style="text-align: right">$${Math.round(item.price).toLocaleString()}</td>
                  <td style="text-align: right">$${Math.round(item.total).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div><span>Subtotal:</span> <span>$${Math.round(subtotal).toLocaleString()}</span></div>
            <div><span>IVA (16%):</span> <span>$${Math.round(iva).toLocaleString()}</span></div>
            <div class="grand-total"><span>Total:</span> <span>$${Math.round(order.total).toLocaleString()}</span></div>
          </div>

          <div class="footer">
            <p>Gracias por su compra. Esta es una representación gráfica de una factura electrónica.</p>
          </div>
          
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const updateOrderStatus = async (orderId: number, newStatus: number) => {
    setUpdating(true);
    try {
      const res = await apiFetch(`/orders_admin/${orderId}/status?new_status=${newStatus}`, {
        method: 'PUT',
      });
      if (!res.ok) throw new Error(await readApiError(res));
      
      const updatedStatusLabel = orderStateToLabel(newStatus);
      
      // Actualizar la lista general
      setOrders(prev => prev.map(o => o.apiId === orderId ? { ...o, status: updatedStatusLabel } : o));
      
      // Actualizar el modal si está abierto para esta orden
      if (viewOrder?.apiId === orderId) {
        setViewOrder({ ...viewOrder, status: updatedStatusLabel });
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al actualizar estado');
    } finally {
      setUpdating(false);
    }
  };

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
      case 'Pendiente': return <Clock className="w-4 h-4" />;
      case 'En Preparación': return <Package className="w-4 h-4" />;
      case 'En Camino': return <Truck className="w-4 h-4" />;
      case 'Entregado': return <CheckCircle className="w-4 h-4" />;
      case 'Cancelado': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'En Preparación': return 'bg-blue-100 text-blue-800';
      case 'En Camino': return 'bg-purple-100 text-purple-800';
      case 'Entregado': return 'bg-green-100 text-green-800';
      case 'Cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>
        <p className="text-gray-600 mt-1">Panel de administración para control de estados</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Pendiente', 'En Preparación', 'En Camino', 'Entregado'].map(status => (
          <div key={status} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${getStatusColor(status).split(' ')[0]}`}>
                {(() => {
                  const Icon = getStatusIcon(status);
                  return Icon ? React.cloneElement(Icon as React.ReactElement, { className: 'w-5 h-5 ' + getStatusColor(status).split(' ')[1] }) : null;
                })()}
              </div>
              <h3 className="text-sm font-medium text-gray-600">{status}</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {!loading ? orders.filter((o) => o.status === status).length : '—'}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número o cliente..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orden</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pago</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Cargando pedidos…</td></tr>
              ) : paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <tr key={order.apiId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-mono font-medium text-sm text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{payMethodLabel(order.payMethod)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">${order.total.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}{order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button onClick={() => loadOrderDetails(order)} className="text-accent hover:bg-accent/10 px-3 py-1 rounded-lg text-sm flex items-center gap-1 ml-auto transition-colors">
                        <Eye className="w-4 h-4" /> Detalles
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No se encontraron pedidos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Detalles del Pedido</h2>
                  <p className="text-sm text-gray-500">{viewOrder.id}</p>
                </div>
                <button
                  onClick={() => handlePrintInvoice(viewOrder)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-black transition-all text-xs font-bold"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Factura
                </button>
              </div>
              <button onClick={() => setViewOrder(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" /> Información del Cliente
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Cliente</p>
                      <p className="font-medium text-gray-900">{viewOrder.customer}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Dirección de Entrega</p>
                      <p className="font-medium text-gray-900">{viewOrder.address}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Método de Pago</p>
                      <p className="font-medium text-gray-900">{payMethodLabel(viewOrder.payMethod)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" /> Tiempos y Estado
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Creado</p>
                        <p className="font-medium text-gray-900">{new Date(viewOrder.createdDate).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Estado Actual</p>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(viewOrder.status)}`}>
                          {getStatusIcon(viewOrder.status)}{viewOrder.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" /> Detalle de Platos
                </h3>
                <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-gray-500 font-bold text-[10px] uppercase tracking-widest">
                      <tr>
                        <th className="px-4 py-2 text-left">Plato</th>
                        <th className="px-4 py-2 text-center">Cant.</th>
                        <th className="px-4 py-2 text-right">Unitario</th>
                        <th className="px-4 py-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {viewOrder && viewOrder.items && viewOrder.items.length > 0 ? (
                        viewOrder.items.map((item, idx) => (
                          <tr key={idx} className="bg-white">
                            <td className="px-4 py-3 font-medium text-gray-900">{item.dish_name}</td>
                            <td className="px-4 py-3 text-center text-gray-600">{item.amount}</td>
                            <td className="px-4 py-3 text-right text-gray-600">${item.price.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right font-bold text-gray-900">${item.total.toLocaleString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-gray-400 italic">
                            Cargando detalles de platos...
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50 font-bold border-t border-gray-200">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right text-gray-500">Total a Pagar</td>
                        <td className="px-4 py-3 text-right text-blue-600 text-lg">${viewOrder?.total.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" /> Seguimiento en Tiempo Real
                </h3>
                <div className="relative bg-gray-100 rounded-2xl overflow-hidden shadow-inner" style={{ height: '350px' }}>
                  {/* Route Simulation Overlay */}
                  <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center p-8">
                    <div className="w-full max-w-md bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-2 shadow-lg shadow-blue-200 rotate-3">
                            <Package className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Origen</span>
                        </div>
                        
                        <div className="flex-1 px-6 relative">
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 ease-out relative"
                              style={{ 
                                width: viewOrder.status === 'Entregado' ? '100%' : 
                                       viewOrder.status === 'En Camino' ? '65%' : 
                                       viewOrder.status === 'En Preparación' ? '35%' : '5%' 
                              }}
                            >
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-4 border-indigo-600 rounded-full shadow-lg" />
                            </div>
                          </div>
                          {viewOrder.status === 'En Camino' && (
                            <Truck className="w-7 h-7 text-indigo-600 absolute -top-9 transition-all duration-1000 animate-bounce" 
                              style={{ left: '65%', transform: 'translateX(-50%)' }} 
                            />
                          )}
                        </div>

                        <div className="flex flex-col items-center">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 transition-all duration-500 ${viewOrder.status === 'Entregado' ? 'bg-green-500 text-white shadow-lg shadow-green-200 -rotate-3' : 'bg-gray-100 text-gray-300'}`}>
                            <MapPin className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Destino</span>
                        </div>
                      </div>
                      
                      <div className="text-center space-y-1">
                        <p className="text-lg font-bold text-gray-900 tracking-tight">
                          {viewOrder.status === 'Pendiente' ? 'Confirmando pedido...' :
                           viewOrder.status === 'En Preparación' ? 'Preparando en cocina...' :
                           viewOrder.status === 'En Camino' ? '¡Tu pedido está cerca!' :
                           viewOrder.status === 'Entregado' ? '¡Entregado!' : 'Cancelado'}
                        </p>
                        <p className="text-xs text-gray-500">Estimado: 15-25 min</p>
                      </div>
                    </div>
                  </div>

                  <iframe
                    title="mapa"
                    width="100%"
                    height="100%"
                    frameBorder={0}
                    style={{ border: 0, filter: 'contrast(1.1) brightness(0.9) saturate(0.8)' }}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${((viewOrder?.coordinates?.lng ?? DEFAULT_COORDS.lng) - 0.02).toFixed(4)},${((viewOrder?.coordinates?.lat ?? DEFAULT_COORDS.lat) - 0.02).toFixed(4)},${((viewOrder?.coordinates?.lng ?? DEFAULT_COORDS.lng) + 0.02).toFixed(4)},${((viewOrder?.coordinates?.lat ?? DEFAULT_COORDS.lat) + 0.02).toFixed(4)}&layer=mapnik`}
                    allowFullScreen
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-3 w-full sm:w-auto">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center sm:text-left">Gestionar Estado</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[0, 1, 2, 3, 4].map((s) => {
                    const label = orderStateToLabel(s);
                    // Comparación robusta: normalizamos a minúsculas y quitamos espacios
                    const isActive = viewOrder?.status?.trim().toLowerCase() === label.trim().toLowerCase();
                    return (
                      <button
                        key={s}
                        disabled={updating || !viewOrder}
                        onClick={() => viewOrder && updateOrderStatus(viewOrder.apiId, s)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                          isActive 
                            ? 'bg-gray-900 text-white shadow-xl scale-105' 
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        } disabled:opacity-50`}
                      >
                        {updating && isActive ? (
                          <div className="flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Procesando</span>
                          </div>
                        ) : label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={() => setViewOrder(null)}
                className="w-full sm:w-auto px-8 py-3 bg-white text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm shadow-sm"
              >
                Cerrar Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
