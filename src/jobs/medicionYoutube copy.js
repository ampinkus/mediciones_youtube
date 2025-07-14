// src/jobs/medicionYoutube.js
import fetch from "node-fetch";
import sequelize from "../database/database.js";
import StreamYouTube from "../models/streams_youtube.js";
import ConfiguracionYouTube from "../models/configuracion_youtube.js";
import MedicionYouTube from "../models/mediciones_youtube.js";

const apiKey = "AIzaSyDIgZET6RXzONn3Mx8odAFXQYYqBeBbBu0";
const medicionesActivas = new Map();

function extraerVideoID(url) {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match && match[1] ? match[1] : url.trim();
}

async function obtenerDatosYouTube(stream) {
  try {
    const videoID = extraerVideoID(stream.url_stream);
    const channelID = stream.id_canal;

    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${channelID}&key=${apiKey}`;
    const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,liveStreamingDetails&id=${videoID}&key=${apiKey}`;

    const [channelResponse, videoResponse] = await Promise.all([
      fetch(channelUrl).then((res) => res.json()),
      fetch(videoUrl).then((res) => res.json()),
    ]);

    const channel = channelResponse.items?.[0];
    const video = videoResponse.items?.[0];
    const lsd = video?.liveStreamingDetails;
    const now = new Date();
    const hora_medicion = now.toTimeString().split(" ")[0];

    // 🔄 Cargar configuración actualizada de la DB
    const config = await ConfiguracionYouTube.findOne({
      where: { streamId: stream.id },
    });

    // ✅ Actualizar actual_start_time y actual_end_time si existe config
    if (lsd && config) {
      await ConfiguracionYouTube.update(
        {
          actual_start_time: lsd.actualStartTime || null,
          actual_end_time: lsd.actualEndTime || null,
        },
        { where: { streamId: stream.id } }
      );
    }

    await MedicionYouTube.create({
      streamId: stream.id,
      fecha: config?.fecha || new Date(), // fallback para evitar error
      hora_medicion,
      suscriptores_canal: channel?.statistics?.subscriberCount || 0,
      cantidad_videos_canal: channel?.statistics?.videoCount || 0,
      vistas_canal: channel?.statistics?.viewCount || 0,
      view_count: video?.statistics?.viewCount || 0,
      concurrent_viewers: lsd?.concurrentViewers || null,
      likes_video: video?.statistics?.likeCount || 0,
      comentarios_video: video?.statistics?.commentCount || 0,
    });

    console.log(
      `✅ Medición guardada para: ${stream.nombre_stream} (${videoID})`
    );
  } catch (error) {
    console.error(
      `❌ Error al obtener datos para ${stream.nombre_stream}:`,
      error
    );
  }
}

async function supervisor() {
  try {
    const streams = await StreamYouTube.findAll({
      include: ConfiguracionYouTube,
    });

    streams.forEach((stream) => {
      if (!stream.ConfiguracionYouTube) return;

      if (
        stream.ConfiguracionYouTube.activo &&
        !medicionesActivas.has(stream.id)
      ) {
        console.log(
          `🚀 Iniciando medición dinámica para ${stream.nombre_stream}`
        );
        medicionesActivas.set(stream.id, true);
        medirStreamConTimeout(stream);
      }
    });
  } catch (error) {
    console.error("❌ Error en supervisor:", error);
  }

  setTimeout(supervisor, 60 * 1000);
}

