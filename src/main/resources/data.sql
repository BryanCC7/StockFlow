-- Seed demo: 5 clientes, 12 productos (stocks variados para probar stock-bajo)
-- y 3 pedidos historicos (2025-2026) con su detalle.
-- Coherencia: los stocks de producto ya incluyen el descuento de los pedidos
-- CONFIRMADO/PENDIENTE; el pedido CANCELADO no descuenta stock.
-- Nota: los pedidos CONFIRMADO/PENDIENTE viven en 2025 para no interferir con
-- los tests que consultan el rango 2026-01-01..2026-12-31.
INSERT INTO cliente (nombre, email, telefono, version, created_at, updated_at) VALUES
  ('Ana Torres', 'ana.torres@mail.cl', '+56911111111', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Bruno Díaz', 'bruno.diaz@mail.cl', '+56922222222', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Carla Soto', 'carla.soto@mail.cl', '+56933333333', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Diego Mora', 'diego.mora@mail.cl', '+56944444444', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Elena Ruiz', 'elena.ruiz@mail.cl', NULL, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO producto (nombre, categoria, precio, stock_actual, version, created_at, updated_at) VALUES
  ('Café Grano 1kg', 'Abarrotes', 8990.00, 18, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Té Verde 100un', 'Abarrotes', 4990.00, 2, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Laptop Pro 14', 'Electrónica', 999990.00, 5, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Mouse Inalámbrico', 'Electrónica', 19990.00, 49, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Teclado Mecánico', 'Electrónica', 59990.00, 2, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Silla Oficina', 'Hogar', 129990.00, 8, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Lámpara LED', 'Hogar', 15990.00, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Cuaderno 100h', 'Librería', 2990.00, 100, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Lápiz Grafito x12', 'Librería', 3990.00, 4, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Mochila Urbana', 'Deporte', 34990.00, 13, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Botella Acero 750ml', 'Deporte', 12990.00, 30, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Pelota Fútbol N5', 'Deporte', 24990.00, 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Pedido 1: CONFIRMADO (stock ya descontado en los productos de arriba)
INSERT INTO pedido (cliente_id, fecha, estado, total, version, created_at, updated_at) VALUES
  (2, TIMESTAMP '2025-11-10 10:30:00', 'CONFIRMADO', 37970.00, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario, version, created_at, updated_at) VALUES
  (1, 1, 2, 8990.00, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (1, 4, 1, 19990.00, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Pedido 2: CANCELADO (stock NO descontado; excluido del reporte de ventas)
INSERT INTO pedido (cliente_id, fecha, estado, total, version, created_at, updated_at) VALUES
  (3, TIMESTAMP '2026-03-15 16:45:00', 'CANCELADO', 8970.00, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario, version, created_at, updated_at) VALUES
  (2, 8, 3, 2990.00, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Pedido 3: PENDIENTE (stock ya descontado en los productos de arriba)
INSERT INTO pedido (cliente_id, fecha, estado, total, version, created_at, updated_at) VALUES
  (4, TIMESTAMP '2025-12-20 09:15:00', 'PENDIENTE', 74970.00, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario, version, created_at, updated_at) VALUES
  (3, 2, 1, 4990.00, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 10, 2, 34990.00, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
