-- Crear un usuario -> % Desde cualquier orignen
CREATE USER 'nombre_usuario'@'localhost' IDENTIFIED BY 'tu_contraseña';
-- Dar solo permisos de lectura (SELECT) e inserción (INSERT)
GRANT SELECT, INSERT ON nombre_bd.* TO 'nombre_usuario'@'localhost';
-- Aplicar los cambios de privilegios inmediatamente
FLUSH PRIVILEGES;

DROP USER 'nombre_usuario'@'localhost';

create table if not exists Rol (
    id_rol TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(40) NOT NULL UNIQUE
) ENGINE=InnoDB;

INSERT INTO Rol (id_rol, descripcion) VALUES
    (1, 'Sin_rol'),
    (2, 'Docente'),
    (3, 'Encargado de laboratorio')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

CREATE TABLE IF NOT EXISTS Usuario (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    emailVerified BOOLEAN NOT NULL,
    image TEXT,
    createdAt TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP NOT NULL,
    id_rol TINYINT UNSIGNED NOT NULL DEFAULT 1,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES Rol(id_rol)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Sesion (
	id VARCHAR(255) NOT NULL PRIMARY KEY,
	userId VARCHAR(255) NOT NULL,
	token VARCHAR(255) NOT NULL UNIQUE,
	expiresAt timestamp NOT NULL,
	ipAddress text,
	userAgent text,
	createdAt timestamp NOT NULL,
	updatedAt timestamp NOT NULL,
	FOREIGN KEY (userId) REFERENCES Usuario (id) ON DELETE CASCADE
);

CREATE INDEX sesion_userId_idx ON Sesion (userId);

CREATE TABLE IF NOT EXISTS Cuenta (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    userId VARCHAR(255) NOT NULL,
    accountId text NOT NULL,
    providerId text NOT NULL,
    accessToken text,
    refreshToken text,
    accessTokenExpiresAt timestamp,
    refreshTokenExpiresAt timestamp,
    scope text,
    idToken text,
    password text,
    createdAt timestamp NOT NULL,
    updatedAt timestamp NOT NULL,
    FOREIGN KEY (userId) REFERENCES Usuario (id) ON DELETE CASCADE
);
CREATE INDEX  Cuenta_userId_idx ON Cuenta (userId);

CREATE TABLE IF NOT EXISTS Verificacion (
	id VARCHAR(255) NOT NULL PRIMARY KEY,
	identifier VARCHAR(255) NOT NULL,
	value text NOT NULL,
	expiresAt timestamp NOT NULL,
	createdAt timestamp NOT NULL,
	updatedAt timestamp NOT NULL
);
CREATE INDEX Verificacion_identifier_idx ON Verificacion (identifier);

CREATE TABLE IF NOT EXISTS jwks (
	id VARCHAR(255) NOT NULL PRIMARY KEY,
	publicKey text NOT NULL,
	privateKey text NOT NULL,
	alg text,
	crv text,
	createdAt timestamp NOT NULL,
	expiresAt timestamp
);

CREATE TABLE IF NOT EXISTS escaner (
    id_escaner INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_laboratorio TINYINT UNSIGNED NOT NULL,
    nombre VARCHAR(80) NULL,
    token_hash VARCHAR(500) NOT NULL COMMENT 'SHA-256 hexadecimal del token secreto del dispositivo',
    activo BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS uda (
    id_uda BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS grupo (
    id_grupo BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS docente_usuario (
    user_id VARCHAR(255) NOT NULL PRIMARY KEY,
    id_docente INT UNSIGNED NOT NULL UNIQUE,
    CONSTRAINT fk_docente_usuario_usuario
        FOREIGN KEY (user_id) REFERENCES Usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS docente_asignacion (
    id_asignacion BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_docente INT UNSIGNED NOT NULL,
    id_grupo BIGINT UNSIGNED NOT NULL,
    id_uda BIGINT UNSIGNED NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE KEY uq_docente_grupo_uda (id_docente, id_grupo, id_uda),
    KEY idx_docente_asignacion_grupo (id_docente, id_grupo, activo),
    CONSTRAINT fk_docente_asignacion_grupo
        FOREIGN KEY (id_grupo) REFERENCES grupo(id_grupo),
    CONSTRAINT fk_docente_asignacion_uda
        FOREIGN KEY (id_uda) REFERENCES uda(id_uda)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS acceso (
    id_acceso INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nua MEDIUMINT UNSIGNED NOT NULL,
    id_laboratorio TINYINT UNSIGNED NOT NULL,
    id_reserva BIGINT UNSIGNED NULL,
    id_grupo BIGINT UNSIGNED NULL,
    id_docente INT UNSIGNED NULL,
    id_uda BIGINT UNSIGNED NULL,
    razon_entrada VARCHAR(100) NULL,
    fecha DATE NOT NULL,
    hora_entrada TIME NOT NULL,
    hora_salida TIME NULL,
    estado_salida ENUM(
        'Pendiente',
        'No aplica',
        'Salida registrada',
        'Cerrado por registro'
    ) NOT NULL DEFAULT 'Pendiente',
    origen ENUM('Qr', 'Manual') NULL DEFAULT 'Manual',
    id_escaner INT UNSIGNED NULL,
    observaciones TEXT NULL,
    estado_registro BOOLEAN NOT NULL DEFAULT FALSE,
    justificacion_anulacion TEXT NULL,
    anulado_por VARCHAR(255) NULL,
    anulado_en TIMESTAMP NULL,
    CONSTRAINT fk_acceso_escaner
        FOREIGN KEY (id_escaner)
        REFERENCES escaner(id_escaner)
        ON DELETE NO ACTION,
    CONSTRAINT fk_acceso_grupo
        FOREIGN KEY (id_grupo) REFERENCES grupo(id_grupo),
    CONSTRAINT fk_acceso_uda
        FOREIGN KEY (id_uda) REFERENCES uda(id_uda)
);

CREATE INDEX acceso_nua_fecha_idx ON acceso(nua, fecha, id_acceso);
CREATE INDEX acceso_lab_fecha_idx ON acceso(id_laboratorio, fecha, id_acceso);
CREATE INDEX acceso_grupo_fecha_idx ON acceso(id_grupo, fecha, id_acceso);
CREATE INDEX acceso_uda_fecha_idx ON acceso(id_uda, fecha, id_acceso);

DROP PROCEDURE IF EXISTS registrar_acceso_qr;
DELIMITER $$
CREATE PROCEDURE registrar_acceso_qr(
    IN p_nua MEDIUMINT UNSIGNED,
    IN p_id_laboratorio TINYINT UNSIGNED,
    IN p_id_escaner INT UNSIGNED
)
BEGIN
    DECLARE v_lock_name VARCHAR(64);
    DECLARE v_lock_acquired INT DEFAULT 0;
    DECLARE v_registros_abiertos INT DEFAULT 0;
    DECLARE v_mismo_laboratorio INT DEFAULT 0;
    DECLARE v_id_acceso INT UNSIGNED DEFAULT NULL;
    DECLARE v_accion VARCHAR(32);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        IF v_lock_acquired = 1 THEN
            DO RELEASE_LOCK(v_lock_name);
        END IF;
        RESIGNAL;
    END;

    IF p_nua IS NULL OR p_nua = 0 OR p_id_laboratorio IS NULL OR p_id_escaner IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'NUA, laboratorio y escáner son obligatorios.';
    END IF;

    SET v_lock_name = CONCAT('acceso:', p_nua, ':', CURRENT_DATE());
    SELECT GET_LOCK(v_lock_name, 10) INTO v_lock_acquired;
    IF v_lock_acquired IS NULL OR v_lock_acquired <> 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se pudo bloquear el registro del NUA.';
    END IF;

    START TRANSACTION;

    SELECT COUNT(*),
           COALESCE(SUM(id_laboratorio = p_id_laboratorio), 0)
      INTO v_registros_abiertos, v_mismo_laboratorio
      FROM acceso
     WHERE nua = p_nua
       AND fecha = CURRENT_DATE()
       AND hora_salida IS NULL
       AND estado_registro = FALSE;

    IF v_registros_abiertos > 0 THEN
        IF v_mismo_laboratorio > 0 THEN
            SELECT id_acceso INTO v_id_acceso
              FROM acceso
             WHERE nua = p_nua
               AND fecha = CURRENT_DATE()
               AND id_laboratorio = p_id_laboratorio
               AND hora_salida IS NULL
               AND estado_registro = FALSE
             ORDER BY id_acceso DESC
             LIMIT 1
             FOR UPDATE;

            UPDATE acceso
               SET hora_salida = CURRENT_TIME(),
                   estado_salida = CASE
                       WHEN id_laboratorio = p_id_laboratorio THEN 'Salida registrada'
                       ELSE 'Cerrado por registro'
                   END
             WHERE nua = p_nua
               AND fecha = CURRENT_DATE()
               AND hora_salida IS NULL
               AND estado_registro = FALSE;
            SET v_accion = 'salida';
        ELSE
            UPDATE acceso
               SET hora_salida = CURRENT_TIME(),
                   estado_salida = 'Cerrado por registro'
             WHERE nua = p_nua
               AND fecha = CURRENT_DATE()
               AND hora_salida IS NULL
               AND estado_registro = FALSE;

            INSERT INTO acceso (
                nua, id_laboratorio, fecha, hora_entrada, estado_salida,
                origen, id_escaner
            ) VALUES (
                p_nua, p_id_laboratorio, CURRENT_DATE(), CURRENT_TIME(),
                'Pendiente', 'Qr', p_id_escaner
            );
            SET v_id_acceso = LAST_INSERT_ID();
            SET v_accion = 'entrada_con_cierre';
        END IF;
    ELSE
        INSERT INTO acceso (
            nua, id_laboratorio, fecha, hora_entrada, estado_salida,
            origen, id_escaner
        ) VALUES (
            p_nua, p_id_laboratorio, CURRENT_DATE(), CURRENT_TIME(),
            'Pendiente', 'Qr', p_id_escaner
        );
        SET v_id_acceso = LAST_INSERT_ID();
        SET v_accion = 'entrada';
    END IF;

    COMMIT;
    DO RELEASE_LOCK(v_lock_name);
    SET v_lock_acquired = 0;
    SELECT v_id_acceso AS id_acceso, v_accion AS accion;
END$$
DELIMITER ;