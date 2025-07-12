// src/routes/youtube.routes.js
import { Router } from 'express';
import * as youtubeController from '../controllers/youtube.controller.js';

const router = Router();

// Mostrar todos los streams
router.get('/youtube', youtubeController.verStreams);

// Formulario para agregar stream
router.get('/youtube/agregar', youtubeController.formularioAgregar);
router.post('/youtube/agregar', youtubeController.guardarStream);

// Ver stream
router.get('/youtube/ver/:id', youtubeController.verStream);

// Formulario para modificar stream
router.get('/youtube/editar/:id', youtubeController.formularioEditar);
router.post('/youtube/editar/:id', youtubeController.actualizarStream);

// Borrar stream
router.post('/youtube/borrar/:id', youtubeController.eliminarStream);

export default router;
