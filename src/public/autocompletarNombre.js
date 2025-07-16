// public/js/autocompletarNombre.js

/**
 * Script que autocompleta el campo `nombre_stream` en el formulario
 * de carga de un nuevo stream de YouTube, basándose en la URL ingresada.
 * 
 * Al perder el foco (evento `blur`) en el input de URL, este script
 * realiza una petición al backend (`/youtube/obtener-nombre`) para
 * obtener y completar automáticamente el nombre del stream.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Se obtienen los elementos del DOM: URL y Nombre del stream
  const urlInput = document.getElementById("url_stream");
  const nombreInput = document.getElementById("nombre_stream");

  // Si no existen los inputs requeridos, no se hace nada
  if (!urlInput || !nombreInput) return;

  // Evento que se dispara cuando el usuario deja el campo de URL
  urlInput.addEventListener("blur", async () => {
    const url = urlInput.value.trim();

    // Si la URL está vacía, no se realiza la petición
    if (!url) return;

    try {
      // Se hace una petición al backend para obtener el nombre del stream
      const response = await fetch(`/youtube/obtener-nombre?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      // Si el backend retorna un nombre, se autocompleta el campo
      if (data.nombre) {
        nombreInput.value = data.nombre;
      } else {
        // Si hubo un error en la respuesta, se muestra una advertencia
        console.warn("⚠️ No se pudo autocompletar el nombre:", data.error);
      }
    } catch (error) {
      // Si ocurre un error de red o en el fetch, se muestra en consola
      console.error("❌ Error al consultar el nombre del video:", error);
    }
  });
});
