/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { db } = require('../../config/gcp');
const crypto = require('crypto');

const tasksCollection = db.collection('tasks');

/**
 * Crea una nueva tarea en Firestore.
 */
exports.createTask = async (req, res) => {
  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  try {
    const { description, status = 'pending' } = req.body;
    if (!description) {
      return res.status(400).json({
        success: false,
        requestId,
        timestamp,
        error: { message: 'La descripción es requerida.' }
      });
    }

    const docRef = await tasksCollection.add({
      description,
      status,
      createdAt: new Date()
    });

    res.status(201).json({
      success: true,
      requestId,
      timestamp,
      response: { id: docRef.id, description, status }
    });
  } catch (error) {
    console.error(`[${requestId}] Error al crear la tarea:`, error);
    res.status(500).json({
      success: false,
      requestId,
      timestamp,
      error: { message: 'Error interno al crear la tarea.' }
    });
  }
};

/**
 * Obtiene todas las tareas de Firestore.
 */
exports.getAllTasks = async (req, res) => {
  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  try {
    const snapshot = await tasksCollection.orderBy('createdAt', 'desc').get();
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    res.status(200).json({
      success: true,
      requestId,
      timestamp,
      response: tasks
    });
  } catch (error) {
    console.error(`[${requestId}] Error al obtener las tareas:`, error);
    res.status(500).json({
      success: false,
      requestId,
      timestamp,
      error: { message: 'Error interno al obtener las tareas.' }
    });
  }
};
