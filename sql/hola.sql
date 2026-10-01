
CREATE DATABASE IF NOT EXISTS nike_jordan_store
	CHARACTER SET utf8mb4
	COLLATE utf8mb4_unicode_ci;

USE nike_jordan_store;

CREATE TABLE IF NOT EXISTS roles (
	role_id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
	nombre VARCHAR(32) NOT NULL,
	PRIMARY KEY (role_id),
	UNIQUE KEY uq_roles_nombre (nombre)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS usuarios (
	user_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	role_id TINYINT UNSIGNED NOT NULL DEFAULT 1,
	nombre_completo VARCHAR(120) NOT NULL,
	username VARCHAR(32) NOT NULL,
	email VARCHAR(254) NOT NULL,
	password_hash VARCHAR(255) NULL,
	activo BOOLEAN NOT NULL DEFAULT FALSE,
	terminos_aceptados_en DATETIME NULL,
	creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (user_id),
	UNIQUE KEY uq_usuarios_username (username),
	UNIQUE KEY uq_usuarios_email (email),
	KEY idx_usuarios_role (role_id),
	CONSTRAINT chk_usuario_activo_con_hash CHECK (activo = FALSE OR password_hash IS NOT NULL),
	CONSTRAINT fk_usuarios_roles FOREIGN KEY (role_id) REFERENCES roles (role_id)
		ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS catalogo (
	product_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	marca VARCHAR(40) NOT NULL,
	nombre VARCHAR(160) NOT NULL,
	color VARCHAR(100) NOT NULL,
	descripcion TEXT NULL,
	imagen_url VARCHAR(2048) NOT NULL,
	modelo_3d_url VARCHAR(2048) NULL COMMENT 'URL o ruta relativa al archivo 3D GLB/GLTF',
	etiqueta VARCHAR(40) NULL,
	precio DECIMAL(10,2) NOT NULL,
	activo BOOLEAN NOT NULL DEFAULT TRUE,
	creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (product_id),
	KEY idx_catalogo_marca_activo (marca, activo),
	CONSTRAINT chk_catalogo_precio CHECK (precio >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pedidos (
	order_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	user_id BIGINT UNSIGNED NULL,
	nombre_cliente VARCHAR(120) NOT NULL,
	email_cliente VARCHAR(254) NOT NULL,
	fecha_recogida DATE NOT NULL,
	estado ENUM('pendiente', 'confirmado', 'listo', 'completado', 'cancelado') NOT NULL DEFAULT 'pendiente',
	moneda CHAR(3) NOT NULL DEFAULT 'USD',
	notas VARCHAR(500) NULL,
	creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (order_id),
	KEY idx_pedidos_usuario_fecha (user_id, creado_en),
	KEY idx_pedidos_estado_fecha (estado, creado_en),
	CONSTRAINT fk_pedidos_usuarios FOREIGN KEY (user_id) REFERENCES usuarios (user_id)
		ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS detalle_pedido (
	order_item_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	order_id BIGINT UNSIGNED NOT NULL,
	product_id BIGINT UNSIGNED NOT NULL,
	nombre_producto VARCHAR(160) NOT NULL,
	talla_eu TINYINT UNSIGNED NULL,
	cantidad INT UNSIGNED NOT NULL,
	precio_unitario DECIMAL(10,2) NOT NULL,
	PRIMARY KEY (order_item_id),
	UNIQUE KEY uq_detalle_pedido_producto_talla (order_id, product_id, talla_eu),
	KEY idx_detalle_pedido_catalogo (product_id),
	CONSTRAINT chk_detalle_pedido_cantidad CHECK (cantidad > 0),
	CONSTRAINT chk_detalle_pedido_precio CHECK (precio_unitario >= 0),
	CONSTRAINT fk_detalle_pedido_pedido FOREIGN KEY (order_id) REFERENCES pedidos (order_id)
		ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT fk_detalle_pedido_catalogo FOREIGN KEY (product_id) REFERENCES catalogo (product_id)
		ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reservas (
	reservation_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	user_id BIGINT UNSIGNED NULL,
	nombre_cliente VARCHAR(120) NOT NULL,
	email_cliente VARCHAR(254) NOT NULL,
	direccion VARCHAR(255) NOT NULL,
	estado ENUM('pendiente', 'confirmada', 'lista', 'completada', 'cancelada', 'vencida') NOT NULL DEFAULT 'pendiente',
	moneda CHAR(3) NOT NULL DEFAULT 'USD',
	vence_en DATETIME NULL,
	notas VARCHAR(500) NULL,
	creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (reservation_id),
	KEY idx_reservas_usuario_fecha (user_id, creado_en),
	KEY idx_reservas_estado_fecha (estado, creado_en),
	CONSTRAINT fk_reservas_usuarios FOREIGN KEY (user_id) REFERENCES usuarios (user_id)
		ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS detalle_reserva (
	reservation_item_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
	reservation_id BIGINT UNSIGNED NOT NULL,
	product_id BIGINT UNSIGNED NOT NULL,
	nombre_producto VARCHAR(160) NOT NULL,
	talla_eu TINYINT UNSIGNED NULL,
	cantidad INT UNSIGNED NOT NULL,
	precio_unitario DECIMAL(10,2) NOT NULL,
	PRIMARY KEY (reservation_item_id),
	UNIQUE KEY uq_detalle_reserva_producto_talla (reservation_id, product_id, talla_eu),
	KEY idx_detalle_reserva_catalogo (product_id),
	CONSTRAINT chk_detalle_reserva_cantidad CHECK (cantidad > 0),
	CONSTRAINT chk_detalle_reserva_precio CHECK (precio_unitario >= 0),
	CONSTRAINT fk_detalle_reserva_reserva FOREIGN KEY (reservation_id) REFERENCES reservas (reservation_id)
		ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT fk_detalle_reserva_catalogo FOREIGN KEY (product_id) REFERENCES catalogo (product_id)
		ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;
