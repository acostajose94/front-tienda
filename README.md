# Sistema de Gestión de Tienda - Frontend React

Sistema completo de gestión de tienda con React, TypeScript y Tailwind CSS.

## 🚀 Características

### Módulos Principales

1. **Autenticación y Roles**
   - Login/Registro de usuarios
   - Roles: Admin, Manager, Cajero, Cliente
   - Protección de rutas basada en roles

2. **Gestión de Productos**
   - CRUD completo de productos
   - Categorización
   - Control de inventario
   - Búsqueda y filtros

3. **Gestión de Clientes**
   - Registro con múltiples tipos de documento (DNI, Pasaporte, Cédula, RUC)
   - Administración completa de datos
   - Historial de compras

4. **Punto de Venta (POS)**
   - Sistema de caja registradora
   - Búsqueda rápida de productos
   - Aplicación de descuentos
   - Múltiples métodos de pago
   - Cálculo automático de impuestos

5. **Reportes**
   - Reportes diarios, semanales y mensuales
   - Reportes por caja registradora
   - Reportes por cajero
   - Reportes por local
   - Exportación a PDF, Excel y CSV

6. **Analytics**
   - Tendencias de compras
   - Productos más vendidos
   - Análisis por categoría
   - Gráficos interactivos
   - Análisis de ingresos

7. **Gestión de Categorías**
   - CRUD de categorías de productos
   - Categorías jerárquicas (padre/hijo)
   - Asignación a productos

8. **Tienda Online (Storefront)**
   - Catálogo público de productos
   - Filtros por categoría y precio
   - Búsqueda avanzada
   - Vistas grid y lista
   - Página de detalle de producto

9. **Sistema de Cupones/Descuentos**
   - Administración completa de cupones
   - Tipos: Porcentaje o Monto Fijo
   - Fechas de validez
   - Límites de uso
   - Compra mínima y descuento máximo
   - Aplicación en checkout

10. **Checkout Avanzado**
    - **Delivery:** Envío a domicilio con costo por ubicación
    - **Pickup:** Retiro en tienda (gratis)
    - Selección de tienda más cercana
    - Aplicación de cupones
    - Múltiples métodos de pago

11. **Métodos de Pago**
    - **Stripe:** Tarjetas internacionales
    - **Culqi:** Tarjetas y Yape (Perú)
    - **Efectivo:** Pago contra entrega
    - **Transferencia:** Con número de referencia

12. **Registro con Verificación Email**
    - Registro de clientes separado
    - Código de 6 dígitos por email
    - Verificación obligatoria
    - Reenvío de código

13. **Perfil de Usuario**
    - Editar información personal
    - Cambiar contraseña
    - Historial completo de compras
    - Ver estado de pedidos

14. **Reportes Financieros**
    - **Ganancias:** Análisis de ingresos, costos, ganancia bruta/neta, margen de utilidad por categoría
    - **Impuestos:** Cálculo de IGV (18%), Renta, Municipal, declaraciones exportables
    - **Nómina:** Gestión de sueldos, deducciones (AFP/ONP), beneficios (CTS, Gratificaciones), reportes por departamento
    - **Gastos:** Análisis por categoría, tipo (fijos/variables), gastos más altos
    - **Flujo de Caja:** Ingresos vs egresos, saldo, gráfico de flujo diario
    - **Rentabilidad por Producto:** Margen, ROI, análisis de productos más rentables
    - **Exportación:** PDF, Excel, CSV para todos los reportes
    - **Gestión de Empleados:** CRUD completo con cargos, departamentos, salarios
    - **Gestión de Gastos:** Registro y categorización de gastos operativos

15. **Facturación Electrónica - NubeFact** (Nuevo)
    - **Emisión de Comprobantes:**
      - Facturas electrónicas (para empresas con RUC)
      - Boletas de venta electrónicas (para personas naturales)
      - Notas de crédito (devoluciones, anulaciones)
      - Notas de débito (cargos adicionales)
    - **Integración SUNAT:**
      - Envío automático a SUNAT
      - Validación en tiempo real
      - Descarga de CDR (Constancia de Recepción)
      - Consulta de estado de comprobantes
    - **Gestión de Comprobantes:**
      - Lista completa con filtros (fecha, tipo, estado, cliente)
      - Detalle completo del comprobante
      - Visualización de items y totales
      - Estados: Borrador, Enviado, Aceptado, Rechazado, Anulado
    - **Descarga de Archivos:**
      - PDF con formato oficial
      - XML firmado digitalmente
      - CDR de SUNAT
      - Código QR para verificación
    - **Envío Automático:**
      - Email al cliente con PDF adjunto
      - Envío automático a SUNAT tras generación
      - Configuración por comprobante
    - **Generación desde Orden:**
      - Modal para generar comprobante desde cualquier orden/venta
      - Auto-llenado de datos del cliente
      - Validación de RUC para facturas
      - Cálculo automático de IGV (18%)
    - **Configuración:**
      - Credenciales de NubeFact (RUC, Token, Usuario SOL)
      - Series personalizadas (F001, B001, etc.)
      - Modo producción/prueba
      - Envío automático configurable

