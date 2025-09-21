/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { generativeModel } = require('../config/gcp');
const codeGenerator = require('../tools/code_generator');
const fileManager = require('../tools/file_manager');
const memoryManager = require('../tools/memory_manager');

// Agrupar todas las herramientas disponibles con sus declaraciones para la IA
const tools = [
  { functionDeclaration: codeGenerator.functionDeclaration, function: codeGenerator.generate },
  { functionDeclaration: fileManager.functionDeclarations.create, function: fileManager.create },
  { functionDeclaration: fileManager.functionDeclarations.read, function: fileManager.read },
  { functionDeclaration: memoryManager.functionDeclarations.createTask, function: memoryManager.createTask },
  { functionDeclaration: memoryManager.functionDeclarations.getTasks, function: memoryManager.getTasks },
];

const functionDeclarations = tools.map(tool => tool.functionDeclaration);

// Iniciar una sesión de chat con el modelo, proporcionándole las herramientas que puede usar.
const chat = generativeModel.startChat({
  tools: [{ functionDeclarations }],
});

/**
 * Procesa un mensaje del usuario, interactuando con el modelo Gemini
 * y utilizando herramientas a través de function calling.
 * @param {string} userInput - El mensaje del usuario.
 * @param {object} ws - La conexión WebSocket del cliente para enviar respuestas en streaming.
 */
const processMessage = async (userInput, ws) => {
  console.log(`Usuario: ${userInput}`);
  ws.send(JSON.stringify({ type: 'userMessage', payload: userInput }));

  try {
    // Enviar el mensaje del usuario al chat de Gemini y obtener la respuesta en streaming.
    const result = await chat.sendMessageStream(userInput);

    // Procesar la respuesta del stream.
    for await (const item of result.stream) {
      if (item.functionCall) {
        // La IA quiere llamar a una función.
        const { name, args } = item.functionCall;
        console.log(`IA quiere llamar a la función: ${name} con args:`, args);

        // Encontrar y ejecutar la función correspondiente.
        const tool = tools.find(t => t.functionDeclaration.name === name);
        if (tool) {
          const functionResult = await tool.function(args);
          
          // Enviar el resultado de la función de vuelta a la IA.
          await chat.sendMessageStream(
            JSON.stringify({
              functionResponse: {
                name,
                response: functionResult,
              },
            })
          );
        } else {
            console.error(`Función desconocida: ${name}`);
        }
      } else if (item.text) {
        // La IA está enviando texto. Transmitirlo directamente al cliente.
        const text = item.text();
        console.log(`IA: ${text}`);
        ws.send(JSON.stringify({ type: 'aiMessagePart', payload: text }));
      }
    }
     ws.send(JSON.stringify({ type: 'aiMessageEnd' }));

  } catch (error) {
    console.error("Error al procesar el mensaje con Vertex AI:", error);
    ws.send(JSON.stringify({ type: 'error', payload: 'Error al comunicarse con la IA.' }));
  }
};

module.exports = {
  processMessage,
};
