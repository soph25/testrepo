// server.js
// server.js
// server.js
const express = require('express');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const cors = require('cors');
const { GoogleAuth } = require('google-auth-library');

// Fonction pour configurer l'authentification
async function setupGoogleAuth() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const auth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/cloud-platform'
    });
    const client = await auth.getClient();
    return client;
  } else {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS non défini');
  }
}

const app = express();

const corsOptions = {
  origin: 'https://mionisup.ouvaton.org',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());
app.options('*', cors(corsOptions));

const projectId = process.env.DIALOGFLOW_PROJECT_ID;

// Utilisez cette fonction avant d'initialiser le client Dialogflow
setupGoogleAuth().then(authClient => {
  // Initialisez votre client Dialogflow ici
  const sessionClient = new dialogflow.SessionsClient();

  app.post('/chatbot', async (req, res) => {
    const sessionId = uuid.v4();
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: req.body.message,
          languageCode: 'fr-FR',
        },
      },
    };

    console.log("Requête reçue:", req.body);

    try {
      const responses = await sessionClient.detectIntent(request);
      console.log("response:", responses);
      res.header('Access-Control-Allow-Origin', 'https://mionisup.ouvaton.org');
      res.json({ reply: responses[0].queryResult.fulfillmentText });
    } catch (error) {
      console.error('ERROR:', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  });

}).catch(error => {
  console.error('Erreur authentification:', error);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});










