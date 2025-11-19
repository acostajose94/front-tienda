import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { orderService } from '@/services/order.service';
import { Order } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Lock, ShoppingBag, Package } from 'lucide-react';
import { format } from 'date-fns';

const profileSchema = z.object({
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  email: z.string().email('Email inválido'),
});

const passwordSchema = z.object({
  oldPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export function UserProfile() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'orders'>('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab]);

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    try {
      // Filter orders by customer
      const allOrders = await orderService.getOrders({ cashierId: user?.id });
      setOrders(allOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const onSubmitProfile = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      await authService.updateProfile(data);
      alert('Perfil actualizado exitosamente');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    setIsSaving(true);
    try {
      await authService.changePassword(data.oldPassword, data.newPassword);
      alert('Contraseña cambiada exitosamente');
      resetPassword();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completado';
      case 'PENDING':
        return 'Pendiente';
      case 'PROCESSING':
        return 'Procesando';
      case 'CANCELLED':
        return 'Cancelado';
      case 'REFUNDED':
        return 'Reembolsado';
      default:
        return status;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <User className="inline-block mr-2" size={18} />
            Información Personal
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'password'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Lock className="inline-block mr-2" size={18} />
            Cambiar Contraseña
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ShoppingBag className="inline-block mr-2" size={18} />
            Historial de Compras
          </button>
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card title="Información Personal">
          <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
            <Input
              label="Nombre de Usuario"
              {...registerProfile('username')}
              error={profileErrors.username?.message}
            />

            <Input
              label="Email"
              type="email"
              {...registerProfile('email')}
              error={profileErrors.email?.message}
            />

            <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
              <Package className="text-blue-600" size={20} />
              <div>
                <p className="text-sm font-medium text-blue-900">Rol de Usuario</p>
                <p className="text-sm text-blue-700">{user?.role}</p>
              </div>
            </div>

            <Button type="submit" isLoading={isSaving}>
              Guardar Cambios
            </Button>
          </form>
        </Card>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <Card title="Cambiar Contraseña">
          <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">
            <Input
              label="Contraseña Actual"
              type="password"
              {...registerPassword('oldPassword')}
              error={passwordErrors.oldPassword?.message}
            />

            <Input
              label="Nueva Contraseña"
              type="password"
              {...registerPassword('newPassword')}
              error={passwordErrors.newPassword?.message}
              helperText="Mínimo 6 caracteres"
            />

            <Input
              label="Confirmar Nueva Contraseña"
              type="password"
              {...registerPassword('confirmPassword')}
              error={passwordErrors.confirmPassword?.message}
            />

            <Button type="submit" isLoading={isSaving}>
              Cambiar Contraseña
            </Button>
          </form>
        </Card>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <Card title="Historial de Compras">
          {isLoadingOrders ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No tienes compras registradas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Orden #{order.orderNumber}</p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.quantity}x {item.productName}
                        </span>
                        <span className="font-medium">${item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="font-bold text-primary-600 text-lg">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Notas:</p>
                      <p className="text-sm text-gray-700">{order.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
