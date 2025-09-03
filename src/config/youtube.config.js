// src/config/youtube.config.js

import dotenv from "dotenv";
dotenv.config();

/**
 * Clave de API para acceder a los servicios de YouTube Data API v3.
 *
 * Esta clave se utiliza para realizar solicitudes autenticadas a la API
 * desde los controladores del sistema, como `medicionYoutube.js` y `youtube.controller.js`.
 *
 * ⚠️ IMPORTANTE: No compartas esta clave públicamente en producción.
 *
 * @constant {string}
 */
export const apiKey = process.env.YOUTUBE_API_KEY;
