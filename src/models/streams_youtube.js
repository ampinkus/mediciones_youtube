/**
 * Modelo Sequelize: StreamYouTube
 * 
 * Representa un stream de YouTube a medir.
 * 
 * ✅ Campos definidos:
 * - nombre_stream: Nombre descriptivo del stream (ej. "Canal XYZ - Video en Vivo").
 * - url_stream: Enlace directo al video del stream de YouTube.
 * - id_canal: ID único del canal de YouTube asociado al stream.
 * 
 * 📌 Relaciones:
 * - Uno a muchos con MedicionYouTube (un stream puede tener múltiples mediciones).
 */

import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';

const StreamYouTube = sequelize.define('StreamYouTube', {
    nombre_stream: {
        type: DataTypes.STRING,
        allowNull: false
    },
    url_stream: {
        type: DataTypes.STRING,
        allowNull: false
    },
    id_canal: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'streams_youtube',
    timestamps: false
});

import MedicionYouTube from './mediciones_youtube.js';

// 🔁 Relaciones entre modelos:
// Un stream puede tener muchas mediciones.
StreamYouTube.hasMany(MedicionYouTube, { foreignKey: 'streamId' });
MedicionYouTube.belongsTo(StreamYouTube, { foreignKey: 'streamId' });

export default StreamYouTube;
