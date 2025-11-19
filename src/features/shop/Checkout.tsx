import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { orderService } from '@/services/order.service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PaymentMethod, OrderStatus } from '@/types';
import { CreditCard, Truck, CheckCircle, ShoppingBag, Store as StoreIcon, MapPin, Tag } from 'lucide-react';
import { discountService } from '@/services/discount.service';
import { storeService } from '@/services/store.service';
import { Discount, Store } from '@/types';

const checkoutSchema = z.object({
  // Delivery Method
  deliveryMethod: z.enum(['delivery', 'pickup']),
  storeId: z.string().optional(),

  // Shipping Information (for delivery)
  firstName: z.string().min(2, 'El nombre es requerido'),
  lastName: z.string().min(2, 'El apellido es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(6, 'El teléfono es requerido'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().min(2, 'El país es requerido'),

  // Payment Information
  paymentMethod: z.nativeEnum(PaymentMethod),
  cardNumber: z.string().optional(),
  cardName: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvv: z.string().optional(),

  // Coupon
  couponCode: z.string().optional(),

  // Additional
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart, getSubtotal } = useCartStore();
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [stores, setStores] = useState<Store[]>([]);
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: user?.username || '',
      email: user?.email || '',
      paymentMethod: PaymentMethod.CREDIT_CARD,
      country: 'Argentina',
    },
  });

  const paymentMethod = watch('paymentMethod');
  const subtotal = getSubtotal();
  const shipping = 10; // Fixed shipping cost
  const tax = subtotal * 0.16; // 16% tax
  const total = subtotal + shipping + tax;

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    setIsProcessing(true);

    try {
      // Create order
      const orderItems = items.map((item, index) => ({
        id: `temp-${index}`,
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        discount: 0,
        subtotal: item.product.price * item.quantity,
      }));

      await orderService.createOrder({
        customerId: user?.id,
        storeId: 'online-store',
        cashRegisterId: 'online',
        cashierId: 'online',
        items: orderItems,
        subtotal,
        taxes: [{ taxId: 'tax-1', name: 'IVA', amount: tax }],
        discounts: [],
        charges: [{ chargeId: 'shipping', name: 'Envío', amount: shipping }],
        total,
        paymentMethod: data.paymentMethod,
        status: OrderStatus.PENDING,
        notes: data.notes,
      } as any);

      // Clear cart
      clearCart();

      // Show success
      alert('¡Pedido realizado exitosamente! Recibirás un email de confirmación.');
      navigate('/shop');
    } catch (error) {
      console.error('Error processing order:', error);
      alert('Error al procesar el pedido. Por favor intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Tu carrito está vacío
            </h2>
            <p className="text-gray-600 mb-6">
              Agrega algunos productos para continuar con la compra
            </p>
            <Button onClick={() => navigate('/shop')}>
              Ir a la Tienda
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Finalizar Compra</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">Envío</span>
          </div>
          <div className="w-24 h-1 bg-gray-300 mx-4" />
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">Pago</span>
          </div>
          <div className="w-24 h-1 bg-gray-300 mx-4" />
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">Confirmación</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <Card title="Información de Envío">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="md:col-span-2">
                  <Input
                    label="Dirección"
                    {...register('address')}
                    error={errors.address?.message}
                  />
                </div>
                <Input
                  label="Ciudad"
                  {...register('city')}
                  error={errors.city?.message}
                />
                <Input
                  label="Estado/Provincia"
                  {...register('state')}
                  error={errors.state?.message}
                />
                <Input
                  label="Código Postal"
                  {...register('zipCode')}
                  error={errors.zipCode?.message}
                />
                <Input
                  label="País"
                  {...register('country')}
                  error={errors.country?.message}
                />
              </div>
            </Card>

            {/* Payment Information */}
            <Card title="Información de Pago">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Método de Pago
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="relative flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary-500">
                      <input
                        type="radio"
                        {...register('paymentMethod')}
                        value={PaymentMethod.CREDIT_CARD}
                        className="h-4 w-4 text-primary-600"
                      />
                      <CreditCard className="ml-3 h-5 w-5 text-gray-600" />
                      <span className="ml-2 text-sm font-medium">Tarjeta de Crédito</span>
                    </label>
                    <label className="relative flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary-500">
                      <input
                        type="radio"
                        {...register('paymentMethod')}
                        value={PaymentMethod.DEBIT_CARD}
                        className="h-4 w-4 text-primary-600"
                      />
                      <CreditCard className="ml-3 h-5 w-5 text-gray-600" />
                      <span className="ml-2 text-sm font-medium">Tarjeta de Débito</span>
                    </label>
                    <label className="relative flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary-500">
                      <input
                        type="radio"
                        {...register('paymentMethod')}
                        value={PaymentMethod.TRANSFER}
                        className="h-4 w-4 text-primary-600"
                      />
                      <span className="ml-7 text-sm font-medium">Transferencia</span>
                    </label>
                    <label className="relative flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary-500">
                      <input
                        type="radio"
                        {...register('paymentMethod')}
                        value={PaymentMethod.CASH}
                        className="h-4 w-4 text-primary-600"
                      />
                      <span className="ml-7 text-sm font-medium">Efectivo</span>
                    </label>
                  </div>
                </div>

                {(paymentMethod === PaymentMethod.CREDIT_CARD || paymentMethod === PaymentMethod.DEBIT_CARD) && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <Input
                      label="Número de Tarjeta"
                      {...register('cardNumber')}
                      placeholder="1234 5678 9012 3456"
                    />
                    <Input
                      label="Nombre en la Tarjeta"
                      {...register('cardName')}
                      placeholder="Juan Pérez"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Fecha de Expiración"
                        {...register('cardExpiry')}
                        placeholder="MM/AA"
                      />
                      <Input
                        label="CVV"
                        {...register('cardCvv')}
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Additional Notes */}
            <Card title="Notas Adicionales (Opcional)">
              <textarea
                {...register('notes')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Instrucciones especiales de entrega, comentarios, etc."
              />
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <Card title="Resumen del Pedido" className="sticky top-6">
              <div className="space-y-4">
                {/* Cart Items */}
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-3 pb-3 border-b border-gray-200">
                      {item.product.image && (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                        <p className="text-xs text-gray-500">Cantidad: {item.quantity}</p>
                        <p className="text-sm font-semibold text-primary-600">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Envío:</span>
                    <span className="font-medium">${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Impuestos (16%):</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                    <span>Total:</span>
                    <span className="text-primary-600">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  isLoading={isProcessing}
                  className="w-full"
                  size="lg"
                >
                  <CheckCircle size={20} />
                  Confirmar Pedido
                </Button>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-4">
                  <CheckCircle size={14} className="text-green-600" />
                  <span>Pago seguro y encriptado</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
