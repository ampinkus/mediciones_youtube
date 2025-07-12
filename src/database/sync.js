// src/database/sync.js
import sequelize from './database.js';

// Importar todos los modelos
import StreamYouTube from '../models/streams_youtube.js';
import MedicionYouTube from '../models/mediciones_youtube.js';
import ConfiguracionYouTube from '../models/configuracion_youtube.js'; // ✅ Asegurate de agregar esto

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
