# Sistema de Ventas

Proyecto didáctico construido con React y Vite para practicar un flujo de ecommerce frontend relativamente completo: autenticación, catálogo, carrito, checkout, órdenes, perfil de usuario y administración básica.

El proyecto hoy funciona con persistencia local en `localStorage`, pero ya está estructurado con una capa `services/` y configuración de entorno para facilitar una migración progresiva hacia backend real.

## Stack

- React 19
- React Router DOM 7
- Vite
- CSS Modules
- ESLint + Prettier

## Requisitos

- Node.js 18 o superior
- npm 9 o superior recomendado

## Instalación y ejecución

```bash
npm install
npm run dev
```

Scripts disponibles:

- `npm run dev`: servidor de desarrollo
- `npm run build`: build de producción
- `npm run preview`: preview local del build
- `npm run lint`: validación con ESLint
- `npm run lint:fix`: corrección automática de lint cuando aplica
- `npm run format`: formateo con Prettier
- `npm run format:check`: validación de formato

## Credenciales demo

El proyecto crea un usuario administrador por defecto en persistencia local:

- Email: `admin@cesde.local`
- Password: `Admin123!`

También puedes registrar usuarios nuevos desde la interfaz.

## Funcionalidades principales

### Autenticación

- Registro e inicio de sesión.
- Hidratación de sesión al cargar la app.
- Rutas protegidas para usuarios autenticados.
- Rutas restringidas para administradores.
- Edición de perfil desde `Mi cuenta`.
- Cambio de contraseña dentro de la sesión autenticada.

### Catálogo y exploración

- Home con categorías destacadas.
- Listado general de productos.
- Página por categoría.
- Filtro por nombre.
- Modal con detalle del producto.
- Agregado de productos al carrito desde catálogo y categorías.

### Carrito y checkout

- Carrito persistido en `localStorage`.
- Actualización de cantidades y eliminación de productos.
- Checkout protegido por autenticación.
- Selección de envío y medio de pago.
- Confirmación de orden.

### Cuenta del usuario

- Perfil con datos personales.
- Historial de órdenes.
- Vista de detalle por orden.

### Administración

- Dashboard administrativo.
- Gestión de productos.
- CRUD de productos con formulario reutilizable.

## Rutas principales

### Públicas

- `/`
- `/login`
- `/register`
- `/products`
- `/category/:categoryName`
- `/cart`
- `/order-confirmation`

### Protegidas

- `/checkout`
- `/user/profile`
- `/user/orders`
- `/user/orders/:orderId`

### Solo admin

- `/admin`
- `/admin/products`

## Arquitectura resumida

### Router y composición general

- `src/main.jsx` monta `BrowserRouter` y `AuthProvider`.
- `src/App.jsx` centraliza las rutas, el estado del carrito y la finalización del checkout.

### Estado y autenticación

- `src/contexts/AuthContext.jsx` expone `currentUser`, login, register, logout, hidratación de sesión y acciones de cuenta.
- `src/components/ProtectedRoute.jsx` protege rutas autenticadas.
- `src/components/AdminRoute.jsx` restringe rutas al rol administrador.

### Servicios

- `src/services/authService.js`: autenticación, sesión, actualización de perfil y cambio de contraseña.
- `src/services/productService.js`: acceso al catálogo y operaciones sobre productos.
- `src/services/orderService.js`: creación y consulta de órdenes.
- `src/services/adminService.js`: snapshot y operaciones de soporte para vistas admin.
- `src/services/http.js`: cliente base para requests HTTP.

### Persistencia local

Mientras no se activa backend remoto, la aplicación usa `localStorage` como fallback principal para:

- sesión y usuarios
- productos
- carrito
- órdenes

Esta persistencia está encapsulada en `src/utils/` para evitar acoplar la UI directamente al storage.

## Integración con backend

El proyecto ya está preparado para una transición progresiva hacia backend mediante variables de entorno y una capa de servicios.

Variables soportadas:

- `VITE_USE_REMOTE_API`
- `VITE_API_BASE_URL`
- `VITE_API_TIMEOUT_MS`

Por defecto:

- la app usa fallback local
- la base de API es `/api`
- el timeout base es `10000ms`

Para el contrato mínimo de integración, revisar `CONTRATO_API_MINIMO.md`.

## Estructura principal

```text
src/
	components/
		AdminRoute.jsx
		ChangePasswordForm.jsx
		Footer.jsx
		Header.jsx
		Navbar.jsx
		OrderCard.jsx
		ProductCard.jsx
		ProductDetailsModal.jsx
		ProductForm.jsx
		ProtectedRoute.jsx
		UserProfileForm.jsx
	config/
		env.js
		index.js
	contexts/
		AuthContext.jsx
	hooks/
		useAuth.js
	pages/
		AdminDashboard.jsx
		AdminProducts.jsx
		Cart.jsx
		CategoryProducts.jsx
		Checkout.jsx
		Home.jsx
		Login.jsx
		OrderConfirmation.jsx
		OrderDetail.jsx
		ProductList.jsx
		Register.jsx
		Unauthorized.jsx
		UserOrders.jsx
		UserProfile.jsx
	services/
		adminService.js
		authService.js
		http.js
		orderService.js
		productService.js
	styles/
		*.module.css
	utils/
		*.js
```

## Documentación complementaria

- `CONTRATO_API_MINIMO.md`: contrato de datos y endpoints mínimos para backend.

## Notas

- La carpeta `clases/` existe en el workspace como documentación del curso, pero no forma parte del repo del proyecto.
- Este repo está orientado a práctica frontend y evolución incremental por semanas.
- La recuperación de contraseña por correo/token no está implementada todavía; solo existe cambio de contraseña dentro de una sesión autenticada.
