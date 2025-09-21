/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Esquema de la función para que la IA (Gemini) entienda cómo usarla.
 */
const functionDeclaration = {
  name: 'generateCode',
  description: 'Genera un fragmento de código basado en una descripción, lenguaje, estilo y complejidad.',
  parameters: {
    type: 'OBJECT',
    properties: {
      prompt: {
        type: 'STRING',
        description: 'Una descripción detallada de lo que el código debe hacer.',
      },
      language: {
        type: 'STRING',
        description: 'El lenguaje de programación a utilizar (ej. "javascript", "python").',
      },
      style: {
        type: 'STRING',
        description: 'La guía de estilo a seguir (ej. "airbnb", "google", "standard").',
      },
      complexity: {
        type: 'STRING',
        description: 'La complejidad deseada para el código (ej. "simple", "optimizado", "didáctico").',
      },
    },
    required: ['prompt', 'language'],
  },
};

/**
 * Módulo de herramienta para la generación de código.
 * @param {object} args - Los argumentos proporcionados por la IA.
 * @param {string} args.prompt - La descripción del código a generar.
 * @param {string} args.language - El lenguaje de programación.
 * @param {string} [args.style='standard'] - La guía de estilo de código.
 * @param {string} [args.complexity='simple'] - La complejidad del código.
 * @returns {Promise<object>} Un objeto que contiene el código generado.
 */
const generate = async ({ prompt, language, style = 'standard', complexity = 'simple' }) => {
  console.log(`Generando código para: "${prompt}" [Lang: ${language}, Style: ${style}, Complexity: ${complexity}]`);

  // Simulación de generación de código
  const generatedCode = `/**
 * Language: ${language}
 * Style Guide: ${style}
 * Complexity: ${complexity}
 * Prompt: "${prompt}"
 */
function helloWorld() {
  console.log("¡Hola, mundo desde NyxOS en ${language}!");
}

helloWorld();
`;

  return {
    prompt,
    language,
    style,
    complexity,
    code: generatedCode,
    message: 'Código generado exitosamente (simulado).',
  };
};

module.exports = {
  functionDeclaration,
  generate,
};
