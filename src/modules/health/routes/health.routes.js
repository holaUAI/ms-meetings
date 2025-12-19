
import { Router } from 'express';
import { checkDatabaseConnection } from '../controllers/health.controller.js';

const router = Router();

// Define la ruta GET /ping que activa el chequeo de la base de datos.
// Esta es la ruta que llamarás cada 14 minutos para mantener el servidor activo.
router.get('/ping', checkDatabaseConnection);

export default router;
