import { useState, useEffect } from 'react';
import { financialReportService } from '@/services/financial-report.service';
import { TaxReport } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, Receipt, FileText } from 'lucide-react';

interface Props {
  startDate: string;
  endDate: string;
}

export function TaxReportTab({ startDate, endDate }: Props) {
  const [report, setReport] = useState<TaxReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadReport();
  }, [startDate, endDate]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const data = await financialReportService.getTaxReport({
        startDate,
        endDate,
      });
      setReport(data);
    } catch (error) {
      console.error('Error loading tax report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const blob = await financialReportService.exportFinancialReport(
        'tax',
        { startDate, endDate },
        format
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-impuestos-${startDate}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const exportDeclaration = async (format: 'pdf' | 'excel') => {
    try {
      const blob = await financialReportService.exportTaxDeclaration(
        { startDate, endDate },
        format
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `declaracion-impuestos-${startDate}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting declaration:', error);
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
      <div className="flex justify-end gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => exportReport('pdf')}>
          <Download size={16} />
          PDF
        </Button>
        <Button variant="outline" size="sm" onClick={() => exportReport('excel')}>
          <Download size={16} />
          Excel
        </Button>
        <Button variant="primary" size="sm" onClick={() => exportDeclaration('pdf')}>
          <FileText size={16} />
          Exportar Declaración
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ventas Totales</p>
              <p className="text-2xl font-bold text-gray-900">
                S/. {report.totalSales.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <Receipt className="h-10 w-10 text-gray-600 opacity-50" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Base Imponible</p>
              <p className="text-2xl font-bold text-blue-600">
                S/. {report.taxableBase.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <Receipt className="h-10 w-10 text-blue-600 opacity-50" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">IGV (18%)</p>
              <p className="text-2xl font-bold text-indigo-600">
                S/. {report.igv.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <Receipt className="h-10 w-10 text-indigo-600 opacity-50" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Impuestos</p>
              <p className="text-2xl font-bold text-red-600">
                S/. {report.totalTaxes.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <Receipt className="h-10 w-10 text-red-600 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Tax Breakdown */}
      <Card title="Desglose de Impuestos">
        <div className="space-y-3">
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-sm font-medium text-gray-700">IGV (18%)</span>
            <span className="text-base font-semibold text-indigo-600">
              S/. {report.igv.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-sm font-medium text-gray-700">Impuesto a la Renta</span>
            <span className="text-base font-semibold text-purple-600">
              S/. {report.incomeTax.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-sm font-medium text-gray-700">Impuesto Municipal</span>
            <span className="text-base font-semibold text-blue-600">
              S/. {report.municipalTax.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-sm font-medium text-gray-700">Otros Impuestos</span>
            <span className="text-base font-semibold text-gray-600">
              S/. {report.otherTaxes.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 pt-4 border-t-2">
            <span className="text-base font-bold text-gray-900">TOTAL A PAGAR</span>
            <span className="text-2xl font-bold text-red-600">
              S/. {report.totalTaxes.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </Card>

      {/* Daily Breakdown */}
      {report.breakdown && report.breakdown.length > 0 && (
        <Card title="Desglose Diario de Impuestos">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ventas
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IGV
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Renta
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.breakdown.map((day, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(day.date).toLocaleDateString('es-PE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      S/. {day.sales.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-indigo-600">
                      S/. {day.igv.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-purple-600">
                      S/. {day.incomeTax.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                      S/. {(day.igv + day.incomeTax).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tax Calculation Info */}
      <Card title="Información de Cálculo">
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>IGV (Impuesto General a las Ventas):</strong> 18% sobre ventas gravadas</p>
          <p><strong>Impuesto a la Renta:</strong> Aplica según régimen tributario (RER, RMT, Régimen General)</p>
          <p><strong>Impuesto Municipal:</strong> Varía según municipalidad (0-2%)</p>
          <p className="mt-4 text-xs text-gray-500">
            * Los cálculos son referenciales. Consulte con su contador para declaraciones oficiales.
          </p>
        </div>
      </Card>
    </div>
  );
}
