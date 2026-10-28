import { createPool } from 'mysql2/promise';

const env_vars = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_NAME'];
const missingEnvironmentVariables = env_vars.filter(
  (name) => !process.env[name],
);

if (missingEnvironmentVariables.length > 0) {
  throw new Error(
    `Faltan variables de entorno para MySQL: ${missingEnvironmentVariables.join(', ')}`,
  );
}

const port = Number(process.env.MYSQL_PORT || 3306);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('MYSQL_PORT debe ser un puerto válido.');
}

export const conexion = createPool({
  host: process.env.MYSQL_HOST,
  port,
  user: 'root' || process.env.MYSQL_USER,
  password: 'secret_password' || process.env.MYSQL_PASSWORD || process.env.MYSQL_ROOT_PASSWORD || '',
  database: process.env.MYSQL_NAME || process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
});
