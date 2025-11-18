import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { useAuthStore } from './store/authStore';
import { UserRole } from './types';

// Auth
import { Login } from './features/auth/Login';
import { Register } from './features/auth/Register';

// Products
import { ProductList } from './features/products/ProductList';
import { ProductForm } from './features/products/ProductForm';

// Customers
import { CustomerList } from './features/customers/CustomerList';
import { CustomerForm } from './features/customers/CustomerForm';

// POS
import { PointOfSale } from './features/pos/PointOfSale';

// Reports & Analytics
import { Reports } from './features/reports/Reports';
import { Analytics } from './features/analytics/Analytics';

// Cart
import { Cart } from './features/cart/Cart';

// Admin Dashboard
import { AdminDashboard } from './features/admin/AdminDashboard';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }: { children: JSX.Element; allowedRoles?: UserRole[] }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes with Layout */}
        <Route path="/" element={<Layout><ProductList /></Layout>} />
        <Route path="/products" element={<Layout><ProductList /></Layout>} />
        <Route path="/cart" element={<Layout><Cart /></Layout>} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
              <Layout><AdminDashboard /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
              <Layout><ProductList /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/new"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
              <Layout><ProductForm /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/:id/edit"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
              <Layout><ProductForm /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
              <Layout><CustomerList /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/customers/new"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
              <Layout><CustomerForm /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/customers/:id/edit"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
              <Layout><CustomerForm /></Layout>
            </ProtectedRoute>
          }
        />

        {/* POS Route */}
        <Route
          path="/pos"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER]}>
              <Layout><PointOfSale /></Layout>
            </ProtectedRoute>
          }
        />

        {/* Reports Route */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
              <Layout><Reports /></Layout>
            </ProtectedRoute>
          }
        />

        {/* Analytics Route */}
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
              <Layout><Analytics /></Layout>
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
