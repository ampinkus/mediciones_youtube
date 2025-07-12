// index.js
import app from './app.js';
import sequelize from './database/database.js';
import iniciarMediciones from '../src/jobs/medicionYoutube.js';
const SERVER_PORT = 7000;

// ✅ Función para iniciar la aplicación
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos exitosa.');

        app.listen(SERVER_PORT, () => {
            console.log(`✅ Servidor funcionando en http://localhost:${SERVER_PORT}`);
        });
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error);
    }
}

// ✅ Iniciar la aplicación
startServer();
iniciarMediciones();

export default app;
