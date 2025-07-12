import fetch from "node-fetch";
import sequelize from "../database/database.js";
import StreamYouTube from "../models/streams_youtube.js";
import ConfiguracionYouTube from "../models/configuracion_youtube.js";
import MedicionYouTube from "../models/mediciones_youtube.js";

const apiKey = "AIzaSyDIgZET6RXzONn3Mx8odAFXQYYqBeBbBu0";

const medicionesActivas = new Map();

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
    const now = new Date();
    const hora_medicion = now.toTimeString().split(" ")[0];

    const viewCount = video?.statistics?.viewCount || 0;
    const concurrentViewers =
      video?.liveStreamingDetails?.concurrentViewers || null;

    // ✅ Mostrar información de stream o no stream, separando fecha y hora
    const lsd = video?.liveStreamingDetails;
    if (lsd) {
      console.log("🎥 Este video ES un stream en vivo o lo fue:");

      const formatDateTime = (iso) => {
        if (!iso) return "undefined";
        const [fecha, hora] = iso.split("T");
        return `📅 ${fecha} 🕒 ${hora.replace("Z", "")}`;
      };

      console.log("▶️ actualStartTime:", formatDateTime(lsd.actualStartTime));
      console.log("⏹ actualEndTime:", formatDateTime(lsd.actualEndTime));
      console.log(
        "🕓 scheduledStartTime:",
        formatDateTime(lsd.scheduledStartTime)
      );
      console.log("🕘 scheduledEndTime:", formatDateTime(lsd.scheduledEndTime));
    } else {
      console.log("❌ Este video NO es un stream en vivo.");
    }

    await MedicionYouTube.create({
      streamId: stream.id,
      fecha: stream.ConfiguracionYouTube.fecha,
      hora_medicion,
      suscriptores_canal: channel?.statistics?.subscriberCount || 0,
      cantidad_videos_canal: channel?.statistics?.videoCount || 0,
      vistas_canal: channel?.statistics?.viewCount || 0,
      view_count: viewCount,
      concurrent_viewers: concurrentViewers,
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
      include: { model: ConfiguracionYouTube },
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

  setTimeout(supervisor, 60 * 1000); // Supervisor corre cada 60 segundos
}

async function medirStreamConTimeout(stream) {
  try {
    const streamActualizado = await StreamYouTube.findByPk(stream.id, {
      include: { model: ConfiguracionYouTube },
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
      fecha, // fecha de inicio
      fecha_final, // fecha de fin
    } = config;

    const ahora = new Date();
    const hoy = ahora.toISOString().split("T")[0]; // yyyy-mm-dd

    // ✅ Verificar si hoy está dentro del rango [fecha, fecha_final]
    if (hoy < fecha || hoy > fecha_final) {
      console.log(
        `⏰ Medición no realizada para ${streamActualizado.nombre_stream}: fuera del rango de fechas (${fecha} a ${fecha_final}). Hoy es ${hoy}.`
      );

      console.log(
        `🔄 Próxima medición en 120 segundos para ${streamActualizado.nombre_stream}`
      );

      return setTimeout(
        () => medirStreamConTimeout(streamActualizado),
        120 * 1000
      );
    }

    const [inicioHoras, inicioMinutos, inicioSegundos] = hora_comienzo_medicion
      .split(":")
      .map(Number);
    const [finHoras, finMinutos, finSegundos] = hora_fin_medicion
      .split(":")
      .map(Number);

    const inicio = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate(),
      inicioHoras,
      inicioMinutos,
      inicioSegundos
    );
    const fin = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate(),
      finHoras,
      finMinutos,
      finSegundos
    );

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
    supervisor(); // Iniciar el supervisor
  } catch (error) {
    console.error("❌ Error al iniciar mediciones:", error);
  }
}

// ✅ Esta función extrae el ID del video desde una URL de YouTube
function extraerVideoID(url) {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match && match[1] ? match[1] : url.trim();
}

export default iniciarMediciones;
