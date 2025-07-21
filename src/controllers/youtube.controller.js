/**
 * @module controllers/youtubecontroller
 * @description Controlador principal del módulo de YouTube.
 * Gestiona:
 * - Alta, modificación, visualización y eliminación de streams.
 * - Consulta de datos desde la API de YouTube.
 * - Generación automática de nombres de streams.
 * - Activación/desactivación de streams.
 * - Conversión de formatos de fecha y hora.
 */

import sequelize from "../database/database.js";
import StreamYouTube from "../models/streams_youtube.js";
import ConfiguracionYouTube from "../models/configuracion_youtube.js";
import MedicionYouTube from "../models/mediciones_youtube.js";
import moment from "moment";
import fetch from "node-fetch";
import { extraerVideoID } from "./utils.controller.js";
import { apiKey } from "../config/youtube.config.js";


/**
 * Convierte una fecha en formato ISO (YYYY-MM-DD o completo) a formato DD/MM/YYYY.
 *
 * @param {string|null|undefined} fechaISO - Fecha en formato ISO.
 * @returns {string|null} Fecha formateada en formato DD/MM/YYYY o null si es inválida.
 */
function formatearFecha(fechaISO) {
  if (!fechaISO) return null;
  const fecha = new Date(fechaISO);
  const dia = String(fecha.getUTCDate()).padStart(2, "0");
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0");
  const anio = fecha.getUTCFullYear();
  return `${dia}/${mes}/${anio}`;
}

/**
 * Formatea una hora quitando los segundos, dejando solo HH:mm.
 *
 * @param {string|null|undefined} horaCompleta - Hora en formato HH:mm:ss.
 * @returns {string} Hora en formato HH:mm, o cadena vacía si es inválida.
 */
function formatearHora(horaCompleta) {
  if (!horaCompleta) return "";
  const [hh, mm] = horaCompleta.split(":");
  return `${hh}:${mm}`;
}

/**
 * Muestra todos los streams con sus configuraciones asociadas.
 *
 * @function verStreams
 * @async
 * @param {Express.Request} req - Objeto de solicitud HTTP de Express.
 *
 *   Esta ruta **no** recibe parámetros:
 *     - `req.params`  → vacío
 *     - `req.query`   → vacío
 *     - `req.body`    → vacío
 *
 * @param {Express.Response} res - Objeto de respuesta HTTP de Express.
 *
 *   Renderiza la vista **`youtube/youtube`** enviando:
 *     - `streams` (Array\<StreamYouTube>): listado de streams con sus configuraciones
 *       ya formateadas (fechas y horas legibles).
 *
 * @returns {Promise<void>}
 */
export const verStreams = async (req, res) => {
  try {
    const streams = await StreamYouTube.findAll({
      include: ConfiguracionYouTube,
      order: [["id", "ASC"]],
    });

    streams.forEach((stream) => {
      const config = stream.ConfiguracionYouTube;
      if (config) {
        config.fecha_formateada = formatearFecha(config.fecha);
        config.fecha_final_formateada = formatearFecha(config.fecha_final);
        config.hora_comienzo_medicion = formatearHora(
          config.hora_comienzo_medicion
        );
        config.hora_fin_medicion = formatearHora(config.hora_fin_medicion);
        config.actual_start_time_formateada = formatearHora(
          config.actual_start_time
        );
        config.actual_end_time_formateada = formatearHora(
          config.actual_end_time
        );
        config.actual_start_time = config.actual_start_time || "";
        config.actual_end_time = config.actual_end_time || "";
      }
    });

    res.render("youtube/youtube", { streams });
  } catch (error) {
    console.error("Error al obtener los streams:", error);
    res.status(500).send("Error al obtener los streams.");
  }
};

