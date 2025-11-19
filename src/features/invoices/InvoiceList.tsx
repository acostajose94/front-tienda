import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { nubefactService } from '@/services/nubefact.service';
import { Invoice, InvoiceType, InvoiceStatus } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  FileText,
  Download,
  Send,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { format } from 'date-fns';

export function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    type: '' as InvoiceType | '',
    status: '' as InvoiceStatus | '',
    customerDocument: '',
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const data = await nubefactService.getInvoices({
        startDate: filters.startDate,
        endDate: filters.endDate,
        type: filters.type || undefined,
        status: filters.status || undefined,
        customerDocument: filters.customerDocument || undefined,
      });
      setInvoices(data);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInvoiceTypeBadge = (type: InvoiceType) => {
    const badges = {
      [InvoiceType.FACTURA]: { label: 'Factura', className: 'bg-blue-100 text-blue-800' },
      [InvoiceType.BOLETA]: { label: 'Boleta', className: 'bg-green-100 text-green-800' },
      [InvoiceType.NOTA_CREDITO]: { label: 'N. Crédito', className: 'bg-orange-100 text-orange-800' },
      [InvoiceType.NOTA_DEBITO]: { label: 'N. Débito', className: 'bg-purple-100 text-purple-800' },
    };

    const badge = badges[type];
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    const badges = {
      [InvoiceStatus.DRAFT]: {
        label: 'Borrador',
        icon: Clock,
        className: 'bg-gray-100 text-gray-800',
      },
      [InvoiceStatus.SENT]: {
        label: 'Enviado',
        icon: Send,
        className: 'bg-blue-100 text-blue-800',
      },
      [InvoiceStatus.ACCEPTED]: {
        label: 'Aceptado',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800',
      },
      [InvoiceStatus.REJECTED]: {
        label: 'Rechazado',
        icon: XCircle,
        className: 'bg-red-100 text-red-800',
      },
      [InvoiceStatus.CANCELLED]: {
        label: 'Anulado',
        icon: AlertCircle,
        className: 'bg-yellow-100 text-yellow-800',
      },
    };

    const badge = badges[status];
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${badge.className}`}>
        <Icon size={14} />
        {badge.label}
      </span>
    );
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      const blob = await nubefactService.downloadPDF(invoice.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.serie}-${invoice.numero}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error al descargar el PDF');
    }
  };

  const handleDownloadXML = async (invoice: Invoice) => {
    try {
      const blob = await nubefactService.downloadXML(invoice.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.serie}-${invoice.numero}.xml`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading XML:', error);
      alert('Error al descargar el XML');
    }
  };

  const handleSendToSunat = async (invoice: Invoice) => {
    if (!confirm('¿Desea enviar este comprobante a SUNAT?')) return;

    try {
      await nubefactService.sendToSunat(invoice.id);
      alert('Comprobante enviado a SUNAT exitosamente');
      loadInvoices();
    } catch (error: any) {
      console.error('Error sending to SUNAT:', error);
      alert(error.response?.data?.message || 'Error al enviar a SUNAT');
    }
  };

  const handleSendToCustomer = async (invoice: Invoice) => {
    try {
      await nubefactService.sendToCustomer(invoice.id);
      alert('Comprobante enviado al cliente por email');
    } catch (error) {
      console.error('Error sending to customer:', error);
      alert('Error al enviar email al cliente');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="text-primary-600" />
          Comprobantes Electrónicos
        </h1>
        <Link to="/admin/invoices/new">
          <Button>
            <Plus size={20} />
            Nuevo Comprobante
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Input
            label="Fecha Inicio"
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />
          <Input
            label="Fecha Fin"
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as InvoiceType | '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todos</option>
              <option value={InvoiceType.FACTURA}>Factura</option>
              <option value={InvoiceType.BOLETA}>Boleta</option>
              <option value={InvoiceType.NOTA_CREDITO}>Nota de Crédito</option>
              <option value={InvoiceType.NOTA_DEBITO}>Nota de Débito</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as InvoiceStatus | '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todos</option>
              <option value={InvoiceStatus.DRAFT}>Borrador</option>
              <option value={InvoiceStatus.SENT}>Enviado</option>
              <option value={InvoiceStatus.ACCEPTED}>Aceptado</option>
              <option value={InvoiceStatus.REJECTED}>Rechazado</option>
              <option value={InvoiceStatus.CANCELLED}>Anulado</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={loadInvoices} isLoading={isLoading} className="w-full">
              Buscar
            </Button>
          </div>
        </div>
      </Card>

      {/* Invoice List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comprobante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {getInvoiceTypeBadge(invoice.type)}
                      <span className="text-sm font-medium text-gray-900">
                        {invoice.serie}-{invoice.numero}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{invoice.customerName}</div>
                      <div className="text-gray-500">{invoice.customerDocumentNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(invoice.issueDate).toLocaleDateString('es-PE')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                    S/. {invoice.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {getStatusBadge(invoice.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link to={`/admin/invoices/${invoice.id}`}>
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalle"
                        >
                          <Eye size={18} />
                        </button>
                      </Link>

                      {invoice.pdfUrl && (
                        <button
                          onClick={() => handleDownloadPDF(invoice)}
                          className="text-red-600 hover:text-red-900"
                          title="Descargar PDF"
                        >
                          <Download size={18} />
                        </button>
                      )}

                      {invoice.status === InvoiceStatus.DRAFT && (
                        <button
                          onClick={() => handleSendToSunat(invoice)}
                          className="text-green-600 hover:text-green-900"
                          title="Enviar a SUNAT"
                        >
                          <Send size={18} />
                        </button>
                      )}

                      {invoice.status === InvoiceStatus.ACCEPTED && invoice.customerEmail && (
                        <button
                          onClick={() => handleSendToCustomer(invoice)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Enviar a cliente"
                        >
                          <Send size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {invoices.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No se encontraron comprobantes</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
