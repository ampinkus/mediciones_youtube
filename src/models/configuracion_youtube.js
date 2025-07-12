// src/models/configuracion_youtube.js
import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";
import StreamYouTube from "./streams_youtube.js";

const ConfiguracionYouTube = sequelize.define(
  "ConfiguracionYouTube",
  {
    streamId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: StreamYouTube,
        key: "id",
      },
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    fecha_final: { // 🔹 Campo correctamente agregado
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    hora_comienzo_medicion: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    hora_fin_medicion: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    intervalo_medicion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 1440 }, // entre 1 y 1440 minutos
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "configuracion_youtube",
    timestamps: false,
  }
);

// Relación uno a uno
StreamYouTube.hasOne(ConfiguracionYouTube, { foreignKey: "streamId" });
ConfiguracionYouTube.belongsTo(StreamYouTube, { foreignKey: "streamId" });

export default ConfiguracionYouTube;
