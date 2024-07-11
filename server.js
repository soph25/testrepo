// server.js
const express = require('express');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const cors = require('cors');
const { GoogleAuth } = require('google-auth-library');


const corsOptions = {
  origin: 'https://mionisup.ouvaton.org', // Remplacez par l'URL de votre frontend
  optionsSuccessStatus: 200
};

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

// Utilisez cette fonction avant d'initialiser le client Dialogflow
setupGoogleAuth().then(authClient => {
  // Initialisez votre client Dialogflow ici

const app = express();
app.use(express.json());
app.use(cors(corsOptions));

const sessionClient = new dialogflow.SessionsClient();
const projectId = process.env.DIALOGFLOW_PROJECT_ID;

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

    try {
        const responses = await sessionClient.detectIntent(request);
        res.json({ reply: responses[0].queryResult.fulfillmentText });
    } catch (error) {
        console.error('ERROR:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});
  
}).catch(error => {
  console.error('Erreur d'authentification:', error);
});










const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
