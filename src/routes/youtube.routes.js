// src/routes/youtube.routes.js

/**
 * Rutas para la gestión de streams de YouTube.
 * Incluye funcionalidades para ver, agregar, editar, eliminar y activar streams.
 */

import { Router } from 'express';
import * as youtubeController from '../controllers/youtube.controller.js';

// Crea una instancia del router de Express
const router = Router();

/**
 * @route GET /youtube
 * @description Lista todos los streams de YouTube
 * @access Público
 */
router.get('/youtube', youtubeController.verStreams);

/**
 * @route GET /youtube/agregar
 * @description Muestra el formulario para agregar un nuevo stream
 * @access Público
 */
router.get('/youtube/agregar', youtubeController.formularioAgregar);

/**
 * @route POST /youtube/agregar
 * @description Procesa la creación de un nuevo stream
 * @access Público
 */
router.post('/youtube/agregar', youtubeController.guardarStream);

/**
 * @route GET /youtube/ver/:id
 * @description Muestra el detalle de un stream específico
 * @access Público
 */
router.get('/youtube/ver/:id', youtubeController.verStream);

/**
 * @route GET /youtube/editar/:id
 * @description Muestra el formulario para editar un stream
 * @access Público
 */
router.get('/youtube/editar/:id', youtubeController.formularioEditar);

/**
 * @route POST /youtube/editar/:id
 * @description Procesa la actualización de un stream
 * @access Público
 */
router.post('/youtube/editar/:id', youtubeController.actualizarStream);

/**
 * @route POST /youtube/borrar/:id
 * @description Elimina un stream por su ID
 * @access Público
 */
router.post('/youtube/borrar/:id', youtubeController.eliminarStream);

/**
 * @route POST /youtube/toggle/:id
 * @description Activa o desactiva la medición del stream
 * @access Público
 */
router.post('/youtube/toggle/:id', youtubeController.toggleStream);

/**
 * @route GET /youtube/obtener-nombre
 * @description Obtiene automáticamente el nombre del stream a partir de la URL
 * @access Público
 */
router.get('/youtube/obtener-nombre', youtubeController.obtenerNombreDesdeURL);

// Exporta el router para ser usado en la aplicación principal
export default router;
