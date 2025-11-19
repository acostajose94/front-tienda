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

// ============================================
// FACTURACIÓN ELECTRÓNICA - NUBEFACT
// ============================================

export enum InvoiceType {
  FACTURA = '01', // Factura
  BOLETA = '03', // Boleta de Venta
  NOTA_CREDITO = '07', // Nota de Crédito
  NOTA_DEBITO = '08', // Nota de Débito
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT', // Borrador
  SENT = 'SENT', // Enviado a SUNAT
  ACCEPTED = 'ACCEPTED', // Aceptado por SUNAT
  REJECTED = 'REJECTED', // Rechazado por SUNAT
  CANCELLED = 'CANCELLED', // Anulado
}

export enum InvoiceDocumentType {
  DNI = '1', // DNI
  CARNET_EXTRANJERIA = '4', // Carnet de Extranjería
  RUC = '6', // RUC
  PASAPORTE = '7', // Pasaporte
}

export interface InvoiceItem {
  codigo: string;
  descripcion: string;
  cantidad: number;
  valor_unitario: number;
  precio_unitario: number;
  descuento: number;
  subtotal: number;
  tipo_igv: string; // '10' = Gravado
  igv: number;
  total: number;
  anticipo_regularizacion?: boolean;
  anticipo_documento_serie?: string;
  anticipo_documento_numero?: string;
}

export interface NubefactInvoiceRequest {
  operacion: 'generar_comprobante';
  tipo_de_comprobante: InvoiceType;
  serie: string;
  numero: string;
  sunat_transaction: '1' | '2'; // 1 = Producción, 2 = Prueba
  cliente_tipo_de_documento: InvoiceDocumentType;
  cliente_numero_de_documento: string;
  cliente_denominacion: string;
  cliente_direccion: string;
  cliente_email?: string;
  cliente_email_1?: string;
  cliente_email_2?: string;
  fecha_de_emision: string; // YYYY-MM-DD
  fecha_de_vencimiento?: string;
  moneda: '1' | '2'; // 1 = PEN, 2 = USD
  tipo_de_cambio?: number;
  porcentaje_de_igv: number; // 18.00
  descuento_global?: number;
  total_descuento?: number;
  total_anticipo?: number;
  total_gravada: number;
  total_inafecta?: number;
  total_exonerada?: number;
  total_igv: number;
  total_gratuita?: number;
  total_otros_cargos?: number;
  total: number;
  percepcion_tipo?: string;
  percepcion_base_imponible?: number;
  percepcion_total?: number;
  detraccion?: boolean;
  observaciones?: string;
  documento_que_se_modifica_tipo?: string;
  documento_que_se_modifica_serie?: string;
  documento_que_se_modifica_numero?: string;
  tipo_de_nota_de_credito?: string;
  tipo_de_nota_de_debito?: string;
  enviar_automaticamente_a_la_sunat?: boolean;
  enviar_automaticamente_al_cliente?: boolean;
  codigo_unico?: string;
  condiciones_de_pago?: string;
  medio_de_pago?: string;
  placa_vehiculo?: string;
  orden_compra_servicio?: string;
  tabla_personalizada_codigo?: string;
  formato_de_pdf?: string;
  items: InvoiceItem[];
}

export interface NubefactInvoiceResponse {
  errors?: string;
  sunat_description?: string;
  sunat_note?: string;
  sunat_responsecode?: string;
  sunat_soap_error?: string;
  pdf_zip_base64?: string;
  xml_zip_base64?: string;
  cdr_zip_base64?: string;
  enlace_del_pdf?: string;
  enlace_del_xml?: string;
  enlace_del_cdr?: string;
  cadena_para_codigo_qr?: string;
  codigo_hash?: string;
  codigo_de_barras?: string;
  aceptada_por_sunat?: boolean;
  descripcion_sunat?: string;
  nota_sunat?: string;
  numero_sunat?: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  type: InvoiceType;
  status: InvoiceStatus;
  serie: string;
  numero: string;

  // Cliente
  customerDocumentType: InvoiceDocumentType;
  customerDocumentNumber: string;
  customerName: string;
  customerAddress: string;
  customerEmail?: string;

  // Fechas
  issueDate: string;
  dueDate?: string;

  // Montos
  currency: 'PEN' | 'USD';
  subtotal: number;
  discount: number;
  igv: number;
  total: number;

  // Items
  items: InvoiceItem[];

  // SUNAT
  sunatResponse?: NubefactInvoiceResponse;
  sunatAccepted: boolean;
  sunatDescription?: string;

  // Enlaces
  pdfUrl?: string;
  xmlUrl?: string;
  cdrUrl?: string;
  qrCode?: string;

  // Notas
  notes?: string;

  // Modificaciones (para notas de crédito/débito)
  modifiedInvoiceType?: string;
  modifiedInvoiceSerie?: string;
  modifiedInvoiceNumber?: string;
  creditNoteReason?: string;
  debitNoteReason?: string;

  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface NubefactConfig {
  id: string;
  ruc: string;
  usuarioSol: string;
  claveSol: string;
  apiToken: string;
  production: boolean; // true = Producción, false = Prueba

  // Series para comprobantes
  facturaSerie: string; // Ej: F001
  boletaSerie: string; // Ej: B001
  notaCreditoSerie: string; // Ej: FC01, BC01
  notaDebitoSerie: string; // Ej: FD01, BD01

  // Configuración adicional
  sendToSunatAutomatically: boolean;
  sendToCustomerAutomatically: boolean;
  logoUrl?: string;

  createdAt: string;
  updatedAt: string;
}
