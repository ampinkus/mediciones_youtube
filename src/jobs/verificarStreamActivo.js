// src/jobs/verificarStreamActivo.js
import fetch from 'node-fetch';

const apiKey = 'YOUR_API_KEY'; // 🔑 Cambiar por tu API Key válida

/**
 * Verifica si un canal de YouTube tiene un stream en vivo activo.
 * @param {string} channelId - ID del canal de YouTube.
 * @returns {Promise<boolean>} - Devuelve true si el canal está en vivo, false si no.
 */
export async function canalEstaEnVivo(channelId) {
    try {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            console.log(`✅ El canal con ID ${channelId} está transmitiendo en vivo.`);
            return true;
        } else {
            console.log(`⏹️ El canal con ID ${channelId} no tiene transmisiones en vivo.`);
            return false;
        }
    } catch (error) {
        console.error('❌ Error al verificar stream en vivo:', error);
        return false;
    }
}
