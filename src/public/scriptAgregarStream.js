// public/scriptAgregarStream.js

const apiKey = 'AIzaSyDIgZET6RXzONn3Mx8odAFXQYYqBeBbBu0'; // Reemplazalo por tu API KEY real

async function autocompletarIdCanal() {
    const urlInput = document.getElementById('url_stream').value.trim();
    const idInput = document.getElementById('id_canal');

    try {
        const channelId = await obtenerChannelIdDesdeURL(urlInput);
        idInput.value = channelId;
    } catch (error) {
        alert('No se pudo obtener el ID del canal: ' + error.message);
    }
}

async function obtenerChannelIdDesdeURL(url) {
    let match = url.match(/youtube\.com\/channel\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
        return match[1];
    }

    match = url.match(/youtube\.com\/user\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
        return await obtenerIdDesdeUsername(match[1]);
    }

    match = url.match(/youtube\.com\/@([a-zA-Z0-9._-]+)/);
    if (match && match[1]) {
        return await obtenerIdDesdeHandle('@' + match[1]);
    }

    throw new Error('Formato de URL no reconocido.');
}

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

async function obtenerIdDesdeHandle(handle) {
    // ✅ Búsqueda por nombre de canal (handle)
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${handle}&key=${apiKey}`;
    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
        return data.items[0].snippet.channelId;
    } else {
        throw new Error('No se encontró canal para ese handle.');
    }
}
