# Sistema de Ventas (React + Vite)

Proyecto didáctico para practicar React (componentes, props, estado, formularios controlados) con una app simple de catálogo/ventas.

## Requisitos

- Node.js 18+ (recomendado)

## Instalar y ejecutar

- Instalar: npm install
- Desarrollo: npm run dev
- Lint: npm run lint
- Build: npm run build
- Preview: npm run preview

## Notas

- La carpeta clases/ existe en el workspace como documentación del curso, pero no forma parte del repo del proyecto.

---

## Estructura principal

src/
components/
Header.jsx
Navbar.jsx
Footer.jsx
ProductCard.jsx
ProductForm.jsx
ProductDetailsModal.jsx
pages/
Home.jsx
ProductList.jsx
Cart.jsx
data/
products.js
styles/
\*.module.css
utils/
formatCOP.js

## Navegación (sin router)

La app no usa react-router-dom todavía. En su lugar, se navega por estado local en src/App.jsx:

- home: Inicio
- products: Productos (CRUD)
- cart: Carrito
- category: Productos por categoría

## Funcionalidades por pantalla

### Inicio

En src/pages/Home.jsx:

- Una sola grilla de categorías.
- Cada categoría muestra solo la imagen del producto destacado (mejor rating; en empate se conserva el primero).
- Al hacer clic en una categoría, navega a la página de productos de esa categoría.

### Categoría

En src/pages/CategoryProducts.jsx:

- Lista los productos de la categoría seleccionada.
- Permite filtrar por nombre (input de búsqueda).
- Botón "Más información" abre un modal con el detalle del producto.

### Productos (CRUD en memoria + persistencia)

En src/pages/ProductList.jsx:

- Agregar / editar / eliminar productos con src/components/ProductForm.jsx.
- Persistencia en localStorage bajo la clave products.
- Compatibilidad: si hay productos guardados sin rating, se normaliza con un valor por defecto.

## Datos

El seed inicial está en src/data/products.js. Incluye rating para ordenar en Inicio.

## Referencia (template)

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
