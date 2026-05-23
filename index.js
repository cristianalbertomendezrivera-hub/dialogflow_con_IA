const express = require('express');
const { WebhookClient } = require('dialogflow-fulfillment');
const axios = require('axios');
const app = express();

app.use(express.json());

const GEMINI_API_KEY = 'AIzaSyAJHKQHgf8-wyRVNnhTJJNAq4xuQ84WMDk';

app.post('/webhook', async (request, response) => {
  const agent = new WebhookClient({ request, response });

  async function fallback(agent) {
    const preguntaUsuario = agent.query;
    console.log('Pregunta recibida:', preguntaUsuario);

    try {
      // CAMBIO AQUÍ: Usamos el modelo 'gemini-pro' que es el estándar estable
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
      
      const respuestaGemini = await axios.post(url, {
        contents: [{ parts: [{ text: `Eres un experto asistente de la Wiki del Proceso Administrativo. Responde de forma clara y formal a esto: ${preguntaUsuario}` }] }]
      });

      const textoGenerado = respuestaGemini.data.candidates[0].content.parts[0].text;
      agent.add(textoGenerado);

    } catch (error) {
      const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
      console.error('ERROR EN GEMINI:', errorMsg);
      agent.add('Error técnico: ' + errorMsg.substring(0, 50)); 
    }
  }

  let intentMap = new Map();
  intentMap.set('Default Fallback Intent', fallback);
  agent.handleRequest(intentMap);
});

app.listen(process.env.PORT || 3000, () => console.log('Servidor en línea'));