-- =====================================================================
-- EXTENSIONES
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- TIPOS ENUM
-- =====================================================================

CREATE TYPE "TipoUsuario" AS ENUM ('Cliente', 'Administrador', 'Evaluador', 'Cobrador');
CREATE TYPE "Estado" AS ENUM ('Activo', 'Inactivo');
CREATE TYPE "EstadoSolicitud" AS ENUM ('Pendiente', 'Aprobada', 'Rechazada', 'Evaluando');
CREATE TYPE "EstadoFisico" AS ENUM ('Excelente', 'Bueno', 'Regular', 'Malo');
CREATE TYPE "EstadoFirma" AS ENUM ('Pendiente', 'Firmado');
CREATE TYPE "EstadoPrestamo" AS ENUM ('Pendiente_Firma', 'Activo', 'Pagado', 'Vencido', 'En_Mora');
CREATE TYPE "EstadoCuota" AS ENUM ('Pendiente', 'Pagado', 'Vencido');
CREATE TYPE "TipoPago" AS ENUM ('Transferencia', 'Efectivo', 'Deposito');
CREATE TYPE "EstadoValidacion" AS ENUM ('Pendiente', 'Validado', 'Rechazado');
CREATE TYPE "EstadoProducto" AS ENUM ('Disponible', 'Vendido', 'Retirado');
CREATE TYPE "EstadoPedido" AS ENUM ('Pendiente', 'Procesando', 'Enviado', 'Entregado', 'Cancelado');
CREATE TYPE "EstadoRuta" AS ENUM ('Asignada', 'En_Progreso', 'Completada');
CREATE TYPE "ResultadoVisita" AS ENUM ('Pago', 'Promesa', 'No_Contacto');
CREATE TYPE "TipoDocumento" AS ENUM ('Foto_Prenda', 'Especificaciones', 'Comprobante', 'Contrato', 'Identificacion');
CREATE TYPE "TipoRelacion" AS ENUM ('Solicitud', 'Pago', 'Visita', 'Usuario');
CREATE TYPE "TipoDato" AS ENUM ('STRING', 'INTEGER', 'DECIMAL', 'BOOLEAN', 'DATE');

-- =====================================================================
-- TABLAS
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tabla: usuario
-- Descripción: Almacena información de todos los usuarios del sistema
-- ---------------------------------------------------------------------
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(20) NOT NULL,
    direccion TEXT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo_usuario "TipoUsuario" NOT NULL,
    estado "Estado" DEFAULT 'Activo',
    cedula VARCHAR(20) NOT NULL UNIQUE,
    fecha_nacimiento DATE,
    password_hash VARCHAR(255) NOT NULL,
    email_verificado BOOLEAN DEFAULT FALSE,
    token_verificacion VARCHAR(255) UNIQUE,
    expira_token_verif TIMESTAMP,
    reset_password_token VARCHAR(255) UNIQUE,
    reset_password_expires TIMESTAMP,
    reset_password_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Tabla: tipo_articulo
