// src/database/database.js

import { Sequelize } from 'sequelize';

/**
 * ✅ Configuración de conexión a la base de datos PostgreSQL.
 *
 * Se utiliza para conectar el sistema a la base de datos `medicion_redes` en el host local.
 * Este objeto Sequelize se importa en los modelos y controladores que requieren acceso a la base.
 *
 * @constant {Sequelize}
 */
const sequelize = new Sequelize('medicion_redes', 'postgres', 'Hammil_01', {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: false,
});

export default sequelize;
