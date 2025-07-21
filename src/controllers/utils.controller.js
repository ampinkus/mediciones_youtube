/**
 * @module controllers/utilscontroller
 * @description
 * Utilidades generales para controladores relacionados con YouTube.
 * En particular, este módulo expone la función {@link extraerVideoID}, que es
 * utilizada por `youtube.controller.js`, `medicionYoutube.js` y otros
 * controladores para obtener el ID limpio de un video de YouTube a partir de
 * distintos formatos de URL.
 */

/**
 * Extrae el ID de un video de YouTube a partir de una URL.
 *
 * Esta función reconoce los siguientes formatos de enlace (entre otros):
 *   - `https://www.youtube.com/watch?v=VIDEO_ID`
 *   - `https://youtu.be/VIDEO_ID`
 *   - `https://www.youtube.com/embed/VIDEO_ID`
 *   - `https://www.youtube.com/shorts/VIDEO_ID`
 *
 * Si no encuentra un ID válido devuelve la **URL recortada** (sin espacios),
 * permitiendo al llamador detectar que no se pudo extraer.
 *
 * @function extraerVideoID
 * @param {string} url - URL completa del video de YouTube.
 * @returns {string} ID de 11 caracteres del video **o** la URL original
 *          recortada si no se pudo extraer.
 */
export function extraerVideoID(url) {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match && match[1] ? match[1] : url.trim();
}
