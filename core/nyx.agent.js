/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Importar las herramientas especializadas que NyxOS puede utilizar
const codeGenerator = require('../tools/code_generator');
const fileManager = require('../tools/file_manager');

/**
 * Lanza un error estandarizado para solicitudes de cliente incorrectas (Bad Request).
 * @param {string} message - El mensaje de error.
 * @param {number} statusCode - El código de estado HTTP (generalmente 400).
 */
const throwClientError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

/**
 * Agente principal de NyxOS.
 * Procesa una tarea y delega inteligentemente al módulo o herramienta apropiada.
 * @param {string} task - El identificador de la tarea a realizar (ej. 'generate_code', 'create_file').
 * @param {object} data - Los datos necesarios para ejecutar la tarea.
 * @returns {Promise<object>} El resultado de la herramienta ejecutada.
 */
const processTask = async (task, data) => {
  console.log(`Procesando tarea: ${task}`);

  // Lógica de enrutamiento de tareas: decide qué herramienta usar.
  // Cualquier error lanzado aquí (ya sea por validación o por la propia herramienta)
  // será capturado por el controlador, que formateará la respuesta de error HTTP.
  switch (task) {
    case 'generate_code':
      // Validar que todos los parámetros necesarios para la generación de código estén presentes.
      if (!data || !data.prompt || !data.language || !data.style || !data.complexity) {
        throwClientError('Se requieren "prompt", "language", "style" y "complexity" para la tarea generate_code.');
      }
      // Pasar los parámetros adicionales a la herramienta de generación de código.
      return codeGenerator.generate(data.prompt, data.language, data.style, data.complexity);

    case 'create_file':
      if (!data || !data.path || !data.content) {
        throwClientError('Se requieren "path" y "content" para la tarea create_file.');
      }
      return fileManager.create(data.path, data.content);
    
    case 'read_file':
        if (!data || !data.path) {
          throwClientError('Se requiere "path" para la tarea read_file.');
        }
        return fileManager.read(data.path);

    default:
      // Si la tarea no se reconoce, se lanza un error de cliente (400 Bad Request).
      throwClientError(`Tarea no reconocida: '${task}'. Las tareas disponibles son: generate_code, create_file, read_file.`);
  }
};

module.exports = {
  processTask,
};