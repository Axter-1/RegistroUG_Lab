import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { createPool } from "mysql2/promise";
import { database } from "../config/database.js";

if  (database) {
    console.log("Conexión a la base de datos establecida correctamente.");
}else{
    const secret = process.env.JWT_SECRET;
    console.log(process.env); // Log the value of JWT_SECRET for debugging
    if (!secret || secret.length < 32) {
        throw new Error("JWT_SECRET debe estar definido y tener al menos 32 caracteres.");
    }

    const databasePort = Number.parseInt(
        process.env.MYSQL_PORT || process.env.DB_PORT || "3306",
        10,
    );

    if (!Number.isInteger(databasePort) || databasePort < 1 || databasePort > 65535) {
        throw new Error("MYSQL_PORT debe ser un puerto válido.");
    }

    const database = createPool({
        host: process.env.MYSQL_HOST || process.env.DB_HOST || "localhost",
        port: databasePort,
        user: process.env.MYSQL_USER || process.env.DB_USER || "root",
        password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || "",
        database: process.env.MYSQL_DATABASE || process.env.DB_NAME || "default_db",
    });
}

export const auth = betterAuth({
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trustedOrigins: ["http://localhost:3001"],
    database,
    user: {
        modelName: "Usuario",
    },
    session: {
        modelName: "Sesion",
    },
    verification: {
        modelName: "Verificacion",
    },
    emailAndPassword: {
        enabled: true,
    },
    account: {
        modelName: "Cuenta",
        additionalFields: {
            id_role: {
                type: "number",
                required: true,
                defaultValue: 1,
                input: true,
            },
            state: {
                type: "boolean",
                required: true,
                defaultValue: true,
                input: true,
            },
        },
    },
    advanced: {
        database: {
            generateId: "uuid",
        },
    },
    plugins: [
        jwt({
            jwt: {
                definepayload: (user) => ({
                    id: user.id,
                    email: user.email,
                    role: user.id_role,
                }),
                issuer: "http://localhost:3000",
                audience: "http://localhost:3001",
                expirationTime: process.env.JWT_EXPIRES_IN || "1h",
            },
            refresh: {
                enabled: true,
                expirationTime: "30d" // refresh token válido por 30 días
            }
        }),
    ],
    secret: process.env.JWT_SECRET,
});
