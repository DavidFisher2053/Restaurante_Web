import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { clearAccessToken, getAccessToken } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  UtensilsCrossed,
  ChevronDown,
  Utensils,
  ShoppingBag,
} from 'lucide-react';

interface UserInfo {
  id: number;
  user_name: string;
  user_role: number;
  user_full_name?: string;
}

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      navigate('/', { replace: true });
      return;
    }

    async function fetchUser() {
      try {
        const res = await apiFetch('/auth/users/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          clearAccessToken();
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [navigate]);

  const allMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: [1, 2] },
    { icon: Utensils, label: 'Platos', path: '/dashboard/dishes', roles: [1] },
    { icon: UtensilsCrossed, label: 'Platos Usuario', path: '/dashboard/dishesusers', roles: [2, 3] },
    { icon: ShoppingBag, label: 'Pedidos', path: '/dashboard/orders', roles: [1] },
    { icon: ShoppingBag, label: 'Pedidos Usuario', path: '/dashboard/ordersusers', roles: [2, 3] },
    { icon: Users, label: 'User Management', path: '/dashboard/users', roles: [1] },
    { icon: FileText, label: 'Reports', path: '/dashboard/reports', roles: [1, 2, 3] },
    { icon: CreditCard, label: 'Payments', path: '/dashboard/payments', roles: [1] },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings', roles: [1, 2, 3] },
  ];

  const menuItems = user 
    ? allMenuItems.filter(item => item.roles.includes(user.user_role))
    : [];

  const handleLogout = () => {
    clearAccessToken();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top App Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30">
        <div className="flex items-center justify-between h-full px-4">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-7 h-7 text-accent" />
              <span className="hidden sm:block text-lg font-semibold text-gray-800">
                Europa Restaurant {user?.user_role === 1 ? 'Admin' : 'Portal'}
              </span>
            </div>
          </div>

          {/* Right: Notifications + Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
              >
                <div className="w-8 h-8 gradient-mixed rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user?.user_name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {user?.user_full_name || user?.user_name}
                </span>
                <ChevronDown className="hidden sm:block w-4 h-4 text-gray-600" />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-20 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-accent/10 text-accent font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
        />
      )}

      {/* Main Content */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet context={{ user }} />
        </div>
      </main>
    </div>
  );
}