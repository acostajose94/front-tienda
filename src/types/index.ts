// ============================================
// USUARIOS Y AUTENTICACIÓN
// ============================================

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
  CUSTOMER = 'CUSTOMER',
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  storeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ============================================
// DOCUMENTOS DE IDENTIDAD
// ============================================

export enum DocumentType {
  DNI = 'DNI',
  PASSPORT = 'PASSPORT',
  CEDULA = 'CEDULA',
  RUC = 'RUC',
  OTHER = 'OTHER',
}

export interface CustomerDocument {
  type: DocumentType;
  number: string;
  country?: string;
  expirationDate?: string;
}

// ============================================
// CLIENTES
// ============================================

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documents: CustomerDocument[];
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  birthDate?: string;
  notes?: string;
  totalPurchases: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// PRODUCTOS
// ============================================

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  barcode?: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  maxStock: number;
  image?: string;
  tags: string[];
  isActive: boolean;
  storeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
}

// ============================================
// LOCALES/TIENDAS
// ============================================

export interface Store {
  id: string;
  name: string;
  code: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// IMPUESTOS
// ============================================

export enum TaxType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export interface Tax {
  id: string;
  name: string;
  description?: string;
  type: TaxType;
  value: number;
  isActive: boolean;
  applicableProducts?: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// DESCUENTOS
// ============================================

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export interface Discount {
  id: string;
  name: string;
  code: string;
  description?: string;
  type: DiscountType;
  value: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableProducts?: string[];
  usageLimit?: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// CARGOS ADICIONALES
// ============================================

export enum ChargeType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export interface Charge {
  id: string;
  name: string;
  description?: string;
  type: ChargeType;
  value: number;
  isOptional: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// CAJAS REGISTRADORAS
// ============================================

export interface CashRegister {
  id: string;
  name: string;
  code: string;
  storeId: string;
  isActive: boolean;
  openingBalance: number;
  currentBalance: number;
  openedAt?: string;
  closedAt?: string;
  openedBy?: string;
  closedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// VENTAS Y ÓRDENES
// ============================================

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  TRANSFER = 'TRANSFER',
  OTHER = 'OTHER',
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  discount?: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  storeId: string;
  cashRegisterId: string;
  cashierId: string;
  items: OrderItem[];
  subtotal: number;
  taxes: { taxId: string; name: string; amount: number }[];
  discounts: { discountId: string; name: string; amount: number }[];
  charges: { chargeId: string; name: string; amount: number }[];
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// REPORTES
// ============================================

export enum ReportPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  CUSTOM = 'CUSTOM',
}

export interface SalesReport {
  period: ReportPeriod;
  startDate: string;
  endDate: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  byStore?: Record<string, { sales: number; orders: number }>;
  byCashier?: Record<string, { sales: number; orders: number }>;
  byCashRegister?: Record<string, { sales: number; orders: number }>;
  topProducts: { productId: string; productName: string; quantity: number; revenue: number }[];
}

// ============================================
// ANALYTICS Y PREDICCIONES
// ============================================

export interface CustomerAnalytics {
  customerId: string;
  totalPurchases: number;
  totalSpent: number;
  averageOrderValue: number;
  purchaseFrequency: number;
  lastPurchaseDate: string;
  favoriteProducts: string[];
  predictedNextPurchase?: string;
}

export interface InventoryPrediction {
  productId: string;
  productName: string;
  currentStock: number;
  averageDailySales: number;
  predictedStockoutDate: string;
  recommendedOrderQuantity: number;
  confidence: number;
}

export interface PurchaseTrend {
  date: string;
  sales: number;
  orders: number;
  customers: number;
}

// ============================================
// CARRITO DE COMPRAS
// ============================================

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  total: number;
}

// ============================================
// REPORTES FINANCIEROS
// ============================================

export interface ProfitReport {
  period: string;
  totalRevenue: number;
  totalCosts: number;
  grossProfit: number;
  operatingExpenses: number;
  netProfit: number;
  profitMargin: number;
  byCategory: {
    categoryId: string;
    categoryName: string;
    revenue: number;
    costs: number;
    profit: number;
  }[];
}

export interface TaxReport {
  period: string;
  totalSales: number;
  taxableBase: number;
  igv: number; // 18% Peru
  incomeTax: number;
  municipalTax: number;
  otherTaxes: number;
  totalTaxes: number;
  breakdown: {
    date: string;
    sales: number;
    igv: number;
    incomeTax: number;
  }[];
}

export interface PayrollReport {
  period: string;
  totalEmployees: number;
  totalGrossSalary: number;
  totalDeductions: number;
  totalNetSalary: number;
  totalBenefits: number;
  employees: {
    employeeId: string;
    employeeName: string;
    position: string;
    grossSalary: number;
    deductions: number;
    netSalary: number;
    benefits: number;
  }[];
  byDepartment: Record<string, {
    employees: number;
    totalSalary: number;
  }>;
}

export interface ExpenseReport {
  period: string;
  totalExpenses: number;
  byCategory: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  byType: {
    type: 'FIXED' | 'VARIABLE' | 'ONE_TIME';
    amount: number;
  }[];
  topExpenses: {
    description: string;
    amount: number;
    date: string;
    category: string;
  }[];
}

export interface CashFlowReport {
  period: string;
  openingBalance: number;
  closingBalance: number;
  totalInflow: number;
  totalOutflow: number;
  netCashFlow: number;
  inflows: {
    source: string;
    amount: number;
  }[];
  outflows: {
    destination: string;
    amount: number;
  }[];
  dailyFlow: {
    date: string;
    inflow: number;
    outflow: number;
    balance: number;
  }[];
}

export interface ProductProfitabilityReport {
  productId: string;
  productName: string;
  totalSold: number;
  revenue: number;
  cost: number;
  profit: number;
  profitMargin: number;
  roi: number;
}

export enum FinancialReportType {
  PROFIT = 'PROFIT',
  TAX = 'TAX',
  PAYROLL = 'PAYROLL',
  EXPENSE = 'EXPENSE',
  CASH_FLOW = 'CASH_FLOW',
  PRODUCT_PROFITABILITY = 'PRODUCT_PROFITABILITY',
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: number;
  hireDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  benefits: {
    healthInsurance: boolean;
    lifeInsurance: boolean;
    retirement: boolean;
    bonus: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: 'FIXED' | 'VARIABLE' | 'ONE_TIME';
  date: string;
  storeId?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
