// server.js
// server.js
const express = require('express');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const cors = require('cors');
const { GoogleAuth } = require('google-auth-library');

const app = express();

// Configuration CORS
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

// Fonction pour configurer l'authentification
async function setupGoogleAuth() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const auth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/cloud-platform'
    });
    return auth.getClient();
  } else {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS non défini');
  }
}

// Initialisation de Dialogflow et définition de la route
async function initializeDialogflowAndRoutes() {
  try {
    await setupGoogleAuth();
    const sessionClient = new dialogflow.SessionsClient();

    // Définition de la route /chatbot
    app.post('/', async (req, res) => {
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

    // Route de test
    app.get('/', (req, res) => {
      res.send('Server is running');
    });

    // Démarrage du serveur
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Erreur lors de l'initialisation:', error);
  }
}

// Appel de la fonction d'initialisation
initializeDialogflowAndRoutes();










