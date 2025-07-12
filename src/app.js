import express from 'express';
import path from 'path';
import { __filename, __dirname } from './utils.js';

import homeRoutes from './routes/home.routes.js';
import youtubeRoutes from './routes/youtube.routes.js';
import datatablesYoutubeRoutes from './routes/datatablesYoutube.routes.js';
import graficosYoutubeRoutes from './routes/graficosYoutube.routes.js';


const app = express();

// Middlewares
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/modulos', express.static(path.join(__dirname, 'modulos')));
app.use(express.urlencoded({ extended: true }));
app.use('/node_modules', express.static(path.join(__dirname, '..', 'node_modules')));

// Motor de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Rutas
app.use(homeRoutes);
app.use(youtubeRoutes);
app.use(datatablesYoutubeRoutes);
app.use(graficosYoutubeRoutes);


export default app;
