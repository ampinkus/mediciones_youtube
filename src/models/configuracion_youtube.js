/**
 * Modelo Sequelize: ConfiguracionYouTube
 * 
 * Define la configuración individual para cada stream de YouTube en el sistema de mediciones.
 * 
 * ✅ Campos definidos:
 * - streamId: Clave primaria y clave foránea hacia StreamYouTube.
 * - fecha: Fecha de inicio de la medición.
 * - fecha_final: Fecha final opcional para finalizar la medición.
 * - hora_comienzo_medicion: Hora manual de inicio (opcional).
 * - hora_fin_medicion: Hora manual de finalización (opcional).
 * - actual_start_time: Hora real de inicio extraída de la API (opcional).
 * - actual_end_time: Hora real de finalización extraída de la API (opcional).
 * - intervalo_medicion: Intervalo entre mediciones en minutos (1 a 1440).
 * - activo: Indica si el stream está activo para medición.
 * 
 * 📌 Relaciones:
 * - Uno a uno con StreamYouTube mediante streamId.
 * 
 * Este modelo se utiliza en medicionYoutube.js y otros componentes para controlar los rangos de medición y frecuencia.
 */

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
      allowNull: true,
    },
    fecha_final: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    hora_comienzo_medicion: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    hora_fin_medicion: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    actual_start_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    actual_end_time: {
      type: DataTypes.TIME,
      allowNull: true,
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