## 🛠️ Stack Tecnológico

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **React Router v6** - Navegación
- **Zustand** - Estado global
- **Tailwind CSS** - Estilos
- **React Hook Form** + **Zod** - Formularios
- **Recharts** - Gráficos
- **Axios** - HTTP client
- **Stripe** - Pagos internacionales
- **Culqi** - Pagos Perú
- **NubeFact** - Facturación electrónica Perú
- **date-fns** - Manejo de fechas
- **Lucide React** - Iconos

## 🚀 Instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```

   Editar `.env` con tus claves:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_STRIPE_PUBLIC_KEY=pk_test_...
   VITE_CULQI_PUBLIC_KEY=pk_test_...
   ```

3. **Iniciar desarrollo:**
   ```bash
   npm run dev
   ```

4. **Build para producción:**
   ```bash
   npm run build
   ```

## 📁 Estructura

```
src/
├── features/       # Módulos de funcionalidad
├── components/     # Componentes reutilizables
├── services/       # Servicios API
├── store/          # Estado global
└── types/          # TypeScript types
```

## 🔐 Roles

- **Admin**: Acceso completo al sistema
- **Manager**: Reportes, analytics y gestión
- **Cashier**: Punto de venta y ventas
- **Customer**: Compras en tienda online

## 💳 Métodos de Pago Soportados

### Stripe (Internacional)
- Tarjetas de crédito/débito
- Redirección a Stripe Checkout
- Procesamiento seguro

### Culqi (Perú)
- Tarjetas Visa/Mastercard
- Yape
- Procesamiento local

### Otros
- Efectivo (contra entrega)
- Transferencia bancaria

## 🚚 Opciones de Entrega

### Delivery
Envío a domicilio con costos según ciudad:
- Lima: S/. 10
- Callao: S/. 12
- Arequipa: S/. 20
- Trujillo: S/. 18
- Cusco: S/. 25
- Otras ciudades: S/. 15

### Pickup
- Retiro en tienda seleccionada
- **Gratis**
- Lista de tiendas disponibles

## 🎫 Sistema de Cupones

Características:
- Códigos únicos personalizables
- Descuento por porcentaje o monto fijo
- Configuración de fechas de validez
- Límite de usos
- Compra mínima requerida
- Descuento máximo permitido
- Estados: Activo, Expirado, Agotado, Programado

## 📱 Rutas Principales

### Públicas
- `/` - Tienda online
- `/shop` - Catálogo de productos
- `/shop/product/:id` - Detalle de producto
- `/cart` - Carrito de compras
- `/checkout` - Finalizar compra
- `/register-customer` - Registro de cliente
- `/verify-email` - Verificación de email

### Protegidas (Usuario)
- `/profile` - Perfil y datos personales
- `/profile` (tab: orders) - Historial de compras

### Admin
- `/admin` - Dashboard administrativo
- `/admin/products` - Gestión de productos
- `/admin/categories` - Gestión de categorías
- `/admin/customers` - Gestión de clientes
- `/admin/discounts` - Gestión de cupones
- `/admin/invoices` - **Facturación Electrónica** (Nuevo)
  - Lista de comprobantes con filtros
  - Detalle de factura/boleta
  - Generación desde órdenes
  - Envío a SUNAT y clientes
  - Descarga PDF/XML/CDR
- `/pos` - Punto de venta
- `/reports` - Reportes de ventas
- `/reports/financial` - **Reportes Financieros** (Nuevo)
  - Ganancias: Ingresos, costos, ganancia bruta/neta, margen
  - Impuestos: IGV, renta, municipal, declaraciones
  - Nómina: Sueldos, deducciones, beneficios, CTS
  - Gastos: Por categoría, tipo, gastos más altos
  - Flujo de Caja: Ingresos/egresos, saldo, flujo diario
  - Rentabilidad: Por producto, margen, ROI
- `/analytics` - Analytics y tendencias

## 🎨 Características de UX

- ✅ Diseño responsive (mobile-first)
- ✅ Validación de formularios en tiempo real
- ✅ Feedback visual en todas las acciones
- ✅ Manejo de errores amigable
- ✅ Loading states en operaciones async
- ✅ Confirmaciones para acciones destructivas
- ✅ Navegación intuitiva
- ✅ Carrito persistente (localStorage)

## 🔧 Servicios API

El frontend se conecta con estos endpoints:

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registro admin
- `POST /auth/register-customer` - Registro cliente
- `POST /auth/verify-email` - Verificar email
- `POST /auth/resend-verification-code` - Reenviar código

### Productos
- `GET /products` - Listar productos
- `POST /products` - Crear producto
- `PUT /products/:id` - Actualizar producto
- `DELETE /products/:id` - Eliminar producto

### Categorías
- `GET /products/categories` - Listar categorías
- `POST /products/categories` - Crear categoría

### Clientes
- `GET /customers` - Listar clientes
- `POST /customers` - Crear cliente
- `GET /customers/search/document` - Buscar por documento

### Descuentos
- `GET /discounts` - Listar descuentos
- `POST /discounts` - Crear descuento
- `POST /discounts/validate` - Validar cupón

### Tiendas
- `GET /stores` - Listar tiendas

### Órdenes
- `GET /orders` - Listar órdenes
- `POST /orders` - Crear orden

### Pagos
- `POST /payments/stripe/create-checkout-session` - Stripe
- `POST /payments/culqi/create-charge` - Culqi
- `POST /payments/cash` - Efectivo
- `POST /payments/transfer` - Transferencia

### Reportes
- `GET /reports/sales` - Reporte de ventas
- `GET /reports/sales/daily` - Reporte diario
- `GET /reports/sales/weekly` - Reporte semanal
- `GET /reports/sales/monthly` - Reporte mensual

### Reportes Financieros (Nuevo)
- `GET /reports/financial/profit` - Reporte de ganancias
- `GET /reports/financial/tax` - Reporte de impuestos
- `GET /reports/financial/tax/export` - Exportar declaración de impuestos
- `GET /reports/financial/payroll` - Reporte de nómina
- `GET /reports/financial/payroll/export` - Exportar nómina
- `GET /reports/financial/expenses` - Reporte de gastos
- `GET /reports/financial/cash-flow` - Reporte de flujo de caja
- `GET /reports/financial/product-profitability` - Rentabilidad por producto
- `GET /reports/financial/{type}/export` - Exportar cualquier reporte (PDF/Excel/CSV)

### Empleados y Gastos
- `GET /employees` - Listar empleados
- `POST /employees` - Crear empleado
- `PUT /employees/:id` - Actualizar empleado
- `DELETE /employees/:id` - Eliminar empleado
- `GET /expenses` - Listar gastos
- `POST /expenses` - Crear gasto
- `PUT /expenses/:id` - Actualizar gasto
- `DELETE /expenses/:id` - Eliminar gasto

### Facturación Electrónica - NubeFact (Nuevo)
- `GET /nubefact/config` - Obtener configuración
- `PUT /nubefact/config` - Actualizar configuración
- `GET /invoices` - Listar comprobantes (con filtros)
- `GET /invoices/:id` - Obtener comprobante por ID
- `GET /invoices/order/:orderId` - Obtener comprobante por orden
- `POST /invoices/generate/:orderId` - Generar comprobante desde orden
- `POST /invoices/:id/send-to-sunat` - Enviar comprobante a SUNAT
- `POST /invoices/:id/send-to-customer` - Enviar comprobante por email
- `POST /invoices/:id/credit-note` - Generar nota de crédito
- `POST /invoices/:id/debit-note` - Generar nota de débito
- `POST /invoices/:id/cancel` - Anular comprobante
- `GET /invoices/:id/pdf` - Descargar PDF
- `GET /invoices/:id/xml` - Descargar XML
- `GET /invoices/:id/cdr` - Descargar CDR (Constancia SUNAT)
- `GET /invoices/:id/sunat-status` - Consultar estado en SUNAT
- `GET /invoices/next-number/:type` - Obtener siguiente número de serie
- `GET /invoices/report` - Reporte de comprobantes
- `GET /invoices/report/export` - Exportar reporte (PDF/Excel/CSV)

### Analytics
- `GET /analytics/trends` - Tendencias de compras
- `GET /analytics/products/top-selling` - Productos top

## 📊 Estado Global (Zustand)

### authStore
- `user` - Usuario actual
- `token` - JWT token
- `isAuthenticated` - Estado de autenticación
- `login()` - Iniciar sesión
- `logout()` - Cerrar sesión
- `loadUser()` - Cargar usuario actual

### cartStore
- `items` - Items del carrito
- `addItem()` - Agregar producto
- `removeItem()` - Eliminar producto
- `updateQuantity()` - Actualizar cantidad
- `clearCart()` - Vaciar carrito
- `getSubtotal()` - Calcular subtotal
- `getItemCount()` - Contar items

## 🚀 Despliegue

### Variables de Entorno Requeridas

```env
# Backend API
VITE_API_URL=https://api.tutienda.com

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_live_...

# Culqi
VITE_CULQI_PUBLIC_KEY=pk_live_...
```

### Build

```bash
npm run build
```

Los archivos compilados estarán en `dist/`

## 📝 Licencia

MIT

---

**Sistema completo de e-commerce listo para producción** 🚀

