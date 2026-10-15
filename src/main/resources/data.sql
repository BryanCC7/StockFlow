-- Seed demo: 5 clientes, 12 productos (stocks variados para probar stock-bajo)
INSERT INTO cliente (nombre, email, telefono, version, created_at, updated_at) VALUES
  ('Ana Torres', 'ana.torres@mail.cl', '+56911111111', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Bruno Díaz', 'bruno.diaz@mail.cl', '+56922222222', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Carla Soto', 'carla.soto@mail.cl', '+56933333333', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Diego Mora', 'diego.mora@mail.cl', '+56944444444', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Elena Ruiz', 'elena.ruiz@mail.cl', NULL, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO producto (nombre, categoria, precio, stock_actual, version, created_at, updated_at) VALUES
  ('Café Grano 1kg', 'Abarrotes', 8990.00, 20, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Té Verde 100un', 'Abarrotes', 4990.00, 3, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Laptop Pro 14', 'Electrónica', 999990.00, 5, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Mouse Inalámbrico', 'Electrónica', 19990.00, 50, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Teclado Mecánico', 'Electrónica', 59990.00, 2, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Silla Oficina', 'Hogar', 129990.00, 8, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Lámpara LED', 'Hogar', 15990.00, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Cuaderno 100h', 'Librería', 2990.00, 100, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Lápiz Grafito x12', 'Librería', 3990.00, 4, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Mochila Urbana', 'Deporte', 34990.00, 15, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Botella Acero 750ml', 'Deporte', 12990.00, 30, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Pelota Fútbol N5', 'Deporte', 24990.00, 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
