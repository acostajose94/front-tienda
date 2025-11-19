import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  DollarSign,
  Receipt,
  Users,
  TrendingDown,
  TrendingUp,
  FileText,
  Download,
  BarChart3
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ProfitReportTab } from './tabs/ProfitReportTab';
import { TaxReportTab } from './tabs/TaxReportTab';
import { PayrollReportTab } from './tabs/PayrollReportTab';
import { ExpenseReportTab } from './tabs/ExpenseReportTab';
import { CashFlowReportTab } from './tabs/CashFlowReportTab';
import { ProductProfitabilityTab } from './tabs/ProductProfitabilityTab';

type TabType = 'profit' | 'tax' | 'payroll' | 'expense' | 'cashflow' | 'profitability';

export function FinancialReports() {
  const [activeTab, setActiveTab] = useState<TabType>('profit');
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const tabs = [
    {
      id: 'profit' as TabType,
      label: 'Ganancias',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'tax' as TabType,
      label: 'Impuestos',
      icon: Receipt,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'payroll' as TabType,
      label: 'Nómina',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'expense' as TabType,
      label: 'Gastos',
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      id: 'cashflow' as TabType,
      label: 'Flujo de Caja',
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      id: 'profitability' as TabType,
      label: 'Rentabilidad',
      icon: BarChart3,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  const handleQuickDateRange = (range: 'current' | 'last' | '3months' | '6months' | 'year') => {
    const today = new Date();

    switch (range) {
      case 'current':
        setStartDate(format(startOfMonth(today), 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth(today), 'yyyy-MM-dd'));
        break;
      case 'last':
        const lastMonth = subMonths(today, 1);
        setStartDate(format(startOfMonth(lastMonth), 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth(lastMonth), 'yyyy-MM-dd'));
        break;
      case '3months':
        setStartDate(format(subMonths(today, 3), 'yyyy-MM-dd'));
        setEndDate(format(today, 'yyyy-MM-dd'));
        break;
      case '6months':
        setStartDate(format(subMonths(today, 6), 'yyyy-MM-dd'));
        setEndDate(format(today, 'yyyy-MM-dd'));
        break;
      case 'year':
        setStartDate(format(new Date(today.getFullYear(), 0, 1), 'yyyy-MM-dd'));
        setEndDate(format(new Date(today.getFullYear(), 11, 31), 'yyyy-MM-dd'));
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="text-primary-600" />
          Reportes Financieros
        </h1>
      </div>

      {/* Date Range Selection */}
      <Card>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickDateRange('current')}
            >
              Mes Actual
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickDateRange('last')}
            >
              Mes Pasado
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickDateRange('3months')}
            >
              Últimos 3 Meses
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickDateRange('6months')}
            >
              Últimos 6 Meses
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickDateRange('year')}
            >
              Año Completo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex flex-wrap gap-2" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group inline-flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm
                  ${
                    isActive
                      ? `border-primary-500 ${tab.color}`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'profit' && (
          <ProfitReportTab startDate={startDate} endDate={endDate} />
        )}
        {activeTab === 'tax' && (
          <TaxReportTab startDate={startDate} endDate={endDate} />
        )}
        {activeTab === 'payroll' && (
          <PayrollReportTab startDate={startDate} endDate={endDate} />
        )}
        {activeTab === 'expense' && (
          <ExpenseReportTab startDate={startDate} endDate={endDate} />
        )}
        {activeTab === 'cashflow' && (
          <CashFlowReportTab startDate={startDate} endDate={endDate} />
        )}
        {activeTab === 'profitability' && (
          <ProductProfitabilityTab startDate={startDate} endDate={endDate} />
        )}
      </div>
    </div>
  );
}
