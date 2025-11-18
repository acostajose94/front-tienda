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

## 🛠️ Stack Tecnológico

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **React Router v6** - Navegación
- **Zustand** - Estado global
- **Tailwind CSS** - Estilos
- **React Hook Form** + **Zod** - Formularios
- **Recharts** - Gráficos
- **Axios** - HTTP client

## 🚀 Instalación

1. Instalar dependencias: `npm install`
2. Configurar .env: `cp .env.example .env`
3. Iniciar desarrollo: `npm run dev`
4. Build producción: `npm run build`

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

- **Admin**: Acceso completo
- **Manager**: Reportes y gestión
- **Cashier**: POS y ventas
- **Customer**: Compras

