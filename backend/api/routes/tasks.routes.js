/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasks.controller');

// Ruta para obtener todas las tareas
router.get('/', tasksController.getAllTasks);

// Ruta para crear una nueva tarea
router.post('/', tasksController.createTask);

module.exports = router;
