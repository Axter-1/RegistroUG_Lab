import express from 'express';
import {
  addObservation,
  cancelAccess,
  createManualAccess,
  editAccess,
  listAccess,
} from '../controllers/accessController.js';
import { registerQrAccess } from '../controllers/scannerController.js';
import { createScanner } from '../controllers/scannerManagementController.js';
import { requireSession } from '../middleware/authMiddleware.js';
import { requireDevice } from '../middleware/deviceAuthMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();


router.get('/test', (req, res) => {
    res.send('!El servidor está funcionando correctamente¡');
});

router.get('/api/accesos', requireSession, requireRoles('Docente', 'Encargado de laboratorio'), listAccess);
router.post('/api/accesos/manual', requireSession, requireRoles('Encargado de laboratorio'), createManualAccess);
router.patch('/api/accesos/:id', requireSession, requireRoles('Encargado de laboratorio'), editAccess);
router.post('/api/accesos/:id/anular', requireSession, requireRoles('Encargado de laboratorio'), cancelAccess);
router.post('/api/escaneres', requireSession, requireRoles('Encargado de laboratorio'), createScanner);
router.post(
  '/api/accesos/:id/observaciones',
  requireSession,
  requireRoles('Docente', 'Encargado de laboratorio'),
  addObservation,
);
router.post('/api/accesos/qr', requireDevice, registerQrAccess);

export { router };