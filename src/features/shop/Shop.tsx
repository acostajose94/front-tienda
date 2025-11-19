import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '@/services/product.service';
import { Product, ProductCategory } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCart, Search, Filter, Grid, List } from 'lucide-react';

export function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc' | 'newest'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, selectedCategory, searchQuery, sortBy, priceRange]);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        productService.getProducts(),
        productService.getCategories(),
      ]);
      setProducts(productsData.filter(p => p.isActive && p.stock > 0));
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by price range
    filtered = filtered.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

    // Sort products
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    setFilteredProducts(filtered);
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
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-blue-700 text-white py-12 px-6 rounded-lg">
        <h1 className="text-4xl font-bold mb-4">Bienvenido a Nuestra Tienda</h1>
        <p className="text-lg opacity-90">Descubre nuestros mejores productos al mejor precio</p>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Filtros">
            {/* Categories */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Categorías</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  Todas las categorías
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.name
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Rango de Precio</h3>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Mín"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                  />
                  <Input
                    type="number"
                    placeholder="Máx"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  ${priceRange.min} - ${priceRange.max}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search and Sort Bar */}
          <Card>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="newest">Más recientes</option>
                <option value="name">Nombre A-Z</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </Card>

          {/* Results Count */}
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              Mostrando <span className="font-semibold">{filteredProducts.length}</span> productos
            </p>
          </div>

          {/* Products */}
          {filteredProducts.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No se encontraron productos</p>
              </div>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="flex flex-col hover:shadow-xl transition-shadow">
                  <Link to={`/shop/product/${product.id}`}>
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 mb-4">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-48 w-full object-cover object-center hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="h-48 w-full flex items-center justify-center bg-gray-100">
                          <span className="text-gray-400">Sin imagen</span>
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex-1">
                    <Link to={`/shop/product/${product.id}`}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>

                    {product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {product.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-primary-600">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="w-full"
                  >
                    <ShoppingCart size={18} />
                    Agregar al Carrito
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <Card key={product.id}>
                  <div className="flex gap-6">
                    <Link to={`/shop/product/${product.id}`} className="flex-shrink-0">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-sm">Sin imagen</span>
                        </div>
                      )}
                    </Link>

                    <div className="flex-1">
                      <Link to={`/shop/product/${product.id}`}>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-primary-600">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-gray-600 mb-3">{product.description}</p>
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-primary-600">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex items-center">
                      <Button onClick={() => handleAddToCart(product)}>
                        <ShoppingCart size={18} />
                        Agregar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
