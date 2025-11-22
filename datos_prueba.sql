-- ================================================
-- DATOS DE PRUEBA PARA GLAMSOFT
-- Ejecutar estos INSERTs en tu base de datos MySQL
-- ================================================

-- 1. ROLES
INSERT INTO rol (id_rol, nombre_rol) VALUES
(1, 'Administrador'),
(2, 'Estilista'),
(3, 'Cliente');

-- 2. CATEGORÍAS DE SERVICIOS
INSERT INTO categoria (id_categoria, nombre_categoria, descripcion) VALUES
(1, 'Cortes', 'Cortes de cabello para hombres y mujeres'),
(2, 'Tintes', 'Coloración y mechas'),
(3, 'Tratamientos', 'Tratamientos capilares'),
(4, 'Peinados', 'Peinados para eventos'),
(5, 'Manicure', 'Cuidado de uñas'),
(6, 'Maquillaje', 'Maquillaje profesional');

-- 3. USUARIOS (contraseña: "password123" - debe hashearse con Password4j en tu app)
-- Nota: Estas son contraseñas de ejemplo. En producción deberías hashearlas
INSERT INTO usuario (id_usuario, email, password, id_rol) VALUES
(1, 'admin@glamsoft.com', 'adminPass', 1),
(2, 'maria.lopez@glamsoft.com', 'estilistaPass', 2),
(3, 'carlos.ruiz@glamsoft.com', 'estilistaPass', 2),
(4, 'cliente1@test.com', 'clientePass', 3),
(5, 'cliente2@test.com', 'clientePass', 3),
(6, 'cliente3@test.com', 'clientePass', 3);

-- 4. EMPLEADOS (Estilistas)
INSERT INTO empleado (id_empleado, nombre, telefono, imagen_perfil, id_usuario) VALUES
(1, 'María López', '555-0101', 'https://randomuser.me/api/portraits/women/1.jpg', 2),
(2, 'Carlos Ruiz', '555-0102', 'https://randomuser.me/api/portraits/men/1.jpg', 3);

