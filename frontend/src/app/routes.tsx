import { createBrowserRouter } from 'react-router';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import UserManagement from './pages/dashboard/UserManagement';
import Reports from './pages/dashboard/Reports';
import Payments from './pages/dashboard/Payments';
import Settings from './pages/dashboard/Settings';
import Dishes from './pages/dashboard/Dishes';
import DishesUser from './pages/dashboard/DishesUser';
import Orders from './pages/dashboard/Orders';
import OrdersUser from './pages/dashboard/OrdersUser';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <DashboardOverview />,
      },
      {
        path: 'dishes',
        element: <Dishes />,
      },
      {
        path: 'dishesusers',
        element: <DishesUser />,
      },
      {
        path: 'orders',
        element: <Orders />,
      },
      {
        path: 'ordersusers',
        element: <OrdersUser />,
      },
      {
        path: 'users',
        element: <UserManagement />,
      },
      {
        path: 'reports',
        element: <Reports />,
      },
      {
        path: 'payments',
        element: <Payments />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
]);