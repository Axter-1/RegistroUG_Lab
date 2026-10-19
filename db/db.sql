CREATE TABLE IF NOT EXISTS Usuario (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    emailVerified BOOLEAN NOT NULL,
    image TEXT,
    createdAt TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP NOT NULL
) ENGINE=InnoDB;

create table if not exists Rol (
    id_rol TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(20) NOT NULL
); 

insert into Rol (descripcion) values ('Sin_rol'),('Docente'), ('Encargado de laboratorio');

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
    state BOOLEAN NOT NULL,
    id_rol TINYINT UNSIGNED NOT NULL,
    FOREIGN KEY (userId) REFERENCES Usuario (id) ON DELETE CASCADE,
    FOREIGN KEY (id_rol) REFERENCES Rol(id_rol)
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