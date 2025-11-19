import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { nubefactService } from '@/services/nubefact.service';
import { InvoiceType, InvoiceDocumentType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, FileText } from 'lucide-react';

interface Props {
  orderId: string;
  orderTotal: number;
  customerName?: string;
  customerDocument?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const invoiceSchema = z.object({
  type: z.nativeEnum(InvoiceType),
  customerDocumentType: z.nativeEnum(InvoiceDocumentType),
  customerDocumentNumber: z.string().min(8, 'Número de documento requerido'),
  customerName: z.string().min(3, 'Nombre del cliente requerido'),
  customerAddress: z.string().min(5, 'Dirección requerida'),
  customerEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

export function GenerateInvoiceModal({
  orderId,
  orderTotal,
  customerName,
  customerDocument,
  onClose,
  onSuccess,
}: Props) {
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      type: InvoiceType.BOLETA,
      customerDocumentType: InvoiceDocumentType.DNI,
      customerDocumentNumber: customerDocument || '',
      customerName: customerName || '',
      customerAddress: '',
      customerEmail: '',
      notes: '',
    },
  });

  const invoiceType = watch('type');

  const onSubmit = async (data: InvoiceFormData) => {
    setIsGenerating(true);

    try {
      await nubefactService.generateInvoice(orderId, data);
      alert('Comprobante generado exitosamente');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error generating invoice:', error);
      alert(error.response?.data?.message || 'Error al generar el comprobante');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-primary-600" />
            Generar Comprobante
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Tipo de Comprobante */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Comprobante *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer ${
                invoiceType === InvoiceType.BOLETA ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
              }`}>
                <input
                  type="radio"
                  {...register('type')}
                  value={InvoiceType.BOLETA}
                  className="h-4 w-4 text-primary-600"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-gray-900">Boleta de Venta</span>
                  <span className="block text-xs text-gray-500">Para personas naturales</span>
                </div>
              </label>

              <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer ${
                invoiceType === InvoiceType.FACTURA ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
              }`}>
                <input
                  type="radio"
                  {...register('type')}
                  value={InvoiceType.FACTURA}
                  className="h-4 w-4 text-primary-600"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-gray-900">Factura</span>
                  <span className="block text-xs text-gray-500">Para empresas (RUC)</span>
                </div>
              </label>
            </div>
          </div>

          {/* Tipo de Documento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Documento *
            </label>
            <select
              {...register('customerDocumentType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={InvoiceDocumentType.DNI}>DNI</option>
              <option value={InvoiceDocumentType.RUC}>RUC</option>
              <option value={InvoiceDocumentType.CARNET_EXTRANJERIA}>Carnet de Extranjería</option>
              <option value={InvoiceDocumentType.PASAPORTE}>Pasaporte</option>
            </select>
            {errors.customerDocumentType && (
              <p className="text-red-600 text-sm mt-1">{errors.customerDocumentType.message}</p>
            )}
          </div>

          {/* Número de Documento */}
          <Input
            label="Número de Documento *"
            {...register('customerDocumentNumber')}
            error={errors.customerDocumentNumber?.message}
            placeholder="Ej: 12345678"
          />

          {/* Nombre/Razón Social */}
          <Input
            label={invoiceType === InvoiceType.FACTURA ? 'Razón Social *' : 'Nombre Completo *'}
            {...register('customerName')}
            error={errors.customerName?.message}
            placeholder="Nombre del cliente o empresa"
          />

          {/* Dirección */}
          <Input
            label="Dirección *"
            {...register('customerAddress')}
            error={errors.customerAddress?.message}
            placeholder="Dirección fiscal del cliente"
          />

          {/* Email */}
          <Input
            label="Email (opcional)"
            type="email"
            {...register('customerEmail')}
            error={errors.customerEmail?.message}
            placeholder="correo@ejemplo.com"
          />

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas/Observaciones (opcional)
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Información adicional para el comprobante"
            />
          </div>

          {/* Total a facturar */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total a facturar:</span>
              <span className="text-2xl font-bold text-primary-600">
                S/. {orderTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Información */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> El comprobante será enviado automáticamente a SUNAT y al cliente por email (si proporcionó).
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isGenerating}
              className="flex-1"
            >
              Generar Comprobante
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
