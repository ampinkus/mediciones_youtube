// utils.controller.js se usa para extraer el ID de un video de YouTube
// y se usa en youtube.controller.js y medicionYoutube.js

/**
 * Extrae el ID de un video de YouTube a partir de una URL completa.
 *
 * Esta función soporta distintos formatos de URLs de YouTube, incluyendo:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 *
 * Si no encuentra un ID válido, devuelve la URL original sin espacios.
 *
 * @function
 * @param {string} url - La URL del video de YouTube.
 * @returns {string} - El ID del video (11 caracteres) o la URL limpia si no se puede extraer.
 */
export function extraerVideoID(url) {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match && match[1] ? match[1] : url.trim();
}

