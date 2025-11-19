import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '@/services/product.service';
import { Product } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCart, ArrowLeft, Plus, Minus, Package, Tag, Star } from 'lucide-react';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      const data = await productService.getProductById(productId);
      setProduct(data);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      alert(`${quantity} ${product.name}(s) agregado(s) al carrito`);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addItem(product, quantity);
      navigate('/cart');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Producto no encontrado</p>
            <Button onClick={() => navigate('/shop')}>
              <ArrowLeft size={20} />
              Volver a la Tienda
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate('/shop')}>
        <ArrowLeft size={20} />
        Volver a la Tienda
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          <Card className="overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
                <Package className="h-24 w-24 text-gray-400" />
              </div>
            )}
          </Card>

          {/* Product Tags */}
          {product.tags.length > 0 && (
            <Card className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Tag size={16} />
                Etiquetas
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                {product.category}
              </span>
              <span className="text-gray-500 text-sm">SKU: {product.sku}</span>
            </div>
          </div>

          <div className="border-t border-b border-gray-200 py-6">
            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-bold text-primary-600">
                ${product.price.toFixed(2)}
              </span>
              {product.cost && (
                <span className="text-lg text-gray-500 line-through">
                  ${(product.price * 1.2).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Descripción</h2>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          <Card>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Disponibilidad:</span>
                <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
                </span>
              </div>

              {product.stock > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Cantidad:</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg text-gray-700">Total:</span>
                      <span className="text-3xl font-bold text-primary-600">
                        ${(product.price * quantity).toFixed(2)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <Button onClick={handleBuyNow} className="w-full" size="lg">
                        Comprar Ahora
                      </Button>
                      <Button
                        onClick={handleAddToCart}
                        variant="outline"
                        className="w-full"
                        size="lg"
                      >
                        <ShoppingCart size={20} />
                        Agregar al Carrito
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Additional Info */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Producto</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Categoría:</span>
                <span className="font-medium text-gray-900">{product.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SKU:</span>
                <span className="font-medium text-gray-900">{product.sku}</span>
              </div>
              {product.barcode && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Código de Barras:</span>
                  <span className="font-medium text-gray-900">{product.barcode}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Stock Mínimo:</span>
                <span className="font-medium text-gray-900">{product.minStock}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Reviews Section (Placeholder) */}
      <Card title="Reseñas de Clientes">
        <div className="text-center py-8 text-gray-500">
          <Star className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p>Aún no hay reseñas para este producto</p>
          <p className="text-sm mt-2">Sé el primero en dejar una reseña</p>
        </div>
      </Card>
    </div>
  );
}
