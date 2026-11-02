import { betterAuth } from "better-auth";
import { conexion } from "../config/database.js";

const authSecret = process.env.BETTER_AUTH_SECRET;
if (!authSecret || authSecret.length < 32) {
    throw new Error("BETTER_AUTH_SECRET debe estar definido y tener al menos 32 caracteres.");
}

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || process.env.BASE_URL || "http://localhost:3000",
    trustedOrigins: (process.env.BETTER_AUTH_TRUSTED_ORIGINS || "http://localhost:3001")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    secret: authSecret,
    database: conexion,
    user: {
        modelName: "Usuario",
        additionalFields: {
            id_rol: {
                type: "number",
                required: false,
                defaultValue: 1,
                input: false,
            },
            activo: {
                type: "boolean",
                required: false,
                defaultValue: true,
                input: false,
            },
        },
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
    account: { modelName: "Cuenta" },
    advanced: {
        database: {
            generateId: "uuid",
        },
    },
});
