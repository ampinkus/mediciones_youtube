// public/js/autocompletarNombre.js
document.addEventListener("DOMContentLoaded", () => {
  const urlInput = document.getElementById("url_stream");
  const nombreInput = document.getElementById("nombre_stream");

  if (!urlInput || !nombreInput) return;

  urlInput.addEventListener("blur", async () => {
    const url = urlInput.value.trim();

    if (!url) return;

    try {
      const response = await fetch(`/youtube/obtener-nombre?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (data.nombre) {
        nombreInput.value = data.nombre;
      } else {
        console.warn("⚠️ No se pudo autocompletar el nombre:", data.error);
      }
    } catch (error) {
      console.error("❌ Error al consultar el nombre del video:", error);
    }
  });
});
