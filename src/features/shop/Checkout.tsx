import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { orderService } from '@/services/order.service';
import { paymentService } from '@/services/payment.service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PaymentMethod, OrderStatus } from '@/types';
import { CreditCard, Truck, CheckCircle, ShoppingBag, Store as StoreIcon, Tag, Banknote } from 'lucide-react';
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
  transferReference: z.string().optional(),

  // Coupon
  couponCode: z.string().optional(),

  // Additional
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

// City shipping costs
const SHIPPING_COSTS: Record<string, number> = {
  'Lima': 10,
  'Callao': 12,
  'Arequipa': 20,
  'Trujillo': 18,
  'Cusco': 25,
  'Chiclayo': 16,
  'Piura': 19,
  'Iquitos': 30,
  'Huancayo': 15,
  'Tacna': 22,
};

export function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart, getSubtotal } = useCartStore();
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
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
      country: 'Perú',
      deliveryMethod: 'delivery',
    },
  });

  const paymentMethod = watch('paymentMethod');
  const deliveryMethod = watch('deliveryMethod');
  const selectedCity = watch('city');
  const couponCode = watch('couponCode');

  const subtotal = getSubtotal();
  const discountAmount = appliedDiscount
    ? appliedDiscount.type === 'PERCENTAGE'
      ? (subtotal * appliedDiscount.value) / 100
      : appliedDiscount.value
    : 0;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const shipping = deliveryMethod === 'delivery' ? (SHIPPING_COSTS[selectedCity || ''] || 15) : 0;
  const tax = subtotalAfterDiscount * 0.18; // 18% IGV (Peru tax)
  const total = subtotalAfterDiscount + shipping + tax;

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const data = await storeService.getStores();
      setStores(data);
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      setCouponError('Ingresa un código de cupón');
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError('');

    try {
      const response = await discountService.validateDiscount(couponCode, subtotal);

      if (!response.valid) {
        setCouponError(response.message || 'Cupón inválido');
        return;
      }

      if (response.discount) {
        setAppliedDiscount(response.discount);
        alert('¡Cupón aplicado exitosamente!');
      }
    } catch (error: any) {
      setCouponError(error.response?.data?.message || 'Cupón inválido o expirado');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    if (deliveryMethod === 'pickup' && !data.storeId) {
      alert('Por favor selecciona una tienda para recoger tu pedido');
      return;
    }

    setIsProcessing(true);

    try {
      // Create order items
      const orderItems = items.map((item, index) => ({
        id: `temp-${index}`,
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        discount: 0,
        subtotal: item.product.price * item.quantity,
      }));

      // Create order
      const orderData = {
        customerId: user?.id,
        storeId: data.storeId || 'online-store',
        cashRegisterId: 'online',
        cashierId: 'online',
        items: orderItems,
        subtotal: subtotalAfterDiscount,
        taxes: [{ taxId: 'igv', name: 'IGV (18%)', amount: tax }],
        discounts: appliedDiscount
          ? [{ discountId: appliedDiscount.id, name: appliedDiscount.name, amount: discountAmount }]
          : [],
        charges: shipping > 0 ? [{ chargeId: 'shipping', name: 'Envío', amount: shipping }] : [],
        total,
        paymentMethod: data.paymentMethod,
        status: OrderStatus.PENDING,
        notes: data.notes,
        shippingAddress: deliveryMethod === 'delivery'
          ? {
              firstName: data.firstName,
              lastName: data.lastName,
              address: data.address || '',
              city: data.city || '',
              state: data.state || '',
              zipCode: data.zipCode || '',
              country: data.country,
              phone: data.phone,
            }
          : undefined,
      };

      const order = await orderService.createOrder(orderData as any);

      // Process payment based on method
      if (data.paymentMethod === PaymentMethod.CREDIT_CARD || data.paymentMethod === PaymentMethod.DEBIT_CARD) {
        // Stripe payment - redirect to Stripe Checkout
        const { url } = await paymentService.createStripeCheckoutSession(order.id, total);
        window.location.href = url;
        return; // Don't clear cart yet, will be cleared after payment success
      } else if (data.paymentMethod === PaymentMethod.CASH) {
        // Cash payment - register as pending
        await paymentService.registerCashPayment(order.id, total);
      } else if (data.paymentMethod === PaymentMethod.TRANSFER) {
        // Transfer payment - register with reference
        if (!data.transferReference) {
          alert('Por favor ingresa el número de referencia de la transferencia');
          return;
        }
        await paymentService.registerTransferPayment(order.id, total, data.transferReference);
      }

      // Clear cart
      clearCart();

      // Show success
      alert('¡Pedido realizado exitosamente! Recibirás un email de confirmación.');
      navigate('/profile?tab=orders');
    } catch (error: any) {
      console.error('Error processing order:', error);
      alert(error.response?.data?.message || 'Error al procesar el pedido. Por favor intenta nuevamente.');
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

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Method */}
            <Card title="Método de Entrega">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer ${
                  deliveryMethod === 'delivery' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                }`}>
                  <input
                    type="radio"
                    {...register('deliveryMethod')}
                    value="delivery"
                    className="mt-1 h-4 w-4 text-primary-600"
                  />
                  <div className="ml-3">
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-primary-600" />
                      <span className="font-medium text-gray-900">Delivery</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Envío a domicilio</p>
                    <p className="text-xs text-gray-400 mt-1">Costo según ubicación</p>
                  </div>
                </label>

                <label className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer ${
                  deliveryMethod === 'pickup' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                }`}>
                  <input
                    type="radio"
                    {...register('deliveryMethod')}
                    value="pickup"
                    className="mt-1 h-4 w-4 text-primary-600"
                  />
                  <div className="ml-3">
                    <div className="flex items-center gap-2">
                      <StoreIcon className="h-5 w-5 text-primary-600" />
                      <span className="font-medium text-gray-900">Pickup</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Recoger en tienda</p>
                    <p className="text-xs font-semibold text-green-600 mt-1">GRATIS</p>
                  </div>
                </label>
              </div>

              {/* Store Selection for Pickup */}
              {deliveryMethod === 'pickup' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecciona la tienda
                  </label>
                  <select
                    {...register('storeId')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Selecciona una tienda</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name} - {typeof store.address === 'string' ? store.address : `${store.address.street}, ${store.address.city}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </Card>

            {/* Shipping Information (only for delivery) */}
            {deliveryMethod === 'delivery' && (
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad *
                    </label>
                    <select
                      {...register('city')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Selecciona tu ciudad</option>
                      {Object.keys(SHIPPING_COSTS).map((city) => (
                        <option key={city} value={city}>
                          {city} - S/. {SHIPPING_COSTS[city]}
                        </option>
                      ))}
                      <option value="Otra">Otra ciudad - S/. 15</option>
                    </select>
                  </div>
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
            )}

            {/* Payment Information */}
            <Card title="Información de Pago">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Método de Pago
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-primary-500 ${
                      paymentMethod === PaymentMethod.CREDIT_CARD ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        {...register('paymentMethod')}
                        value={PaymentMethod.CREDIT_CARD}
                        className="mt-1 h-4 w-4 text-primary-600"
                      />
                      <div className="ml-3">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-gray-600" />
                          <span className="text-sm font-medium">Tarjeta</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Stripe (Internacional)</p>
                      </div>
                    </label>

                    <label className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-primary-500 ${
                      paymentMethod === PaymentMethod.TRANSFER ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        {...register('paymentMethod')}
                        value={PaymentMethod.TRANSFER}
                        className="mt-1 h-4 w-4 text-primary-600"
                      />
                      <div className="ml-3">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-5 w-5 text-gray-600" />
                          <span className="text-sm font-medium">Transferencia</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Banco de la Nación</p>
                      </div>
                    </label>

                    <label className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-primary-500 ${
                      paymentMethod === PaymentMethod.CASH ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        {...register('paymentMethod')}
                        value={PaymentMethod.CASH}
                        className="mt-1 h-4 w-4 text-primary-600"
                      />
                      <div className="ml-3">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-5 w-5 text-gray-600" />
                          <span className="text-sm font-medium">Efectivo</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Contra entrega</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Stripe Card Payment Info */}
                {paymentMethod === PaymentMethod.CREDIT_CARD && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Pago seguro con Stripe</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Serás redirigido a Stripe para completar el pago de forma segura. Aceptamos todas las tarjetas principales.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Transfer Payment Info */}
                {paymentMethod === PaymentMethod.TRANSFER && (
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm font-medium text-amber-900 mb-2">Datos para transferencia:</p>
                      <div className="text-xs text-amber-800 space-y-1">
                        <p><strong>Banco:</strong> Banco de la Nación</p>
                        <p><strong>Cuenta:</strong> 0401-234567-89</p>
                        <p><strong>CCI:</strong> 018-000-040123456789-12</p>
                        <p><strong>Titular:</strong> Mi Tienda SAC</p>
                      </div>
                    </div>
                    <Input
                      label="Número de Referencia de Transferencia"
                      {...register('transferReference')}
                      placeholder="Ingresa el número de operación"
                      error={errors.transferReference?.message}
                    />
                  </div>
                )}

                {/* Cash Payment Info */}
                {paymentMethod === PaymentMethod.CASH && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-900">Pago contra entrega</p>
                        <p className="text-xs text-green-700 mt-1">
                          Pagarás en efectivo cuando recibas tu pedido. Por favor ten el monto exacto disponible.
                        </p>
                      </div>
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
                          S/. {(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Application */}
                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="inline h-4 w-4 mr-1" />
                    ¿Tienes un cupón?
                  </label>
                  <div className="flex gap-2">
                    <Input
                      {...register('couponCode')}
                      placeholder="Código del cupón"
                      disabled={!!appliedDiscount}
                    />
                    {appliedDiscount ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setAppliedDiscount(null)}
                        size="sm"
                      >
                        Quitar
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={handleApplyCoupon}
                        isLoading={isApplyingCoupon}
                        size="sm"
                      >
                        Aplicar
                      </Button>
                    )}
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-600 mt-1">{couponError}</p>
                  )}
                  {appliedDiscount && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                      <p className="text-green-800 font-medium flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Cupón "{appliedDiscount.code}" aplicado
                      </p>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">S/. {subtotal.toFixed(2)}</span>
                  </div>

                  {appliedDiscount && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Descuento ({appliedDiscount.code}):</span>
                      <span className="font-medium">- S/. {discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Envío:</span>
                    <span className="font-medium">
                      {shipping === 0 ? 'GRATIS' : `S/. ${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">IGV (18%):</span>
                    <span className="font-medium">S/. {tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                    <span>Total:</span>
                    <span className="text-primary-600">S/. {total.toFixed(2)}</span>
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