-- 5. SERVICIOS
INSERT INTO servicio (id_servicio, imagen, nombre_servicio, duracion_minutos, precio, descripcion, id_categoria, id_formulario) VALUES
(1, 'https://images.unsplash.com/photo-1560066984-138dadb4c035', 'Corte Clásico', 30, 200.00, 'Corte de cabello tradicional con lavado', 1, NULL),
(2, 'https://images.unsplash.com/photo-1562322140-8baeececf3df', 'Corte y Barba', 45, 350.00, 'Corte de cabello y arreglo de barba', 1, NULL),
(3, 'https://images.unsplash.com/photo-1522337660859-02fbefca4702', 'Tinte Completo', 120, 800.00, 'Tinte de cabello completo con decoloración', 2, NULL),
(4, 'https://images.unsplash.com/photo-1559599238-1e2a0f75a8c1', 'Mechas Californianas', 90, 650.00, 'Mechas californianas con tonos naturales', 2, NULL),
(5, 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796', 'Tratamiento de Keratina', 120, 1200.00, 'Tratamiento alisador con keratina brasileña', 3, NULL),
(6, 'https://images.unsplash.com/photo-1562322140-8baeececf3df', 'Peinado para Evento', 60, 450.00, 'Peinado profesional para eventos especiales', 4, NULL),
(7, 'https://images.unsplash.com/photo-1604902396830-aca29e19b067', 'Manicure Spa', 45, 250.00, 'Manicure completo con esmaltado permanente', 5, NULL),
(8, 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2', 'Maquillaje Social', 45, 400.00, 'Maquillaje profesional para eventos sociales', 6, NULL);

-- 6. RELACIÓN ESTILISTA-SERVICIO (qué servicios ofrece cada estilista)
INSERT INTO estilista_servicio (id_estilista, id_servicio) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 6), (1, 8),
(2, 1), (2, 2), (2, 5), (2, 7);

-- 7. HORARIOS DE ESTILISTAS
INSERT INTO horario (id_horario, hora_inicio, hora_fin, dia_semana) VALUES
-- María López - Lunes a Viernes
(1, '09:00:00', '18:00:00', 'Lunes'),
(2, '09:00:00', '18:00:00', 'Martes'),
(3, '09:00:00', '18:00:00', 'Miércoles'),
(4, '09:00:00', '18:00:00', 'Jueves'),
(5, '09:00:00', '18:00:00', 'Viernes'),
-- Carlos Ruiz - Martes a Sábado
(6, '10:00:00', '19:00:00', 'Martes'),
(7, '10:00:00', '19:00:00', 'Miércoles'),
(8, '10:00:00', '19:00:00', 'Jueves'),
(9, '10:00:00', '19:00:00', 'Viernes'),
(10, '09:00:00', '15:00:00', 'Sábado');

-- 8. RELACIÓN ESTILISTA-HORARIO
INSERT INTO estilista_horario (id_estilista, id_horario) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
(2, 6), (2, 7), (2, 8), (2, 9), (2, 10);

-- 9. CITAS DE EJEMPLO
INSERT INTO cita (id_cita, estado_cita, fecha_hora_cita, id_cliente, id_estilista, id_horario) VALUES
(1, 'CONFIRMADA', '2025-11-25 10:00:00', 4, 1, 1),
(2, 'PENDIENTE', '2025-11-25 14:00:00', 5, 1, 1),
(3, 'CONFIRMADA', '2025-11-26 11:00:00', 6, 2, 6),
(4, 'CONFIRMADA', '2025-11-27 15:00:00', 4, 2, 7),
(5, 'CANCELADA', '2025-11-22 10:00:00', 5, 1, 1);

-- 10. RELACIÓN CITA-SERVICIO
INSERT INTO cita_servicio (id_cita, id_servicio) VALUES
(1, 1), -- Cita 1: Corte Clásico
(2, 2), -- Cita 2: Corte y Barba
(3, 3), (3, 4), -- Cita 3: Tinte + Mechas
(4, 5), -- Cita 4: Keratina
(5, 1); -- Cita 5: Corte (cancelada)

-- 11. PROMOCIONES
INSERT INTO promocion (id_promocion, nombre_promocion, descripcion, porcentaje_descuento, fecha_inicio, fecha_fin) VALUES
(1, 'Descuento Bienvenida', 'Obtén 20% de descuento en tu primera visita', 20.00, '2025-11-01', '2025-12-31'),
(2, 'Paquete Novias', '25% de descuento en paquetes para novias', 25.00, '2025-01-01', '2025-12-31'),
(3, 'Fin de Semana', '15% de descuento sábados y domingos', 15.00, '2025-11-01', '2025-12-31');

-- 12. SERVICIOS EN PROMOCIÓN
INSERT INTO promocion_servicio (id_promocion, id_servicio) VALUES
(1, 1), (1, 2), (1, 3), (1, 4),
(2, 6), (2, 8),
(3, 1), (3, 7);

-- 13. PORTAFOLIO/GALERÍA
INSERT INTO portafolio (id_imagen, url_imagen, descripcion, fecha_subida) VALUES
(1, 'https://images.unsplash.com/photo-1560066984-138dadb4c035', 'Corte degradado moderno', '2025-11-01'),
(2, 'https://images.unsplash.com/photo-1522337660859-02fbefca4702', 'Tinte rubio platinado', '2025-11-02'),
(3, 'https://images.unsplash.com/photo-1562322140-8baeececf3df', 'Corte y barba ejecutivo', '2025-11-03'),
(4, 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796', 'Tratamiento capilar', '2025-11-04'),
(5, 'https://images.unsplash.com/photo-1559599238-1e2a0f75a8c1', 'Mechas balayage', '2025-11-05'),
(6, 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2', 'Maquillaje profesional', '2025-11-06'),
(7, 'https://images.unsplash.com/photo-1604902396830-aca29e19b067', 'Diseño de uñas', '2025-11-07'),
(8, 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f', 'Peinado de novia', '2025-11-08');

-- 14. VALORACIONES/COMENTARIOS
INSERT INTO valoracion (id_valoracion, puntuacion, comentario, fecha_valoracion, id_cliente) VALUES
(1, 5, '¡Excelente servicio! María es una profesional increíble.', '2025-11-20', 4),
(2, 5, 'Muy satisfecho con mi corte. Carlos tiene mucha experiencia.', '2025-11-21', 5),
(3, 4, 'Buen servicio, pero tuve que esperar un poco.', '2025-11-18', 6),
(4, 5, 'El mejor salón de la ciudad. Totalmente recomendado.', '2025-11-19', 4);

-- ================================================
-- VERIFICACIÓN DE DATOS
-- ================================================

-- Ver todos los servicios con sus categorías
SELECT s.nombre_servicio, s.precio, c.nombre_categoria 
FROM servicio s
JOIN categoria c ON s.id_categoria = c.id_categoria;

-- Ver estilistas con sus servicios
SELECT e.nombre, s.nombre_servicio
FROM empleado e
JOIN estilista_servicio es ON e.id_empleado = es.id_estilista
JOIN servicio s ON es.id_servicio = s.id_servicio;

-- Ver citas próximas
SELECT 
    c.id_cita,
    c.estado_cita,
    c.fecha_hora_cita,
    e.nombre AS estilista,
    u.email AS cliente
FROM cita c
JOIN empleado e ON c.id_estilista = e.id_empleado
JOIN usuario u ON c.id_cliente = u.id_usuario
WHERE c.fecha_hora_cita >= NOW()
ORDER BY c.fecha_hora_cita;

-- Ver promociones activas
SELECT nombre_promocion, porcentaje_descuento, fecha_inicio, fecha_fin
FROM promocion
WHERE fecha_inicio <= CURDATE() AND fecha_fin >= CURDATE();

-- ================================================
-- NOTA: Para usar estos datos:
-- 1. Asegúrate de que tu API está corriendo en puerto 7000
-- 2. Ejecuta este script SQL en tu base de datos
-- 3. Las contraseñas deben hashearse con Password4j en tu backend
-- 4. Usa las credenciales de prueba para login:
--    - Admin: admin@glamsoft.com / adminPass
--    - Estilista: maria.lopez@glamsoft.com / estilistaPass
--    - Cliente: cliente1@test.com / clientePass
-- ================================================
