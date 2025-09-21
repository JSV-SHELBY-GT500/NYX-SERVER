/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const nyxAgent = require('../../core/nyx.agent');
const crypto = require('crypto'); // Importar el módulo crypto para generar IDs únicos

/**
 * Controlador principal para manejar las solicitudes entrantes a la API de NyxOS.
 * Extrae la tarea y los datos del cuerpo de la solicitud y los pasa al agente de IA.
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 */
exports.handleRequest = async (req, res) => {
  // Generar un ID de solicitud único y una marca de tiempo para la trazabilidad
  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  try {
    // Extraer la 'task' (tarea) y los 'data' (datos) del cuerpo de la solicitud JSON
    const { task, data } = req.body;

    // Se elimina la validación explícita aquí para centralizar toda la lógica
    // de negocio y validación de tareas en el agente de NyxOS.

    // Delegar el procesamiento al agente principal de NyxOS
    const result = await nyxAgent.processTask(task, data);

    // Enviar una respuesta exitosa con la nueva estructura
    res.status(200).json({
      success: true,
      requestId,
      timestamp,
      response: result
    });

  } catch (error) {
    // Manejar cualquier error que ocurra durante el procesamiento, incluyendo errores de las herramientas.
    console.error(`[${requestId}] Error procesando la solicitud de NyxOS:`, error.message);
    
    // Determinar el código de estado HTTP. Si el error tiene un statusCode (p. ej. error de validación), úsalo.
    // De lo contrario, es un error inesperado del servidor (500).
    const statusCode = error.statusCode || 500;
    
    // Para errores del cliente (4xx), el mensaje de error es específico y útil.
    // Para errores del servidor (500), el mensaje es genérico para no exponer detalles internos sensibles.
    const message = statusCode < 500 ? error.message : 'Ocurrió un error interno en el servidor.';

    // Devolver la respuesta de error estructurada y consistente
    res.status(statusCode).json({
      success: false,
      requestId,
      timestamp,
      error: {
        message: message,
        // Incluir los detalles del error solo si es un error interno del servidor,
        // lo que puede ser útil para la depuración en entornos controlados.
        details: statusCode >= 500 ? error.message : undefined
      }
    });
  }
};