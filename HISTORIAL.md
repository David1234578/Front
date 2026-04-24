# Historial del proyecto (semana-01 a semana-05)

> Nota: este documento se generó estando en la rama `semana-06`, pero **no** incluye cambios/commits de `semana-06`. El objetivo es documentar la progresión **semana-01 → semana-05** tal como se trabajó (ramas por semana y commits granulares), sin merges a `main`.

## Cómo leer este historial

- **Estrategia de Git**: el trabajo se organiza por ramas `semana-01`, `semana-02`, `semana-03`, `semana-04`, `semana-05`.
- **Sin merges**: no hay commits de merge en `main` ni en las ramas semanales. En la práctica, `main` permanece como **punto de arranque**.
- **Fuente de la información**: se resume a partir de `git log` (commits) y `git diff` (archivos agregados/modificados) por rangos `base..tip` entre semanas.

## Punto de partida (creación del proyecto)

- **`main` (commit inicial)**: `2026-01-30 c4fa164` — _Creación proyecto con React+Vite+Tailwind y sus configuración, adicional se instala ESLint y Prettier_
- **Estado de `main`**: se mantiene en el commit inicial (no recibe merges ni commits posteriores dentro del alcance de este historial).

---

## Semana 01 — Rama base (sin cambios)

**Contexto**

- Se crea la rama `semana-01` desde el commit inicial `c4fa164`.
- No se registran commits adicionales en `semana-01`.

**Resultado**

- Punto de control para comenzar la evolución semanal del proyecto.

---

## Semana 02 — Estructura inicial + listado de productos

**Rango Git (base..tip)**

- Desde: `2026-01-30 c4fa164` — _Creación proyecto con React+Vite+Tailwind y sus configuración, adicional se instala ESLint y Prettier_
- Hasta: `2026-02-12 601f5ac` — _fix: Ajuste de imagen webcam importada desde assets y ajuste de eslint para omitir carpetas dist/vite/node_
- Referencia (rango): `c4fa164..601f5ac`

**Objetivo**

- Definir una estructura mínima del sistema de ventas y renderizar un listado de productos desde datos locales.

**Cambios de estructura (archivos agregados)**

- `src/components/ProductCard.jsx`
- `src/pages/ProductList.jsx`
- `src/data/products.js`
- `src/styles/ProductCard.module.css`
- `src/styles/ProductList.module.css`
- `src/utils/formatCOP.js`
- `src/assets/img-products/webcam-logitech-c920.jpg`

> Nota técnica: aparecen archivos bajo `.vite/deps/*` (artefactos generados por Vite). Se listan porque están en el diff, pero no forman parte de la estructura funcional del código fuente.

**Funcionalidades principales**

- Se crea la **estructura base** de carpetas: `pages/`, `components/`, `data/`, `styles/`, `utils/`.
- Se agrega un **seed** de productos (`products.js`) y se renderiza el listado con `map`.
- Se implementa `ProductCard` usando **props**.
- Se agregan **estilos con CSS Modules** para `ProductCard` y layout responsivo del listado (grid).
- Se agrega funcionalidad de **likes** con `useState` y eventos.
- Se integra `ProductList` en `App` y se limpia el template inicial.
- Se incorporan ajustes de **ESLint** y mejoras de estilos globales/variables CSS.
- Se agrega utilidad `formatCOP` para formato de moneda/números en Colombia.

**Commits clave (orden cronológico)**

- 2026-02-12 `66218e5` feat: crear estructura de carpetas pages, components y data
- 2026-02-12 `e84e1ad` feat: agregar datos de productos informáticos
- 2026-02-12 `85b5c94` feat: crear componente ProductCard con props
- 2026-02-12 `0864e35` feat: crear página ProductList con renderizado de lista usando map
- 2026-02-12 `c2934c4` feat: agregar funcionalidad de likes con useState y eventos
- 2026-02-12 `781a031` feat: Agregar utilidad para formato de numero para colombia y ajuste de products
- 2026-02-12 `601f5ac` fix: Ajuste de imagen webcam importada desde assets y ajuste de eslint para omitir carpetas dist/vite/node

---

## Semana 03 — Layout de aplicación + navegación (Home/Cart)

**Rango Git (base..tip)**

- Desde: `2026-02-12 601f5ac` — _fix: Ajuste de imagen webcam importada desde assets y ajuste de eslint para omitir carpetas dist/vite/node_
- Hasta: `2026-02-13 b762b95` — _Ajuste de colores corporativos y logo_
- Referencia (rango): `601f5ac..b762b95`

**Objetivo**

- Convertir el listado en una app con layout (header/footer) y navegación básica entre páginas.

**Cambios de estructura (archivos agregados)**

- `src/components/Navbar.jsx`
- `src/components/Header.jsx`
- `src/components/Footer.jsx`
- `src/pages/Home.jsx`
- `src/pages/Cart.jsx`
- `src/styles/Navbar.module.css`
- `src/styles/Header.module.css`
- `src/styles/Footer.module.css`
- `src/assets/img-logos/logo-Cesde-2023.svg`

**Funcionalidades principales**

