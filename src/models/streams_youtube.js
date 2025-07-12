// src/models/streams_youtube.js
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

StreamYouTube.hasMany(MedicionYouTube, { foreignKey: 'streamId' });
MedicionYouTube.belongsTo(StreamYouTube, { foreignKey: 'streamId' });

export default StreamYouTube;
