// public/scriptAgregarStream.js
//  No se usa actualmente, pero se deja como referencia para futuras implementaciones

// Clave de la API de YouTube, necesaria para hacer llamadas a la API.
// ⚠️ Reemplazar por una clave válida antes de producción.
const apiKey = 'AIzaSyDIgZET6RXzONn3Mx8odAFXQYYqBeBbBu0'; // Reemplazalo por tu API KEY real

/**
 * Función que intenta autocompletar el campo "id_canal" al ingresar una URL de YouTube.
 * Se invoca generalmente al perder el foco del campo de URL.
 */
async function autocompletarIdCanal() {
    const urlInput = document.getElementById('url_stream').value.trim(); // Obtiene el valor ingresado en el campo de URL
    const idInput = document.getElementById('id_canal'); // Campo donde se colocará el ID del canal

    try {
        const channelId = await obtenerChannelIdDesdeURL(urlInput); // Intenta extraer el ID desde la URL
        idInput.value = channelId; // Completa el input con el ID del canal
    } catch (error) {
        alert('No se pudo obtener el ID del canal: ' + error.message); // Muestra error si no se puede obtener
    }
}

/**
 * Dado un enlace de YouTube, intenta extraer el ID del canal mediante distintos patrones posibles:
 * - /channel/ID
 * - /user/username
 * - /@handle
 * @param {string} url - La URL de YouTube ingresada por el usuario
 * @returns {Promise<string>} - Devuelve el ID del canal o lanza un error si no se reconoce el formato
 */
async function obtenerChannelIdDesdeURL(url) {
    // Caso 1: URL del tipo /channel/ID
    let match = url.match(/youtube\.com\/channel\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
        return match[1];
    }

    // Caso 2: URL del tipo /user/username
    match = url.match(/youtube\.com\/user\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
        return await obtenerIdDesdeUsername(match[1]); // Consulta la API con el username
    }

    // Caso 3: URL del tipo /@handle
    match = url.match(/youtube\.com\/@([a-zA-Z0-9._-]+)/);
    if (match && match[1]) {
        return await obtenerIdDesdeHandle('@' + match[1]); // Consulta la API con el handle
    }

    // Si ningún patrón coincide, lanza error
    throw new Error('Formato de URL no reconocido.');
}

/**
 * Obtiene el ID de un canal de YouTube utilizando su username (antiguo formato de canales).
 * @param {string} username - Username público del canal
 * @returns {Promise<string>} - ID del canal
 */
async function obtenerIdDesdeUsername(username) {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${username}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
        return data.items[0].id;
    } else {
        throw new Error('No se encontró canal para ese username.');
    }
}

/**
 * Obtiene el ID del canal utilizando un "handle" (nuevo formato de identificador en URLs de YouTube).
 * @param {string} handle - Handle precedido por @ (ej: @nombreCanal)
 * @returns {Promise<string>} - ID del canal
 */
async function obtenerIdDesdeHandle(handle) {
    // ✅ Búsqueda por nombre de canal (handle) usando la API de búsqueda
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${handle}&key=${apiKey}`;
    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
        return data.items[0].snippet.channelId;
    } else {
        throw new Error('No se encontró canal para ese handle.');
    }
}
