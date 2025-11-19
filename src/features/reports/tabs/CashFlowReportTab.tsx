import { useState, useEffect } from 'react';
import { financialReportService } from '@/services/financial-report.service';
import { CashFlowReport } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  startDate: string;
  endDate: string;
}

export function CashFlowReportTab({ startDate, endDate }: Props) {
  const [report, setReport] = useState<CashFlowReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadReport();
  }, [startDate, endDate]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const data = await financialReportService.getCashFlowReport({
        startDate,
        endDate,
      });
      setReport(data);
    } catch (error) {
      console.error('Error loading cash flow report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const blob = await financialReportService.exportFinancialReport(
        'cash-flow',
        { startDate, endDate },
        format
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-flujo-caja-${startDate}.${format}`;
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Saldo Inicial</p>
              <p className="text-2xl font-bold text-gray-900">
                S/. {report.openingBalance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <Wallet className="h-10 w-10 text-gray-600 opacity-50" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Ingresos</p>
              <p className="text-2xl font-bold text-green-600">
                S/. {report.totalInflow.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-600 opacity-50" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Egresos</p>
              <p className="text-2xl font-bold text-red-600">
                S/. {report.totalOutflow.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <TrendingDown className="h-10 w-10 text-red-600 opacity-50" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Saldo Final</p>
              <p className={`text-2xl font-bold ${report.closingBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                S/. {report.closingBalance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <Wallet className={`h-10 w-10 opacity-50 ${report.closingBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
          </div>
        </Card>
      </div>

      {/* Cash Flow Chart */}
      {report.dailyFlow && report.dailyFlow.length > 0 && (
        <Card title="Flujo de Caja Diario">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={report.dailyFlow}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('es-PE')} />
              <YAxis />
              <Tooltip
                formatter={(value: number) => `S/. ${value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
                labelFormatter={(label) => new Date(label).toLocaleDateString('es-PE')}
              />
              <Legend />
              <Line type="monotone" dataKey="inflow" stroke="#10B981" name="Ingresos" />
              <Line type="monotone" dataKey="outflow" stroke="#EF4444" name="Egresos" />
              <Line type="monotone" dataKey="balance" stroke="#3B82F6" name="Saldo" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inflows */}
        <Card title="Fuentes de Ingresos">
          <div className="space-y-3">
            {report.inflows.map((inflow, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className="text-sm text-gray-700">{inflow.source}</span>
                <span className="text-base font-semibold text-green-600">
                  S/. {inflow.amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3 border-t-2">
              <span className="text-base font-bold text-gray-900">TOTAL INGRESOS</span>
              <span className="text-xl font-bold text-green-600">
                S/. {report.totalInflow.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </Card>

        {/* Outflows */}
        <Card title="Destinos de Egresos">
          <div className="space-y-3">
            {report.outflows.map((outflow, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className="text-sm text-gray-700">{outflow.destination}</span>
                <span className="text-base font-semibold text-red-600">
                  S/. {outflow.amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3 border-t-2">
              <span className="text-base font-bold text-gray-900">TOTAL EGRESOS</span>
              <span className="text-xl font-bold text-red-600">
                S/. {report.totalOutflow.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Net Cash Flow */}
      <Card title="Flujo de Caja Neto">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-sm font-medium text-gray-700">Saldo Inicial</span>
            <span className="text-lg font-semibold text-gray-900">
              S/. {report.openingBalance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-sm font-medium text-gray-700">+ Total Ingresos</span>
            <span className="text-lg font-semibold text-green-600">
              S/. {report.totalInflow.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-sm font-medium text-gray-700">- Total Egresos</span>
            <span className="text-lg font-semibold text-red-600">
              S/. {report.totalOutflow.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-sm font-medium text-gray-700">= Flujo Neto</span>
            <span className={`text-lg font-semibold ${report.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              S/. {report.netCashFlow.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center py-4 pt-5 border-t-2">
            <span className="text-base font-bold text-gray-900">SALDO FINAL</span>
            <span className={`text-2xl font-bold ${report.closingBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              S/. {report.closingBalance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
