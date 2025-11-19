import { useState, useEffect } from 'react';
import { financialReportService } from '@/services/financial-report.service';
import { PayrollReport } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, Users, DollarSign, TrendingDown } from 'lucide-react';

interface Props {
  startDate: string;
  endDate: string;
}

export function PayrollReportTab({ startDate, endDate }: Props) {
  const [report, setReport] = useState<PayrollReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadReport();
  }, [startDate, endDate]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const data = await financialReportService.getPayrollReport({
        startDate,
        endDate,
      });
      setReport(data);
    } catch (error) {
      console.error('Error loading payroll report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'excel') => {
    try {
      const blob = await financialReportService.exportPayrollReport(
        { startDate, endDate },
        format
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-nomina-${startDate}.${format}`;
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
              <p className="text-sm text-gray-600">Total Empleados</p>
              <p className="text-2xl font-bold text-blue-600">{report.totalEmployees}</p>
            </div>
            <Users className="h-10 w-10 text-blue-600 opacity-50" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Salario Bruto</p>
              <p className="text-2xl font-bold text-green-600">
                S/. {report.totalGrossSalary.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-green-600 opacity-50" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Deducciones</p>
              <p className="text-2xl font-bold text-red-600">
                S/. {report.totalDeductions.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <TrendingDown className="h-10 w-10 text-red-600 opacity-50" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Salario Neto</p>
              <p className="text-2xl font-bold text-purple-600">
                S/. {report.totalNetSalary.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-purple-600 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Payroll Summary */}
      <Card title="Resumen de Nómina">
        <div className="space-y-3">
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-sm font-medium text-gray-700">Salario Bruto Total</span>
            <span className="text-base font-semibold text-green-600">
              S/. {report.totalGrossSalary.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-sm font-medium text-gray-700">Deducciones (AFP, ONP, IR)</span>
            <span className="text-base font-semibold text-red-600">
              - S/. {report.totalDeductions.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-sm font-medium text-gray-700">Beneficios (Gratificaciones, CTS)</span>
            <span className="text-base font-semibold text-blue-600">
              + S/. {report.totalBenefits.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 pt-4 border-t-2">
            <span className="text-base font-bold text-gray-900">TOTAL A PAGAR</span>
            <span className="text-2xl font-bold text-purple-600">
              S/. {report.totalNetSalary.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </Card>

      {/* Employee List */}
      {report.employees && report.employees.length > 0 && (
        <Card title="Detalle por Empleado">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salario Bruto
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deducciones
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Beneficios
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salario Neto
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.employees.map((employee) => (
                  <tr key={employee.employeeId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employee.employeeName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      S/. {employee.grossSalary.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                      S/. {employee.deductions.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600">
                      S/. {employee.benefits.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-purple-600">
                      S/. {employee.netSalary.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* By Department */}
      {report.byDepartment && Object.keys(report.byDepartment).length > 0 && (
        <Card title="Por Departamento">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departamento
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empleados
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Salarios
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Promedio
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(report.byDepartment).map(([dept, data]) => (
                  <tr key={dept}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dept}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {data.employees}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      S/. {data.totalSalary.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-purple-600 font-semibold">
                      S/. {(data.totalSalary / data.employees).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Payroll Info */}
      <Card title="Información sobre Nómina en Perú">
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>AFP/ONP:</strong> Sistema de pensiones (12-13% del salario bruto)</p>
          <p><strong>Impuesto a la Renta 5ta Categoría:</strong> Aplica sobre ingresos anuales mayores a 7 UIT</p>
          <p><strong>Gratificaciones:</strong> Julio y Diciembre (equivalente a un sueldo cada una)</p>
          <p><strong>CTS:</strong> Compensación por Tiempo de Servicios (depositada en Mayo y Noviembre)</p>
          <p><strong>Vacaciones:</strong> 30 días calendario por año trabajado</p>
          <p className="mt-4 text-xs text-gray-500">
            * Los cálculos incluyen todos los conceptos según legislación laboral peruana vigente.
          </p>
        </div>
      </Card>
    </div>
  );
}
