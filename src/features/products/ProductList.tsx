import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '@/services/product.service';
import { Product } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCart, Plus, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const addItem = useCartStore(state => state.addItem);
  const { user } = useAuthStore();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  const loadProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data.filter(p => p.isActive));
      setFilteredProducts(data.filter(p => p.isActive));
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem(product);
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
        <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
        {user && (
          <Link to="/admin/products/new">
            <Button>
              <Plus size={20} />
              Nuevo Producto
            </Button>
          </Link>
        )}
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Search size={20} />
          Buscar
        </Button>
      </div>

      {filteredProducts.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron productos</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="flex flex-col">
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 mb-4">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-48 w-full object-cover object-center"
                  />
                ) : (
                  <div className="h-48 w-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400">Sin imagen</span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                <p className="text-xs text-gray-500 mb-2">Categoría: {product.category}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-primary-600">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `Stock: ${product.stock}` : 'Sin stock'}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => handleAddToCart(product)}
                disabled={product.stock === 0}
                className="w-full"
              >
                <ShoppingCart size={18} />
                Agregar al Carrito
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