- Se crea `Navbar` con navegación (y UI de auth) y se encapsula dentro de `Header`.
- Se agregan páginas `Home` y `Cart`.
- Se agrega `Footer`.
- Se integra layout completo (Header + Footer) en `App` y se ajusta el layout global.
- Ajustes visuales (colores corporativos + logo).

**Commits clave (orden cronológico)**

- 2026-02-13 `ce02486` feat: crear navbar con navegación y auth UI
- 2026-02-13 `38225b7` feat: agregar header que encapsula navbar
- 2026-02-13 `8e692e3` feat: agregar footer básico
- 2026-02-13 `107b2b4` feat: integrar header footer y navegación por estado en app
- 2026-02-13 `b762b95` Ajuste de colores corporativos y logo

---

## Semana 04 — CRUD de productos + persistencia local

**Rango Git (base..tip)**

- Desde: `2026-02-13 b762b95` — _Ajuste de colores corporativos y logo_
- Hasta: `2026-02-20 8df1916` — _feat: persistir productos en localStorage_
- Referencia (rango): `b762b95..8df1916`

**Objetivo**

- Implementar CRUD sobre productos (crear/editar/eliminar) y persistir cambios en `localStorage`.

**Cambios de estructura (archivos agregados)**

- `src/components/ProductForm.jsx`
- `src/styles/ProductForm.module.css`

**Funcionalidades principales**

- Se agrega `stock` a la data de productos y se muestra en UI.
- Los productos pasan de ser datos estáticos a estar en **estado local**, habilitando CRUD.
- Se implementa `ProductForm` con **inputs controlados**.
- Se agregan flujos de:
  - **Agregar** producto.
  - **Editar** producto (modo edición).
  - **Eliminar** producto desde la tarjeta.
- Se mejora el flujo de UI del formulario: abrir bajo demanda, cancelar, volver a la grilla al guardar/cancelar.
- Se agrega toolbar y botón de “agregar producto”.
- Se implementa carga inicial desde `localStorage` con fallback al seed y persistencia de productos al cambiar.

**Commits clave (orden cronológico)**

- 2026-02-19 `c5eea72` feat: agregar ProductForm con inputs controlados
- 2026-02-19 `7c13d6d` feat: editar productos con modo edición
- 2026-02-19 `603f4db` feat: abrir formulario bajo demanda y habilitar cancelar
- 2026-02-20 `98a12c9` feat: cargar productos desde localStorage (fallback seed)
- 2026-02-20 `8df1916` feat: persistir productos en localStorage

---

## Semana 05 — Rating + detalle (modal) + Home por categoría

**Rango Git (base..tip)**

- Desde: `2026-02-20 8df1916` — _feat: persistir productos en localStorage_
- Hasta: `2026-02-27 18f95ed` — _docs: actualizar README (categorías + filtro)_
- Referencia (rango): `8df1916..18f95ed`

**Objetivo**

- Enriquecer el dominio (rating), agregar detalle de producto en modal y reorganizar Home por categorías con navegación.

**Cambios de estructura (archivos agregados)**

- `src/components/ProductDetailsModal.jsx`
- `src/pages/CategoryProducts.jsx`
- `src/utils/productsStorage.js`
- `src/styles/ProductDetailsModal.module.css`
- `src/styles/Home.module.css`
- `src/styles/CategoryProducts.module.css`

**Funcionalidades principales**

- Se agrega `rating` al seed y se garantiza un rating por defecto en formularios.
- Se normaliza el rating al cargar productos.
- Se agrega `ProductDetailsModal` (modal de detalle) y se habilita desde `ProductCard`.
- Se muestra rating y se mejora el acceso a detalles.
- Se implementa `Home` por categoría (ordenada/destacada por rating) y se agrega grilla de categorías.
- Se agrega navegación hacia una página de categoría (`CategoryProducts`).
- `CategoryProducts` incluye filtro por nombre y soporte de modal.
- Se refactoriza la lógica de carga/normalización/persistencia hacia `utils/productsStorage.js`.
- Se actualiza la documentación del proyecto (README) con las nuevas funcionalidades.

**Commits clave (orden cronológico)**

- 2026-02-27 `4cd26f5` feat: agregar rating a seed de productos
- 2026-02-27 `e78a54a` feat: agregar modal de detalle de producto
- 2026-02-27 `3ffb190` feat: home por categoría ordenada por rating y modal
- 2026-02-27 `ccc04f1` refactor: extraer carga y normalización de productos
- 2026-02-27 `538a19a` feat: CategoryProducts con filtro por nombre y modal
- 2026-02-27 `18f95ed` docs: actualizar README (categorías + filtro)

---

## Resumen ejecutivo (semana-01 → semana-05)

- **Semana 01**: rama base sin cambios.
- **Semana 02**: estructura inicial + listado de productos con componentes, estilos y utilidades.
- **Semana 03**: se convierte en una app con layout (Navbar/Header/Footer) y páginas base.
- **Semana 04**: CRUD completo y persistencia de productos en `localStorage`.
- **Semana 05**: rating + modal de detalle + Home por categoría + navegación a categorías + refactor de storage.
