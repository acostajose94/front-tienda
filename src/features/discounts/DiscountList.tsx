import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { discountService } from '@/services/discount.service';
import { Discount, DiscountType } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Plus, Edit, Trash2, Tag, Percent } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';

const discountSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  code: z.string().min(3, 'El código debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  type: z.nativeEnum(DiscountType),
  value: z.number().min(0, 'El valor debe ser mayor a 0'),
  minPurchaseAmount: z.number().min(0).optional(),
  maxDiscountAmount: z.number().min(0).optional(),
  startDate: z.string(),
  endDate: z.string(),
  usageLimit: z.number().int().min(1).optional(),
  isActive: z.boolean(),
});

type DiscountFormData = z.infer<typeof discountSchema>;

export function DiscountList() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DiscountFormData>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      type: DiscountType.PERCENTAGE,
      isActive: true,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    },
  });

  const discountType = watch('type');

  useEffect(() => {
    loadDiscounts();
  }, []);

  const loadDiscounts = async () => {
    try {
      const data = await discountService.getDiscounts();
      setDiscounts(data);
    } catch (error) {
      console.error('Error loading discounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (discount?: Discount) => {
    if (discount) {
      setEditingDiscount(discount);
      setValue('name', discount.name);
      setValue('code', discount.code);
      setValue('description', discount.description || '');
      setValue('type', discount.type);
      setValue('value', discount.value);
      setValue('minPurchaseAmount', discount.minPurchaseAmount);
      setValue('maxDiscountAmount', discount.maxDiscountAmount);
      setValue('startDate', format(new Date(discount.startDate), 'yyyy-MM-dd'));
      setValue('endDate', format(new Date(discount.endDate), 'yyyy-MM-dd'));
      setValue('usageLimit', discount.usageLimit);
      setValue('isActive', discount.isActive);
    } else {
      setEditingDiscount(null);
      reset();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDiscount(null);
    reset();
  };

  const onSubmit = async (data: DiscountFormData) => {
    try {
      if (editingDiscount) {
        await discountService.updateDiscount(editingDiscount.id, data as any);
      } else {
        await discountService.createDiscount(data as any);
      }
      loadDiscounts();
      handleCloseModal();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al guardar el descuento');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cupón?')) {
      try {
        await discountService.deleteDiscount(id);
        loadDiscounts();
      } catch (error) {
        alert('Error al eliminar el cupón');
      }
    }
  };

  const getStatusBadge = (discount: Discount) => {
    const now = new Date();
    const start = new Date(discount.startDate);
    const end = new Date(discount.endDate);

    if (!discount.isActive) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Inactivo</span>;
    }
    if (now < start) {
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Programado</span>;
    }
    if (now > end) {
      return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Expirado</span>;
    }
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
      return <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Agotado</span>;
    }
    return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Activo</span>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Tag className="text-primary-600" />
          Cupones y Descuentos
        </h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={20} />
          Nuevo Cupón
        </Button>
      </div>

      {discounts.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hay cupones registrados</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discounts.map((discount) => (
            <Card key={discount.id} className="relative">
              <div className="absolute top-4 right-4">
                {getStatusBadge(discount)}
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="text-primary-600" size={24} />
                  <h3 className="text-xl font-bold text-gray-900">{discount.name}</h3>
                </div>
                <p className="text-sm text-gray-600">{discount.description || 'Sin descripción'}</p>
              </div>

              <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-4 rounded-lg mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Código del Cupón</p>
                  <p className="text-2xl font-bold text-primary-600 font-mono">{discount.code}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Descuento:</span>
                  <span className="font-semibold text-gray-900">
                    {discount.type === DiscountType.PERCENTAGE
                      ? `${discount.value}%`
                      : `$${discount.value.toFixed(2)}`}
                  </span>
                </div>

                {discount.minPurchaseAmount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Compra mínima:</span>
                    <span className="font-semibold">${discount.minPurchaseAmount.toFixed(2)}</span>
                  </div>
                )}

                {discount.maxDiscountAmount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Descuento máximo:</span>
                    <span className="font-semibold">${discount.maxDiscountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Válido hasta:</span>
                  <span className="font-semibold">{format(new Date(discount.endDate), 'dd/MM/yyyy')}</span>
                </div>

                {discount.usageLimit && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Usos:</span>
                    <span className="font-semibold">
                      {discount.usageCount} / {discount.usageLimit}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <Button size="sm" variant="outline" onClick={() => handleOpenModal(discount)} className="flex-1">
                  <Edit size={16} />
                  Editar
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(discount.id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal for Create/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingDiscount ? 'Editar Cupón' : 'Nuevo Cupón'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre del Cupón"
              {...register('name')}
              error={errors.name?.message}
              placeholder="Ej: Descuento de Verano"
            />

            <Input
              label="Código"
              {...register('code')}
              error={errors.code?.message}
              placeholder="Ej: VERANO2024"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción (opcional)
            </label>
            <textarea
              {...register('description')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Descripción del cupón"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Descuento
              </label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={DiscountType.PERCENTAGE}>Porcentaje (%)</option>
                <option value={DiscountType.FIXED}>Monto Fijo ($)</option>
              </select>
            </div>

            <Input
              label={discountType === DiscountType.PERCENTAGE ? 'Porcentaje' : 'Monto'}
              type="number"
              step="0.01"
              {...register('value', { valueAsNumber: true })}
              error={errors.value?.message}
              placeholder={discountType === DiscountType.PERCENTAGE ? '10' : '50.00'}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Compra Mínima (opcional)"
              type="number"
              step="0.01"
              {...register('minPurchaseAmount', { valueAsNumber: true })}
              error={errors.minPurchaseAmount?.message}
              placeholder="0.00"
            />

            <Input
              label="Descuento Máximo (opcional)"
              type="number"
              step="0.01"
              {...register('maxDiscountAmount', { valueAsNumber: true })}
              error={errors.maxDiscountAmount?.message}
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Fecha de Inicio"
              type="date"
              {...register('startDate')}
              error={errors.startDate?.message}
            />

            <Input
              label="Fecha de Fin"
              type="date"
              {...register('endDate')}
              error={errors.endDate?.message}
            />
          </div>

          <Input
            label="Límite de Usos (opcional)"
            type="number"
            {...register('usageLimit', { valueAsNumber: true })}
            error={errors.usageLimit?.message}
            placeholder="Dejar vacío para usos ilimitados"
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('isActive')}
              id="isActive"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Cupón Activo
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1">
              {editingDiscount ? 'Actualizar Cupón' : 'Crear Cupón'}
            </Button>
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
