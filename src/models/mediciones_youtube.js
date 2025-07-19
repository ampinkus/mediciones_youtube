/**
 * Modelo Sequelize: MedicionYouTube
 * 
 * Representa una medición puntual de un stream de YouTube.
 * Cada registro corresponde a una observación realizada en una fecha y hora específica.
 * 
 * ✅ Campos definidos:
 * - streamId: ID del stream asociado (clave foránea hacia streams_youtube).
 * - fecha: Fecha en la que se realizó la medición (YYYY-MM-DD).
 * - hora_medicion: Hora exacta de la medición (HH:mm:ss).
 * - suscriptores_canal: Cantidad total de suscriptores del canal en el momento de la medición.
 * - cantidad_videos_canal: Total de videos en el canal.
 * - vistas_canal: Cantidad total de vistas del canal.
 * - view_count: Cantidad de vistas del video en vivo.
 * - concurrent_viewers: Espectadores concurrentes (si está disponible).
 * - likes_video: Total de likes del video.
 * - comentarios_video: Total de comentarios del video.
 * 
 * 📌 Relaciones:
 * - Muchos a uno con StreamYouTube (por medio de streamId).
 * 
 * Este modelo se utiliza en `medicionYoutube.js` para registrar estadísticas durante la transmisión.
 */

import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';
import StreamYouTube from './streams_youtube.js'; // La ruta es correcta

const MedicionYouTube = sequelize.define('MedicionYouTube', {
    streamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'streams_youtube',
            key: 'id'
        }
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    hora_medicion: {
        type: DataTypes.TIME,
        allowNull: false
    },
    suscriptores_canal: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    cantidad_videos_canal: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    vistas_canal: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    view_count: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    concurrent_viewers: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    likes_video: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    comentarios_video: {
        type: DataTypes.BIGINT,
        allowNull: false
    }
}, {
    tableName: 'mediciones_youtube',
    timestamps: false
});

export default MedicionYouTube;
