// obtenerCanal.js
// No esta en uso por ahora, pero se deja como referencia para futuras implementaciones

/**
 * Script que detecta automáticamente el ID de canal de YouTube a partir de un enlace con un `handle`.
 * Al perder el foco del input de URL, intenta obtener el ID del canal y completar el campo correspondiente.
 * Si no lo logra, muestra una alerta para que el usuario lo introduzca manualmente.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Se obtienen los campos de entrada para la URL del stream y el ID del canal
    const urlInput = document.querySelector('input[name="url_stream"]');
    const idInput = document.querySelector('input[name="id_canal"]');

    // Evento: al perder el foco del campo URL
    urlInput.addEventListener('blur', async () => {
        const url = urlInput.value.trim();

        if (url) {
            const handle = extractHandle(url); // Extrae el handle del enlace
            if (handle) {
                try {
                    // Llama a la función para obtener el ID de canal desde el handle
                    const channelId = await obtenerIdCanal(handle);
                    if (channelId) {
                        idInput.value = channelId; // Completa el campo con el ID obtenido
                    } else {
                        mostrarAlertaManual(); // Si no se obtiene, muestra alerta
                    }
                } catch (error) {
                    console.error('Error al obtener ID:', error);
                    mostrarAlertaManual(); // Muestra alerta ante errores
                }
            } else {
                mostrarAlertaManual(); // Si no se detecta el handle, muestra alerta
            }
        }
    });
});

/**
 * Extrae el handle de un enlace de YouTube en formato @handle.
 * @param {string} url - La URL del stream ingresada por el usuario.
 * @returns {string|null} - El handle extraído o null si no se encuentra.
 */
function extractHandle(url) {
    const handleMatch = url.match(/@([a-zA-Z0-9_.-]+)/);
    return handleMatch ? handleMatch[1] : null;
}

/**
 * Llama a la API de YouTube para obtener el ID de canal a partir de un handle.
 * @param {string} handle - El handle extraído de la URL del stream.
 * @returns {Promise<string|null>} - Retorna el ID del canal si se encuentra, o null en caso contrario.
 */
async function obtenerIdCanal(handle) {
    const apiKey = 'AIzaSyDIgZET6RXzONn3Mx8odAFXQYYqBeBbBu0';
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${handle}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
        return data.items[0].snippet.channelId;
    }
    return null;
}

/**
 * Muestra una alerta con SweetAlert indicando que no se pudo obtener el ID del canal.
 * Se sugiere al usuario que lo introduzca manualmente.
 */
function mostrarAlertaManual() {
    Swal.fire({
        icon: 'warning',
        title: 'No se encontró el canal',
        text: 'No se pudo obtener el ID del canal automáticamente. Por favor, ingrese el ID manualmente.'
    });
}
