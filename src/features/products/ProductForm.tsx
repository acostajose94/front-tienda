import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { productService } from '@/services/product.service';
import { Product } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowLeft } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  sku: z.string().min(1, 'El SKU es requerido'),
  barcode: z.string().optional(),
  category: z.string().min(1, 'La categoría es requerida'),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  cost: z.number().min(0, 'El costo debe ser mayor o igual a 0'),
  stock: z.number().int().min(0, 'El stock debe ser mayor o igual a 0'),
  minStock: z.number().int().min(0, 'El stock mínimo debe ser mayor o igual a 0'),
  maxStock: z.number().int().min(0, 'El stock máximo debe ser mayor o igual a 0'),
  image: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  tags: z.string().optional(),
  isActive: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

export function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      isActive: true,
    },
  });

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      const product = await productService.getProductById(productId);
      setValue('name', product.name);
      setValue('description', product.description);
      setValue('sku', product.sku);
      setValue('barcode', product.barcode || '');
      setValue('category', product.category);
      setValue('price', product.price);
      setValue('cost', product.cost);
      setValue('stock', product.stock);
      setValue('minStock', product.minStock);
      setValue('maxStock', product.maxStock);
      setValue('image', product.image || '');
      setValue('tags', product.tags.join(', '));
      setValue('isActive', product.isActive);
    } catch (error) {
      console.error('Error loading product:', error);
      setError('Error al cargar el producto');
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const productData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        image: data.image || undefined,
        barcode: data.barcode || undefined,
      };

      if (id) {
        await productService.updateProduct(id, productData);
      } else {
        await productService.createProduct(productData as any);
      }

      navigate('/admin/products');
    } catch (error: any) {
      console.error('Error saving product:', error);
      setError(error.response?.data?.message || 'Error al guardar el producto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/products')}
        >
          <ArrowLeft size={20} />
          Volver
        </Button>
      </div>

      <Card title={id ? 'Editar Producto' : 'Nuevo Producto'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nombre del Producto"
              {...register('name')}
              error={errors.name?.message}
            />

            <Input
              label="SKU"
              {...register('sku')}
              error={errors.sku?.message}
            />

            <Input
              label="Código de Barras"
              {...register('barcode')}
              error={errors.barcode?.message}
            />

            <Input
              label="Categoría"
              {...register('category')}
              error={errors.category?.message}
            />

            <Input
              label="Precio"
              type="number"
              step="0.01"
              {...register('price', { valueAsNumber: true })}
              error={errors.price?.message}
            />

            <Input
              label="Costo"
              type="number"
              step="0.01"
              {...register('cost', { valueAsNumber: true })}
              error={errors.cost?.message}
            />

            <Input
              label="Stock"
              type="number"
              {...register('stock', { valueAsNumber: true })}
              error={errors.stock?.message}
            />

            <Input
              label="Stock Mínimo"
              type="number"
              {...register('minStock', { valueAsNumber: true })}
              error={errors.minStock?.message}
            />

            <Input
              label="Stock Máximo"
              type="number"
              {...register('maxStock', { valueAsNumber: true })}
              error={errors.maxStock?.message}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <Input
              label="URL de Imagen"
              {...register('image')}
              error={errors.image?.message}
              helperText="Ingresa la URL de la imagen del producto"
            />

            <Input
              label="Etiquetas (separadas por comas)"
              {...register('tags')}
              error={errors.tags?.message}
              placeholder="nuevo, promoción, oferta"
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('isActive')}
                id="isActive"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Producto Activo
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" isLoading={isLoading} className="flex-1">
              {id ? 'Actualizar Producto' : 'Crear Producto'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/admin/products')}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
