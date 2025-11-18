import { useState, useEffect } from 'react';
import { reportService, ReportFilters } from '@/services/report.service';
import { SalesReport, ReportPeriod } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BarChart3, Download, Calendar, TrendingUp } from 'lucide-react';
import { format, subDays, startOfWeek, startOfMonth } from 'date-fns';

export function Reports() {
  const [period, setPeriod] = useState<ReportPeriod>(ReportPeriod.DAILY);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [report, setReport] = useState<SalesReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadReport();
  }, [period]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const filters: ReportFilters = {
        period,
        startDate,
        endDate,
      };

      const data = await reportService.getSalesReport(filters);
      setReport(data);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod: ReportPeriod) => {
    setPeriod(newPeriod);
    const today = new Date();

    switch (newPeriod) {
      case ReportPeriod.DAILY:
        setStartDate(format(today, 'yyyy-MM-dd'));
        setEndDate(format(today, 'yyyy-MM-dd'));
        break;
      case ReportPeriod.WEEKLY:
        setStartDate(format(startOfWeek(today), 'yyyy-MM-dd'));
        setEndDate(format(today, 'yyyy-MM-dd'));
        break;
      case ReportPeriod.MONTHLY:
        setStartDate(format(startOfMonth(today), 'yyyy-MM-dd'));
        setEndDate(format(today, 'yyyy-MM-dd'));
        break;
    }
  };

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const blob = await reportService.exportReport({
        period,
        startDate,
        endDate,
      }, format);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-${period.toLowerCase()}-${startDate}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="text-primary-600" />
          Reportes de Ventas
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <Download size={18} />
            PDF
          </Button>
          <Button variant="outline" onClick={() => exportReport('excel')}>
            <Download size={18} />
            Excel
          </Button>
          <Button variant="outline" onClick={() => exportReport('csv')}>
            <Download size={18} />
            CSV
          </Button>
        </div>
      </div>

      {/* Period Selection */}
      <Card>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={period === ReportPeriod.DAILY ? 'primary' : 'outline'}
              onClick={() => handlePeriodChange(ReportPeriod.DAILY)}
            >
              Diario
            </Button>
            <Button
              variant={period === ReportPeriod.WEEKLY ? 'primary' : 'outline'}
              onClick={() => handlePeriodChange(ReportPeriod.WEEKLY)}
            >
              Semanal
            </Button>
            <Button
              variant={period === ReportPeriod.MONTHLY ? 'primary' : 'outline'}
              onClick={() => handlePeriodChange(ReportPeriod.MONTHLY)}
            >
              Mensual
            </Button>
            <Button
              variant={period === ReportPeriod.CUSTOM ? 'primary' : 'outline'}
              onClick={() => setPeriod(ReportPeriod.CUSTOM)}
            >
              Personalizado
            </Button>
          </div>

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
              <Button onClick={loadReport} isLoading={isLoading} className="w-full">
                Generar Reporte
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Report Summary */}
      {report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ventas Totales</p>
                  <p className="text-3xl font-bold text-primary-600">
                    ${report.totalSales.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-primary-600 opacity-50" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Órdenes</p>
                  <p className="text-3xl font-bold text-blue-600">{report.totalOrders}</p>
                </div>
                <Calendar className="h-12 w-12 text-blue-600 opacity-50" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Valor Promedio</p>
                  <p className="text-3xl font-bold text-green-600">
                    ${report.averageOrderValue.toFixed(2)}
                  </p>
                </div>
                <BarChart3 className="h-12 w-12 text-green-600 opacity-50" />
              </div>
            </Card>
          </div>

          {/* Top Products */}
          <Card title="Productos Más Vendidos">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ingresos
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.topProducts.map((product, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Sales by Store */}
          {report.byStore && Object.keys(report.byStore).length > 0 && (
            <Card title="Ventas por Local">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Local
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ventas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Órdenes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(report.byStore).map(([storeId, data]) => (
                      <tr key={storeId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {storeId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${data.sales.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {data.orders}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
