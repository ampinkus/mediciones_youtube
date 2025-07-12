import fetch from 'node-fetch';
import sequelize from '../database/database.js';
import StreamYouTube from '../models/streams_youtube.js';
import ConfiguracionYouTube from '../models/configuracion_youtube.js';

// Mostrar todos los streams
export const verStreams = async (req, res) => {
  try {
    const streams = await StreamYouTube.findAll({
      include: ConfiguracionYouTube,
      order: [['id', 'ASC']]
    });

    res.render('youtube/youtube', { streams });
  } catch (error) {
    console.error('Error al obtener los streams:', error);
    res.status(500).send('Error al obtener los streams.');
  }
};

// Mostrar formulario para agregar stream (con fecha actual por defecto)
export const formularioAgregar = (req, res) => {
  const hoy = new Date().toISOString().split('T')[0];
  res.render('youtube/agregarStreamYoutube', { fechaHoy: hoy });
};

// Función para extraer el ID del video
function extraerVideoID(url) {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Guardar nuevo stream
export const guardarStream = async (req, res) => {
  try {
    const {
      nombre_stream,
      url_stream,
      fecha,
      fecha_final,
      hora_comienzo_medicion,
      hora_fin_medicion,
      intervalo_medicion
    } = req.body;

    const videoID = extraerVideoID(url_stream);

    if (!videoID) {
      return res.render('youtube/agregarStreamYoutube', {
        fechaHoy: new Date().toISOString().split('T')[0],
        error: '❌ No se pudo extraer el ID del video de la URL proporcionada.'
      });
    }

    const apiKey = "AIzaSyDIgZET6RXzONn3Mx8odAFXQYYqBeBbBu0";
    const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoID}&key=${apiKey}`;
    const videoData = await fetch(videoUrl).then(res => res.json());

    const id_canal = videoData.items?.[0]?.snippet?.channelId;

    if (!id_canal) {
      return res.render('youtube/agregarStreamYoutube', {
        fechaHoy: new Date().toISOString().split('T')[0],
        error: '❌ No se pudo obtener el ID del canal desde el video.'
      });
    }

    const nuevoStream = await StreamYouTube.create({
      nombre_stream,
      url_stream,
      id_canal
    });

    await ConfiguracionYouTube.create({
      streamId: nuevoStream.id,
      fecha,
      fecha_final,
      hora_comienzo_medicion,
      hora_fin_medicion,
      intervalo_medicion
    });

    res.redirect('/youtube');
  } catch (error) {
    console.error('Error al guardar el stream:', error);
    res.status(500).send('Error al guardar el stream.');
  }
};
