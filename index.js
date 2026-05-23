const express = require('express');
const { WebhookClient } = require('dialogflow-fulfillment');
const axios = require('axios'); // Importamos la nueva herramienta
const app = express();

app.use(express.json());

// Tu llave de DeepSeek (Mantén esto privado)
const DEEPSEEK_API_KEY = 'sk-663077864c264bd996d9e2a2cbbb0a17';

app.post('/webhook', (request, response) => {
  const agent = new WebhookClient({ request, response });

  // Convertimos la función en 'async' porque debe esperar a que la IA piense y responda
  async function fallback(agent) {
    const preguntaUsuario = agent.query; // Capturamos lo que el usuario escribió en el chat

    try {
      // Hacemos la petición a la API de DeepSeek
      const respuestaDeepSeek = await axios.post(
        'https://api.deepseek.com/chat/completions',
        {
          model: 'deepseek-chat',
          messages: [
            {
              // SYSTEM PROMPT: Aquí le damos la personalidad y las reglas a la IA
              role: 'system',
              content: 'Eres el asistente virtual experto de la Wiki del Proceso Administrativo. Tus respuestas deben ser amables, claras, breves y enfocadas únicamente en temas de Planeación, Organización, Dirección y Control. Si te preguntan algo fuera de estos temas, indica cortésmente que tu especialidad es la administración.'
            },
            {
              // USER: Lo que preguntó el usuario
              role: 'user',
              content: preguntaUsuario
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Extraemos el texto exacto que generó DeepSeek
      const textoGenerado = respuestaDeepSeek.data.choices[0].message.content;

      // Se lo enviamos de vuelta al chat de Dialogflow
      agent.add(textoGenerado);

    } catch (error) {
      console.error('Error al contactar a DeepSeek:', error.message);
      agent.add('Lo siento, en este momento mis servidores de inteligencia artificial están experimentando problemas. Por favor, intenta de nuevo más tarde.');
    }
  }

  let intentMap = new Map();
  // Conectamos el Intent predeterminado con nuestra nueva función con IA
  intentMap.set('Default Fallback Intent', fallback);
  agent.handleRequest(intentMap);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor de la Wiki encendido y escuchando en el puerto ${PORT}`);
});