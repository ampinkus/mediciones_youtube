// src/controllers/graficosYoutube.controller.js
import sequelize from '../database/database.js';
import StreamYouTube from '../models/streams_youtube.js';
import MedicionYouTube from '../models/mediciones_youtube.js';
import { Op } from 'sequelize';
import moment from 'moment';

// Mostrar formulario
export const mostrarFormulario = async (req, res) => {
  const streams = await StreamYouTube.findAll({
    order: [['nombre_stream', 'ASC']]
  });

  res.render('youtube/formularioGraficosYoutube', { streams });
};

// Generar gráfico
export const generarGrafico = async (req, res) => {
  const { streamId, fechaInicio, fechaFin, horaInicio, horaFin } = req.query;

  let condiciones = {};

  // ✅ CORREGIDO: usar formato "DD/MM/YYYY"
  const fechaInicioDate = fechaInicio ? moment(fechaInicio, 'DD/MM/YYYY').toDate() : null;
  const fechaFinDate = fechaFin ? moment(fechaFin, 'DD/MM/YYYY').toDate() : null;

  if (streamId) {
    condiciones.streamId = { [Op.in]: Array.isArray(streamId) ? streamId : [streamId] };
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

  const mediciones = await MedicionYouTube.findAll({
    where: condiciones,
    include: { model: StreamYouTube },
    order: [['fecha', 'ASC'], ['hora_medicion', 'ASC']]
  });

  // Preparar datos por stream
  const datosPorStream = [];
  const streamsUnicos = [...new Set(mediciones.map(m => m.streamId))];

  for (const id of streamsUnicos) {
    const datosFiltrados = mediciones.filter(m => m.streamId === id);

    const labels = datosFiltrados.map(m => {
      const [hh, mm] = m.hora_medicion.split(':');
      const [yyyy, mm1, dd] = m.fecha.split('-');
      return new Date(yyyy, mm1 - 1, dd, hh, mm);
    });

    const data = datosFiltrados.map(m => m.vistas_video);
    const nombreStream = datosFiltrados.length > 0 ? datosFiltrados[0].StreamYouTube.nombre_stream : 'Sin datos';

    datosPorStream.push({ labels, data, nombreStream, streamId: id });
  }

  res.render('youtube/graficosYoutube', { datosPorStream });
};
