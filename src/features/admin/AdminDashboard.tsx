import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Package,
  Users,
  ShoppingCart,
  Store,
  Receipt,
  TrendingUp,
  DollarSign,
  Tag,
  Percent,
  FileText
} from 'lucide-react';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    // In a real app, fetch these stats from the API
    setStats({
      totalProducts: 156,
      totalCustomers: 89,
      totalOrders: 342,
      totalRevenue: 45678.90,
    });
  }, []);

  const quickLinks = [
    {
      title: 'Productos',
      description: 'Gestionar inventario y catálogo',
      icon: Package,
      link: '/admin/products',
      color: 'blue',
    },
    {
      title: 'Clientes',
      description: 'Administrar base de clientes',
      icon: Users,
      link: '/admin/customers',
      color: 'green',
    },
    {
      title: 'Punto de Venta',
      description: 'Procesar ventas',
      icon: ShoppingCart,
      link: '/pos',
      color: 'purple',
    },
    {
      title: 'Locales',
      description: 'Gestionar tiendas',
      icon: Store,
      link: '/admin/stores',
      color: 'orange',
    },
    {
      title: 'Impuestos',
      description: 'Configurar impuestos',
      icon: Receipt,
      link: '/admin/taxes',
      color: 'red',
    },
    {
      title: 'Descuentos',
      description: 'Gestionar promociones',
      icon: Percent,
      link: '/admin/discounts',
      color: 'pink',
    },
    {
      title: 'Cargos',
      description: 'Gestionar cargos adicionales',
      icon: Tag,
      link: '/admin/charges',
      color: 'indigo',
    },
    {
      title: 'Reportes',
      description: 'Ver reportes de ventas',
      icon: FileText,
      link: '/reports',
      color: 'teal',
    },
    {
      title: 'Analytics',
      description: 'Análisis y tendencias',
      icon: TrendingUp,
      link: '/analytics',
      color: 'cyan',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
    pink: 'bg-pink-100 text-pink-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    teal: 'bg-teal-100 text-teal-600',
    cyan: 'bg-cyan-100 text-cyan-600',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Productos</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalProducts}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clientes</p>
              <p className="text-3xl font-bold text-green-600">{stats.totalCustomers}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Órdenes</p>
              <p className="text-3xl font-bold text-purple-600">{stats.totalOrders}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <ShoppingCart className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ingresos Totales</p>
              <p className="text-3xl font-bold text-primary-600">
                ${stats.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="bg-primary-100 p-3 rounded-lg">
              <DollarSign className="h-8 w-8 text-primary-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.link} to={link.link}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${colorClasses[link.color as keyof typeof colorClasses]}`}>
                    <link.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{link.title}</h3>
                    <p className="text-sm text-gray-600">{link.description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card title="Actividad Reciente">
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="bg-green-100 p-2 rounded">
              <ShoppingCart className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Nueva venta procesada</p>
              <p className="text-xs text-gray-500">Hace 5 minutos</p>
            </div>
            <span className="text-sm font-semibold text-gray-900">$125.50</span>
          </div>

          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="bg-blue-100 p-2 rounded">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Producto actualizado</p>
              <p className="text-xs text-gray-500">Hace 15 minutos</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="bg-purple-100 p-2 rounded">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Nuevo cliente registrado</p>
              <p className="text-xs text-gray-500">Hace 30 minutos</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
