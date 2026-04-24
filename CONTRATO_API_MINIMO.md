# Contrato API Mínimo Inicial

## Objetivo

Definir un contrato mínimo para que backend pueda iniciar implementación sin ambigüedades y para que frontend pueda migrar desde `localStorage` hacia servicios HTTP sin rehacer la estructura funcional actual.

Este contrato cubre únicamente el alcance base necesario para una primera integración:

1. Autenticación.
2. Catálogo de productos.
3. Creación y consulta de órdenes.
4. Panel administrativo básico.

Quedan fuera de este contrato inicial:

1. Pasarela de pagos real.
2. Integración logística.
3. Recuperación de contraseña.
4. Edición avanzada de perfil.
5. Carrito persistido en backend, salvo que el equipo decida incluirlo desde fase 1.

---

## Decisiones Base

1. Backend es dueño de IDs, permisos, stock y totales finales.
2. El carrito puede permanecer en frontend durante la fase inicial.
3. El backend debe validar stock y recalcular totales al crear una orden.
4. La autenticación debe pasar a token o cookie segura; no se debe replicar el esquema local actual de sesión mock.
5. El frontend debe recibir estructuras consistentes en nombres y tipos de campos.

---

## Modelos de Datos

### User

```json
{
  "id": "usr_123",
  "name": "Laura Gómez",
  "email": "laura@correo.com",
  "role": "user",
  "phone": "3001234567",
  "address": "Calle 10 #20-30",
  "city": "Medellín",
  "postalCode": "050021"
}
```

Reglas:

1. `id` es generado por backend.
2. `email` debe ser único.
3. `role` debe ser `user` o `admin`.
4. `phone`, `address`, `city` y `postalCode` pueden llegar vacíos, pero deben existir como parte del shape esperado por frontend.

### Product

```json
{
  "id": "prod_101",
  "name": "Mouse Logitech G203",
  "category": "Accesorios",
  "price": 89900,
  "stock": 15,
  "image": "https://...",
  "description": "Mouse gamer con sensor de alta precisión",
  "rating": 4.7,
  "createdAt": "2026-03-27T10:00:00.000Z",
  "updatedAt": "2026-03-27T10:00:00.000Z"
}
```

Reglas:

1. `price` es numérico.
2. `stock` es entero mayor o igual a 0.
3. `rating` es opcional si backend no lo gestiona en la primera fase.
4. `createdAt` y `updatedAt` son recomendados desde el inicio.

### Order

```json
{
  "id": "ord_5001",
  "userId": "usr_123",
  "status": "confirmed",
  "createdAt": "2026-03-27T10:30:00.000Z",
  "items": [
    {
      "productId": "prod_101",
      "name": "Mouse Logitech G203",
      "price": 89900,
      "quantity": 2,
      "subtotal": 179800
    }
  ],
  "customer": {
    "fullName": "Laura Gómez",
    "email": "laura@correo.com",
    "phone": "3001234567",
    "address": "Calle 10 #20-30",
    "city": "Medellín",
    "postalCode": "050021"
  },
  "shippingMethod": {
    "id": "standard",
    "label": "Envío estándar",
    "price": 12000
  },
  "paymentMethod": {
    "id": "card",
    "label": "Tarjeta"
  },
  "totals": {
    "subtotal": 179800,
    "tax": 34162,
    "shipping": 12000,
    "total": 225962
  }
}
```

Reglas:

1. `status` debe existir desde el inicio.
2. `userId` debe derivarse de la sesión autenticada.
3. `totals` deben calcularse y validarse en backend.
4. El backend debe decidir el `id` definitivo de la orden.

### Cart

Opcional para fase 1.

Si backend lo implementa desde el inicio, el request mínimo puede ser:

```json
{
  "items": [
    {
      "productId": "prod_101",
      "quantity": 2
    }
  ]
}
```

Y la respuesta enriquecida:

```json
{
  "items": [
    {
      "productId": "prod_101",
      "name": "Mouse Logitech G203",
      "price": 89900,
      "stock": 15,
      "image": "https://...",
      "quantity": 2,
      "subtotal": 179800
    }
  ],
  "totals": {
    "subtotal": 179800,
    "tax": 34162,
    "shipping": 0,
    "total": 213962
  }
}
```

Si no se implementa en fase 1, el carrito queda temporalmente en frontend y solo se envían `items` al crear la orden.

---

## Endpoints Mínimos

## 1. Auth

### `POST /auth/register`

Request:

```json
{
  "name": "Laura Gómez",
  "email": "laura@correo.com",
  "password": "123456",
  "phone": "3001234567",
  "address": "Calle 10 #20-30",
  "city": "Medellín",
  "postalCode": "050021"
}
```

Response:

```json
{
  "token": "jwt-o-token-seguro",
  "user": {
    "id": "usr_123",
    "name": "Laura Gómez",
    "email": "laura@correo.com",
    "role": "user",
    "phone": "3001234567",
    "address": "Calle 10 #20-30",
    "city": "Medellín",
    "postalCode": "050021"
  }
}
```

### `POST /auth/login`

Request:

```json
{
  "email": "laura@correo.com",
  "password": "123456"
}
```

Response:

