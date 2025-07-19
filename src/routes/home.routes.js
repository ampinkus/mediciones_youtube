// src/routes/home.routes.js

/**
 * Rutas correspondientes a la página principal del sistema.
 * Este módulo define la ruta para acceder al Home del sistema.
 */

import { Router } from 'express';
import * as homeController from '../controllers/home.controller.js';

// Crea una instancia del router de Express
const router = Router();

/**
 * @route GET /
 * @description Muestra la página principal del sistema (Home)
 * @access Público
 */
router.get('/', homeController.mostrarHome);

// Exporta el router para que pueda ser utilizado en el archivo principal
export default router;
