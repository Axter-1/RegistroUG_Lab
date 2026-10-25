import express from 'express';

//import { loginController } from '../controllers/loginController.js';
//import { registerController } from '../controllers/registerController.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.send('!El servidor está funcionando correctamente¡');
});

router.get('/test', (req, res) => {
    res.send('!El servidor está funcionando correctamente¡');
});

router.get('/usuarios', (req, res) => {
    res.send('!El servidor está funcionando correctamente¡');
});

// router.post('/login', loginController.login);
// router.post('/register', registerController.auth);

export { router };