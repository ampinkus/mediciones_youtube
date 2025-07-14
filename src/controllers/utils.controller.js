// utils.controller.js se usa para extraer el ID de un video de YouTube
export function extraerVideoID(url) {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match && match[1] ? match[1] : url.trim();
}
