import { Users, LogIn, CreditCard, Activity, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiFetch, readApiError } from '@/lib/api';
import { useOutletContext } from 'react-router';

interface UserInfo {
  id: number;
  user_name: string;
  user_full_name?: string;
}

interface Stats {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: any;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

interface ActivityItem {
  user: string;
  action: string;
  time: string;
  type: 'success' | 'info' | 'warning';
}

export default function DashboardOverview() {
  const { user } = useOutletContext<{ user: UserInfo | null }>();
  const [stats, setStats] = useState<Stats[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [usersRes, ordersRes] = await Promise.all([
          apiFetch('/users/'),
          apiFetch('/orders_admin/'),
        ]);

        if (!usersRes.ok) throw new Error(await readApiError(usersRes));
        if (!ordersRes.ok) throw new Error(await readApiError(ordersRes));

        const users = await usersRes.json();
        const orders = await ordersRes.json();

        const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total_price, 0);
        const activeSessions = Math.floor(users.length * 0.12) + 5; // Simulated active sessions

        setStats([
          {
            title: 'Total Users',
            value: users.length.toLocaleString(),
            change: '+12.5%',
            trend: 'up',
            icon: Users,
            color: 'blue',
          },
          {
            title: 'Total Orders',
            value: orders.length.toLocaleString(),
            change: '+8.2%',
            trend: 'up',
            icon: LogIn,
            color: 'green',
          },
          {
            title: 'Total Revenue',
            value: `$${totalRevenue.toLocaleString()}`,
            change: '+15.3%',
            trend: 'up',
            icon: CreditCard,
            color: 'purple',
          },
          {
            title: 'Active Sessions',
            value: activeSessions.toString(),
            change: '+5.3%',
            trend: 'up',
            icon: Activity,
            color: 'orange',
          },
        ]);

        // Map recent orders to activity
        const recent = orders
          .sort((a: any, b: any) => new Date(b.creation_time).getTime() - new Date(a.creation_time).getTime())
          .slice(0, 5)
          .map((order: any) => ({
            user: `Order ${order.order_code || order.id}`,
            action: `New order for $${order.total_price}`,
            time: new Date(order.creation_time).toLocaleTimeString(),
            type: 'success' as const,
          }));
        
        setRecentActivity(recent.length > 0 ? recent : [
          { user: 'System', action: 'No recent orders found', time: 'Now', type: 'info' }
        ]);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {user?.user_full_name || user?.user_name || 'Admin'}! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => {
          const colorClasses = {
            blue: 'bg-accent/10 text-accent',
            green: 'bg-green-50 text-green-600',
            purple: 'bg-purple-50 text-purple-600',
            orange: 'bg-vibrant/10 text-vibrant',
          };

          return (
            <div key={stat.title} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Activity Log</h2>
          <p className="text-sm text-gray-600 mt-1">Recent user activities and system events</p>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivity.map((activity, index) => {
            const typeColors = {
              success: 'bg-green-100 text-green-800',
              info: 'bg-blue-100 text-blue-800',
              warning: 'bg-yellow-100 text-yellow-800',
            };

            return (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-gray-700 font-semibold text-sm">
                      {activity.user.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                      <p className="text-sm text-gray-600">{activity.action}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[activity.type]}`}>
                      {activity.type}
                    </span>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
