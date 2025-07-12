// src/models/mediciones_youtube.js
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
    vistas_video: {
        type: DataTypes.BIGINT,
        allowNull: false
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
