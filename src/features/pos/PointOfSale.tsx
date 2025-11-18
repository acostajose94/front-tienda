import { useState, useEffect } from 'react';
import { productService } from '@/services/product.service';
import { customerService } from '@/services/customer.service';
import { taxService } from '@/services/tax.service';
import { discountService } from '@/services/discount.service';
import { orderService } from '@/services/order.service';
import { Product, Customer, Tax, Discount, OrderItem, PaymentMethod } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, ShoppingCart, Trash2, Plus, Minus, User, Tag } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

interface POSItem {
  product: Product;
  quantity: number;
}

export function PointOfSale() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [cart, setCart] = useState<POSItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, customersData, taxesData] = await Promise.all([
        productService.getProducts(),
        customerService.getCustomers(),
        taxService.getActiveTaxes(),
      ]);
      setProducts(productsData.filter(p => p.isActive && p.stock > 0));
      setCustomers(customersData);
      setTaxes(taxesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const item = cart.find(i => i.product.id === productId);
    if (!item) return;

    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else if (newQuantity <= item.product.stock) {
      setCart(cart.map(i =>
        i.product.id === productId ? { ...i, quantity: newQuantity } : i
      ));
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const calculateTaxes = () => {
    const subtotal = calculateSubtotal();
    return taxes.map(tax => ({
      taxId: tax.id,
      name: tax.name,
      amount: tax.type === 'PERCENTAGE' ? (subtotal * tax.value / 100) : tax.value,
    }));
  };

  const calculateDiscount = () => {
    if (!appliedDiscount) return 0;
    const subtotal = calculateSubtotal();

    if (appliedDiscount.type === 'PERCENTAGE') {
      const discount = subtotal * appliedDiscount.value / 100;
      return appliedDiscount.maxDiscountAmount
        ? Math.min(discount, appliedDiscount.maxDiscountAmount)
        : discount;
    } else {
      return appliedDiscount.value;
    }
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxesTotal = calculateTaxes().reduce((sum, tax) => sum + tax.amount, 0);
    const discount = calculateDiscount();
    return subtotal + taxesTotal - discount;
  };

  const applyDiscount = async () => {
    if (!discountCode) return;

    try {
      const result = await discountService.validateDiscount(discountCode, calculateSubtotal());
      if (result.valid && result.discount) {
        setAppliedDiscount(result.discount);
      } else {
        alert(result.message || 'Código de descuento inválido');
      }
    } catch (error) {
      console.error('Error applying discount:', error);
      alert('Error al aplicar el descuento');
    }
  };

  const processPayment = async () => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    setIsProcessing(true);

    try {
      const orderItems: OrderItem[] = cart.map((item, index) => ({
        id: `temp-${index}`,
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        discount: 0,
        subtotal: item.product.price * item.quantity,
      }));

      const taxesData = calculateTaxes();
      const discountAmount = calculateDiscount();

      await orderService.createOrder({
        customerId: selectedCustomer?.id,
        storeId: 'default-store',
        cashRegisterId: 'default-register',
        cashierId: 'current-user',
        items: orderItems,
        subtotal: calculateSubtotal(),
        taxes: taxesData,
        discounts: appliedDiscount ? [{
          discountId: appliedDiscount.id,
          name: appliedDiscount.name,
          amount: discountAmount,
        }] : [],
        charges: [],
        total: calculateTotal(),
        paymentMethod,
        status: 'COMPLETED',
      } as any);

      // Reset
      setCart([]);
      setSelectedCustomer(null);
      setAppliedDiscount(null);
      setDiscountCode('');
      alert('Venta procesada exitosamente');
      loadData(); // Reload products to update stock
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error al procesar la venta');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Products Section */}
      <div className="lg:col-span-2 space-y-6">
        <Card title="Productos">
          <div className="mb-4">
            <Input
              placeholder="Buscar producto por nombre o SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all text-left"
              >
                <h4 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h4>
                <p className="text-sm text-gray-500 mb-2">{product.sku}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-primary-600">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Cart Section */}
      <div className="space-y-6">
        <Card title="Carrito de Venta">
          <div className="space-y-4">
            {/* Customer Selection */}
            <div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsCustomerModalOpen(true)}
              >
                <User size={18} />
                {selectedCustomer
                  ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
                  : 'Seleccionar Cliente'}
              </Button>
            </div>

            {/* Cart Items */}
            <div className="border-t border-b border-gray-200 py-4 max-h-60 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Carrito vacío</p>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          ${item.product.price.toFixed(2)} c/u
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Discount */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Código de descuento"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                />
                <Button size="sm" onClick={applyDiscount}>
                  <Tag size={16} />
                </Button>
              </div>
              {appliedDiscount && (
                <p className="text-sm text-green-600">
                  Descuento aplicado: {appliedDiscount.name}
                </p>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
              </div>

              {calculateTaxes().map((tax) => (
                <div key={tax.taxId} className="flex justify-between text-sm">
                  <span className="text-gray-600">{tax.name}:</span>
                  <span className="font-medium">${tax.amount.toFixed(2)}</span>
                </div>
              ))}

              {appliedDiscount && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Descuento:</span>
                  <span className="font-medium">-${calculateDiscount().toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span className="text-primary-600">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Pago
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={PaymentMethod.CASH}>Efectivo</option>
                <option value={PaymentMethod.CREDIT_CARD}>Tarjeta de Crédito</option>
                <option value={PaymentMethod.DEBIT_CARD}>Tarjeta de Débito</option>
                <option value={PaymentMethod.TRANSFER}>Transferencia</option>
                <option value={PaymentMethod.OTHER}>Otro</option>
              </select>
            </div>

            {/* Process Payment Button */}
            <Button
              onClick={processPayment}
              isLoading={isProcessing}
              disabled={cart.length === 0}
              className="w-full"
            >
              <ShoppingCart size={18} />
              Procesar Venta
            </Button>
          </div>
        </Card>
      </div>

      {/* Customer Modal */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title="Seleccionar Cliente"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            placeholder="Buscar cliente..."
          />
          <div className="max-h-96 overflow-y-auto space-y-2">
            <button
              onClick={() => {
                setSelectedCustomer(null);
                setIsCustomerModalOpen(false);
              }}
              className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Sin cliente (Venta anónima)
            </button>
            {customers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => {
                  setSelectedCustomer(customer);
                  setIsCustomerModalOpen(false);
                }}
                className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <p className="font-medium">
                  {customer.firstName} {customer.lastName}
                </p>
                <p className="text-sm text-gray-500">{customer.email}</p>
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
