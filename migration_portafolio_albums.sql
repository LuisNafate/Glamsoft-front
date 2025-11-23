-- =====================================================
-- MIGRACIÓN DE PORTAFOLIO A SISTEMA DE ÁLBUMES
-- Sistema de Gestión para Salón de Belleza
-- Fecha: 23 de Noviembre de 2025
-- =====================================================

USE glamsoft;

-- =====================================================
-- PASO 1: RENOMBRAR TABLA ACTUAL (BACKUP)
-- =====================================================
RENAME TABLE portafolio TO portafolio_old;

-- =====================================================
-- PASO 2: CREAR NUEVAS TABLAS
-- =====================================================

-- Tabla: portafolio_album
-- Descripción: Álbumes/grupos de trabajos del portafolio
CREATE TABLE portafolio_album (
    id_album INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    id_categoria INT,
    destacado BOOLEAN DEFAULT FALSE,
    imagen_portada TEXT, -- URL de la imagen principal que se muestra en la galería
    visitas INT DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_album_categoria FOREIGN KEY (id_categoria)
        REFERENCES categoria(id_categoria) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Tabla: portafolio_imagen
-- Descripción: Imágenes individuales dentro de cada álbum
CREATE TABLE portafolio_imagen (
    id_imagen INT AUTO_INCREMENT PRIMARY KEY,
    id_album INT NOT NULL,
    url TEXT NOT NULL,
    nombre_imagen VARCHAR(100),
    orden INT DEFAULT 0, -- Para ordenar las imágenes dentro del álbum
    es_portada BOOLEAN DEFAULT FALSE, -- Marca si es la imagen de portada del álbum
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_imagen_album FOREIGN KEY (id_album)
        REFERENCES portafolio_album(id_album) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Índices para mejorar el rendimiento
CREATE INDEX idx_album_categoria ON portafolio_album(id_categoria);
CREATE INDEX idx_album_destacado ON portafolio_album(destacado);
CREATE INDEX idx_imagen_album ON portafolio_imagen(id_album);
CREATE INDEX idx_imagen_orden ON portafolio_imagen(id_album, orden);

-- =====================================================
-- PASO 3: MIGRAR DATOS EXISTENTES
-- =====================================================

-- Insertar los portafolios actuales como álbumes con 1 imagen cada uno
INSERT INTO portafolio_album (titulo, descripcion, id_categoria, destacado, visitas, fecha_creacion)
SELECT
    COALESCE(titulo, 'Sin título') AS titulo,
    descripcion,
    id_categoria,
    destacado,
    visitas,
    fecha_creacion
FROM portafolio_old;

-- Insertar las imágenes en la tabla de imágenes
-- Cada imagen antigua se convierte en la primera imagen de su álbum
INSERT INTO portafolio_imagen (id_album, url, nombre_imagen, orden, es_portada)
SELECT
    pa.id_album,
    po.url,
    po.nombre_imagen,
    1 AS orden,
    TRUE AS es_portada
FROM portafolio_old po
INNER JOIN portafolio_album pa ON (
    COALESCE(po.titulo, 'Sin título') = pa.titulo
    AND pa.fecha_creacion = po.fecha_creacion
);

-- Actualizar imagen_portada en los álbumes
UPDATE portafolio_album pa
INNER JOIN portafolio_imagen pi ON pa.id_album = pi.id_album AND pi.es_portada = TRUE
SET pa.imagen_portada = pi.url;

-- =====================================================
-- PASO 4: VERIFICACIÓN
-- =====================================================

-- Verificar que se migraron todos los registros
SELECT
    'ÁLBUMES CREADOS:' AS verificacion,
    COUNT(*) AS total
FROM portafolio_album;

SELECT
    'IMÁGENES MIGRADAS:' AS verificacion,
    COUNT(*) AS total
FROM portafolio_imagen;

SELECT
    'REGISTROS ORIGINALES:' AS verificacion,
    COUNT(*) AS total
FROM portafolio_old;

-- Mostrar algunos ejemplos
SELECT
    pa.id_album,
    pa.titulo,
    pa.descripcion,
    pa.destacado,
    COUNT(pi.id_imagen) AS total_imagenes
FROM portafolio_album pa
LEFT JOIN portafolio_imagen pi ON pa.id_album = pi.id_album
GROUP BY pa.id_album
LIMIT 5;

-- =====================================================
-- PASO 5: ELIMINAR TABLA ANTIGUA (OPCIONAL)
-- =====================================================
-- ⚠️ DESCOMENTAR SOLO SI ESTÁS SEGURO DE QUE LA MIGRACIÓN ES CORRECTA
-- DROP TABLE portafolio_old;

-- =====================================================
-- NOTA IMPORTANTE:
-- =====================================================
-- Después de ejecutar este script, deberás:
-- 1. Actualizar el backend Java para trabajar con las nuevas tablas
-- 2. Modificar los endpoints de la API
-- 3. Actualizar el frontend para enviar/recibir álbumes e imágenes
-- =====================================================
