-- =====================================================
-- REVERTIR MIGRACIÓN DE PORTAFOLIO
-- Volver a la estructura original
-- =====================================================

USE glamsoft;

-- Eliminar las tablas nuevas si existen
DROP TABLE IF EXISTS portafolio_imagen;
DROP TABLE IF EXISTS portafolio_album;

-- Restaurar la tabla original desde el backup
-- (Si ya la renombraste a portafolio_old)
DROP TABLE IF EXISTS portafolio;

-- Si tienes portafolio_old, restaurarla
-- RENAME TABLE portafolio_old TO portafolio;

-- O si no hiciste el backup, recrear la tabla original:
CREATE TABLE IF NOT EXISTS portafolio (
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

-- Verificar
SELECT 'Tabla portafolio restaurada' AS status;
DESCRIBE portafolio;
