import { toNodeHandler } from "better-auth/node";
import { auth } from "./utils/auth.ts";
import { router } from './routes/router.js';

import express from 'express';
import cors from "cors";



const app = express();
app.use(
  cors({
    origin: (process.env.FRONTEND_ORIGIN || "http://localhost:3001")
      .split(",")
      .map((origin) => origin.trim()),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());
app.use(router);

app.use((error, req, res, next) => {
  console.error("API request failed:", error);
  if (res.headersSent) return next(error);

  const statusCode =
    error.statusCode || error.status || (error.sqlState === "45000" ? 409 : 500);
  const message =
    statusCode >= 500 ? "Ocurrió un error interno al procesar la solicitud." : error.message;
  return res.status(statusCode).json({ error: message });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at port:${port}/`);
});