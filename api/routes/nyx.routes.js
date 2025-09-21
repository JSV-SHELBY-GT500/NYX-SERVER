/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const express = require('express');
const router = express.Router();
const nyxController = require('../controllers/nyx.controller');

// Definir la ruta principal de la API para NyxOS
// Todas las solicitudes POST a /api/nyx/ serán manejadas por el controlador 'handleRequest'
router.post('/', nyxController.handleRequest);

module.exports = router;