-- Descripción: Catálogo de tipos de artículos aceptados para préstamos
-- ---------------------------------------------------------------------
CREATE TABLE tipo_articulo (
    id_tipo_articulo SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    porcentaje_min_avaluo NUMERIC(5,2) NOT NULL CHECK (porcentaje_min_avaluo >= 0 AND porcentaje_min_avaluo <= 100),
    porcentaje_max_avaluo NUMERIC(5,2) NOT NULL CHECK (porcentaje_max_avaluo >= porcentaje_min_avaluo),
    requiere_electronico BOOLEAN DEFAULT FALSE,
    estado "Estado" DEFAULT 'Activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Tabla: solicitud_prestamo
-- Descripción: Solicitudes de préstamo realizadas por clientes
-- ---------------------------------------------------------------------
CREATE TABLE solicitud_prestamo (
    id_solicitud SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
    id_evaluador INTEGER REFERENCES usuario(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado "EstadoSolicitud" DEFAULT 'Pendiente',
    observaciones TEXT,
    fecha_evaluacion TIMESTAMP,
    monto_solicitado NUMERIC(10,2),
    plazo_meses INTEGER,
    modalidad_pago VARCHAR(50),
    total_a_pagar NUMERIC(10,2),
    tasa_interes NUMERIC(5,2),
    cliente_acepto_oferta BOOLEAN DEFAULT FALSE,
    fecha_aceptacion TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Tabla: articulo
-- Descripción: Artículos ofrecidos como garantía en solicitudes
-- ---------------------------------------------------------------------
CREATE TABLE articulo (
    id_articulo SERIAL PRIMARY KEY,
    id_solicitud INTEGER NOT NULL REFERENCES solicitud_prestamo(id_solicitud) ON DELETE CASCADE ON UPDATE CASCADE,
    id_tipo_articulo INTEGER NOT NULL REFERENCES tipo_articulo(id_tipo_articulo) ON DELETE RESTRICT ON UPDATE CASCADE,
    descripcion TEXT NOT NULL,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    serie VARCHAR(100),
    color VARCHAR(50),
    estado_fisico "EstadoFisico" NOT NULL,
    valor_estimado_cliente NUMERIC(10,2) CHECK (valor_estimado_cliente >= 0),
    especificaciones_tecnicas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Tabla: avaluo
-- Descripción: Avalúos realizados por evaluadores sobre artículos
-- ---------------------------------------------------------------------
CREATE TABLE avaluo (
    id_avaluo SERIAL PRIMARY KEY,
    id_articulo INTEGER NOT NULL UNIQUE REFERENCES articulo(id_articulo) ON DELETE CASCADE ON UPDATE CASCADE,
    id_evaluador INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
    valor_comercial NUMERIC(10,2) NOT NULL CHECK (valor_comercial > 0),
    porcentaje_aplicado NUMERIC(5,2) NOT NULL CHECK (porcentaje_aplicado >= 0 AND porcentaje_aplicado <= 100),
    monto_prestamo NUMERIC(10,2) NOT NULL CHECK (monto_prestamo > 0),
    fecha_avaluo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Tabla: contrato
-- Descripción: Contratos generados para solicitudes aprobadas
-- ---------------------------------------------------------------------
CREATE TABLE contrato (
    id_contrato SERIAL PRIMARY KEY,
    id_solicitud INTEGER NOT NULL UNIQUE REFERENCES solicitud_prestamo(id_solicitud) ON DELETE CASCADE ON UPDATE CASCADE,
    numero_contrato VARCHAR(50) NOT NULL UNIQUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_firma TIMESTAMP,
    estado_firma "EstadoFirma" DEFAULT 'Pendiente',
    contenido_contrato TEXT NOT NULL,
    hash_firma TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Tabla: prestamo
-- Descripción: Préstamos activos derivados de contratos firmados
-- ---------------------------------------------------------------------
CREATE TABLE prestamo (
    id_prestamo SERIAL PRIMARY KEY,
    numero_prestamo VARCHAR(50) NOT NULL UNIQUE,
    id_contrato INTEGER NOT NULL UNIQUE REFERENCES contrato(id_contrato) ON DELETE CASCADE ON UPDATE CASCADE,
    monto_prestado NUMERIC(10,2) NOT NULL CHECK (monto_prestado > 0),
    tasa_interes NUMERIC(5,2) NOT NULL CHECK (tasa_interes >= 0),
    plazo_meses INTEGER NOT NULL CHECK (plazo_meses > 0 AND plazo_meses <= 6),
    modalidad_pago VARCHAR(50) NOT NULL,
    total_a_pagar NUMERIC(10,2) NOT NULL CHECK (total_a_pagar >= monto_prestado),
    fecha_inicio DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado "EstadoPrestamo" DEFAULT 'Pendiente_Firma',
    saldo_pendiente NUMERIC(10,2) NOT NULL CHECK (saldo_pendiente >= 0),
    costo_almacenamiento NUMERIC(8,2) DEFAULT 0 CHECK (costo_almacenamiento >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Tabla: plan_pagos
-- Descripción: Plan de amortización de cuotas para cada préstamo
-- ---------------------------------------------------------------------
CREATE TABLE plan_pagos (
    id_plan_pago SERIAL PRIMARY KEY,
    id_prestamo INTEGER NOT NULL REFERENCES prestamo(id_prestamo) ON DELETE CASCADE ON UPDATE CASCADE,
    numero_cuota INTEGER NOT NULL CHECK (numero_cuota > 0),
    fecha_vencimiento DATE NOT NULL,
    monto_cuota NUMERIC(10,2) NOT NULL CHECK (monto_cuota > 0),
    monto_capital NUMERIC(10,2) NOT NULL CHECK (monto_capital >= 0),
    monto_interes NUMERIC(10,2) NOT NULL CHECK (monto_interes >= 0),
    estado "EstadoCuota" DEFAULT 'Pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Tabla: pago
-- Descripción: Pagos realizados por clientes (préstamos y pedidos)
-- ---------------------------------------------------------------------
CREATE TABLE pago (
    id_pago SERIAL PRIMARY KEY,
    id_prestamo INTEGER REFERENCES prestamo(id_prestamo) ON DELETE RESTRICT ON UPDATE CASCADE,
    id_pedido INTEGER REFERENCES pedido(id_pedido) ON DELETE RESTRICT ON UPDATE CASCADE,
    monto_pago NUMERIC(10,2) NOT NULL CHECK (monto_pago > 0),
    fecha_pago TIMESTAMP NOT NULL,
    tipo_pago "TipoPago" NOT NULL,
    comprobante VARCHAR(500),
    estado_validacion "EstadoValidacion" DEFAULT 'Pendiente',
    id_validador INTEGER REFERENCES usuario(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE,
    observaciones TEXT,
    fecha_deposito DATE,
    nombre_banco VARCHAR(100),
    numero_transaccion VARCHAR(100),
    imagen_comprobante VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Tabla: producto_tienda
-- Descripción: Productos disponibles en la tienda (artículos no redimidos)
-- ---------------------------------------------------------------------
CREATE TABLE producto_tienda (
    id_producto SERIAL PRIMARY KEY,
    id_articulo INTEGER NOT NULL UNIQUE REFERENCES articulo(id_articulo) ON DELETE CASCADE ON UPDATE CASCADE,
    precio_venta NUMERIC(10,2) NOT NULL CHECK (precio_venta > 0),
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado "EstadoProducto" DEFAULT 'Disponible',
    descuento_aplicado NUMERIC(5,2) DEFAULT 0 CHECK (descuento_aplicado >= 0 AND descuento_aplicado <= 100),
    dias_en_inventario INTEGER DEFAULT 0,
    categoria VARCHAR(100) NOT NULL,
    valoracion_promedio NUMERIC(3,2) DEFAULT 0 CHECK (valoracion_promedio >= 0 AND valoracion_promedio <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Tabla: pedido
-- Descripción: Pedidos realizados en la tienda online
-- ---------------------------------------------------------------------
CREATE TABLE pedido (
    id_pedido SERIAL PRIMARY KEY,
    id_usuario_comprador INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_pedido NUMERIC(10,2) NOT NULL CHECK (total_pedido > 0),
    estado_pedido "EstadoPedido" DEFAULT 'Procesando',
    direccion_envio TEXT NOT NULL,
    metodo_pago VARCHAR(100) NOT NULL,
    subtotal NUMERIC(10,2),
    iva NUMERIC(10,2),
    costo_envio NUMERIC(10,2),
    banco_origen VARCHAR(100),
    fecha_transferencia DATE,
    numero_transaccion VARCHAR(100),
    comprobante_transferencia VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Tabla: detalle_pedido
-- Descripción: Líneas de detalle de productos en cada pedido
-- ---------------------------------------------------------------------
CREATE TABLE detalle_pedido (
    id_detalle SERIAL PRIMARY KEY,
    id_pedido INTEGER NOT NULL REFERENCES pedido(id_pedido) ON DELETE CASCADE ON UPDATE CASCADE,
    id_producto INTEGER NOT NULL REFERENCES producto_tienda(id_producto) ON DELETE RESTRICT ON UPDATE CASCADE,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario > 0),
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Tabla: carrito
-- Descripción: Carrito de compras de usuarios
-- ---------------------------------------------------------------------
CREATE TABLE carrito (
    id_carrito SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    id_producto INTEGER NOT NULL REFERENCES producto_tienda(id_producto) ON DELETE CASCADE ON UPDATE CASCADE,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_usuario, id_producto)
);

-- ---------------------------------------------------------------------
-- Tabla: ruta_cobranza
-- Descripción: Rutas asignadas a cobradores
-- ---------------------------------------------------------------------
CREATE TABLE ruta_cobranza (
    id_ruta SERIAL PRIMARY KEY,
    id_cobrador INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
    fecha_ruta DATE NOT NULL,
    zona_asignada VARCHAR(200) NOT NULL,
    estado "EstadoRuta" DEFAULT 'Asignada',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Tabla: visita_cobranza
-- Descripción: Registro de visitas de cobranza realizadas
-- ---------------------------------------------------------------------
CREATE TABLE visita_cobranza (
    id_visita SERIAL PRIMARY KEY,
    id_ruta INTEGER NOT NULL REFERENCES ruta_cobranza(id_ruta) ON DELETE CASCADE ON UPDATE CASCADE,
    id_prestamo INTEGER NOT NULL REFERENCES prestamo(id_prestamo) ON DELETE RESTRICT ON UPDATE CASCADE,
    fecha_visita TIMESTAMP NOT NULL,
    resultado "ResultadoVisita" NOT NULL,
    monto_cobrado NUMERIC(10,2) DEFAULT 0 CHECK (monto_cobrado >= 0),
    observaciones TEXT,
    ubicacion_gps VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Tabla: documento
-- Descripción: Documentos y archivos del sistema
-- ---------------------------------------------------------------------
CREATE TABLE documento (
    id_documento SERIAL PRIMARY KEY,
    tipo_documento "TipoDocumento" NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_relacionado INTEGER NOT NULL,
    tipo_relacion "TipoRelacion" NOT NULL,
    tamano_archivo BIGINT,
    tipo_mime VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Tabla: parametros_sistema
-- Descripción: Parámetros configurables del sistema
-- ---------------------------------------------------------------------
CREATE TABLE parametros_sistema (
    id_parametro SERIAL PRIMARY KEY,
    nombre_parametro VARCHAR(100) NOT NULL UNIQUE,
    valor_parametro TEXT NOT NULL,
    descripcion TEXT,
    tipo_dato "TipoDato" NOT NULL,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario_modifico INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Tabla: comentario_producto
-- Descripción: Comentarios y calificaciones de productos
-- ---------------------------------------------------------------------
CREATE TABLE comentario_producto (
    id_comentario SERIAL PRIMARY KEY,
    id_producto INTEGER NOT NULL REFERENCES producto_tienda(id_producto) ON DELETE CASCADE ON UPDATE CASCADE,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    comentario TEXT NOT NULL,
    fecha_comentario TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Tabla: sesion_usuario
-- Descripción: Sesiones activas e historial de sesiones
-- ---------------------------------------------------------------------
CREATE TABLE sesion_usuario (
    id_sesion UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    ip_inicio INET,
    user_agent TEXT,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP,
    tipo_sesion VARCHAR(20) DEFAULT 'web' CHECK (tipo_sesion IN ('web', 'mobile', 'api')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Tabla: log_actividad
-- Descripción: Registro de auditoría de acciones en el sistema
-- ---------------------------------------------------------------------
CREATE TABLE log_actividad (
    id_log SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuario(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE,
    accion VARCHAR(100) NOT NULL,
    entidad VARCHAR(100) NOT NULL,
    entidad_id VARCHAR(100),
    detalles JSONB,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- ÍNDICES
-- =====================================================================

CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_usuario_cedula ON usuario(cedula);
CREATE INDEX idx_usuario_tipo ON usuario(tipo_usuario);
CREATE INDEX idx_solicitud_usuario ON solicitud_prestamo(id_usuario);
CREATE INDEX idx_solicitud_estado ON solicitud_prestamo(estado);
CREATE INDEX idx_solicitud_evaluador ON solicitud_prestamo(id_evaluador);
CREATE INDEX idx_articulo_solicitud ON articulo(id_solicitud);
CREATE INDEX idx_prestamo_estado ON prestamo(estado);
CREATE INDEX idx_prestamo_fecha_vencimiento ON prestamo(fecha_vencimiento);
CREATE INDEX idx_pago_prestamo ON pago(id_prestamo);
CREATE INDEX idx_pago_fecha ON pago(fecha_pago);
CREATE INDEX idx_pago_estado ON pago(estado_validacion);
CREATE INDEX idx_producto_estado ON producto_tienda(estado);
CREATE INDEX idx_producto_categoria ON producto_tienda(categoria);
CREATE INDEX idx_pedido_usuario ON pedido(id_usuario_comprador);
CREATE INDEX idx_pedido_estado ON pedido(estado_pedido);
CREATE INDEX idx_log_usuario ON log_actividad(id_usuario);
CREATE INDEX idx_log_fecha ON log_actividad(fecha_hora);
CREATE INDEX idx_log_entidad ON log_actividad(entidad, entidad_id);

-- =====================================================================
-- TRIGGERS
-- =====================================================================

-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas con campo updated_at
CREATE TRIGGER update_usuario_updated_at BEFORE UPDATE ON usuario FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tipo_articulo_updated_at BEFORE UPDATE ON tipo_articulo FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_solicitud_prestamo_updated_at BEFORE UPDATE ON solicitud_prestamo FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_articulo_updated_at BEFORE UPDATE ON articulo FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_avaluo_updated_at BEFORE UPDATE ON avaluo FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contrato_updated_at BEFORE UPDATE ON contrato FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prestamo_updated_at BEFORE UPDATE ON prestamo FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plan_pagos_updated_at BEFORE UPDATE ON plan_pagos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pago_updated_at BEFORE UPDATE ON pago FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_producto_tienda_updated_at BEFORE UPDATE ON producto_tienda FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pedido_updated_at BEFORE UPDATE ON pedido FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ruta_cobranza_updated_at BEFORE UPDATE ON ruta_cobranza FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- VISTAS
-- =====================================================================

-- Vista: Préstamos activos con información del cliente
CREATE VIEW vista_prestamos_activos AS
SELECT
    p.id_prestamo,
    p.numero_prestamo,
    p.monto_prestado,
    p.saldo_pendiente,
    p.fecha_vencimiento,
    p.estado,
    u.nombre || ' ' || u.apellido as cliente,
    u.email,
    u.telefono,
    a.descripcion as articulo,
    a.marca,
    a.modelo
FROM prestamo p
JOIN contrato c ON p.id_contrato = c.id_contrato
JOIN solicitud_prestamo sp ON c.id_solicitud = sp.id_solicitud
JOIN usuario u ON sp.id_usuario = u.id_usuario
JOIN articulo a ON sp.id_solicitud = a.id_solicitud
WHERE p.estado IN ('Activo', 'En_Mora', 'Vencido');

-- Vista: Productos disponibles en tienda
CREATE VIEW vista_productos_disponibles AS
SELECT
    pt.id_producto,
    pt.precio_venta,
    pt.descuento_aplicado,
    pt.precio_venta * (1 - pt.descuento_aplicado/100) as precio_final,
    pt.categoria,
    pt.valoracion_promedio,
    a.descripcion,
    a.marca,
    a.modelo,
    a.color,
    a.estado_fisico,
    ta.nombre as tipo_articulo
FROM producto_tienda pt
JOIN articulo a ON pt.id_articulo = a.id_articulo
JOIN tipo_articulo ta ON a.id_tipo_articulo = ta.id_tipo_articulo
WHERE pt.estado = 'Disponible';

-- Vista: Solicitudes pendientes de evaluación
CREATE VIEW vista_solicitudes_pendientes AS
SELECT
    sp.id_solicitud,
    sp.fecha_solicitud,
    sp.monto_solicitado,
    sp.plazo_meses,
    u.nombre || ' ' || u.apellido as cliente,
    u.email,
    u.telefono,
    COUNT(a.id_articulo) as cantidad_articulos
FROM solicitud_prestamo sp
JOIN usuario u ON sp.id_usuario = u.id_usuario
LEFT JOIN articulo a ON sp.id_solicitud = a.id_solicitud
WHERE sp.estado = 'Pendiente'
GROUP BY sp.id_solicitud, sp.fecha_solicitud, sp.monto_solicitado, sp.plazo_meses, u.nombre, u.apellido, u.email, u.telefono;

-- =====================================================================
-- DATOS INICIALES
-- =====================================================================

-- Tipos de artículo
INSERT INTO tipo_articulo (nombre, porcentaje_min_avaluo, porcentaje_max_avaluo, requiere_electronico) VALUES
('Autos', 30.00, 50.00, FALSE),
('Celulares', 25.00, 45.00, TRUE),
('Joyas', 40.00, 70.00, FALSE),
('Relojes', 35.00, 60.00, FALSE),
('Diamantes', 50.00, 85.00, FALSE),
('Monedas', 30.00, 55.00, FALSE),
('Electrónicos', 20.00, 40.00, TRUE),
('Herramientas', 25.00, 45.00, FALSE);

-- Usuario administrador inicial
INSERT INTO usuario (nombre, apellido, email, telefono, direccion, tipo_usuario, cedula, password_hash, email_verificado) VALUES
('Fredy', 'Fasbear', 'admin@fredyfasbear.tech', '502-1234-5678', 'Oficina Central Fredy Fasbear Industries', 'Administrador', '1234567890', crypt('admin123', gen_salt('bf')), TRUE);

-- Parámetros del sistema
INSERT INTO parametros_sistema (nombre_parametro, valor_parametro, descripcion, tipo_dato, id_usuario_modifico) VALUES
('TASA_INTERES_MENSUAL', '5.0', 'Tasa de interés mensual por defecto', 'DECIMAL', 1),
('PLAZO_MAXIMO_MESES', '6', 'Plazo máximo en meses para préstamos', 'INTEGER', 1),
('COSTO_ALMACENAMIENTO_DIARIO', '2.50', 'Costo diario de almacenamiento', 'DECIMAL', 1),
('NOMBRE_EMPRESA', 'Fredy Fasbear Industries', 'Nombre oficial de la empresa', 'STRING', 1),
('DIAS_DESCUENTO_10', '30', 'Días en inventario para aplicar 10% descuento', 'INTEGER', 1),
('DIAS_DESCUENTO_20', '60', 'Días en inventario para aplicar 20% descuento', 'INTEGER', 1),
('DIAS_DESCUENTO_30', '90', 'Días en inventario para aplicar 30% descuento', 'INTEGER', 1);

-- =====================================================================
-- PERMISOS
-- =====================================================================

-- Crear rol para la aplicación
CREATE ROLE fasbear_app LOGIN PASSWORD 'change_this_password';

-- Otorgar permisos
GRANT CONNECT ON DATABASE fredy_fasbear_prestamos TO fasbear_app;
GRANT USAGE ON SCHEMA public TO fasbear_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO fasbear_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO fasbear_app;

-- Asegurar que futuros objetos también tengan permisos
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO fasbear_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO fasbear_app;

-- =====================================================================
-- COMENTARIOS EN TABLAS
-- =====================================================================

COMMENT ON TABLE usuario IS 'Usuarios del sistema: clientes, administradores, evaluadores y cobradores';
COMMENT ON TABLE tipo_articulo IS 'Catálogo de tipos de artículos aceptados como garantía';
COMMENT ON TABLE solicitud_prestamo IS 'Solicitudes de préstamo prendario realizadas por clientes';
COMMENT ON TABLE articulo IS 'Artículos ofrecidos como garantía en solicitudes';
COMMENT ON TABLE avaluo IS 'Avalúos realizados por evaluadores sobre artículos';
COMMENT ON TABLE contrato IS 'Contratos generados para solicitudes aprobadas';
COMMENT ON TABLE prestamo IS 'Préstamos activos derivados de contratos firmados';
COMMENT ON TABLE plan_pagos IS 'Plan de amortización de cuotas para cada préstamo';
COMMENT ON TABLE pago IS 'Pagos realizados por clientes (préstamos y pedidos)';
COMMENT ON TABLE producto_tienda IS 'Productos disponibles en la tienda (artículos no redimidos)';
COMMENT ON TABLE pedido IS 'Pedidos realizados en la tienda online';
COMMENT ON TABLE detalle_pedido IS 'Líneas de detalle de productos en cada pedido';
COMMENT ON TABLE carrito IS 'Carrito de compras de usuarios';
COMMENT ON TABLE ruta_cobranza IS 'Rutas de cobranza asignadas a cobradores';
COMMENT ON TABLE visita_cobranza IS 'Registro de visitas de cobranza realizadas';
COMMENT ON TABLE documento IS 'Documentos y archivos asociados a entidades del sistema';
COMMENT ON TABLE parametros_sistema IS 'Parámetros configurables del sistema';
COMMENT ON TABLE comentario_producto IS 'Comentarios y calificaciones de productos en tienda';
COMMENT ON TABLE sesion_usuario IS 'Sesiones activas e historial de sesiones de usuarios';
COMMENT ON TABLE log_actividad IS 'Registro de auditoría de acciones en el sistema';

-- =====================================================================
-- FIN DEL SCRIPT
-- =====================================================================

SELECT 'Base de datos Fredy Fasbear Industries creada exitosamente' AS mensaje;
SELECT 'Total de tablas creadas: ' || COUNT(*) AS resumen FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