/**
 * Muestra el formulario para agregar un nuevo stream de YouTube.
 *
 * @function formularioAgregar
 * @param {Express.Request} req - Objeto de solicitud HTTP de Express.
 *
 *   Esta ruta **no** recibe parámetros:
 *     - `req.params` → vacío
 *     - `req.query`  → vacío
 *     - `req.body`   → vacío
 *
 * @param {Express.Response} res - Objeto de respuesta HTTP de Express.
 *
 *   Renderiza la vista **`youtube/agregarStreamYoutube`** enviando:
 *     - `fechaHoy` (string): Fecha actual en formato DD/MM/YYYY.
 *     - `horaComienzo` (string): Hora manual de inicio (campo vacío por defecto).
 *     - `horaFin` (string): Hora manual de fin  (campo vacío por defecto).
 *
 * @returns {void}
 */

export const formularioAgregar = (req, res) => {
  const hoy = new Date();
  const dia = String(hoy.getDate()).padStart(2, "0");
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const anio = hoy.getFullYear();
  const fechaHoy = `${dia}/${mes}/${anio}`;

  res.render("youtube/agregarStreamYoutube", {
    fechaHoy,
    horaComienzo: "",
    horaFin: "",
  });
};

/**
 * Guarda un nuevo stream de YouTube junto con su configuración en la base de datos.
 *
 * @function guardarStream
 * @async
 * @param {Express.Request} req - Objeto de solicitud HTTP de Express.
 *
 *   Contiene los siguientes campos en **`req.body`** (provenientes del formulario):
 *     - `nombre_stream` (string): Nombre descriptivo del stream.
 *     - `url_stream`   (string): URL completa del video/stream de YouTube.
 *     - `id_canal`     (string): ID del canal de YouTube.
 *     - `fecha`        (string): Fecha de inicio en formato **DD/MM/YYYY**.
 *     - `fecha_final`  (string | null): Fecha de fin en formato **DD/MM/YYYY** (opcional).
 *     - `hora_comienzo_medicion` (string | null): Hora manual de comienzo **HH:mm** (opcional).
 *     - `hora_fin_medicion`      (string | null): Hora manual de fin **HH:mm** (opcional).
 *     - `intervalo_medicion`     (number): Intervalo entre mediciones, en minutos.
 *
 *   ➡ Durante la lógica:
 *     - Se extrae `videoID` para consultar **YouTube Data API** y, si existe,
 *       obtener `actualStartTime` y `actualEndTime` para autocompletar horas.
 *     - Las fechas se validan y convierten a ISO (**YYYY-MM-DD**).
 *
 * @param {Express.Response} res - Objeto de respuesta HTTP de Express.
 *
 *   - En caso exitoso **redirige** a **`/youtube`** (lista de streams).
 *   - Si ocurre un error, responde con `500 Internal Server Error`
 *     y el mensaje **"Error al guardar el stream"**.
 *
 * @returns {Promise<void>}
 */

