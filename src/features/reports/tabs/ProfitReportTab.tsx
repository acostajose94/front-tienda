import { useState, useEffect } from 'react';
import { financialReportService } from '@/services/financial-report.service';
import { ProfitReport } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface Props {
  startDate: string;
  endDate: string;
}

export function ProfitReportTab({ startDate, endDate }: Props) {
  const [report, setReport] = useState<ProfitReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadReport();
  }, [startDate, endDate]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const data = await financialReportService.getProfitReport({
        startDate,
        endDate,
      });
      setReport(data);
    } catch (error) {
      console.error('Error loading profit report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const blob = await financialReportService.exportFinancialReport(
        'profit',
        { startDate, endDate },
        format
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-ganancias-${startDate}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-gray-500">No hay datos disponibles para el período seleccionado</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Export Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => exportReport('pdf')}>
          <Download size={16} />
          PDF
        </Button>
        <Button variant="outline" size="sm" onClick={() => exportReport('excel')}>
          <Download size={16} />
          Excel
        </Button>
        <Button variant="outline" size="sm" onClick={() => exportReport('csv')}>
          <Download size={16} />
          CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-green-600">
                S/. {report.totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-600 opacity-50" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Costos Totales</p>
              <p className="text-2xl font-bold text-red-600">
                S/. {report.totalCosts.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <TrendingDown className="h-10 w-10 text-red-600 opacity-50" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ganancia Bruta</p>
              <p className="text-2xl font-bold text-blue-600">
                S/. {report.grossProfit.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-blue-600 opacity-50" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ganancia Neta</p>
              <p className={`text-2xl font-bold ${report.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                S/. {report.netProfit.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Margen: {report.profitMargin.toFixed(2)}%
              </p>
            </div>
            <DollarSign className={`h-10 w-10 opacity-50 ${report.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
        </Card>
      </div>

      {/* Profit Breakdown */}
      <Card title="Desglose de Ganancias">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 pb-4 border-b">
            <div>
              <p className="text-sm text-gray-600">Ingresos Totales</p>
              <p className="text-lg font-semibold text-gray-900">
                S/. {report.totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">100%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pb-4 border-b">
            <div>
              <p className="text-sm text-gray-600">(-) Costos de Productos</p>
              <p className="text-lg font-semibold text-red-600">
                S/. {report.totalCosts.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {((report.totalCosts / report.totalRevenue) * 100).toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pb-4 border-b">
            <div>
              <p className="text-sm font-medium text-gray-900">Ganancia Bruta</p>
              <p className="text-lg font-semibold text-blue-600">
                S/. {report.grossProfit.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {((report.grossProfit / report.totalRevenue) * 100).toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pb-4 border-b">
            <div>
              <p className="text-sm text-gray-600">(-) Gastos Operativos</p>
              <p className="text-lg font-semibold text-red-600">
                S/. {report.operatingExpenses.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {((report.operatingExpenses / report.totalRevenue) * 100).toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-base font-bold text-gray-900">Ganancia Neta</p>
              <p className={`text-2xl font-bold ${report.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                S/. {report.netProfit.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-base font-bold text-gray-900">{report.profitMargin.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Profit by Category */}
      {report.byCategory && report.byCategory.length > 0 && (
        <Card title="Ganancias por Categoría">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingresos
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Costos
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ganancia
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Margen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.byCategory.map((category) => (
                  <tr key={category.categoryId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {category.categoryName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      S/. {category.revenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                      S/. {category.costs.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                      category.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      S/. {category.profit.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {((category.profit / category.revenue) * 100).toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
