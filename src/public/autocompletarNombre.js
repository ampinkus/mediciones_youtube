// public/js/autocompletarNombre.js
// se usa en agregarStreamYoutube.ejs

/**
 * Script que autocompleta el campo `nombre_stream` en el formulario
 * de carga de un nuevo stream de YouTube, basándose en la URL ingresada.
 * 
 * Al perder el foco (evento `blur`) en el input de URL, este script
 * realiza una petición al backend (`/youtube/obtener-nombre`) para
 * obtener y completar automáticamente el nombre del stream.
 */

document.addEventListener('DOMContentLoaded', () => {
  const urlInput    = document.getElementById('url_stream');
  const nombreInput = document.getElementById('nombre_stream');
  const canalInput  = document.getElementById('id_canal');

  if (!urlInput || !nombreInput) return;

  urlInput.addEventListener('blur', async () => {
    const url = urlInput.value.trim();
    if (!url) return;

    try {
      const resp = await fetch(`/youtube/obtener-nombre?url=${encodeURIComponent(url)}`);
      const data = await resp.json();

      // ← ahora coincidimos con las claves que devuelve el backend
      if (data.nombre_stream) nombreInput.value = data.nombre_stream;
      if (data.id_canal)      canalInput.value  = data.id_canal;
    } catch (err) {
      console.error('❌ Error autocompletando:', err);
    }
  });
});