async function medirStreamConTimeout(stream) {
  try {
    const streamActualizado = await StreamYouTube.findByPk(stream.id, {
      include: ConfiguracionYouTube,
    });

    const config = streamActualizado.ConfiguracionYouTube;
    if (!config) {
      console.log(
        `⚠️ No hay configuración para ${streamActualizado.nombre_stream}.`
      );
      return;
    }

    const {
      hora_comienzo_medicion,
      hora_fin_medicion,
      intervalo_medicion,
      activo,
      fecha,
      fecha_final,
    } = config;

    const usarHoraStream = config.usar_hora_stream === true;

    const ahora = new Date();
    const hoy = ahora.toISOString().split("T")[0];

    if (hoy < fecha || (fecha_final && hoy > fecha_final)) {
      console.log(
        `⏰ Medición no realizada para ${
          streamActualizado.nombre_stream
        }: fuera del rango de fechas (${fecha} a ${
          fecha_final || "∞"
        }). Hoy es ${hoy}.`
      );
      console.log(
        `🔄 Próxima medición en 120 segundos para ${streamActualizado.nombre_stream}`
      );
      return setTimeout(
        () => medirStreamConTimeout(streamActualizado),
        120 * 1000
      );
    }

    let inicio, fin;

    if (!usarHoraStream) {
      if (!hora_comienzo_medicion || !hora_fin_medicion) {
        console.log(
          `⚠️ Horarios manuales no definidos correctamente para ${streamActualizado.nombre_stream}. Se pospone.`
        );
        return setTimeout(
          () => medirStreamConTimeout(streamActualizado),
          120 * 1000
        );
      }

      const [inicioHoras, inicioMinutos, inicioSegundos = 0] =
        hora_comienzo_medicion.split(":").map(Number);
      const [finHoras, finMinutos, finSegundos = 0] = hora_fin_medicion
        .split(":")
        .map(Number);

      inicio = new Date(
        ahora.getFullYear(),
        ahora.getMonth(),
        ahora.getDate(),
        inicioHoras,
        inicioMinutos,
        inicioSegundos
      );
      fin = new Date(
        ahora.getFullYear(),
        ahora.getMonth(),
        ahora.getDate(),
        finHoras,
        finMinutos,
        finSegundos
      );

      console.log(`⏱️ Usando horario definido manualmente por el usuario`);
    } else {
      const videoID = extraerVideoID(streamActualizado.url_stream);
      const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoID}&key=${apiKey}`;
      const videoResponse = await fetch(videoUrl).then((res) => res.json());
      const video = videoResponse.items?.[0];

      const startTime = video?.liveStreamingDetails?.actualStartTime;
      const endTime = video?.liveStreamingDetails?.actualEndTime;

      if (!startTime || !endTime) {
        console.log(
          `❌ No se pudo obtener actualStartTime o actualEndTime para ${streamActualizado.nombre_stream}. Se pospone.`
        );
        return setTimeout(
          () => medirStreamConTimeout(streamActualizado),
          120 * 1000
        );
      }

      inicio = new Date(startTime);
      fin = new Date(endTime);

      console.log(`⏱️ Usando horario obtenido desde YouTube (API)`);
    }

    console.log(`⏰ Hora actual: ${ahora.toTimeString().split(" ")[0]}`);
    console.log(`⏱️ Inicio: ${inicio.toTimeString().split(" ")[0]}`);
    console.log(`⏱️ Fin: ${fin.toTimeString().split(" ")[0]}`);

    let proximoIntervalo = 30 * 1000;

    if (ahora >= inicio && ahora <= fin && activo) {
      console.log(
        `✅ Dentro del horario. Ejecutando medición para ${streamActualizado.nombre_stream}`
      );
      await obtenerDatosYouTube(streamActualizado);
      proximoIntervalo = intervalo_medicion * 60 * 1000;
    } else {
      console.log(
        `⏰ Medición no realizada para ${streamActualizado.nombre_stream}: fuera del rango horario o stream detenido.`
      );
    }

    console.log(
      `🔄 Próxima medición en ${proximoIntervalo / 1000} segundos para ${
        streamActualizado.nombre_stream
      }`
    );
    setTimeout(
      () => medirStreamConTimeout(streamActualizado),
      proximoIntervalo
    );
  } catch (error) {
    console.error("❌ Error en medición dinámica:", error);
  }
}

async function iniciarMediciones() {
  try {
    await sequelize.authenticate();
    console.log("✅ Conectado a la base de datos para iniciar mediciones.");
    supervisor();
  } catch (error) {
    console.error("❌ Error al iniciar mediciones:", error);
  }
}

export default iniciarMediciones;
