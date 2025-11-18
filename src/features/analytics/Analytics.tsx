import { useState, useEffect } from 'react';
import { analyticsService } from '@/services/analytics.service';
import { PurchaseTrend } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShoppingBag, Users, Package } from 'lucide-react';
import { format, subDays } from 'date-fns';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function Analytics() {
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [trends, setTrends] = useState<PurchaseTrend[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [categoryAnalytics, setCategoryAnalytics] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const [trendsData, productsData, categoriesData, revenue] = await Promise.all([
        analyticsService.getPurchaseTrends(startDate, endDate),
        analyticsService.getTopSellingProducts(10, startDate, endDate),
        analyticsService.getCategoryAnalytics(startDate, endDate),
        analyticsService.getRevenueAnalytics(startDate, endDate),
      ]);

      setTrends(trendsData);
      setTopProducts(productsData);
      setCategoryAnalytics(categoriesData);
      setRevenueData(revenue);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="text-primary-600" />
          Analytics y Tendencias
        </h1>
      </div>

      {/* Date Filter */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Fecha Inicio"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="Fecha Fin"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <div className="flex items-end">
            <Button onClick={loadAnalytics} className="w-full">
              Actualizar
            </Button>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      {revenueData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-primary-600">
                  ${revenueData.totalRevenue.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-primary-600 opacity-50" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Promedio Diario</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${revenueData.averageDailyRevenue.toFixed(2)}
                </p>
              </div>
              <ShoppingBag className="h-10 w-10 text-blue-600 opacity-50" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Productos Vendidos</p>
                <p className="text-2xl font-bold text-green-600">
                  {topProducts.reduce((sum, p) => sum + p.totalQuantity, 0)}
                </p>
              </div>
              <Package className="h-10 w-10 text-green-600 opacity-50" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categorías Activas</p>
                <p className="text-2xl font-bold text-purple-600">
                  {categoryAnalytics.length}
                </p>
              </div>
              <Users className="h-10 w-10 text-purple-600 opacity-50" />
            </div>
          </Card>
        </div>
      )}

      {/* Sales Trend Chart */}
      <Card title="Tendencia de Ventas">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#3b82f6" name="Ventas ($)" />
            <Line type="monotone" dataKey="orders" stroke="#10b981" name="Órdenes" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card title="Productos Más Vendidos">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="productName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalRevenue" fill="#3b82f6" name="Ingresos ($)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Distribution */}
        <Card title="Distribución por Categoría">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryAnalytics}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.category}: ${entry.percentageOfTotal.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="totalRevenue"
              >
                {categoryAnalytics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Revenue by Payment Method */}
      {revenueData && revenueData.revenueByPaymentMethod && (
        <Card title="Ingresos por Método de Pago">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={Object.entries(revenueData.revenueByPaymentMethod).map(([method, amount]) => ({
                method,
                amount,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="method" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#10b981" name="Ingresos ($)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Revenue Trend */}
      {revenueData && revenueData.revenueTrend && (
        <Card title="Tendencia de Ingresos">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData.revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Ingresos ($)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
