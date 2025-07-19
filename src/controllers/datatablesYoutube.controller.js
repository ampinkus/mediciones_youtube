/** @typedef {import('express')} Express */

/**
 * Muestra el formulario para seleccionar un stream y fechas/horas para generar una tabla.
 *
 * @function mostrarFormulario
 * @async
 * @param {Express.Request} req - Objeto de solicitud de Express.
 * @param {Express.Response} res - Objeto de respuesta de Express.
 */

/**
 * datatablesYoutube.controller.js
 *
 * Este módulo contiene los controladores para:
 * - Mostrar el formulario de selección para generar una tabla de mediciones.
 * - Consultar las mediciones de YouTube desde la base de datos.
 * - Filtrar por fechas, horas y stream específico.
 * - Renderizar una tabla con los resultados formateados para visualización.
 */

import moment from "moment"; // Asegurate de tener instalado moment
import sequelize from "../database/database.js";
import StreamYouTube from "../models/streams_youtube.js";
import MedicionYouTube from "../models/mediciones_youtube.js";
import { Op } from "sequelize";


export const mostrarFormulario = async (req, res) => {
  const streams = await StreamYouTube.findAll({
    order: [["nombre_stream", "ASC"]],
  });

  // Renderiza el formulario con la lista de streams ordenados alfabéticamente
  res.render("youtube/formularioYoutube", { streams });
};

/**
 * Genera y renderiza la tabla de mediciones de YouTube según los filtros ingresados.
 *
 * @function generarTabla
 * @async
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
export const generarTabla = async (req, res) => {
  const { streamId, fechaInicio, fechaFin, horaInicio, horaFin } = req.query;

  let condiciones = {};

  // Convierte las fechas desde formato DD/MM/YYYY a objetos Date
  const fechaInicioDate = fechaInicio
    ? moment(fechaInicio, "DD/MM/YYYY").toDate()
    : null;
  const fechaFinDate = fechaFin
    ? moment(fechaFin, "DD/MM/YYYY").toDate()
    : null;

  // Si se selecciona un stream específico, se agrega como condición
  if (streamId && streamId !== "todos") {
    condiciones.streamId = streamId;
  }

  // Condiciones de filtro por fechas
  if (fechaInicioDate && fechaFinDate) {
    condiciones.fecha = { [Op.between]: [fechaInicioDate, fechaFinDate] };
  } else if (fechaInicioDate) {
    condiciones.fecha = { [Op.gte]: fechaInicioDate };
  } else if (fechaFinDate) {
    condiciones.fecha = { [Op.lte]: fechaFinDate };
  }

  // Condiciones de filtro por horas
  if (horaInicio && horaFin) {
    condiciones.hora_medicion = { [Op.between]: [horaInicio, horaFin] };
  } else if (horaInicio) {
    condiciones.hora_medicion = { [Op.gte]: horaInicio };
  } else if (horaFin) {
    condiciones.hora_medicion = { [Op.lte]: horaFin };
  }

  try {
    // Consulta todas las mediciones con las condiciones y orden
    const mediciones = await MedicionYouTube.findAll({
      where: condiciones,
      include: [StreamYouTube],
      order: [
        ["fecha", "ASC"],
        ["hora_medicion", "ASC"],
      ],
    });

    // Formatea los datos para enviarlos a la vista
    const medicionesFormateadas = mediciones.map((medicion) => ({
      nombre_stream: medicion.StreamYouTube?.nombre_stream || "Sin nombre",
      fecha: moment(medicion.fecha).format("DD/MM/YYYY"),
      hora: moment(medicion.hora_medicion, "HH:mm:ss").format("HH:mm"),
      view_count: medicion.view_count,
      concurrent_viewers: medicion.concurrent_viewers ?? "—", // ✅ Añadido aquí
      likes_video: medicion.likes_video,
      comentarios_video: medicion.comentarios_video,
    }));

    // Renderiza la tabla de resultados
    res.render("youtube/tablaYoutube", { mediciones: medicionesFormateadas });
  } catch (error) {
    console.error("Error al generar la tabla:", error);
    res.status(500).send("Error al generar la tabla.");
  }
};
