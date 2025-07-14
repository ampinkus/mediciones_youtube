import moment from "moment"; // Asegurate de tener instalado moment
import sequelize from "../database/database.js";
import StreamYouTube from "../models/streams_youtube.js";
import MedicionYouTube from "../models/mediciones_youtube.js";
import { Op } from "sequelize";

// Mostrar formulario
export const mostrarFormulario = async (req, res) => {
  const streams = await StreamYouTube.findAll({
    order: [["nombre_stream", "ASC"]],
  });

  res.render("youtube/formularioYoutube", { streams });
};

// Generar tabla
export const generarTabla = async (req, res) => {
  const { streamId, fechaInicio, fechaFin, horaInicio, horaFin } = req.query;

  let condiciones = {};

  const fechaInicioDate = fechaInicio
    ? moment(fechaInicio, "DD/MM/YYYY").toDate()
    : null;
  const fechaFinDate = fechaFin
    ? moment(fechaFin, "DD/MM/YYYY").toDate()
    : null;

  if (streamId && streamId !== "todos") {
    condiciones.streamId = streamId;
  }

  if (fechaInicioDate && fechaFinDate) {
    condiciones.fecha = { [Op.between]: [fechaInicioDate, fechaFinDate] };
  } else if (fechaInicioDate) {
    condiciones.fecha = { [Op.gte]: fechaInicioDate };
  } else if (fechaFinDate) {
    condiciones.fecha = { [Op.lte]: fechaFinDate };
  }

  if (horaInicio && horaFin) {
    condiciones.hora_medicion = { [Op.between]: [horaInicio, horaFin] };
  } else if (horaInicio) {
    condiciones.hora_medicion = { [Op.gte]: horaInicio };
  } else if (horaFin) {
    condiciones.hora_medicion = { [Op.lte]: horaFin };
  }

  try {
    const mediciones = await MedicionYouTube.findAll({
      where: condiciones,
      include: [StreamYouTube],
      order: [
        ["fecha", "ASC"],
        ["hora_medicion", "ASC"],
      ],
    });

    // ✅ Formatear fechas y campos para la vista
    const medicionesFormateadas = mediciones.map((medicion) => ({
      nombre_stream: medicion.StreamYouTube?.nombre_stream || "Sin nombre",
      fecha: moment(medicion.fecha).format("DD/MM/YYYY"),
      hora: moment(medicion.hora_medicion, "HH:mm:ss").format("HH:mm"),
      view_count: medicion.view_count,
      // concurrent_viewers: medicion.concurrent_viewers ?? "—",
      likes_video: medicion.likes_video,
      comentarios_video: medicion.comentarios_video,
    }));

    res.render("youtube/tablaYoutube", { mediciones: medicionesFormateadas });
  } catch (error) {
    console.error("Error al generar la tabla:", error);
    res.status(500).send("Error al generar la tabla.");
  }
};
