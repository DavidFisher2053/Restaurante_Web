import { useState, useEffect, useCallback } from 'react';
import { FileText, Printer, Download, Filter, Calendar, Search } from 'lucide-react';
import { useOutletContext } from 'react-router';
import { apiFetch, readApiError } from '@/lib/api';
import React from 'react';

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
  creation_time: string;
  delivery_time: string;
  order_state: number;
  pay_method: number;
}

function payMethodLabel(n: number): string {
  const map: Record<number, string> = {
    1: 'Efectivo',
    2: 'Tarjeta de Crédito',
    3: 'Transferencia Bancaria',
    4: 'Nequi/Daviplata',
  };
  return map[n] ?? `Método ${n}`;
}

function orderStateToLabel(n: number): string {
  const map: Record<number, string> = {
    0: 'Pendiente',
    1: 'En Preparación',
    2: 'En Camino',
    3: 'Entregado',
    4: 'Cancelado',
  };
  return map[n] ?? `Estado ${n}`;
}

export default function Reports() {
  const { user } = useOutletContext<{ user: UserInfo | null }>();
  const [orders, setOrders] = useState<OrderApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const endpoint = user.user_role === 1 ? '/orders_admin/' : '/orders_user/';
      const res = await apiFetch(endpoint);
      if (!res.ok) throw new Error(await readApiError(res));
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching orders');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handlePrintAll = () => {
    window.print();
  };

  const handlePrintOrder = (order: OrderApi) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const dateStr = new Date(order.creation_time).toLocaleString();
      const statusLabel = orderStateToLabel(order.order_state);
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Factura - ${order.order_code || order.id}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 0; padding: 40px; }
              .invoice-card { max-width: 800px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
              .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #6366F1; padding-bottom: 20px; margin-bottom: 30px; }
              .logo-container { display: flex; align-items: center; gap: 10px; }
              .logo-text { font-size: 24px; font-bold; color: #6366F1; font-weight: bold; }
              .invoice-title { text-align: right; }
              .invoice-title h1 { margin: 0; color: #6366F1; font-size: 28px; }
              .info-grid { display: grid; grid-cols: 1fr 1fr; display: flex; justify-content: space-between; margin-bottom: 40px; }
              .info-section h3 { margin-top: 0; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
              .info-section p { margin: 5px 0; font-size: 16px; }
              .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              .items-table th { background-color: #f8fafc; text-align: left; padding: 12px; border-bottom: 2px solid #eee; color: #64748b; text-transform: uppercase; font-size: 12px; }
              .items-table td { padding: 12px; border-bottom: 1px solid #eee; }
              .total-section { display: flex; justify-content: flex-end; }
              .total-box { width: 250px; }
              .total-row { display: flex; justify-content: space-between; padding: 10px 0; }
              .total-row.grand-total { border-top: 2px solid #6366F1; margin-top: 10px; padding-top: 15px; font-size: 20px; font-weight: bold; color: #6366F1; }
              .footer { margin-top: 50px; text-align: center; border-top: 1px solid #eee; padding-top: 20px; color: #94a3b8; font-size: 12px; }
              .status-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; background-color: #e0e7ff; color: #4338ca; }
            </style>
          </head>
          <body>
            <div class="invoice-card">
              <div class="header">
                <div class="logo-container">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 2 2 2 4 4-4 4-2 2-2-2-4-4 4-4 2-2Z"/><path d="m11 7-3 3"/><path d="m15 11-3 3"/><path d="m21 3-3 3"/><path d="m17 7-3 3"/><path d="m21 13-8 8-4-4 8-8Z"/></svg>
                  <span class="logo-text">Europa Restaurant</span>
                </div>
                <div class="invoice-title">
                  <h1>FACTURA</h1>
                  <p style="margin: 5px 0; color: #64748b;">${order.order_code || `ORD-${order.id}`}</p>
                </div>
              </div>

              <div class="info-grid">
                <div class="info-section">
                  <h3>CLIENTE</h3>
                  <p><strong>${user?.user_full_name || user?.user_name}</strong></p>
                  <p>${order.place_delivery}</p>
                  <p>Bogotá, Colombia</p>
                </div>
                <div class="info-section" style="text-align: right;">
                  <h3>DETALLES</h3>
                  <p><strong>Fecha:</strong> ${dateStr}</p>
                  <p><strong>Estado:</strong> <span class="status-badge">${statusLabel}</span></p>
                </div>
              </div>

              <table class="items-table">
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th style="text-align: center;">Cantidad</th>
                    <th style="text-align: right;">Precio</th>
                    <th style="text-align: right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Consumo de Restaurante - Pedido ${order.order_code || order.id}</td>
                    <td style="text-align: center;">1</td>
                    <td style="text-align: right;">$${order.total_price.toLocaleString()}</td>
                    <td style="text-align: right;">$${order.total_price.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <div class="total-section">
                <div class="total-box">
                  <div class="total-row">
                    <span>Subtotal</span>
                    <span>$${order.total_price.toLocaleString()}</span>
                  </div>
                  <div class="total-row">
                    <span>Impuestos (0%)</span>
                    <span>$0</span>
                  </div>
                  <div class="total-row grand-total">
                    <span>TOTAL</span>
                    <span>$${order.total_price.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div class="footer">
                <p><strong>Europa Restaurant</strong></p>
                <p>Carrera 13 #82-71, Bogotá, Colombia</p>
                <p>Tel: +57 (601) 123-4567 | www.europarestaurant.co</p>
                <p style="margin-top: 15px;">¡Gracias por su preferencia!</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const filteredOrders = orders.filter(order => 
    (order.order_code?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     order.place_delivery.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reports Module</h1>
          <p className="text-gray-600 mt-1">
            {user?.user_role === 1 ? 'Admin View: All Orders' : 'User View: My Orders'}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handlePrintAll}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Full Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by code or delivery place..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="w-4 h-4" />
            <span>Showing {filteredOrders.length} orders</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Place</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.order_code || `ORD-${order.id}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.creation_time).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {payMethodLabel(order.pay_method)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.place_delivery}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${order.total_price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.order_state === 3 ? 'bg-green-100 text-green-800' :
                        order.order_state === 4 ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {orderStateToLabel(order.order_state)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handlePrintOrder(order)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1 ml-auto"
                      >
                        <Printer className="w-4 h-4" />
                        Print
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          header, aside, .no-print, button, input, .filters-container {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .bg-white {
            box-shadow: none !important;
            border: none !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th, td {
            border: 1px solid #eee !important;
            padding: 8px !important;
          }
        }
      `}</style>
    </div>
  );
}
