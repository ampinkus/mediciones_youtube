/**
 * @module controllers/homecontroller
 * @description Controlador de la página principal.
 * 
 * Se encarga de renderizar la vista de inicio (**views/home/index.ejs**).
 * No recibe parámetros especiales en `req`, simplemente responde con la vista
 * inicial del sistema.
 */

/**
 * Renderiza la página de inicio.
 *
 * @function mostrarHome
 * @param {Express.Request} req - Objeto de solicitud HTTP de Express.  
 *   - **No contiene datos relevantes**; se usa solo para verificar que la ruta se llamó
 *     y para acceder a posibles middlewares globales si existieran.
 *
 * @param {Express.Response} res - Objeto de respuesta HTTP de Express.  
 *   - **Renderiza**: `'home/index'` (la plantilla EJS principal de Home).
 *
 * @returns {void}
 */
export const mostrarHome = (req, res) => {
    res.render('home/index');
};
