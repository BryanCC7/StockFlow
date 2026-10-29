# StockFlow Base API

API de inventario y pedidos con stock transaccional.
Spring Boot 3.3 + H2 portable, sin infra externa.
Capas Controller / Service / Repository con validación y manejo uniforme de errores.

## Requisitos

- JDK 17 o 21 (recomendado: [Temurin 21](https://adoptium.net/)). Spring Boot 3.3 no soporta JDK 22+.
- No necesitas tener Maven instalado: el proyecto incluye Maven wrapper.

## Cómo correr

```powershell
./mvnw.cmd spring-boot:run
```

- API base: http://localhost:8080/api
- Frontend de prueba: http://localhost:8080/index.html
- Consola H2: http://localhost:8080/h2-console (usuario `sa`, sin clave)

## Endpoints principales

- `POST /api/productos` · `GET /api/productos` (filtros: categoria, nombre, precioMin, precioMax)
- `GET /api/productos/stock-bajo?umbral=5` · `GET/PUT/DELETE /api/productos/{id}`
- `POST /api/clientes` · `GET /api/clientes` · `GET/PUT/DELETE /api/clientes/{id}`
- `GET /api/clientes/{id}/pedidos`
- `POST /api/pedidos` (201 PENDIENTE / 409 sin stock) · `GET /api/pedidos` · `GET /api/pedidos/{id}`
- `GET /api/reportes/ventas?desde&hasta` · `GET /api/reportes/inventario`

El reporte de ventas excluye pedidos CANCELADO. Las respuestas de producto, cliente y pedido incluyen el campo `version` (bloqueo optimista).
