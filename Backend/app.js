import { createServer } from 'node:http';
import { router } from './routes/router.js';
import express from 'express';

const app = express();

app.use(express.json());
app.use(router);

const port = 3000;
app.listen(port, () => {
  console.log(`Server running at port:${port}/`);
});