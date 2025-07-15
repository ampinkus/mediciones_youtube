/**
 * app.js
 * 
 * Punto de entrada principal de la aplicación Express.
 * Configura middlewares, motor de plantillas y rutas.
 * 
 * Este módulo sirve como bootstrap de todo el sistema:
 * - Carga rutas principales del sistema.
 * - Configura el motor de vistas con EJS.
 * - Sirve archivos estáticos como scripts y estilos desde /public y /modulos.
 * 
 * Dependencias:
 * - express: Framework web principal
 * - path: Módulo para manejar rutas del sistema de archivos
 * - __dirname, __filename: Variables auxiliares importadas desde utils.js
 * 
 * Rutas registradas:
 * - home.routes.js (página principal)
 * - youtube.routes.js (gestión de streams de YouTube)
 * - datatablesYoutube.routes.js (tablas dinámicas)
 * - graficosYoutube.routes.js (gráficos de estadísticas)
 */

import express from 'express';
import path from 'path';
import { __filename, __dirname } from './utils.js';

import homeRoutes from './routes/home.routes.js';
import youtubeRoutes from './routes/youtube.routes.js';
import datatablesYoutubeRoutes from './routes/datatablesYoutube.routes.js';
import graficosYoutubeRoutes from './routes/graficosYoutube.routes.js';

const app = express();

// ---------- Middlewares ----------
app.use(express.json()); // Para recibir datos en formato JSON
app.use('/public', express.static(path.join(__dirname, 'public'))); // Archivos estáticos públicos
app.use('/modulos', express.static(path.join(__dirname, 'modulos'))); // Archivos estáticos de módulos
app.use(express.urlencoded({ extended: true })); // Para parsear formularios HTML
app.use('/node_modules', express.static(path.join(__dirname, '..', 'node_modules'))); // Dependencias externas

// ---------- Motor de vistas ----------
app.set('views', path.join(__dirname, 'views')); // Carpeta de vistas
app.set('view engine', 'ejs'); // Motor de plantillas EJS

// ---------- Rutas ----------
app.use(homeRoutes); // Página de inicio
app.use(youtubeRoutes); // Gestión de streams de YouTube
app.use(datatablesYoutubeRoutes); // Tablas dinámicas
app.use(graficosYoutubeRoutes); // Gráficos con estadísticas

export default app;
