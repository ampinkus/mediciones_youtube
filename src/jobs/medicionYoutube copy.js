// src/jobs/medicionYoutube.js
import fetch from "node-fetch";
import sequelize from "../database/database.js";
import StreamYouTube from "../models/streams_youtube.js";
import ConfiguracionYouTube from "../models/configuracion_youtube.js";
import MedicionYouTube from "../models/mediciones_youtube.js";
import { extraerVideoID } from "../controllers/utils.controller.js";
import { DateTime } from "luxon";

import { apiKey } from "../config/youtube.config.js";
const medicionesActivas = new Map();

function convertirAHoraArgentina(utcString) {
  if (!utcString) return null;
  return DateTime.fromISO(utcString, { zone: 'utc' })
    .setZone('America/Argentina/Buenos_Aires')
    .toFormat('HH:mm:ss');
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

    const config = await ConfiguracionYouTube.findOne({
      where: { streamId: stream.id },
    });

    const actualStartTime = lsd?.actualStartTime || null;
    const actualEndTime = lsd?.actualEndTime || null;
    const concurrentViewers = lsd?.concurrentViewers
      ? parseInt(lsd.concurrentViewers)
      : 0;

    console.log("📡 Respuesta de YouTube API:");
    console.log(`🔹 actualStartTime: ${actualStartTime}`);
    console.log(`🔹 actualEndTime: ${actualEndTime}`);
    console.log(`👁️ Espectadores concurrentes: ${concurrentViewers}`);

    if (lsd && config) {
      const horaStart = convertirAHoraArgentina(lsd.actualStartTime);
      const horaEnd = convertirAHoraArgentina(lsd.actualEndTime);

      await ConfiguracionYouTube.update(
        {
          actual_start_time: horaStart,
          actual_end_time: horaEnd,
        },
        { where: { streamId: stream.id } }
      );
    } else {
      console.warn(
        `⚠️ No se encontró configuración para el stream ${stream.nombre_stream}, no se actualizan horas reales`
      );
    }

    // ✅ Usar Luxon para obtener fecha y hora local (Argentina)
    const ahoraArgentina = DateTime.now().setZone("America/Argentina/Buenos_Aires");
    const fechaLocal = ahoraArgentina.toISODate();           // "2025-07-18"
    const horaActual = ahoraArgentina.toFormat("HH:mm:ss");  // "22:13:41"

    // ✅ Diagnóstico
    const fechaHoraArgentina = ahoraArgentina.toFormat("yyyy-MM-dd HH:mm:ss");
    console.log("→ Fecha/hora local (Argentina):", fechaHoraArgentina);

    await MedicionYouTube.create({
      streamId: stream.id,
      fecha: fechaLocal,
      hora_medicion: horaActual,
      suscriptores_canal: parseInt(channel.statistics.subscriberCount || 0),
      cantidad_videos_canal: parseInt(channel.statistics.videoCount || 0),
      vistas_canal: parseInt(channel.statistics.viewCount || 0),
      view_count: parseInt(video.statistics.viewCount || 0),
      likes_video: parseInt(video.statistics.likeCount || 0),
      comentarios_video: parseInt(video.statistics.commentCount || 0),
      actual_start_time: stream.ConfiguracionYouTube?.actual_start_time || null,
      actual_end_time: stream.ConfiguracionYouTube?.actual_end_time || null,
      concurrent_viewers: concurrentViewers,
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
      if (!stream.ConfiguracionYouTube) {
        console.warn(
          `⚠️ Stream ${stream.nombre_stream} no tiene configuración`
        );
        return;
      }

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

    if (!streamActualizado || !streamActualizado.ConfiguracionYouTube) {
      console.warn(
        `⚠️ El stream con ID ${stream.id} no tiene configuración asociada o no existe`
      );
      return;
    }

    const config = streamActualizado.ConfiguracionYouTube;

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
    const hoy = DateTime.now()
      .setZone("America/Argentina/Buenos_Aires")
      .toISODate(); // YYYY-MM-DD según hora Argentina

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
        () => medirStreamConTimeout({ id: streamActualizado.id }),
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
          () => medirStreamConTimeout({ id: streamActualizado.id }),
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

      console.log("📡 Respuesta de YouTube API:");
      console.log(`🔹 actualStartTime: ${startTime}`);
      console.log(`🔹 actualEndTime: ${endTime}`);

      if (!startTime || !endTime) {
        console.log(
          `❌ No se pudo obtener actualStartTime o actualEndTime para ${streamActualizado.nombre_stream}. Se pospone.`
        );
        return setTimeout(
          () => medirStreamConTimeout({ id: streamActualizado.id }),
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
      () => medirStreamConTimeout({ id: streamActualizado.id }),
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
