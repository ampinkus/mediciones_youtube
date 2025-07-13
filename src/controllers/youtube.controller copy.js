// src/controllers/youtube.controller.js
import sequelize from "../database/database.js";
import StreamYouTube from "../models/streams_youtube.js";
import ConfiguracionYouTube from "../models/configuracion_youtube.js";
import moment from "moment";

function formatearFecha(fechaISO) {
  if (!fechaISO) return null;
  const fecha = new Date(fechaISO);
  const dia = String(fecha.getUTCDate()).padStart(2, "0");
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0");
  const anio = fecha.getUTCFullYear();
  return `${dia}/${mes}/${anio}`;
}

function formatearHora(horaCompleta) {
  if (!horaCompleta) return "";
  const [hh, mm] = horaCompleta.split(":");
  return `${hh}:${mm}`;
}

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
        config.hora_comienzo_medicion = formatearHora(config.hora_comienzo_medicion);
        config.hora_fin_medicion = formatearHora(config.hora_fin_medicion);
      }
    });

    res.render("youtube/youtube", { streams });
  } catch (error) {
    console.error("Error al obtener los streams:", error);
    res.status(500).send("Error al obtener los streams.");
  }
};

export const formularioAgregar = (req, res) => {
  const hoy = new Date();
  const dia = String(hoy.getDate()).padStart(2, "0");
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const anio = hoy.getFullYear();
  const fechaHoy = `${dia}/${mes}/${anio}`;

  res.render("youtube/agregarStreamYoutube", { fechaHoy });
};

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
      usar_hora_stream,
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

    await ConfiguracionYouTube.create({
      streamId: nuevoStream.id,
      fecha: fechaInicioISO,
      fecha_final: fechaFinalISO,
      hora_comienzo_medicion: hora_comienzo_medicion || null,
      hora_fin_medicion: hora_fin_medicion || null,
      intervalo_medicion,
      activo: true,
      usar_hora_stream: usar_hora_stream === "true",
    });

    res.redirect("/youtube");
  } catch (error) {
    console.error("Error al guardar el stream:", error);
    res.status(500).send("Error al guardar el stream");
  }
};

// Ver stream individual
export const verStream = async (req, res) => {
  const { id } = req.params;

  try {
    const stream = await StreamYouTube.findByPk(id, {
      include: ConfiguracionYouTube,
    });

    if (!stream) {
      return res.status(404).send("Stream no encontrado");
    }

    if (stream.ConfiguracionYouTube) {
      stream.ConfiguracionYouTube.fecha_formateada = formatearFecha(
        stream.ConfiguracionYouTube.fecha
      );
      stream.ConfiguracionYouTube.fecha_final_formateada = formatearFecha(
        stream.ConfiguracionYouTube.fecha_final
      );
      stream.ConfiguracionYouTube.hora_comienzo_medicion = formatearHora(
        stream.ConfiguracionYouTube.hora_comienzo_medicion
      );
      stream.ConfiguracionYouTube.hora_fin_medicion = formatearHora(
        stream.ConfiguracionYouTube.hora_fin_medicion
      );
    }

    res.render("youtube/verStreamYoutube", { stream });
  } catch (error) {
    console.error("Error al buscar el stream:", error);
    res.status(500).send("Error interno del servidor");
  }
};

export const formularioEditar = async (req, res) => {
  try {
    const { id } = req.params;

    const stream = await StreamYouTube.findByPk(id, {
      include: ConfiguracionYouTube,
    });

    if (!stream) {
      return res.status(404).send("Stream no encontrado.");
    }

    if (stream.ConfiguracionYouTube) {
      stream.ConfiguracionYouTube.fecha_formateada = formatearFecha(
        stream.ConfiguracionYouTube.fecha
      );
      stream.ConfiguracionYouTube.fecha_final_formateada = formatearFecha(
        stream.ConfiguracionYouTube.fecha_final
      );
      stream.ConfiguracionYouTube.hora_comienzo_medicion = formatearHora(
        stream.ConfiguracionYouTube.hora_comienzo_medicion
      );
      stream.ConfiguracionYouTube.hora_fin_medicion = formatearHora(
        stream.ConfiguracionYouTube.hora_fin_medicion
      );
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

export const actualizarStream = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      url,
      id_canal,
      fecha_inicial,
      fecha_final,
      hora_comienzo_medicion,
      hora_fin_medicion,
      intervalo_medicion,
      usar_hora_stream,
    } = req.body;

    console.log("📥 Body recibido:", req.body);

    await StreamYouTube.update(
      { nombre_stream: nombre, url_stream: url, id_canal: id_canal },
      { where: { id } }
    );

    const fechaInicialDate = moment(fecha_inicial, "DD/MM/YYYY", true).isValid()
      ? moment(fecha_inicial, "DD/MM/YYYY").toDate()
      : null;

    const fechaFinalDate =
      fecha_final && moment(fecha_final, "DD/MM/YYYY", true).isValid()
        ? moment(fecha_final, "DD/MM/YYYY").toDate()
        : null;

    if (!fechaInicialDate) {
      console.error("❌ Fecha inicial inválida");
      return res.status(400).send("Formato de fecha inválido");
    }

    const usarHoraStream = usar_hora_stream === "true";

    await ConfiguracionYouTube.update(
      {
        fecha: fechaInicialDate,
        fecha_final: fechaFinalDate,
        hora_comienzo_medicion: hora_comienzo_medicion?.trim() || null,
        hora_fin_medicion: hora_fin_medicion?.trim() || null,
        intervalo_medicion: intervalo_medicion ? parseInt(intervalo_medicion) : null,
        usar_hora_stream: usarHoraStream,
      },
      { where: { streamId: id } }
    );

    res.redirect("/youtube");
  } catch (error) {
    console.error("Error al actualizar el stream:", error);
    res.status(500).send("Error al actualizar el stream.");
  }
};

export const eliminarStream = async (req, res) => {
  try {
    const { id } = req.params;

    await ConfiguracionYouTube.destroy({ where: { streamId: id } });
    await StreamYouTube.destroy({ where: { id } });

    res.redirect("/youtube");
  } catch (error) {
    console.error("Error al eliminar el stream:", error);
    res.status(500).send("Error al eliminar el stream.");
  }
};

export const toggleStream = async (req, res) => {
  const { id } = req.params;

  try {
    const configuracion = await ConfiguracionYouTube.findOne({
      where: { streamId: id },
    });

    if (!configuracion) {
      return res.status(404).send("Configuración no encontrada");
    }

    configuracion.activo = !configuracion.activo;
    await configuracion.save();

    res.redirect("/youtube");
  } catch (error) {
    console.error("Error al alternar el estado del stream:", error);
    res.status(500).send("Error al cambiar el estado del stream.");
  }
};
