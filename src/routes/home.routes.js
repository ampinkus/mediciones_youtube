// src/routes/home.routes.js
import { Router } from 'express';
import * as homeController from '../controllers/home.controller.js';

const router = Router();

// Ruta para la página inicial
router.get('/', homeController.mostrarHome);

export default router;
