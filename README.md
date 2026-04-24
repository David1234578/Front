# Sistema de Ventas

Proyecto didáctico construido con React y Vite para practicar un flujo de ecommerce frontend relativamente completo: autenticación, catálogo, carrito, checkout, órdenes, perfil de usuario y administración.

Actualmente el proyecto soporta dos modos de operación:

- fallback local con `localStorage`
- integración remota con backend mediante la capa `services/` y configuración de entorno

La aplicación ya puede trabajar contra backend real en auth, carrito, categorías, catálogo, órdenes y administración de productos y usuarios.

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

### Modo local

El proyecto crea un usuario administrador por defecto en persistencia local:

- Email: `admin@cesde.local`
- Password: `Admin123!`

### Modo remoto

Si activas las credenciales demo remotas en tu `.env` local, el login puede mostrar y usar:

- Admin: `admin.demo@pps.com` / `Admin12345*`
- Customer: `customer.demo@pps.com` / `Customer12345*`

También puedes registrar usuarios nuevos desde la interfaz o crear usuarios desde el panel admin cuando el backend remoto está activo.

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

- Carrito con fallback local o sesión guest remota.
- Actualización de cantidades y eliminación de productos.
- Checkout protegido por autenticación.
- Selección de direcciones guardadas para envío y facturación.
- Confirmación de orden.

### Cuenta del usuario

- Perfil con datos personales.
- Gestión de direcciones del usuario autenticado.
- Historial de órdenes.
- Vista de detalle por orden.

### Administración

- Dashboard administrativo con métricas de productos, órdenes y usuarios.
- Gestión de productos.
- Gestión de usuarios.
- CRUD de productos con formulario reutilizable.
- CRUD de usuarios admin con creación, edición y desactivación lógica.

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
- `/admin/users`

## Arquitectura resumida

### Router y composición general

- `src/main.jsx` monta `BrowserRouter`, `AuthProvider` y `CartProvider`.
- `src/App.jsx` centraliza las rutas y la finalización del checkout.

### Estado y autenticación

- `src/contexts/AuthContext.jsx` expone `currentUser`, login, register, logout, hidratación de sesión y acciones de cuenta.
- `src/contexts/CartContext.jsx` expone el carrito global, sincronización remota y acciones asíncronas.
- `src/components/ProtectedRoute.jsx` protege rutas autenticadas.
- `src/components/AdminRoute.jsx` restringe rutas al rol administrador.

### Servicios

- `src/services/authService.js`: autenticación, sesión, actualización de perfil, cambio de contraseña y CRUD admin de usuarios.
- `src/services/cartService.js`: carrito local/remoto, sesión guest y merge post-auth.
- `src/services/categoryService.js`: categorías y árbol de categorías.
- `src/services/productService.js`: acceso al catálogo y operaciones admin sobre productos.
- `src/services/orderService.js`: checkout y consulta de órdenes.
- `src/services/adminService.js`: snapshot del dashboard admin.
- `src/services/http.js`: cliente base para requests HTTP.

### Persistencia local

Cuando no se activa backend remoto, la aplicación usa `localStorage` como fallback principal para:

- sesión y usuarios
- direcciones
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
- `VITE_DEV_PROXY_TARGET`
- `VITE_SHOW_REMOTE_DEMO_CREDENTIALS`
- `VITE_REMOTE_DEMO_ADMIN_EMAIL`
- `VITE_REMOTE_DEMO_ADMIN_PASSWORD`
- `VITE_REMOTE_DEMO_CUSTOMER_EMAIL`
- `VITE_REMOTE_DEMO_CUSTOMER_PASSWORD`
- `VITE_REMOTE_DEMO_GUEST_TOKEN`

Por defecto:

- la app usa fallback local
- la base de API es `/api/v1`
- el timeout base es `10000ms`

Para desarrollo local con backend Spring Boot arriba en `localhost:8080`, se puede usar:

```bash
cp .env.example .env
npm run dev
```

Con esta configuración:

- `VITE_USE_REMOTE_API=true`
- `VITE_API_BASE_URL=/api/v1`
- `VITE_DEV_PROXY_TARGET=http://localhost:8080`
- `VITE_SHOW_REMOTE_DEMO_CREDENTIALS=true` solo si quieres mostrar accesos demo en la UI

El proxy de Vite redirige `/api/*` al backend local para evitar problemas de origen cruzado durante la demo e integración.

`VITE_*` en Vite no es secreto de servidor: termina embebido en el bundle cliente. Sirve para configuración pública del frontend y para credenciales demo de desarrollo, no para llaves privadas, tokens reales ni secretos de producción.

Cuando `VITE_USE_REMOTE_API=true`, el catálogo público y admin debe provenir del backend como fuente única. El frontend ya no debe completar imágenes o descripciones de productos usando el seed local; si el backend no devuelve esos campos, el contrato debe ajustarse en la API.

En ese mismo modo remoto, las direcciones del usuario y el carrito también deben refrescarse desde la API como fuente de verdad. `localStorage` solo debe conservar una copia técnica de la última respuesta válida para mantener la experiencia del frontend, no completar ni reintroducir datos que ya no existan en backend.

Para minimizar cambios entre frontend y backend, el nombre oficial del campo de imagen del producto debe ser `image`.

Para la referencia operativa actualizada de endpoints backend, revisar `BACKEND_ENDPOINTS_REFRENCE.md`.

## Estructura principal

```text
src/
	components/
		AdminUserForm.jsx
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
		CartContext.jsx
	hooks/
		useAuth.js
		useCart.js
	pages/
		AdminDashboard.jsx
		AdminProducts.jsx
		AdminUsers.jsx
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
		cartService.js
		categoryService.js
		http.js
		orderService.js
		productService.js
	styles/
		*.module.css
	utils/
		*.js
```

## Documentación complementaria

- `BACKEND_ENDPOINTS_REFRENCE.md`: referencia operativa del backend disponible.

## Notas

- La carpeta `clases/` existe en el workspace como documentación del curso, pero no forma parte del repo del proyecto.
- Este repo está orientado a práctica frontend y evolución incremental por semanas.
- La recuperación de contraseña por correo/token no está implementada todavía; solo existe cambio de contraseña dentro de una sesión autenticada.
- El dashboard admin está pensado como panel de resumen y navegación; la gestión detallada de productos y usuarios vive en sus pantallas específicas.
