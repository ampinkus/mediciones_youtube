/**
 * @module controllers/homecontroller
 * @description Controlador que maneja:
 * Este módulo define el controlador de la página principal del sistema.
 * Se encarga de renderizar la vista de inicio ('home/index').
 */

/**
 * Renderiza la página de inicio.
 * 
 * @function mostrarHome
 * @param {Express.Request} req - Objeto de solicitud HTTP de Express.
 * @param {Express.Response} res - Objeto de respuesta HTTP de Express.
 * @returns {void}
 */
export const mostrarHome = (req, res) => {
    res.render('home/index');
};
