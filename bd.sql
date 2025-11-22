-- =====================================================
-- SCRIPT DE BASE DE DATOS GLAMSOFT - VERSIÓN CORREGIDA
-- Sistema de Gestión para Salón de Belleza
-- Fecha: 22 de Noviembre de 2025
-- =====================================================

-- 1. CREAR Y USAR BASE DE DATOS
DROP DATABASE IF EXISTS glamsoft;
CREATE DATABASE glamsoft CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE glamsoft;

-- =====================================================
-- 2. CREACIÓN DE TABLAS
-- =====================================================

-- Tabla: rol
-- Descripción: Define los roles de usuario en el sistema
CREATE TABLE rol (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla: usuario
-- Descripción: Almacena la información de autenticación de usuarios
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    id_rol INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_conexion TIMESTAMP NULL,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) 
        REFERENCES rol(id_rol) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Tabla: empleado
-- Descripción: Información adicional de empleados del salón
CREATE TABLE empleado (
    id_empleado INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    imagen_perfil TEXT,
    puesto VARCHAR(100),
    id_usuario INT NOT NULL UNIQUE,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_empleado_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla: categoria
-- Descripción: Categorías de servicios ofrecidos
CREATE TABLE categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla: formulario
-- Descripción: Formularios personalizados para servicios
CREATE TABLE formulario (
    id_formulario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_formulario VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla: pregunta
-- Descripción: Preguntas de formularios y FAQ
CREATE TABLE pregunta (
    id_pregunta INT AUTO_INCREMENT PRIMARY KEY,
    texto_pregunta TEXT NOT NULL,
    texto_respuesta TEXT,
    tipo VARCHAR(50) DEFAULT 'FAQ', -- FAQ, FORMULARIO
    id_formulario INT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pregunta_formulario FOREIGN KEY (id_formulario) 
        REFERENCES formulario(id_formulario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla: servicio
-- Descripción: Servicios ofrecidos por el salón
CREATE TABLE servicio (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    nombre_servicio VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    duracion_minutos INT NOT NULL,
    imagen TEXT,
    id_categoria INT NOT NULL,
    id_formulario INT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_servicio_categoria FOREIGN KEY (id_categoria) 
        REFERENCES categoria(id_categoria) ON DELETE RESTRICT,
    CONSTRAINT fk_servicio_formulario FOREIGN KEY (id_formulario) 
        REFERENCES formulario(id_formulario) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tabla: horario
-- Descripción: Horarios de trabajo del salón
CREATE TABLE horario (
    id_horario INT AUTO_INCREMENT PRIMARY KEY,
    dia_semana VARCHAR(20) NOT NULL, -- Lunes, Martes, etc.
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_dia_semana CHECK (dia_semana IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'))
) ENGINE=InnoDB;

-- Tabla: promocion
-- Descripción: Promociones y descuentos
CREATE TABLE promocion (
    id_promocion INT AUTO_INCREMENT PRIMARY KEY,
    nombre_promocion VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tipo_descuento VARCHAR(50) NOT NULL, -- PORCENTAJE, MONTO_FIJO
    valor_descuento DECIMAL(10, 2) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_tipo_descuento CHECK (tipo_descuento IN ('PORCENTAJE', 'MONTO_FIJO'))
) ENGINE=InnoDB;

-- Tabla: portafolio
-- Descripción: Galería de trabajos realizados
CREATE TABLE portafolio (
    id_imagen INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100),
    descripcion TEXT,
    url TEXT NOT NULL,
    nombre_imagen VARCHAR(100),
    id_categoria INT,
    destacado BOOLEAN DEFAULT FALSE,
    visitas INT DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_portafolio_categoria FOREIGN KEY (id_categoria) 
        REFERENCES categoria(id_categoria) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tabla: cita
-- Descripción: Citas agendadas en el sistema
CREATE TABLE cita (
    id_cita INT AUTO_INCREMENT PRIMARY KEY,
    fecha_hora_cita DATETIME NOT NULL,
    estado_cita VARCHAR(50) DEFAULT 'PENDIENTE',
    notas TEXT,
    precio_total DECIMAL(10, 2),
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_cliente INT NOT NULL,
    id_estilista INT NOT NULL,
    id_horario INT NOT NULL,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cita_cliente FOREIGN KEY (id_cliente) 
        REFERENCES usuario(id_usuario) ON DELETE RESTRICT,
    CONSTRAINT fk_cita_estilista FOREIGN KEY (id_estilista) 
        REFERENCES empleado(id_empleado) ON DELETE RESTRICT,
    CONSTRAINT fk_cita_horario FOREIGN KEY (id_horario) 
        REFERENCES horario(id_horario) ON DELETE RESTRICT,
    CONSTRAINT chk_estado_cita CHECK (estado_cita IN ('PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA', 'NO_ASISTIO'))
) ENGINE=InnoDB;

-- Tabla: comentario
-- Descripción: Comentarios de clientes sobre servicios
CREATE TABLE comentario (
    id_comentario INT AUTO_INCREMENT PRIMARY KEY,
    comentario TEXT NOT NULL,
    fecha_comentario TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_cita INT NOT NULL,
    id_cliente INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_comentario_cita FOREIGN KEY (id_cita) 
        REFERENCES cita(id_cita) ON DELETE CASCADE,
    CONSTRAINT fk_comentario_cliente FOREIGN KEY (id_cliente) 
        REFERENCES usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla: valoracion
-- Descripción: Valoraciones/calificaciones de servicios
CREATE TABLE valoracion (
    id_valoracion INT AUTO_INCREMENT PRIMARY KEY,
    puntuacion DECIMAL(2, 1) NOT NULL,
    comentario TEXT,
    fecha_valoracion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_cita INT NOT NULL,
    id_cliente INT NOT NULL,
    id_servicio INT NOT NULL,
    CONSTRAINT fk_valoracion_cita FOREIGN KEY (id_cita) 
        REFERENCES cita(id_cita) ON DELETE CASCADE,
    CONSTRAINT fk_valoracion_cliente FOREIGN KEY (id_cliente) 
        REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_valoracion_servicio FOREIGN KEY (id_servicio) 
        REFERENCES servicio(id_servicio) ON DELETE CASCADE,
    CONSTRAINT chk_puntuacion CHECK (puntuacion >= 1.0 AND puntuacion <= 5.0)
) ENGINE=InnoDB;

-- =====================================================
-- 3. TABLAS INTERMEDIAS (RELACIONES MUCHOS A MUCHOS)
-- =====================================================

-- Tabla: estilista_servicio
-- Descripción: Servicios que puede realizar cada estilista
CREATE TABLE estilista_servicio (
    id_estilista INT NOT NULL,
    id_servicio INT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_estilista, id_servicio),
    CONSTRAINT fk_es_estilista FOREIGN KEY (id_estilista) 
        REFERENCES empleado(id_empleado) ON DELETE CASCADE,
    CONSTRAINT fk_es_servicio FOREIGN KEY (id_servicio) 
        REFERENCES servicio(id_servicio) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla: estilista_horario
-- Descripción: Horarios de trabajo de cada estilista
CREATE TABLE estilista_horario (
    id_estilista INT NOT NULL,
    id_horario INT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_estilista, id_horario),
    CONSTRAINT fk_eh_estilista FOREIGN KEY (id_estilista) 
        REFERENCES empleado(id_empleado) ON DELETE CASCADE,
    CONSTRAINT fk_eh_horario FOREIGN KEY (id_horario) 
        REFERENCES horario(id_horario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla: servicio_promocion
-- Descripción: Servicios incluidos en cada promoción
CREATE TABLE servicio_promocion (
    id_servicio INT NOT NULL,
    id_promocion INT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_servicio, id_promocion),
    CONSTRAINT fk_sp_servicio FOREIGN KEY (id_servicio) 
        REFERENCES servicio(id_servicio) ON DELETE CASCADE,
    CONSTRAINT fk_sp_promocion FOREIGN KEY (id_promocion) 
        REFERENCES promocion(id_promocion) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla: cita_servicio
-- Descripción: Servicios incluidos en cada cita
CREATE TABLE cita_servicio (
    id_cita INT NOT NULL,
    id_servicio INT NOT NULL,
    precio_aplicado DECIMAL(10, 2),
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_cita, id_servicio),
    CONSTRAINT fk_cs_cita FOREIGN KEY (id_cita) 
        REFERENCES cita(id_cita) ON DELETE CASCADE,
    CONSTRAINT fk_cs_servicio FOREIGN KEY (id_servicio) 
        REFERENCES servicio(id_servicio) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================================
-- 4. ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_usuario_telefono ON usuario(telefono);
CREATE INDEX idx_cita_fecha ON cita(fecha_hora_cita);
CREATE INDEX idx_cita_estado ON cita(estado_cita);
CREATE INDEX idx_cita_cliente ON cita(id_cliente);
CREATE INDEX idx_cita_estilista ON cita(id_estilista);
CREATE INDEX idx_servicio_categoria ON servicio(id_categoria);
CREATE INDEX idx_promocion_fechas ON promocion(fecha_inicio, fecha_fin);

-- =====================================================
-- 5. INSERTS DE DATOS DE EJEMPLO
-- =====================================================

-- ============ ROLES ============
INSERT INTO rol (nombre_rol, descripcion) VALUES 
('ADMIN', 'Administrador del sistema con acceso completo'),
('ESTILISTA', 'Estilista del salón que atiende clientes'),
('CLIENTE', 'Cliente del salón que agenda citas');

-- ============ USUARIOS ============
-- Nota: Las contraseñas deben estar hasheadas en producción
-- Estos son ejemplos con contraseñas simples para testing

-- Administrador
INSERT INTO usuario (nombre, email, telefono, password, id_rol) VALUES 
('Admin GlamSoft', 'admin@glamsoft.com', '9611111111', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1);
-- Password: Admin123!

-- Estilistas
INSERT INTO usuario (nombre, email, telefono, password, id_rol) VALUES 
('Ana Pérez García', 'ana.perez@glamsoft.com', '9612222222', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2),
('Carlos Ramírez López', 'carlos.ramirez@glamsoft.com', '9613333333', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2),
('María González Ruiz', 'maria.gonzalez@glamsoft.com', '9614444444', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2);
-- Password para todos: Estilista123!

-- Clientes
INSERT INTO usuario (nombre, email, telefono, password, id_rol) VALUES 
('Laura Martínez Sánchez', 'laura.martinez@email.com', '9615555555', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3),
('José Luis Hernández', 'jose.hernandez@email.com', '9616666666', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3),
('Patricia Flores Cruz', 'patricia.flores@email.com', '9617777777', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3),
('Roberto Díaz Morales', 'roberto.diaz@email.com', '9618888888', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3),
('Sofía Reyes Castro', 'sofia.reyes@email.com', '9619999999', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3);
-- Password para todos: Cliente123!

-- ============ EMPLEADOS ============
INSERT INTO empleado (nombre, telefono, imagen_perfil, puesto, id_usuario) VALUES 
('Ana Pérez García', '9612222222', 'https://example.com/images/ana.jpg', 'Estilista Senior', 2),
('Carlos Ramírez López', '9613333333', 'https://example.com/images/carlos.jpg', 'Estilista Colorista', 3),
('María González Ruiz', '9614444444', 'https://example.com/images/maria.jpg', 'Estilista Junior', 4);

-- ============ CATEGORÍAS ============
INSERT INTO categoria (nombre_categoria, descripcion) VALUES 
('Corte', 'Servicios de corte de cabello para dama y caballero'),
('Coloración', 'Servicios de tinte, rayos, mechas y coloración'),
('Tratamientos', 'Tratamientos capilares especializados'),
('Peinado', 'Servicios de peinado para eventos especiales'),
('Maquillaje', 'Servicios profesionales de maquillaje'),
('Uñas', 'Servicios de manicure y pedicure'),
('Depilación', 'Servicios de depilación con cera'),
('Cejas', 'Diseño y perfilado de cejas');

-- ============ FORMULARIOS ============
INSERT INTO formulario (nombre_formulario, descripcion) VALUES 
('Formulario Coloración', 'Cuestionario previo a servicios de coloración'),
('Formulario Tratamientos', 'Evaluación del estado del cabello para tratamientos'),
('Formulario Alergias', 'Detección de alergias a productos'),
('Formulario Consulta General', 'Formulario de contacto general');

-- ============ PREGUNTAS FAQ ============
INSERT INTO pregunta (texto_pregunta, texto_respuesta, tipo) VALUES 
('¿Cuál es el horario de atención?', 'Nuestro horario es de lunes a sábado de 9:00 AM a 7:00 PM y domingos de 10:00 AM a 3:00 PM', 'FAQ'),
('¿Aceptan tarjetas de crédito?', 'Sí, aceptamos todas las tarjetas de crédito y débito, así como pagos en efectivo', 'FAQ'),
('¿Puedo cancelar mi cita?', 'Sí, puedes cancelar tu cita con al menos 24 horas de anticipación sin penalización', 'FAQ'),
('¿Ofrecen servicios a domicilio?', 'Actualmente no ofrecemos servicios a domicilio, pero puedes visitarnos en nuestro salón', 'FAQ'),
('¿Necesito hacer cita previa?', 'Sí, recomendamos agendar cita previa para garantizar disponibilidad', 'FAQ');

-- Preguntas de formularios
INSERT INTO pregunta (texto_pregunta, texto_respuesta, tipo, id_formulario) VALUES 
('¿Ha aplicado tinte en los últimos 3 meses?', NULL, 'FORMULARIO', 1),
('¿Tiene alguna alergia conocida a productos químicos?', NULL, 'FORMULARIO', 1),
('¿Su cabello está teñido actualmente?', NULL, 'FORMULARIO', 1),
('¿Ha tenido reacciones alérgicas previas a tratamientos capilares?', NULL, 'FORMULARIO', 2),
('¿Qué tipo de cabello tiene? (graso/seco/mixto/normal)', NULL, 'FORMULARIO', 2);

-- ============ SERVICIOS ============
INSERT INTO servicio (nombre_servicio, descripcion, precio, duracion_minutos, imagen, id_categoria, id_formulario) VALUES 
-- Corte
('Corte de Cabello Dama', 'Corte moderno y personalizado para dama', 150.00, 30, 'https://example.com/images/corte-dama.jpg', 1, NULL),
('Corte de Cabello Caballero', 'Corte clásico o moderno para caballero', 120.00, 25, 'https://example.com/images/corte-caballero.jpg', 1, NULL),
('Corte Niño/Niña', 'Corte infantil hasta 12 años', 100.00, 20, 'https://example.com/images/corte-nino.jpg', 1, NULL),

-- Coloración
('Tinte Completo', 'Aplicación de tinte en todo el cabello', 450.00, 120, 'https://example.com/images/tinte.jpg', 2, 1),
('Rayos/Mechas', 'Aplicación de rayos o mechas parciales', 550.00, 150, 'https://example.com/images/mechas.jpg', 2, 1),
('Balayage', 'Técnica de coloración degradada natural', 750.00, 180, 'https://example.com/images/balayage.jpg', 2, 1),
('Retoque de Raíz', 'Retoque de raíz hasta 3 cm', 280.00, 60, 'https://example.com/images/retoque.jpg', 2, 1),

-- Tratamientos
('Keratina Brasileña', 'Tratamiento alisador con keratina', 800.00, 180, 'https://example.com/images/keratina.jpg', 3, 2),
('Botox Capilar', 'Tratamiento de hidratación profunda', 600.00, 120, 'https://example.com/images/botox.jpg', 3, 2),
('Hidratación Profunda', 'Tratamiento hidratante para cabello seco', 350.00, 60, 'https://example.com/images/hidratacion.jpg', 3, 2),

-- Peinado
('Peinado Casual', 'Peinado sencillo para uso diario', 200.00, 40, 'https://example.com/images/peinado-casual.jpg', 4, NULL),
('Peinado de Fiesta', 'Peinado elaborado para eventos', 400.00, 90, 'https://example.com/images/peinado-fiesta.jpg', 4, NULL),
('Peinado de Novia', 'Peinado especial para novias', 800.00, 120, 'https://example.com/images/peinado-novia.jpg', 4, NULL),

-- Maquillaje
('Maquillaje Social', 'Maquillaje para eventos sociales', 450.00, 60, 'https://example.com/images/maquillaje-social.jpg', 5, NULL),
('Maquillaje de Novia', 'Maquillaje profesional para novias', 800.00, 90, 'https://example.com/images/maquillaje-novia.jpg', 5, NULL),

-- Uñas
('Manicure Básico', 'Manicure con esmaltado tradicional', 150.00, 45, 'https://example.com/images/manicure.jpg', 6, NULL),
('Manicure Gel', 'Manicure con esmaltado en gel', 250.00, 60, 'https://example.com/images/manicure-gel.jpg', 6, NULL),
('Pedicure Spa', 'Pedicure con tratamiento spa', 300.00, 75, 'https://example.com/images/pedicure.jpg', 6, NULL),

-- Depilación
('Depilación Facial', 'Depilación con cera de rostro completo', 180.00, 30, 'https://example.com/images/depilacion-facial.jpg', 7, 3),
('Depilación Axilas', 'Depilación con cera de axilas', 120.00, 20, 'https://example.com/images/depilacion-axilas.jpg', 7, 3),

-- Cejas
('Diseño de Cejas', 'Diseño y perfilado de cejas', 100.00, 20, 'https://example.com/images/cejas.jpg', 8, NULL),
('Tinte de Cejas', 'Tintura profesional de cejas', 120.00, 25, 'https://example.com/images/tinte-cejas.jpg', 8, NULL);

-- ============ HORARIOS ============
INSERT INTO horario (dia_semana, hora_inicio, hora_fin) VALUES 
('Lunes', '09:00:00', '18:00:00'),
('Martes', '09:00:00', '18:00:00'),
('Miércoles', '09:00:00', '18:00:00'),
('Jueves', '09:00:00', '18:00:00'),
('Viernes', '09:00:00', '19:00:00'),
('Sábado', '09:00:00', '19:00:00'),
('Domingo', '10:00:00', '15:00:00');

-- ============ PROMOCIONES ============
INSERT INTO promocion (nombre_promocion, descripcion, tipo_descuento, valor_descuento, fecha_inicio, fecha_fin) VALUES 
('Black Friday 2025', 'Descuento especial en todos los servicios', 'PORCENTAJE', 30.00, '2025-11-28', '2025-11-30'),
('Navidad 2025', 'Promoción navideña en tratamientos', 'PORCENTAJE', 20.00, '2025-12-15', '2025-12-31'),
('Año Nuevo 2026', 'Comienza el año renovada', 'PORCENTAJE', 25.00, '2026-01-02', '2026-01-15'),
('San Valentín', 'Descuento especial para parejas', 'MONTO_FIJO', 200.00, '2026-02-10', '2026-02-14');

-- ============ PORTAFOLIO ============
INSERT INTO portafolio (titulo, descripcion, url, nombre_imagen, id_categoria, destacado) VALUES 
('Corte Moderno Dama', 'Corte bob asimétrico con capas', 'https://example.com/portfolio/corte1.jpg', 'corte-moderno-1.jpg', 1, TRUE),
('Balayage Californiano', 'Técnica de balayage en tonos rubios', 'https://example.com/portfolio/balayage1.jpg', 'balayage-1.jpg', 2, TRUE),
('Peinado de Novia Elegante', 'Recogido clásico para novia', 'https://example.com/portfolio/novia1.jpg', 'novia-1.jpg', 4, TRUE),
('Mechas Caramelo', 'Mechas en tonos caramelo y miel', 'https://example.com/portfolio/mechas1.jpg', 'mechas-1.jpg', 2, FALSE),
('Corte Pixie', 'Corte corto estilo pixie moderno', 'https://example.com/portfolio/pixie1.jpg', 'pixie-1.jpg', 1, FALSE),
('Alisado con Keratina', 'Resultado de tratamiento de keratina', 'https://example.com/portfolio/keratina1.jpg', 'keratina-1.jpg', 3, TRUE);

-- ============ ESTILISTA_SERVICIO ============
-- Ana Pérez: Especialista en corte y peinado
INSERT INTO estilista_servicio (id_estilista, id_servicio) VALUES 
(1, 1), (1, 2), (1, 3), (1, 11), (1, 12), (1, 13);

-- Carlos Ramírez: Especialista en coloración
INSERT INTO estilista_servicio (id_estilista, id_servicio) VALUES 
(2, 4), (2, 5), (2, 6), (2, 7), (2, 21);

-- María González: Servicios generales
INSERT INTO estilista_servicio (id_estilista, id_servicio) VALUES 
(3, 1), (3, 3), (3, 8), (3, 9), (3, 10), (3, 16), (3, 17), (3, 18);

-- ============ ESTILISTA_HORARIO ============
-- Ana Pérez: Lunes a Sábado
INSERT INTO estilista_horario (id_estilista, id_horario) VALUES 
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6);

-- Carlos Ramírez: Martes a Domingo
INSERT INTO estilista_horario (id_estilista, id_horario) VALUES 
(2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7);

-- María González: Miércoles a Domingo
INSERT INTO estilista_horario (id_estilista, id_horario) VALUES 
(3, 3), (3, 4), (3, 5), (3, 6), (3, 7);

-- ============ SERVICIO_PROMOCION ============
-- Black Friday: Todos los servicios de corte y coloración
INSERT INTO servicio_promocion (id_servicio, id_promocion) VALUES 
(1, 1), (2, 1), (4, 1), (5, 1), (6, 1);

-- Navidad: Tratamientos
INSERT INTO servicio_promocion (id_servicio, id_promocion) VALUES 
(8, 2), (9, 2), (10, 2);

-- ============ CITAS DE EJEMPLO ============
-- Citas pasadas (completadas)
INSERT INTO cita (fecha_hora_cita, estado_cita, notas, precio_total, id_cliente, id_estilista, id_horario) VALUES 
('2025-11-15 10:00:00', 'COMPLETADA', 'Primera visita de la cliente', 150.00, 5, 1, 1),
('2025-11-16 14:00:00', 'COMPLETADA', 'Cliente habitual', 450.00, 6, 2, 2),
('2025-11-18 11:00:00', 'COMPLETADA', NULL, 800.00, 7, 3, 3),
('2025-11-19 15:30:00', 'COMPLETADA', 'Cliente solicitó corte corto', 150.00, 8, 1, 4),
('2025-11-20 09:00:00', 'COMPLETADA', NULL, 350.00, 9, 3, 5);

-- Citas próximas (confirmadas)
INSERT INTO cita (fecha_hora_cita, estado_cita, notas, precio_total, id_cliente, id_estilista, id_horario) VALUES 
('2025-11-25 10:00:00', 'CONFIRMADA', 'Cliente nueva, primera cita', 150.00, 5, 1, 1),
('2025-11-25 15:00:00', 'CONFIRMADA', 'Retoque de color', 280.00, 6, 2, 1),
('2025-11-26 11:00:00', 'CONFIRMADA', NULL, 550.00, 7, 2, 2),
('2025-11-27 14:00:00', 'PENDIENTE', 'Pendiente de confirmación', 200.00, 8, 1, 3),
('2025-11-28 16:00:00', 'CONFIRMADA', 'Evento importante', 400.00, 9, 1, 4);

-- ============ CITA_SERVICIO ============
INSERT INTO cita_servicio (id_cita, id_servicio, precio_aplicado) VALUES 
-- Cita 1: Corte de cabello
(1, 1, 150.00),
-- Cita 2: Tinte completo
(2, 4, 450.00),
-- Cita 3: Keratina
(3, 8, 800.00),
-- Cita 4: Corte de cabello
(4, 1, 150.00),
-- Cita 5: Hidratación profunda
(5, 10, 350.00),
-- Cita 6: Corte de cabello
(6, 1, 150.00),
-- Cita 7: Retoque de raíz
(7, 7, 280.00),
-- Cita 8: Rayos/Mechas
(8, 5, 550.00),
-- Cita 9: Peinado casual
(9, 11, 200.00),
-- Cita 10: Peinado de fiesta
(10, 12, 400.00);

-- ============ COMENTARIOS ============
INSERT INTO comentario (comentario, id_cita, id_cliente) VALUES 
('Excelente servicio, muy profesional y amable. Quedé encantada con mi corte.', 1, 5),
('El color quedó perfecto, justo lo que pedí. Definitivamente regreso.', 2, 6),
('La keratina dejó mi cabello super suave y brillante. Muy recomendado.', 3, 7),
('Ana es una excelente estilista, me encantó cómo quedó mi cabello.', 4, 8),
('El tratamiento superó mis expectativas, mi cabello se ve y se siente increíble.', 5, 9);

-- ============ VALORACIONES ============
INSERT INTO valoracion (puntuacion, comentario, id_cita, id_cliente, id_servicio) VALUES 
(5.0, 'Servicio impecable, súper recomendado', 1, 5, 1),
(5.0, 'El mejor tinte que me han hecho', 2, 6, 4),
(4.5, 'Muy buen servicio, solo el tiempo fue un poco largo', 3, 7, 8),
(5.0, 'Perfecto, exactamente lo que quería', 4, 8, 1),
(4.8, 'Excelente tratamiento, volveré pronto', 5, 9, 10);

-- =====================================================
-- 6. VISTAS ÚTILES PARA CONSULTAS
-- =====================================================

-- Vista: Citas con información completa
CREATE VIEW vista_citas_completas AS
SELECT 
    c.id_cita,
    c.fecha_hora_cita,
    c.estado_cita,
    c.notas,
    c.precio_total,
    u_cliente.nombre AS cliente_nombre,
    u_cliente.telefono AS cliente_telefono,
    u_cliente.email AS cliente_email,
    e.nombre AS estilista_nombre,
    h.dia_semana,
    h.hora_inicio,
    h.hora_fin,
    GROUP_CONCAT(s.nombre_servicio SEPARATOR ', ') AS servicios,
    c.fecha_solicitud,
    c.fecha_actualizacion
FROM cita c
JOIN usuario u_cliente ON c.id_cliente = u_cliente.id_usuario
JOIN empleado e ON c.id_estilista = e.id_empleado
JOIN horario h ON c.id_horario = h.id_horario
LEFT JOIN cita_servicio cs ON c.id_cita = cs.id_cita
LEFT JOIN servicio s ON cs.id_servicio = s.id_servicio
GROUP BY c.id_cita;

-- Vista: Servicios con valoración promedio
CREATE VIEW vista_servicios_valorados AS
SELECT 
    s.id_servicio,
    s.nombre_servicio,
    s.descripcion,
    s.precio,
    s.duracion_minutos,
    c.nombre_categoria,
    COUNT(v.id_valoracion) AS total_valoraciones,
    COALESCE(AVG(v.puntuacion), 0) AS valoracion_promedio
FROM servicio s
JOIN categoria c ON s.id_categoria = c.id_categoria
LEFT JOIN valoracion v ON s.id_servicio = v.id_servicio
WHERE s.activo = TRUE
GROUP BY s.id_servicio;

-- Vista: Estilistas con sus especialidades
CREATE VIEW vista_estilistas_servicios AS
SELECT 
    e.id_empleado AS id_estilista,
    e.nombre AS estilista_nombre,
    e.telefono,
    e.puesto,
    GROUP_CONCAT(DISTINCT s.nombre_servicio SEPARATOR ', ') AS servicios_especialidad,
    GROUP_CONCAT(DISTINCT h.dia_semana SEPARATOR ', ') AS dias_trabajo,
    COUNT(DISTINCT es.id_servicio) AS total_servicios
FROM empleado e
JOIN usuario u ON e.id_usuario = u.id_usuario
LEFT JOIN estilista_servicio es ON e.id_empleado = es.id_estilista
LEFT JOIN servicio s ON es.id_servicio = s.id_servicio
LEFT JOIN estilista_horario eh ON e.id_empleado = eh.id_estilista
LEFT JOIN horario h ON eh.id_horario = h.id_horario
WHERE u.id_rol = 2 AND e.activo = TRUE
GROUP BY e.id_empleado;

-- =====================================================
-- 7. PROCEDIMIENTOS ALMACENADOS ÚTILES
-- =====================================================

DELIMITER //

-- Procedimiento: Obtener disponibilidad de estilista
CREATE PROCEDURE sp_disponibilidad_estilista(
    IN p_id_estilista INT,
    IN p_fecha DATE
)
BEGIN
    SELECT 
        h.hora_inicio,
        h.hora_fin,
        COUNT(c.id_cita) as citas_agendadas
    FROM estilista_horario eh
    JOIN horario h ON eh.id_horario = h.id_horario
    LEFT JOIN cita c ON c.id_estilista = p_id_estilista 
        AND DATE(c.fecha_hora_cita) = p_fecha
        AND c.estado_cita IN ('PENDIENTE', 'CONFIRMADA')
    WHERE eh.id_estilista = p_id_estilista
        AND h.dia_semana = DAYNAME(p_fecha)
    GROUP BY h.id_horario;
END //

-- Procedimiento: Calcular precio total de cita
CREATE PROCEDURE sp_calcular_precio_cita(
    IN p_id_cita INT,
    OUT p_precio_total DECIMAL(10,2)
)
BEGIN
    SELECT SUM(cs.precio_aplicado)
    INTO p_precio_total
    FROM cita_servicio cs
    WHERE cs.id_cita = p_id_cita;
    
    UPDATE cita 
    SET precio_total = p_precio_total
    WHERE id_cita = p_id_cita;
END //

-- Procedimiento: Estadísticas del mes
CREATE PROCEDURE sp_estadisticas_mes(
    IN p_mes INT,
    IN p_year INT
)
BEGIN
    SELECT 
        COUNT(*) as total_citas,
        SUM(CASE WHEN estado_cita = 'COMPLETADA' THEN 1 ELSE 0 END) as citas_completadas,
        SUM(CASE WHEN estado_cita = 'CANCELADA' THEN 1 ELSE 0 END) as citas_canceladas,
        SUM(CASE WHEN estado_cita = 'PENDIENTE' THEN 1 ELSE 0 END) as citas_pendientes,
        COALESCE(SUM(precio_total), 0) as ingresos_totales,
        COUNT(DISTINCT id_cliente) as clientes_atendidos
    FROM cita
    WHERE MONTH(fecha_hora_cita) = p_mes 
        AND YEAR(fecha_hora_cita) = p_year;
END //

DELIMITER ;

-- =====================================================
-- 8. TRIGGERS PARA AUTOMATIZACIÓN
-- =====================================================

DELIMITER //

-- Trigger: Actualizar última conexión del usuario
CREATE TRIGGER tr_actualizar_ultima_conexion
AFTER UPDATE ON usuario
FOR EACH ROW
BEGIN
    IF NEW.activo = TRUE AND OLD.activo = FALSE THEN
        UPDATE usuario 
        SET ultima_conexion = CURRENT_TIMESTAMP 
        WHERE id_usuario = NEW.id_usuario;
    END IF;
END //

-- Trigger: Validar fecha de cita
CREATE TRIGGER tr_validar_fecha_cita
BEFORE INSERT ON cita
FOR EACH ROW
BEGIN
    IF NEW.fecha_hora_cita < NOW() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se puede agendar una cita en el pasado';
    END IF;
END //

DELIMITER ;

-- =====================================================
-- 9. CONSULTAS DE VERIFICACIÓN
-- =====================================================

-- Verificar datos insertados
SELECT 'Roles' as tabla, COUNT(*) as total FROM rol
UNION ALL
SELECT 'Usuarios', COUNT(*) FROM usuario
UNION ALL
SELECT 'Empleados', COUNT(*) FROM empleado
UNION ALL
SELECT 'Categorías', COUNT(*) FROM categoria
UNION ALL
SELECT 'Servicios', COUNT(*) FROM servicio
UNION ALL
SELECT 'Horarios', COUNT(*) FROM horario
UNION ALL
SELECT 'Promociones', COUNT(*) FROM promocion
UNION ALL
SELECT 'Citas', COUNT(*) FROM cita
UNION ALL
SELECT 'Valoraciones', COUNT(*) FROM valoracion
UNION ALL
SELECT 'Comentarios', COUNT(*) FROM comentario;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

-- Para probar la base de datos ejecuta:
-- mysql -u root -p < GlamSoft_Database_Complete.sql