const express = require('express');
const { WebhookClient } = require('dialogflow-fulfillment');
const axios = require('axios');
const app = express();

app.use(express.json());

// Tu nueva API Key de Gemini
const GEMINI_API_KEY = 'AIzaSyAJHKQHgf8-wyRVNnhTJJNAq4xuQ84WMDk';

app.post('/webhook', (request, response) => {
  const agent = new WebhookClient({ request, response });

  async function fallback(agent) {
    const preguntaUsuario = agent.query;

    try {
      // Petición ajustada para la API de Gemini 1.5 Flash
      const respuestaGemini = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: `Eres el asistente de la Wiki del Proceso Administrativo. Responde a esto: ${preguntaUsuario}`
            }]
          }]
        }
      );

      // Extraer el texto de la respuesta de Gemini
      const textoGenerado = respuestaGemini.data.candidates[0].content.parts[0].text;

      agent.add(textoGenerado);

    } catch (error) {
      console.error('Error con Gemini:', error.response ? error.response.data : error.message);
      agent.add('Lo siento, en este momento el asistente tiene dificultades técnicas.');
    }
  }

  let intentMap = new Map();
  intentMap.set('Default Fallback Intent', fallback);
  agent.handleRequest(intentMap);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor activo en puerto ${PORT}`));