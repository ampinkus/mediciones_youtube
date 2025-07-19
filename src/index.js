/**
 * @file index.js
 * @module server
 * @description Archivo principal para levantar el servidor.
 *
 * - Conecta con la base de datos usando Sequelize.
 * - Inicia el servidor Express.
 * - Inicia las tareas programadas (como mediciones periódicas de YouTube).
 *
 * @requires ./app.js
 * @requires ./database/database.js
 * @requires ./jobs/medicionYoutube.js
 */

import app from './app.js';
import sequelize from './database/database.js';
import iniciarMediciones from '../src/jobs/medicionYoutube.js';

const SERVER_PORT = 7000;

/**
 * Inicia la aplicación Express y verifica la conexión a la base de datos.
 * 
 * @async
 * @function startServer
 * @returns {Promise<void>}
 */
async function startServer() {
    try {
        await sequelize.authenticate(); // Testea la conexión con la base de datos
        console.log('✅ Conexión a la base de datos exitosa.');

        app.listen(SERVER_PORT, () => {
            console.log(`✅ Servidor funcionando en http://localhost:${SERVER_PORT}`);
        });
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error);
    }
}

// Llama a la función que arranca el servidor
startServer();

// Lanza las mediciones automáticas de YouTube
iniciarMediciones();

export default app;
