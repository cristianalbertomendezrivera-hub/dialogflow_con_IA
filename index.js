const express = require('express');
const { WebhookClient } = require('dialogflow-fulfillment');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());

// Tu nueva clave de Google AI Studio con todos los permisos habilitados
const GEMINI_API_KEY = 'AIzaSyAf-a4v0C7S5ccsgRDlRB2xWGbqkdMeYnc';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

app.post('/webhook', async (request, response) => {
  const agent = new WebhookClient({ request, response });

  async function fallback(agent) {
    const preguntaUsuario = agent.query;
    console.log('Pregunta recibida:', preguntaUsuario);

    try {
      // Utilizamos el modelo oficial y rápido de Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `Eres un experto asistente de la Wiki del Proceso Administrativo. Responde de forma clara, formal y breve a esto: ${preguntaUsuario}`;
      
      const result = await model.generateContent(prompt);
      const textoGenerado = result.response.text();
      
      agent.add(textoGenerado);

    } catch (error) {
      console.error('ERROR EN GEMINI:', error);
      agent.add('Error técnico: ' + error.message.substring(0, 250)); 
    }
  }

  let intentMap = new Map();
  intentMap.set('Default Fallback Intent', fallback);
  agent.handleRequest(intentMap);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en línea con SDK de Google en el puerto ${PORT}`));