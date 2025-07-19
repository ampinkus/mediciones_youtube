// we use this file to get the path of the current directory and avoid to clutter the code in the app.js
/*
1. Importing Modules:
import path from "path";
import { fileURLToPath } from "url";
These lines import two modules: path and fileURLToPath.

The path module provides utilities for working with file and directory paths.
The fileURLToPath function is from the url module and is used to convert a file URL to a file path.

2. Getting the Current File's URL and Converting it to a Path:
const __filename = fileURLToPath(import.meta.url);
  - import.meta.url returns the URL of the current module. In this case, it's the URL of the JavaScript file
    where this code resides.
  - fileURLToPath is then used to convert the file URL to a file path and assign it to the variable __filename.
So, after this code is executed, __filename will contain the absolute path of the current JavaScript file. 
This is a common pattern used in Node.js when you need the current file's path for various purposes such as 
resolving relative paths or working with file system operations.
*/

/**
 * @file utils.js
 * @module utils
 * @description 
 * Utilidad para obtener la ruta del archivo actual (`__filename`) y su directorio (`__dirname`)
 * usando `import.meta.url`, útil para evitar lógica repetida en `app.js`.
 *
 * Este patrón es común en aplicaciones ES Modules para resolver rutas relativas.
 *
 * @requires path
 * @requires url
 */

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
// console.log(__filename); // la ruta completa del archivo utils 
const __dirname = path.dirname(__filename);
// console.log(__dirname);  // el directorio donde está el archivo utils

export { __filename, __dirname };