```json
{
  "token": "jwt-o-token-seguro",
  "user": {
    "id": "usr_123",
    "name": "Laura Gómez",
    "email": "laura@correo.com",
    "role": "user",
    "phone": "3001234567",
    "address": "Calle 10 #20-30",
    "city": "Medellín",
    "postalCode": "050021"
  }
}
```

### `GET /auth/me`

Header:

```http
Authorization: Bearer <token>
```

Response:

```json
{
  "id": "usr_123",
  "name": "Laura Gómez",
  "email": "laura@correo.com",
  "role": "user",
  "phone": "3001234567",
  "address": "Calle 10 #20-30",
  "city": "Medellín",
  "postalCode": "050021"
}
```

## 2. Productos

### `GET /products`

Opcionalmente con query params:

```http
GET /products?search=mouse&category=Accesorios
```

Response:

```json
[
  {
    "id": "prod_101",
    "name": "Mouse Logitech G203",
    "category": "Accesorios",
    "price": 89900,
    "stock": 15,
    "image": "https://...",
    "description": "Mouse gamer",
    "rating": 4.7
  }
]
```

### `GET /products/:id`

Devuelve el detalle de un producto.

## 3. Órdenes

### `POST /orders`

Request:

```json
{
  "customer": {
    "fullName": "Laura Gómez",
    "email": "laura@correo.com",
    "phone": "3001234567",
    "address": "Calle 10 #20-30",
    "city": "Medellín",
    "postalCode": "050021"
  },
  "shippingMethodId": "standard",
  "paymentMethodId": "card",
  "items": [
    {
      "productId": "prod_101",
      "quantity": 2
    }
  ]
}
```

Response:

```json
{
  "id": "ord_5001",
  "userId": "usr_123",
  "status": "confirmed",
  "createdAt": "2026-03-27T10:30:00.000Z",
  "items": [
    {
      "productId": "prod_101",
      "name": "Mouse Logitech G203",
      "price": 89900,
      "quantity": 2,
      "subtotal": 179800
    }
  ],
  "customer": {
    "fullName": "Laura Gómez",
    "email": "laura@correo.com",
    "phone": "3001234567",
    "address": "Calle 10 #20-30",
    "city": "Medellín",
    "postalCode": "050021"
  },
  "shippingMethod": {
    "id": "standard",
    "label": "Envío estándar",
    "price": 12000
  },
  "paymentMethod": {
    "id": "card",
    "label": "Tarjeta"
  },
  "totals": {
    "subtotal": 179800,
    "tax": 34162,
    "shipping": 12000,
    "total": 225962
  }
}
```

### `GET /orders/me`

Response:

```json
[
  {
    "id": "ord_5001",
    "status": "confirmed",
    "createdAt": "2026-03-27T10:30:00.000Z",
    "totals": {
      "total": 225962
    }
  }
]
```

### `GET /orders/:id`

Reglas:

1. Devuelve la orden solo si pertenece al usuario autenticado.
2. Un administrador puede verla aunque no sea suya.

## 4. Admin

### `GET /admin/dashboard`

Response:

```json
{
  "metrics": {
    "totalProducts": 20,
    "lowStockProducts": 3,
    "totalOrders": 42,
    "totalRevenue": 5800000,
    "totalUsers": 15,
    "adminUsers": 1
  },
  "recentOrders": [],
  "recentUsers": []
}
```

### `POST /admin/products`

### `PUT /admin/products/:id`

### `DELETE /admin/products/:id`

Payload base para crear o editar producto:

```json
{
  "name": "Mouse Logitech G203",
  "category": "Accesorios",
  "price": 89900,
  "stock": 15,
  "image": "https://...",
  "description": "Mouse gamer",
  "rating": 4.7
}
```

---

## Error Estándar

Formato recomendado:

```json
{
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "Ya existe una cuenta con ese correo."
  }
}
```

Casos mínimos a cubrir:

1. `INVALID_CREDENTIALS`
2. `EMAIL_ALREADY_EXISTS`
3. `UNAUTHORIZED`
4. `FORBIDDEN`
5. `PRODUCT_NOT_FOUND`
6. `ORDER_NOT_FOUND`
7. `INSUFFICIENT_STOCK`
8. `VALIDATION_ERROR`

---

## Reglas Operativas

1. Backend genera IDs.
2. Backend valida stock al crear orden.
3. Backend calcula y devuelve `totals`.
4. Frontend no decide permisos.
5. Register crea usuarios con rol `user` por defecto.
6. El administrador demo debe existir como seed o script del backend, no como lógica del frontend.
7. Si el carrito sigue local, frontend envía `items` y backend revalida todo.

---

## Alcance Recomendado de Fase 1

Endpoints mínimos para iniciar integración:

1. `POST /auth/register`
2. `POST /auth/login`
3. `GET /auth/me`
4. `GET /products`
5. `GET /products/:id`
6. `POST /orders`
7. `GET /orders/me`
8. `GET /orders/:id`
9. `GET /admin/dashboard`
10. `POST /admin/products`
11. `PUT /admin/products/:id`
12. `DELETE /admin/products/:id`

---

## Recomendación de Implementación

Para arrancar con la menor fricción posible:

1. Mantener carrito en frontend en fase 1.
2. Conectar primero auth, productos y órdenes a backend.
3. Calcular y validar totales en backend.
4. Crear una capa `services/` en frontend alineada exactamente con este contrato.
