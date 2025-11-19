import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { customerService } from '@/services/customer.service';
import { DocumentType } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

const documentSchema = z.object({
  type: z.nativeEnum(DocumentType),
  number: z.string().min(1, 'El número de documento es requerido'),
  country: z.string().optional(),
  expirationDate: z.string().optional(),
});

const customerSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  documents: z.array(documentSchema).min(1, 'Debe agregar al menos un documento'),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  birthDate: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export function CustomerForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      documents: [{ type: DocumentType.DNI, number: '', country: '', expirationDate: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'documents',
  });

  useEffect(() => {
    if (id) {
      loadCustomer(id);
    }
  }, [id]);

  const loadCustomer = async (customerId: string) => {
    try {
      const customer = await customerService.getCustomerById(customerId);
      setValue('firstName', customer.firstName);
      setValue('lastName', customer.lastName);
      setValue('email', customer.email);
      setValue('phone', customer.phone);
      setValue('documents', customer.documents);
      setValue('address', customer.address);
      setValue('birthDate', customer.birthDate);
      setValue('notes', customer.notes);
    } catch (error) {
      console.error('Error loading customer:', error);
      setError('Error al cargar el cliente');
    }
  };

  const onSubmit = async (data: CustomerFormData) => {
    setIsLoading(true);
    setError('');

    try {
      if (id) {
        await customerService.updateCustomer(id, data as any);
      } else {
        await customerService.createCustomer(data as any);
      }

      navigate('/admin/customers');
    } catch (error: any) {
      console.error('Error saving customer:', error);
      setError(error.response?.data?.message || 'Error al guardar el cliente');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/admin/customers')}>
          <ArrowLeft size={20} />
          Volver
        </Button>
      </div>

      <Card title={id ? 'Editar Cliente' : 'Nuevo Cliente'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nombre"
                {...register('firstName')}
                error={errors.firstName?.message}
              />

              <Input
                label="Apellido"
                {...register('lastName')}
                error={errors.lastName?.message}
              />

              <Input
                label="Email"
                type="email"
                {...register('email')}
                error={errors.email?.message}
              />

              <Input
                label="Teléfono"
                {...register('phone')}
                error={errors.phone?.message}
              />

              <Input
                label="Fecha de Nacimiento"
                type="date"
                {...register('birthDate')}
                error={errors.birthDate?.message}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Documentos de Identidad</h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => append({ type: DocumentType.DNI, number: '', country: '', expirationDate: '' })}
              >
                <Plus size={16} />
                Agregar Documento
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-700">Documento {index + 1}</h4>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => remove(index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Documento
                    </label>
                    <select
                      {...register(`documents.${index}.type`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value={DocumentType.DNI}>DNI</option>
                      <option value={DocumentType.PASSPORT}>Pasaporte</option>
                      <option value={DocumentType.CEDULA}>Cédula</option>
                      <option value={DocumentType.RUC}>RUC</option>
                      <option value={DocumentType.OTHER}>Otro</option>
                    </select>
                    {errors.documents?.[index]?.type && (
                      <p className="mt-1 text-sm text-red-600">{errors.documents[index]?.type?.message}</p>
                    )}
                  </div>

                  <Input
                    label="Número de Documento"
                    {...register(`documents.${index}.number`)}
                    error={errors.documents?.[index]?.number?.message}
                  />

                  <Input
                    label="País"
                    {...register(`documents.${index}.country`)}
                    error={errors.documents?.[index]?.country?.message}
                  />

                  <Input
                    label="Fecha de Expiración"
                    type="date"
                    {...register(`documents.${index}.expirationDate`)}
                    error={errors.documents?.[index]?.expirationDate?.message}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Dirección</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Calle"
                {...register('address.street')}
                error={errors.address?.street?.message}
              />

              <Input
                label="Ciudad"
                {...register('address.city')}
                error={errors.address?.city?.message}
              />

              <Input
                label="Estado/Provincia"
                {...register('address.state')}
                error={errors.address?.state?.message}
              />

              <Input
                label="Código Postal"
                {...register('address.zipCode')}
                error={errors.address?.zipCode?.message}
              />

              <Input
                label="País"
                {...register('address.country')}
                error={errors.address?.country?.message}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              {...register('notes')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Notas adicionales sobre el cliente..."
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" isLoading={isLoading} className="flex-1">
              {id ? 'Actualizar Cliente' : 'Crear Cliente'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/admin/customers')}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
