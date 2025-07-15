/**
 * graficosYoutube.controller.js
 *
 * Este controlador maneja:
 * - La visualización del formulario para generar gráficos.
 * - El procesamiento de filtros de fecha, hora y stream para consultas.
 * - La organización de los datos de medición para ser enviados al gráfico.
 * - La renderización de gráficos usando los datos agrupados por stream.
 */

import sequelize from '../database/database.js';
import StreamYouTube from '../models/streams_youtube.js';
import MedicionYouTube from '../models/mediciones_youtube.js';
import { Op } from 'sequelize';
import moment from 'moment';

/**
 * Muestra el formulario para seleccionar streams, fechas y horas para generar gráficos.
 *
 * @function mostrarFormulario
 * @async
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
export const mostrarFormulario = async (req, res) => {
  const streams = await StreamYouTube.findAll({
    order: [['nombre_stream', 'ASC']]
  });

  // Renderiza el formulario con la lista de streams ordenados alfabéticamente
  res.render('youtube/formularioGraficosYoutube', { streams });
};

/**
 * Procesa la solicitud del formulario y genera los datos necesarios para los gráficos.
 *
 * @function generarGrafico
 * @async
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
export const generarGrafico = async (req, res) => {
  const { streamId, fechaInicio, fechaFin, horaInicio, horaFin } = req.query;

  let condiciones = {};

  // Convierte las fechas desde formato DD/MM/YYYY a objetos Date
  const fechaInicioDate = fechaInicio ? moment(fechaInicio, 'DD/MM/YYYY').toDate() : null;
  const fechaFinDate = fechaFin ? moment(fechaFin, 'DD/MM/YYYY').toDate() : null;

  // Condición: uno o varios streams
  if (streamId) {
    condiciones.streamId = { [Op.in]: Array.isArray(streamId) ? streamId : [streamId] };
  }

  // Condición: por fecha
  if (fechaInicioDate && fechaFinDate) {
    condiciones.fecha = { [Op.between]: [fechaInicioDate, fechaFinDate] };
  } else if (fechaInicioDate) {
    condiciones.fecha = { [Op.gte]: fechaInicioDate };
  } else if (fechaFinDate) {
    condiciones.fecha = { [Op.lte]: fechaFinDate };
  }

  // Condición: por hora
  if (horaInicio && horaFin) {
    condiciones.hora_medicion = { [Op.between]: [horaInicio, horaFin] };
  } else if (horaInicio) {
    condiciones.hora_medicion = { [Op.gte]: horaInicio };
  } else if (horaFin) {
    condiciones.hora_medicion = { [Op.lte]: horaFin };
  }

  // Busca las mediciones en base a las condiciones definidas
  const mediciones = await MedicionYouTube.findAll({
    where: condiciones,
    include: { model: StreamYouTube },
    order: [['fecha', 'ASC'], ['hora_medicion', 'ASC']]
  });

  const datosPorStream = [];
  const streamsUnicos = [...new Set(mediciones.map(m => m.streamId))];

  for (const id of streamsUnicos) {
    // Filtra las mediciones correspondientes a cada stream
    const datosFiltrados = mediciones.filter(m => m.streamId === id);

    // Construye las etiquetas para el eje X a partir de fecha y hora
    const labels = datosFiltrados.map(m => {
      const [hh, mm] = m.hora_medicion.split(':');
      const [yyyy, mm1, dd] = m.fecha.split('-');
      return new Date(yyyy, mm1 - 1, dd, hh, mm);
    });

    // Extrae los datos de view_count (vistas)
    const data = datosFiltrados.map(m => m.view_count);

    // Obtiene el nombre del stream
    const nombreStream = datosFiltrados.length > 0 ? datosFiltrados[0].StreamYouTube.nombre_stream : 'Sin datos';

    // Agrega los datos organizados al array final
    datosPorStream.push({ labels, data, nombreStream, streamId: id });
  }

  // Renderiza la vista con los datos de los gráficos
  res.render('youtube/graficosYoutube', { datosPorStream });
};
