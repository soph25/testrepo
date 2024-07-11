// server.js
const express = require('express');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');

const app = express();
app.use(express.json());

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
