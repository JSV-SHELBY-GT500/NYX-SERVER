/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { db } = require('../config/gcp');
const tasksCollection = db.collection('tasks');

/**
 * Esquemas de las funciones para que la IA (Gemini) entienda cómo usar la memoria.
 */
const functionDeclarations = {
  createTask: {
    name: 'createTask',
    description: 'Crea una nueva tarea o recordatorio para el usuario en la base de datos.',
    parameters: {
      type: 'OBJECT',
      properties: {
        description: {
          type: 'STRING',
          description: 'La descripción de la tarea a crear (ej. "comprar leche", "llamar a mamá").',
        },
      },
      required: ['description'],
    },
  },
  getTasks: {
    name: 'getTasks',
    description: 'Obtiene la lista de tareas pendientes del usuario desde la base de datos.',
    parameters: {
      type: 'OBJECT',
      properties: {}, // No necesita parámetros
    },
  },
};

/**
 * Crea una nueva tarea en Firestore.
 * @param {object} args - Los argumentos proporcionados por la IA.
 * @param {string} args.description - La descripción de la tarea.
 * @returns {Promise<object>} El resultado de la operación.
 */
const createTask = async ({ description }) => {
  try {
    const docRef = await tasksCollection.add({
      description,
      status: 'pending',
      createdAt: new Date(),
    });
    console.log(`Tarea creada en Firestore con ID: ${docRef.id}`);
    return { success: true, taskId: docRef.id, message: 'Tarea creada exitosamente.' };
  } catch (error) {
    console.error('Error al crear la tarea en Firestore:', error);
    return { success: false, message: 'No se pudo crear la tarea.' };
  }
};

/**
 * Obtiene todas las tareas pendientes de Firestore.
 * @returns {Promise<object>} Un objeto con la lista de tareas.
 */
const getTasks = async () => {
  try {
    const snapshot = await tasksCollection.where('status', '==', 'pending').orderBy('createdAt', 'desc').get();
    if (snapshot.empty) {
      return { success: true, tasks: [], message: 'No hay tareas pendientes.' };
    }
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, tasks, message: `Se encontraron ${tasks.length} tareas.` };
  } catch (error) {
    console.error('Error al obtener las tareas de Firestore:', error);
    return { success: false, message: 'No se pudieron obtener las tareas.' };
  }
};

module.exports = {
  functionDeclarations,
  createTask,
  getTasks,
};
