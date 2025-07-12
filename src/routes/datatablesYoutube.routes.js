// src/routes/datatablesYoutube.routes.js

import { Router } from 'express';
import { mostrarFormulario, generarTabla } from '../controllers/datatablesYoutube.controller.js';

const router = Router();

router.get('/datatablesYouTube', mostrarFormulario);
router.get('/datatablesYouTube/tabla', generarTabla);

export default router;
