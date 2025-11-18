import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';

export function Cart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, getSubtotal, getTotal } = useCartStore();

  const handleCheckout = () => {
    // In a real app, this would navigate to a checkout page
    alert('Funcionalidad de checkout en desarrollo');
    clearCart();
    navigate('/products');
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
              Agrega algunos productos para comenzar a comprar
            </p>
            <Button onClick={() => navigate('/products')}>
              Ir a Productos
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Carrito de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                >
                  {item.product.image ? (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-400 text-xs">Sin imagen</span>
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">{item.product.description}</p>
                    <p className="text-lg font-bold text-primary-600 mt-1">
                      ${item.product.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="w-12 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                      disabled={item.quantity >= item.product.stock}
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-red-600 hover:text-red-800 mt-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button variant="danger" onClick={clearCart}>
                Vaciar Carrito
              </Button>
            </div>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card title="Resumen del Pedido">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${getSubtotal().toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Envío:</span>
                <span className="font-medium">Gratis</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Impuestos:</span>
                <span className="font-medium">$0.00</span>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary-600">${getTotal().toFixed(2)}</span>
                </div>
              </div>

              <Button onClick={handleCheckout} className="w-full">
                Proceder al Pago
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/products')}
                className="w-full"
              >
                Continuar Comprando
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
