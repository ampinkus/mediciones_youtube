// src/database/sync.js

import sequelize from './database.js';

// Importar todos los modelos
import StreamYouTube from '../models/streams_youtube.js';
import MedicionYouTube from '../models/mediciones_youtube.js';
import ConfiguracionYouTube from '../models/configuracion_youtube.js'; // ✅ Asegurate de agregar esto

/**
 * Sincroniza todos los modelos Sequelize con la base de datos.
 *
 * - Verifica la conexión con `sequelize.authenticate()`.
 * - Ejecuta `sequelize.sync({ alter: true })` para sincronizar los modelos existentes
 *   y realizar ajustes si hay cambios en las definiciones.
 * - Cierra la conexión con la base de datos al finalizar el proceso.
 *
 * @async
 * @function syncDatabase
 * @returns {Promise<void>}
 */
async function syncDatabase() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos exitosa.');

        // Sincronizar todos los modelos
        await sequelize.sync({ alter: true });
        console.log('✅ Tablas sincronizadas correctamente.');
    } catch (error) {
        console.error('❌ Error al sincronizar la base de datos:', error);
    } finally {
        await sequelize.close();
    }
}

syncDatabase();
