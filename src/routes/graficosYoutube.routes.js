// src/routes/graficosYoutube.routes.js

// Importa el Router de Express para definir rutas de este módulo
import { Router } from 'express';
// Importa las funciones del controlador para manejar las peticiones HTTP
import { mostrarFormulario, generarGrafico } from '../controllers/graficosYoutube.controller.js';

// Crea una instancia de router
const router = Router();

/**
 * @route GET /graficosYouTube
 * @description Muestra el formulario donde el usuario elige los parámetros del gráfico
 * @access Público
 */
router.get('/graficosYouTube', mostrarFormulario);

/**
 * @route GET /graficosYouTube/generar
 * @description Genera el gráfico con los datos filtrados por el usuario
 * @access Público
 */
router.get('/graficosYouTube/generar', generarGrafico);

// Exporta el router para ser usado en app.js
export default router;

// Este archivo define las rutas relacionadas con los gráficos de YouTube
// y se encarga de dirigir las peticiones a los controladores adecuados.
// Las rutas incluyen una para mostrar un formulario y otra para generar un gráfico basado en los datos
// proporcionados por el usuario.
// Asegúrate de que las funciones en el controlador manejen correctamente la lógica de negocio
// y la interacción con la base de datos o servicios externos necesarios para generar los gráficos.
// Además, verifica que las rutas estén correctamente integradas en tu aplicación principal (app.js).
// No olvides importar este archivo en tu archivo principal de rutas para que las rutas estén disponibles.
