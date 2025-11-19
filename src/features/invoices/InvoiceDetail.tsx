import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { nubefactService } from '@/services/nubefact.service';
import { Invoice, InvoiceStatus, InvoiceType } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  FileText,
  Download,
  Send,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Mail,
  QrCode,
} from 'lucide-react';

export function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadInvoice();
    }
  }, [id]);

  const loadInvoice = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const data = await nubefactService.getInvoiceById(id);
      setInvoice(data);
    } catch (error) {
      console.error('Error loading invoice:', error);
      alert('Error al cargar el comprobante');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (type: 'pdf' | 'xml' | 'cdr') => {
    if (!invoice) return;

    try {
      let blob: Blob;
      let filename: string;

      switch (type) {
        case 'pdf':
          blob = await nubefactService.downloadPDF(invoice.id);
          filename = `${invoice.serie}-${invoice.numero}.pdf`;
          break;
        case 'xml':
          blob = await nubefactService.downloadXML(invoice.id);
          filename = `${invoice.serie}-${invoice.numero}.xml`;
          break;
        case 'cdr':
          blob = await nubefactService.downloadCDR(invoice.id);
          filename = `CDR-${invoice.serie}-${invoice.numero}.zip`;
          break;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(`Error downloading ${type}:`, error);
      alert(`Error al descargar el archivo ${type.toUpperCase()}`);
    }
  };

  const handleSendToCustomer = async () => {
    if (!invoice) return;

    try {
      await nubefactService.sendToCustomer(invoice.id);
      alert('Comprobante enviado al cliente por email');
    } catch (error) {
      console.error('Error sending to customer:', error);
      alert('Error al enviar email al cliente');
    }
  };

  const handleSendToSunat = async () => {
    if (!invoice || !confirm('¿Desea enviar este comprobante a SUNAT?')) return;

    try {
      const response = await nubefactService.sendToSunat(invoice.id);
      alert(response.aceptada_por_sunat ? 'Comprobante aceptado por SUNAT' : 'Comprobante rechazado por SUNAT');
      loadInvoice();
    } catch (error: any) {
      console.error('Error sending to SUNAT:', error);
      alert(error.response?.data?.message || 'Error al enviar a SUNAT');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <p className="text-gray-500">Comprobante no encontrado</p>
        <Button onClick={() => navigate('/admin/invoices')} className="mt-4">
          Volver a la lista
        </Button>
      </div>
    );
  }

  const getInvoiceTypeLabel = (type: InvoiceType) => {
    const labels = {
      [InvoiceType.FACTURA]: 'FACTURA ELECTRÓNICA',
      [InvoiceType.BOLETA]: 'BOLETA DE VENTA ELECTRÓNICA',
      [InvoiceType.NOTA_CREDITO]: 'NOTA DE CRÉDITO ELECTRÓNICA',
      [InvoiceType.NOTA_DEBITO]: 'NOTA DE DÉBITO ELECTRÓNICA',
    };
    return labels[type];
  };

  const getStatusIcon = (status: InvoiceStatus) => {
    const icons = {
      [InvoiceStatus.DRAFT]: Clock,
      [InvoiceStatus.SENT]: Send,
      [InvoiceStatus.ACCEPTED]: CheckCircle,
      [InvoiceStatus.REJECTED]: XCircle,
      [InvoiceStatus.CANCELLED]: AlertCircle,
    };
    return icons[status];
  };

  const StatusIcon = getStatusIcon(invoice.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/invoices')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {invoice.serie}-{invoice.numero}
            </h1>
            <p className="text-gray-600">{getInvoiceTypeLabel(invoice.type)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {invoice.status === InvoiceStatus.DRAFT && (
            <Button onClick={handleSendToSunat} variant="primary">
              <Send size={18} />
              Enviar a SUNAT
            </Button>
          )}

          {invoice.pdfUrl && (
            <Button onClick={() => handleDownload('pdf')} variant="outline">
              <Download size={18} />
              PDF
            </Button>
          )}

          {invoice.xmlUrl && (
            <Button onClick={() => handleDownload('xml')} variant="outline">
              <Download size={18} />
              XML
            </Button>
          )}

          {invoice.cdrUrl && invoice.status === InvoiceStatus.ACCEPTED && (
            <Button onClick={() => handleDownload('cdr')} variant="outline">
              <Download size={18} />
              CDR
            </Button>
          )}

          {invoice.customerEmail && invoice.status === InvoiceStatus.ACCEPTED && (
            <Button onClick={handleSendToCustomer} variant="outline">
              <Mail size={18} />
              Enviar Email
            </Button>
          )}
        </div>
      </div>

      {/* Status */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon
              size={32}
              className={
                invoice.status === InvoiceStatus.ACCEPTED
                  ? 'text-green-600'
                  : invoice.status === InvoiceStatus.REJECTED
                  ? 'text-red-600'
                  : 'text-gray-600'
              }
            />
            <div>
              <p className="text-sm text-gray-600">Estado del Comprobante</p>
              <p className="text-xl font-bold text-gray-900">
                {invoice.status === InvoiceStatus.ACCEPTED && 'Aceptado por SUNAT'}
                {invoice.status === InvoiceStatus.REJECTED && 'Rechazado por SUNAT'}
                {invoice.status === InvoiceStatus.DRAFT && 'Borrador - No enviado'}
                {invoice.status === InvoiceStatus.SENT && 'Enviado a SUNAT - Pendiente'}
                {invoice.status === InvoiceStatus.CANCELLED && 'Anulado'}
              </p>
              {invoice.sunatDescription && (
                <p className="text-sm text-gray-600 mt-1">{invoice.sunatDescription}</p>
              )}
            </div>
          </div>

          {invoice.qrCode && (
            <div className="text-center">
              <img
                src={invoice.qrCode}
                alt="QR Code"
                className="w-32 h-32 border-2 border-gray-300 rounded"
              />
              <p className="text-xs text-gray-500 mt-2">Código QR</p>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info */}
        <Card title="Información del Cliente" className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nombre/Razón Social</p>
              <p className="font-semibold text-gray-900">{invoice.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Documento</p>
              <p className="font-semibold text-gray-900">{invoice.customerDocumentNumber}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Dirección</p>
              <p className="font-semibold text-gray-900">{invoice.customerAddress}</p>
            </div>
            {invoice.customerEmail && (
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{invoice.customerEmail}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Invoice Info */}
        <Card title="Datos del Comprobante">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Fecha de Emisión</p>
              <p className="font-semibold text-gray-900">
                {new Date(invoice.issueDate).toLocaleDateString('es-PE')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Moneda</p>
              <p className="font-semibold text-gray-900">
                {invoice.currency === 'PEN' ? 'Soles (S/.)' : 'Dólares ($)'}
              </p>
            </div>
            {invoice.notes && (
              <div>
                <p className="text-sm text-gray-600">Observaciones</p>
                <p className="text-sm text-gray-900">{invoice.notes}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Items */}
      <Card title="Detalle de Items">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Descripción
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  P. Unitario
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Descuento
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  IGV
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.codigo}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.descripcion}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {item.cantidad}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {item.precio_unitario.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {item.descuento.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {item.igv.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                    {item.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Totals */}
      <Card>
        <div className="max-w-md ml-auto space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">S/. {invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between text-sm text-red-600">
              <span>Descuento:</span>
              <span className="font-medium">- S/. {invoice.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">IGV (18%):</span>
            <span className="font-medium">S/. {invoice.igv.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold pt-3 border-t-2">
            <span>TOTAL:</span>
            <span className="text-primary-600">S/. {invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