export const guardarStream = async (req, res) => {
  try {
    const {
      nombre_stream,
      url_stream,
      id_canal,
      fecha,
      fecha_final,
      hora_comienzo_medicion,
      hora_fin_medicion,
      intervalo_medicion,
    } = req.body;

    const fechaInicioISO = moment(fecha, "DD/MM/YYYY", true).isValid()
      ? moment(fecha, "DD/MM/YYYY").format("YYYY-MM-DD")
      : null;

    const fechaFinalISO =
      fecha_final && moment(fecha_final, "DD/MM/YYYY", true).isValid()
        ? moment(fecha_final, "DD/MM/YYYY").format("YYYY-MM-DD")
        : null;

    if (!fechaInicioISO) {
      console.error("❌ Error: formato de fecha inicial inválido");
      return res.status(400).send("Formato de fecha inicial inválido");
    }

    const nuevoStream = await StreamYouTube.create({
      nombre_stream,
      url_stream,
      id_canal,
    });

    const videoID = extraerVideoID(url_stream);
    let actualStart = null;
    let actualEnd = null;
    let horaInicioMedicion = hora_comienzo_medicion?.trim() || null;
    let horaFinMedicion = hora_fin_medicion?.trim() || null;

    if (videoID) {
      const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoID}&key=${apiKey}`;
      try {
        const response = await fetch(videoUrl);
        const data = await response.json();
        const lsd = data?.items?.[0]?.liveStreamingDetails;

        actualStart = lsd?.actualStartTime || null;
        actualEnd = lsd?.actualEndTime || null;

        if (actualStart) horaInicioMedicion = actualStart.substring(11, 16);
        if (actualEnd) horaFinMedicion = actualEnd.substring(11, 16);

        if (actualStart?.length > 0)
          actualStart = actualStart.substring(11, 19);
        if (actualEnd?.length > 0) actualEnd = actualEnd.substring(11, 19);
      } catch (err) {
        console.warn("⚠️ No se pudo obtener actualStartTime/EndTime:", err);
      }
    }

    await ConfiguracionYouTube.create({
      streamId: nuevoStream.id,
      fecha: fechaInicioISO,
      fecha_final: fechaFinalISO,
      hora_comienzo_medicion: horaInicioMedicion,
      hora_fin_medicion: horaFinMedicion,
      intervalo_medicion,
      activo: true,
      actual_start_time: actualStart,
      actual_end_time: actualEnd,
    });

    res.redirect("/youtube");
  } catch (error) {
    console.error("Error al guardar el stream:", error);
    res.status(500).send("Error al guardar el stream");
  }
};

/**
 * Muestra los datos detallados de un stream individual.
 *
 * @function verStream
 * @async
 * @param {Express.Request} req - Objeto de solicitud HTTP de Express.
 *
 *   Contiene los siguientes parámetros en **`req.params`**:
 *     - `id` (string): ID del stream a buscar.
 *
 * @param {Express.Response} res - Objeto de respuesta HTTP de Express.
 *
 *   - **Éxito**: renderiza la vista **`youtube/verStreamYoutube`**
 *     pasando el objeto `{ stream }`.
 *   - **404**: si no existe el stream, responde con *"Stream no encontrado"*.
 *   - **500**: ante cualquier error inesperado, responde con
 *     *"Error interno del servidor"*.
 *
 * @returns {Promise<void>}
 */

export const verStream = async (req, res) => {
  const { id } = req.params;

  try {
    const stream = await StreamYouTube.findByPk(id, {
      include: ConfiguracionYouTube,
    });

    if (!stream) return res.status(404).send("Stream no encontrado");

    if (stream.ConfiguracionYouTube) {
      const c = stream.ConfiguracionYouTube;
      c.fecha_formateada = formatearFecha(c.fecha);
      c.fecha_final_formateada = formatearFecha(c.fecha_final);
      c.hora_comienzo_medicion = formatearHora(c.hora_comienzo_medicion);
      c.hora_fin_medicion = formatearHora(c.hora_fin_medicion);
      c.actual_start_time_formateada = formatearHora(c.actual_start_time);
      c.actual_end_time_formateada = formatearHora(c.actual_end_time);
    }

    res.render("youtube/verStreamYoutube", { stream });
  } catch (error) {
    console.error("Error al buscar el stream:", error);
    res.status(500).send("Error interno del servidor");
  }
};

/**
 * Muestra el formulario para editar un stream existente.
 *
 * @function formularioEditar
 * @async
 * @param {Express.Request} req - Objeto de solicitud HTTP de Express.
 *
 *   Contiene los siguientes parámetros en **`req.params`**:
 *     - `id` (string): ID del stream que se desea editar.
 *
 * @param {Express.Response} res - Objeto de respuesta HTTP de Express.
 *
 *   - **Éxito**: renderiza la vista **`youtube/modificarStreamYoutube`**
 *     con el objeto de contexto:
 *       ```js
 *       {
 *         stream,        // Datos del stream + configuración formateada
 *         errorIdCanal: null
 *       }
 *       ```
 *   - **404**: si el stream no existe, responde con *"Stream no encontrado."*.
 *   - **500**: ante un error de base de datos u otro imprevisto,
 *     responde con *"Error al obtener el stream."*.
 *
 * @returns {Promise<void>}
 */

export const formularioEditar = async (req, res) => {
  try {
    const { id } = req.params;

    const stream = await StreamYouTube.findByPk(id, {
      include: ConfiguracionYouTube,
    });

    if (!stream) return res.status(404).send("Stream no encontrado.");

    if (stream.ConfiguracionYouTube) {
      const c = stream.ConfiguracionYouTube;
      c.fecha_formateada = formatearFecha(c.fecha);
      c.fecha_final_formateada = formatearFecha(c.fecha_final);
      c.hora_comienzo_medicion = formatearHora(c.hora_comienzo_medicion);
      c.hora_fin_medicion = formatearHora(c.hora_fin_medicion);
    }

    res.render("youtube/modificarStreamYoutube", {
      stream,
      errorIdCanal: null,
    });
  } catch (error) {
    console.error("Error al obtener el stream para editar:", error);
    res.status(500).send("Error al obtener el stream.");
  }
};





// ---------------------------------------------------------
// Convierte a 'YYYY-MM-DD' si la fecha es válida.
// Devuelve undefined si el campo está vacío o no pasa la validación.
// ---------------------------------------------------------
const toISO = (raw = '') => {
  const limpio = raw.trim();
  if (!limpio) return undefined;                        // usuario lo dejó vacío

  const m = moment(limpio, ['DD/MM/YYYY', 'YYYY-MM-DD'], true); // true ⇒ estricto
  return m.isValid() ? m.format('YYYY-MM-DD') : undefined;      // undefined ⇒ no tocar
};

export const actualizarStream = async (req, res) => {
  try {
    const { id } = req.params;

    // ---------------- 1) Entradas ----------------
    const {
      nombre_stream            = '',
      url_stream               = '',
      id_canal                 = '',
      fecha                    = '',
      fecha_final              = '',
      hora_comienzo_medicion   = '',
      hora_fin_medicion        = '',
      intervalo_medicion       = ''
    } = req.body;

    // ---------------- 2) Formatos ----------------
    const fechaInicioISO = toISO(fecha);
    const fechaFinalISO  = toISO(fecha_final);

    const intervaloParsed =
      intervalo_medicion && Number.isFinite(+intervalo_medicion) && +intervalo_medicion > 0
        ? parseInt(intervalo_medicion, 10)
        : undefined;

    // ---------------- 3) Cargar modelos ----------------
    const stream = await StreamYouTube.findByPk(id, { include: ConfiguracionYouTube });
    if (!stream) return res.status(404).send('Stream no encontrado.');

    // ---------------- 4) Objetos de actualización ----------------
    const streamUpdates = {};
    if (nombre_stream.trim()) streamUpdates.nombre_stream = nombre_stream.trim();
    if (url_stream.trim())    streamUpdates.url_stream   = url_stream.trim();
    if (id_canal.trim())      streamUpdates.id_canal     = id_canal.trim();

    const cfgUpdates = {};
    if (fechaInicioISO !== undefined)   cfgUpdates.fecha        = fechaInicioISO;
    if (fechaFinalISO  !== undefined)   cfgUpdates.fecha_final  = fechaFinalISO;
    if (hora_comienzo_medicion.trim())  cfgUpdates.hora_comienzo_medicion = hora_comienzo_medicion.trim();
    if (hora_fin_medicion.trim())       cfgUpdates.hora_fin_medicion      = hora_fin_medicion.trim();
    if (intervaloParsed !== undefined)  cfgUpdates.intervalo_medicion     = intervaloParsed;

    // ---------------- 5) Guardar sólo si hay cambios ----------------
    const tareas = [];
    if (Object.keys(streamUpdates).length) tareas.push(stream.update(streamUpdates));
    if (Object.keys(cfgUpdates).length)    tareas.push(stream.ConfiguracionYouTube.update(cfgUpdates));
    await Promise.all(tareas);

    // ---------------- 6) Redirigir ----------------
    return res.redirect('/youtube');
  } catch (err) {
    console.error('Error al actualizar el stream:', err);
    return res.status(500).send('Error al actualizar el stream.');
  }
};

/**
 * Elimina un stream y toda la información relacionada (mediciones y configuración).
 *
 * @function eliminarStream
 * @async
 * @param {Express.Request} req - Objeto de solicitud HTTP de Express.
 *
 *   Contiene los siguientes parámetros en **`req.params`**  
 *   (provenientes de la ruta `DELETE /youtube/:id` o similar):
 *     - `id` (string): ID numérico del stream que se desea eliminar.
 *
 * @param {Express.Response} res - Objeto de respuesta HTTP de Express.
 *
 *   - **Éxito (302)**: redirige a **`/youtube`** después de eliminar el stream.  
 *   - **404**: si el stream no existe, responde con *“Stream no encontrado.”*.  
 *   - **500**: ante un error inesperado, responde con *“Error al eliminar el stream.”*.
 *
 * @returns {Promise<void>}
 *
 * @example
 * // Llamada desde el cliente con fetch
 * fetch('/youtube/123', { method: 'DELETE' })
 *   .then(() => window.location.reload());
 */

export const eliminarStream = async (req, res) => {
  const { id } = req.params;

  try {
    const stream = await StreamYouTube.findByPk(id, {
      include: ConfiguracionYouTube,
    });

    if (!stream) return res.status(404).send("Stream no encontrado.");

    await MedicionYouTube.destroy({ where: { streamId: id } });

    await stream.ConfiguracionYouTube?.destroy();

    await stream.destroy();

    res.redirect("/youtube");
  } catch (error) {
    console.error("Error al eliminar el stream:", error);
    res.status(500).send("Error al eliminar el stream.");
  }
};

/**
 * Activa o desactiva un stream.
 *
 * @async
 * @function
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>}
 */
export const toggleStream = async (req, res) => {
  const { id } = req.params;

  try {
    const stream = await StreamYouTube.findByPk(id, {
      include: ConfiguracionYouTube,
    });

    if (!stream || !stream.ConfiguracionYouTube)
      return res.status(404).send("Stream o configuración no encontrada.");

    const nuevoEstado = !stream.ConfiguracionYouTube.activo;

    await stream.ConfiguracionYouTube.update({ activo: nuevoEstado });

    res.redirect("/youtube");
  } catch (error) {
    console.error("Error al cambiar el estado del stream:", error);
    res.status(500).send("Error al cambiar el estado del stream.");
  }
};

/**
 * Obtiene automáticamente el ID del canal y el título del video desde la API de YouTube.
 *
 * @async
 * @function
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>}
 */
export const obtenerNombreDesdeURL = async (req, res) => {
  // ① Tomamos la URL desde query o body; así sirve con GET o POST
  const url = req.query.url || req.body?.url_stream;

  if (!url) {
    return res.status(400).json({ error: 'URL no proporcionada' });
  }

  try {
    const videoID = extraerVideoID(url);
    if (!videoID) {
      return res.status(400).json({ error: 'No se pudo extraer el ID del video' });
    }

    const apiURL = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoID}&key=${apiKey}`;
    const respuesta = await fetch(apiURL);
    const datos     = await respuesta.json();

    if (!datos.items?.length) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }

    const v = datos.items[0];
    const nombre_stream = `${v.snippet.channelTitle} - ${v.snippet.title}`;
    const id_canal      = v.snippet.channelId;

    return res.json({ nombre_stream, id_canal });
  } catch (err) {
    console.error('Error al consultar YouTube:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};