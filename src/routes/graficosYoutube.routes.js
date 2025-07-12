// src/routes/graficosYoutube.routes.js
import { Router } from 'express';
import { mostrarFormulario, generarGrafico } from '../controllers/graficosYoutube.controller.js';

const router = Router();

router.get('/graficosYouTube', mostrarFormulario);
router.get('/graficosYouTube/generar', generarGrafico);

export default router;
