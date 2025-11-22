-- ===================================
-- DATOS DE PRUEBA PARA GLAMSOFT API
-- ===================================
-- Ejecutar después de crear la base de datos
-- Base de datos: glamsoft
-- ===================================

USE glamsoft;

-- ===================================
-- 1. ROLES
-- ===================================
INSERT INTO rol (idRol, nombre) VALUES
(1, 'Admin'),
(2, 'Empleado'),
(3, 'Cliente')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- ===================================
-- 2. USUARIOS
-- ===================================
-- Contraseñas: admin123, empleado123, cliente123 (bcrypt hash)
INSERT INTO usuario (email, password, idRol) VALUES
('admin@glamsoft.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhkO', 1),
('empleado1@glamsoft.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
('empleado2@glamsoft.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2),
('cliente1@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3),
('cliente2@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3)
ON DUPLICATE KEY UPDATE email = VALUES(email);

-- ===================================
-- 3. CATEGORÍAS
-- ===================================
INSERT INTO categoria (nombre) VALUES
('Cabello'),
('Uñas'),
('Maquillaje'),
('Tratamientos Faciales'),
('Depilación'),
('Masajes')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- ===================================
-- 4. SERVICIOS
-- ===================================
INSERT INTO servicio (nombre, descripcion, precio, duracion, imagen, idCategoria) VALUES
-- Cabello
('Corte de Cabello Dama', 'Corte profesional con lavado y secado incluido', 250.00, 45, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800', 1),
('Corte de Cabello Caballero', 'Corte clásico o moderno con detalles precisos', 150.00, 30, 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800', 1),
('Tinte Completo', 'Coloración completa con productos de alta calidad', 800.00, 120, 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800', 1),
('Mechas o Reflejos', 'Mechas naturales o reflejos de luz', 650.00, 90, 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800', 1),
('Peinado Especial', 'Peinado para eventos especiales', 400.00, 60, 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800', 1),
('Tratamiento Capilar', 'Tratamiento de hidratación profunda', 350.00, 45, 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800', 1),

-- Uñas
('Manicure Básico', 'Limado, cutícula y esmaltado', 120.00, 30, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800', 2),
('Manicure con Gel', 'Manicure con esmalte de gel de larga duración', 250.00, 45, 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=800', 2),
('Pedicure Spa', 'Pedicure completo con exfoliación y masaje', 280.00, 60, 'https://images.unsplash.com/photo-1519401934522-fb1d2f90d51e?w=800', 2),
('Uñas Acrílicas', 'Aplicación de uñas acrílicas con diseño', 450.00, 90, 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800', 2),

-- Maquillaje
('Maquillaje Social', 'Maquillaje para eventos sociales', 350.00, 45, 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800', 3),
('Maquillaje de Novia', 'Maquillaje especial para novias', 800.00, 90, 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800', 3),
('Maquillaje Profesional', 'Maquillaje para sesiones fotográficas', 500.00, 60, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800', 3),

-- Tratamientos Faciales
('Limpieza Facial Profunda', 'Limpieza, exfoliación y mascarilla', 400.00, 60, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800', 4),
('Tratamiento Anti-Edad', 'Tratamiento con ácido hialurónico', 650.00, 75, 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800', 4),
('Peeling Facial', 'Renovación celular profunda', 550.00, 60, 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800', 4),

-- Depilación
('Depilación de Cejas', 'Perfilado y depilación con cera', 80.00, 15, 'https://images.unsplash.com/photo-1583001308988-6e17c9b5e551?w=800', 5),
('Depilación Piernas Completas', 'Depilación con cera de piernas', 300.00, 45, 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800', 5),
('Depilación Brasileña', 'Depilación completa de zona íntima', 350.00, 30, 'https://images.unsplash.com/photo-1519735777090-ec97a26eef67?w=800', 5),

-- Masajes
('Masaje Relajante', 'Masaje corporal completo', 500.00, 60, 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', 6),
('Masaje Piedras Calientes', 'Masaje con terapia de piedras', 650.00, 75, 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800', 6)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- ===================================
-- 5. EMPLEADOS (ESTILISTAS)
-- ===================================
INSERT INTO empleado (idUsuario, nombre, telefono, especialidad) VALUES
(2, 'Laura Martínez', '5551234567', 'Especialista en Cabello'),
(3, 'Carlos Hernández', '5557654321', 'Barbero Profesional')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- ===================================
-- 6. HORARIOS DE EMPLEADOS
-- ===================================
INSERT INTO horario (idEmpleado, diaSemana, horaInicio, horaFin) VALUES
-- Laura Martínez
(1, 'Lunes', '09:00:00', '18:00:00'),
(1, 'Martes', '09:00:00', '18:00:00'),
(1, 'Miércoles', '09:00:00', '18:00:00'),
(1, 'Jueves', '09:00:00', '18:00:00'),
(1, 'Viernes', '09:00:00', '18:00:00'),
(1, 'Sábado', '10:00:00', '15:00:00'),

-- Carlos Hernández
(2, 'Lunes', '10:00:00', '19:00:00'),
(2, 'Martes', '10:00:00', '19:00:00'),
(2, 'Miércoles', '10:00:00', '19:00:00'),
(2, 'Jueves', '10:00:00', '19:00:00'),
(2, 'Viernes', '10:00:00', '19:00:00'),
(2, 'Sábado', '10:00:00', '16:00:00')
ON DUPLICATE KEY UPDATE horaInicio = VALUES(horaInicio);

-- ===================================
-- 7. SERVICIOS POR EMPLEADO
-- ===================================
INSERT INTO empleado_servicio (idEmpleado, idServicio) VALUES
-- Laura Martínez - Servicios de cabello y maquillaje
(1, 1), (1, 3), (1, 4), (1, 5), (1, 6), (1, 11), (1, 12), (1, 13),
-- Carlos Hernández - Servicios de caballero
(2, 2), (2, 6)
ON DUPLICATE KEY UPDATE idEmpleado = VALUES(idEmpleado);

-- ===================================
-- 8. PROMOCIONES
-- ===================================
INSERT INTO promocion (titulo, descripcion, descuento, fechaInicio, fechaFin, imagen, activa) VALUES
('Promo Combo Belleza', 'Corte + Tinte con 20% de descuento', 20.00, '2025-11-01', '2025-12-31', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800', TRUE),
('Black Friday', 'Todos los servicios con 30% de descuento', 30.00, '2025-11-22', '2025-11-30', 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800', TRUE),
('Paquete Spa', 'Facial + Manicure + Pedicure por $800', 25.00, '2025-11-15', '2025-12-15', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800', TRUE)
ON DUPLICATE KEY UPDATE titulo = VALUES(titulo);

-- ===================================
-- 9. SERVICIOS DE PROMOCIONES
-- ===================================
INSERT INTO promocion_servicio (idPromocion, idServicio) VALUES
(1, 1), (1, 3),
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5),
(3, 14), (3, 8), (3, 9)
ON DUPLICATE KEY UPDATE idPromocion = VALUES(idPromocion);

-- ===================================
-- 10. PORTAFOLIO (IMÁGENES)
-- ===================================
INSERT INTO imagen (titulo, descripcion, url, destacada) VALUES
('Corte y Color Balayage', 'Hermoso balayage rubio con corte moderno', 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800', TRUE),
('Maquillaje de Novia', 'Maquillaje natural para novia', 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800', TRUE),
('Uñas Acrílicas Diseño', 'Diseño elegante en uñas acrílicas', 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800', TRUE),
('Peinado Recogido', 'Peinado elegante para eventos', 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800', TRUE),
('Tratamiento Capilar', 'Antes y después de tratamiento de hidratación', 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800', FALSE),
('Corte Caballero', 'Corte moderno degradado', 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800', FALSE),
('Manicure Gel', 'Diseño en esmalte de gel', 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=800', FALSE),
('Facial Spa', 'Tratamiento facial relajante', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800', FALSE)
ON DUPLICATE KEY UPDATE titulo = VALUES(titulo);

-- ===================================
-- 11. VALORACIONES
-- ===================================
INSERT INTO valoracion (idCliente, calificacion, comentario, fecha) VALUES
(4, 5, 'Excelente servicio, quedé muy satisfecha con mi corte y color. Laura es una artista!', '2025-11-15'),
(5, 5, 'El mejor salón en el que he estado. Profesionalismo de primer nivel.', '2025-11-18'),
(4, 4, 'Muy buen trabajo, el ambiente es agradable y el personal muy amable.', '2025-11-20'),
(5, 5, 'Me encantó el resultado de mi maquillaje. Superó mis expectativas.', '2025-11-21'),
(4, 5, 'Carlos es excelente barbero, atención impecable y resultado perfecto.', '2025-11-22'),
(5, 4, 'Hermoso peinado para mi evento, duró toda la noche perfecto.', '2025-11-23')
ON DUPLICATE KEY UPDATE comentario = VALUES(comentario);

-- ===================================
-- 12. CITAS DE EJEMPLO
-- ===================================
INSERT INTO cita (idCliente, idServicio, idEmpleado, fecha, hora, estado, notas) VALUES
(4, 1, 1, '2025-11-25', '10:00:00', 'confirmada', 'Primera vez en el salón'),
(5, 2, 2, '2025-11-25', '11:00:00', 'confirmada', 'Corte regular'),
(4, 3, 1, '2025-11-26', '14:00:00', 'pendiente', 'Consultar tonos disponibles'),
(5, 12, 1, '2025-11-27', '15:00:00', 'pendiente', 'Maquillaje para evento social'),
(4, 8, 1, '2025-11-28', '10:30:00', 'confirmada', 'Manicure con gel color nude'),
(5, 14, 1, '2025-11-29', '16:00:00', 'pendiente', 'Primera limpieza facial')
ON DUPLICATE KEY UPDATE estado = VALUES(estado);

-- ===================================
-- 13. COMENTARIOS (Sistema interno)
-- ===================================
INSERT INTO comentario (idCliente, idServicio, texto, fecha) VALUES
(4, 1, 'Me encantó mi nuevo look, definitivamente volveré', '2025-11-15'),
(5, 2, 'Carlos es muy profesional, excelente atención', '2025-11-18'),
(4, 3, 'El color quedó perfecto, justo como lo quería', '2025-11-20'),
(5, 12, 'El maquillaje duró toda la noche impecable', '2025-11-21'),
(4, 8, 'Las uñas quedaron hermosas, muy buen trabajo', '2025-11-22'),
(5, 14, 'Mi piel se siente increíble después del facial', '2025-11-23')
ON DUPLICATE KEY UPDATE texto = VALUES(texto);

-- ===================================
-- 14. FORMULARIOS DE CONTACTO
-- ===================================
INSERT INTO formulario (nombre, email, telefono, asunto, mensaje, fecha, leido) VALUES
('Ana García', 'ana.garcia@email.com', '5551234567', 'Consulta de Servicios', '¿Tienen servicios de extensiones de cabello?', '2025-11-20', FALSE),
('Pedro López', 'pedro.lopez@email.com', '5557654321', 'Reserva Grupal', 'Necesito agendar servicios para 5 personas, ¿es posible?', '2025-11-21', FALSE),
('María Rodríguez', 'maria.rod@email.com', '5559876543', 'Cotización Evento', 'Cotización para maquillaje y peinado de boda (novia + 4 damas)', '2025-11-22', TRUE)
ON DUPLICATE KEY UPDATE leido = VALUES(leido);

-- ===================================
-- VERIFICACIÓN DE DATOS
-- ===================================
SELECT 'Datos insertados correctamente' as mensaje;
SELECT COUNT(*) as total_servicios FROM servicio;
SELECT COUNT(*) as total_usuarios FROM usuario;
SELECT COUNT(*) as total_empleados FROM empleado;
SELECT COUNT(*) as total_promociones FROM promocion;
SELECT COUNT(*) as total_imagenes FROM imagen;
SELECT COUNT(*) as total_valoraciones FROM valoracion;
SELECT COUNT(*) as total_citas FROM cita;
