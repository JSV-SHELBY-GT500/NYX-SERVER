/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { VertexAI } = require('@google-cloud/vertexai');
const { Firestore } = require('@google-cloud/firestore');

// Inicializar el cliente de Vertex AI
const vertex_ai = new VertexAI({
  project: process.env.GCLOUD_PROJECT,
  location: 'us-central1',
});

// Configuración del modelo generativo (Gemini)
const generativeModel = vertex_ai.getGenerativeModel({
  model: 'gemini-1.0-pro-001', // Usar un modelo que soporte function calling
});

// Inicializar el cliente de Firestore
const db = new Firestore({
  projectId: process.env.GCLOUD_PROJECT,
});

module.exports = {
  generativeModel,
  db,
};
