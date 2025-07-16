// src/routes/youtube.routes.js

/**
 * Rutas para la gestión de streams de YouTube.
 * Incluye funcionalidades para ver, agregar, editar, eliminar y activar streams.
 */

import { Router } from 'express';
import * as youtubeController from '../controllers/youtube.controller.js';

// Crea una instancia del router de Express
const router = Router();

// ✅ Ruta para listar todos los streams
router.get('/youtube', youtubeController.verStreams);

// ✅ Rutas para mostrar y procesar el formulario de agregar un nuevo stream
router.get('/youtube/agregar', youtubeController.formularioAgregar);
router.post('/youtube/agregar', youtubeController.guardarStream);

// ✅ Ruta para ver el detalle de un stream específico
router.get('/youtube/ver/:id', youtubeController.verStream);

// ✅ Rutas para mostrar y procesar el formulario de edición de un stream
router.get('/youtube/editar/:id', youtubeController.formularioEditar);
router.post('/youtube/editar/:id', youtubeController.actualizarStream);

// ✅ Ruta para eliminar un stream por su ID
router.post('/youtube/borrar/:id', youtubeController.eliminarStream);

// ✅ Ruta para activar o desactivar la medición de un stream
router.post('/youtube/toggle/:id', youtubeController.toggleStream);

// ✅ Ruta para autocompletar el nombre del stream a partir de la URL del video
router.get('/youtube/obtener-nombre', youtubeController.obtenerNombreDesdeURL);

// Exporta el router para ser usado en la aplicación principal
export default router;
