// src/routes/datatablesYoutube.routes.js

// Importa el Router de Express para definir rutas específicas del módulo
import { Router } from 'express';
// Importa los controladores que manejarán las peticiones a estas rutas
import { mostrarFormulario, generarTabla } from '../controllers/datatablesYoutube.controller.js';

// Crea una nueva instancia del enrutador
const router = Router();

/**
 * @route GET /datatablesYouTube
 * @description Muestra el formulario principal de DataTables para YouTube
 * @access Público
 */
router.get('/datatablesYouTube', mostrarFormulario);

/**
 * @route GET /datatablesYouTube/tabla
 * @description Devuelve los datos en formato JSON para poblar la tabla de YouTube
 * @access Público (usado por DataTables)
 */
router.get('/datatablesYouTube/tabla', generarTabla);

// Exporta el enrutador para que pueda ser usado en app.js
export default router;
