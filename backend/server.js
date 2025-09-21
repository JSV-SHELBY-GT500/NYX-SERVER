/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Cargar variables de entorno desde el archivo .env al inicio de la aplicación
require('dotenv').config();

const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const nyxAgent = require('./core/nyx.agent');
const tasksRoutes = require('./api/routes/tasks.routes'); // Rutas para la API REST de Tareas

// Crear una instancia de la aplicación Express
const app = express();
const server = http.createServer(app); // Crear un servidor HTTP a partir de la app de Express

// Definir el puerto del servidor, usando la variable de entorno o 8080 como predeterminado
const PORT = process.env.PORT || 8080;

// Middleware para permitir que Express parsee cuerpos de solicitud en formato JSON
app.use(express.json());

// Montar el enrutador de la API de Tareas en la ruta base /api/tasks para peticiones REST
app.use('/api/tasks', tasksRoutes);

// Ruta raíz (/) para verificar que el despliegue fue exitoso
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send('<h1>NyxOS AI v3.0 is running.</h1><p>Vertex AI & Firestore integration successful.</p>');
});

// --- Configuración del Servidor WebSocket ---
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Cliente conectado vía WebSocket.');

  ws.on('message', async (message) => {
    try {
      const userInput = message.toString();
      // Delegar el procesamiento completo al agente de IA, que manejará el streaming
      await nyxAgent.processMessage(userInput, ws);

    } catch (error) {
      console.error(`Error procesando mensaje de WebSocket:`, error.message);
      ws.send(JSON.stringify({
        type: 'error',
        payload: 'Error interno al procesar el mensaje.'
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
  console.log(`El servidor de NyxOS v3.0 está escuchando en el puerto ${PORT}`);
  console.log('API REST y WebSocket listos para recibir conexiones.');
});
