// src/database/database.js
import { Sequelize } from 'sequelize';

// ✅ Configuración de conexión a PostgreSQL
const sequelize = new Sequelize('youtube_gervasio', 'postgres', 'Hammil_01', {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: false
});

export default sequelize;
