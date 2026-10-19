import { createServer } from 'node:http';
import { toNodeHandler } from "better-auth/node";
import { auth } from "./utils/auth.ts";
import { router } from './routes/router.js';

import express from 'express';
import cors from "cors";



const app = express();
app.use(
  cors({
    origin: "http://localhost:3001", // Replace with your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"], 
    credentials: true,
  })
);
app.use(express.json());
app.use(router);


app.all("/api/auth/*splat", toNodeHandler(auth));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at port:${port}/`);
});