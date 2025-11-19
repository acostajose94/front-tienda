import { useState, useEffect } from 'react';
import { financialReportService } from '@/services/financial-report.service';
import { ProductProfitabilityReport } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface Props {
  startDate: string;
  endDate: string;
}

export function ProductProfitabilityTab({ startDate, endDate }: Props) {
  const [report, setReport] = useState<ProductProfitabilityReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'profit' | 'margin' | 'revenue' | 'roi'>('profit');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadReport();
  }, [startDate, endDate]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const data = await financialReportService.getProductProfitabilityReport({
        startDate,
        endDate,
      });
      setReport(data);
    } catch (error) {
      console.error('Error loading profitability report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const blob = await financialReportService.exportFinancialReport(
        'product-profitability',
        { startDate, endDate },
        format
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-rentabilidad-productos-${startDate}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedReport = [...report].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    let aValue: number;
    let bValue: number;

    switch (sortBy) {
      case 'profit':
        aValue = a.profit;
        bValue = b.profit;
        break;
      case 'margin':
        aValue = a.profitMargin;
        bValue = b.profitMargin;
        break;
      case 'revenue':
        aValue = a.revenue;
        bValue = b.revenue;
        break;
      case 'roi':
        aValue = a.roi;
        bValue = b.roi;
        break;
      default:
        aValue = a.profit;
        bValue = b.profit;
    }

    return (aValue - bValue) * multiplier;
  });

  const totalRevenue = report.reduce((sum, p) => sum + p.revenue, 0);
  const totalCost = report.reduce((sum, p) => sum + p.cost, 0);
  const totalProfit = report.reduce((sum, p) => sum + p.profit, 0);
  const averageMargin = report.length > 0 ? report.reduce((sum, p) => sum + p.profitMargin, 0) / report.length : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (report.length === 0) {
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-blue-600">
                S/. {totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <BarChart3 className="h-10 w-10 text-blue-600 opacity-50" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Costos Totales</p>
              <p className="text-2xl font-bold text-red-600">
                S/. {totalCost.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <TrendingDown className="h-10 w-10 text-red-600 opacity-50" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ganancia Total</p>
              <p className="text-2xl font-bold text-green-600">
                S/. {totalProfit.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-600 opacity-50" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Margen Promedio</p>
              <p className="text-2xl font-bold text-purple-600">
                {averageMargin.toFixed(2)}%
              </p>
            </div>
            <BarChart3 className="h-10 w-10 text-purple-600 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Product Profitability Table */}
      <Card title={`Rentabilidad por Producto (${report.length} productos)`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unidades Vendidas
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('revenue')}
                >
                  Ingresos {sortBy === 'revenue' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Costos
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('profit')}
                >
                  Ganancia {sortBy === 'profit' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('margin')}
                >
                  Margen {sortBy === 'margin' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('roi')}
                >
                  ROI {sortBy === 'roi' && (sortOrder === 'desc' ? '↓' : '↑')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedReport.map((product) => (
                <tr key={product.productId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {product.productName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {product.totalSold}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600">
                    S/. {product.revenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                    S/. {product.cost.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                    product.profit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    S/. {product.profit.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                    product.profitMargin >= 30 ? 'text-green-600 font-semibold' :
                    product.profitMargin >= 15 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {product.profitMargin.toFixed(2)}%
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                    product.roi >= 50 ? 'text-green-600 font-semibold' :
                    product.roi >= 20 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {product.roi.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-semibold">
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">TOTAL</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {report.reduce((sum, p) => sum + p.totalSold, 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600">
                  S/. {totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                  S/. {totalCost.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                  S/. {totalProfit.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {((totalProfit / totalRevenue) * 100).toFixed(2)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {((totalProfit / totalCost) * 100).toFixed(2)}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Legend */}
      <Card title="Indicadores de Rentabilidad">
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Margen de Ganancia:</span>
            <ul className="ml-4 mt-1 space-y-1">
              <li className="text-green-600">• &gt; 30%: Excelente rentabilidad</li>
              <li className="text-yellow-600">• 15-30%: Rentabilidad moderada</li>
              <li className="text-red-600">• &lt; 15%: Baja rentabilidad - considerar ajustes</li>
            </ul>
          </div>
          <div className="mt-3">
            <span className="font-medium">ROI (Retorno de Inversión):</span>
            <ul className="ml-4 mt-1 space-y-1">
              <li className="text-green-600">• &gt; 50%: Alto retorno</li>
              <li className="text-yellow-600">• 20-50%: Retorno moderado</li>
              <li className="text-red-600">• &lt; 20%: Bajo retorno</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
