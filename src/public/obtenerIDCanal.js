document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.querySelector('input[name="url_stream"]');
    const idInput = document.querySelector('input[name="id_canal"]');

    urlInput.addEventListener('blur', async () => {
        const url = urlInput.value.trim();

        if (url) {
            const handle = extractHandle(url);
            if (handle) {
                try {
                    const channelId = await obtenerIdCanal(handle);
                    if (channelId) {
                        idInput.value = channelId;
                    } else {
                        mostrarAlertaManual();
                    }
                } catch (error) {
                    console.error('Error al obtener ID:', error);
                    mostrarAlertaManual();
                }
            } else {
                mostrarAlertaManual();
            }
        }
    });
});

function extractHandle(url) {
    const handleMatch = url.match(/@([a-zA-Z0-9_.-]+)/);
    return handleMatch ? handleMatch[1] : null;
}

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

function mostrarAlertaManual() {
    Swal.fire({
        icon: 'warning',
        title: 'No se encontró el canal',
        text: 'No se pudo obtener el ID del canal automáticamente. Por favor, ingrese el ID manualmente.'
    });
}
