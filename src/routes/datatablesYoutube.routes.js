// src/routes/datatablesYoutube.routes.js

// Importa el Router de Express para definir rutas específicas del módulo
import { Router } from 'express';
// Importa los controladores que manejarán las peticiones a estas rutas
import { mostrarFormulario, generarTabla } from '../controllers/datatablesYoutube.controller.js';

// Crea una nueva instancia del enrutador
const router = Router();

// Ruta GET que muestra el formulario principal de DataTables para YouTube
router.get('/datatablesYouTube', mostrarFormulario);

// Ruta GET que genera y devuelve la tabla de datos de YouTube en formato JSON
// Esta ruta es usada por DataTables para hacer la carga dinámica de datos
router.get('/datatablesYouTube/tabla', generarTabla);

// Exporta el enrutador para que pueda ser usado en app.js
export default router;
