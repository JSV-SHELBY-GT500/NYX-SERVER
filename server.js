/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Cargar variables de entorno desde el archivo .env al inicio de la aplicación
require('dotenv').config();

const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const crypto = require('crypto');
const nyxRoutes = require('./api/routes/nyx.routes');
const nyxAgent = require('./core/nyx.agent');

// Crear una instancia de la aplicación Express
const app = express();
const server = http.createServer(app); // Crear un servidor HTTP a partir de la app de Express

// Definir el puerto del servidor, usando la variable de entorno o 8080 como predeterminado
const PORT = process.env.PORT || 8080;

// Middleware para permitir que Express parsee cuerpos de solicitud en formato JSON
app.use(express.json());

// Montar el enrutador de la API de Nyx en la ruta base /api/nyx para peticiones REST
app.use('/api/nyx', nyxRoutes);

// Ruta raíz (/) para verificar que el despliegue fue exitoso
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send('<h1>NyxOS AI is running.</h1><p>El despliegue ha sido exitoso.</p>');
});

// --- Configuración del Servidor WebSocket ---
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Cliente conectado vía WebSocket.');

  ws.on('message', async (message) => {
    const requestId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    
    try {
      const { task, data } = JSON.parse(message);
      console.log(`[${requestId}] Tarea recibida vía WebSocket: ${task}`);

      const result = await nyxAgent.processTask(task, data);

      ws.send(JSON.stringify({
        success: true,
        requestId,
        timestamp,
        response: result
      }));

    } catch (error) {
      console.error(`[${requestId}] Error procesando mensaje de WebSocket:`, error.message);
      
      const statusCode = error.statusCode || 500;
      const message = statusCode < 500 ? error.message : 'Ocurrió un error interno en el servidor.';

      ws.send(JSON.stringify({
        success: false,
        requestId,
        timestamp,
        error: {
          message: message,
          details: statusCode >= 500 ? error.message : undefined
        }
      }));
    }
  });

  ws.on('close', () => {
    console.log('Cliente desconectado de WebSocket.');
  });

  ws.on('error', (error) => {
    console.error('Error en la conexión WebSocket:', error);
  });
});

// Iniciar el servidor para que escuche las peticiones en el puerto especificado
server.listen(PORT, () => {
  console.log(`El servidor de NyxOS está escuchando en el puerto ${PORT}`);
  console.log('API REST y WebSocket listos para recibir conexiones.');
});