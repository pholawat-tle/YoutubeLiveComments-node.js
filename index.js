const axios = require('axios');
const express = require('express');
const { google } = require('googleapis');
const secrets = require('./secrets.json');

const app = express();
app.use(express.json());

const scopes = ['https://www.googleapis.com/auth/youtube.readonly'];

const oauth2Client = new google.auth.OAuth2(
    secrets.OAuth2.client_id,
    secrets.OAuth2.client_secret,
    secrets.OAuth2.redirect_uris[0]
);

let liveChatId;
let listening = false;

app.get('/getUrl', (req, res) => {
    res.send(
        oauth2Client.generateAuthUrl({
            access_type: 'online',
            scope: scopes,
        })
    );
});

app.get('/oauth2callback', async (req, res) => {
    let code = req.query.code;
    const token = await oauth2Client.getToken(code);
    oauth2Client.credentials = token;
    res.send('Authentication successful! Please return to the console.');
});

app.get('/getStreamID', async (req, res) => {
    axios
        .get(
            `https://youtube.googleapis.com/youtube/v3/liveBroadcasts?part=snippet&broadcastStatus=active&key=${secrets.OAuth2.apiKey}`,
            {
                headers: {
                    Authorization: `Bearer ${oauth2Client.credentials.tokens.access_token}`,
                    Accept: 'application/json',
                },
            }
        )
        .then((response) => {
            liveChatId = response.data.items[0].snippet.liveChatId;
            res.send('Saved New LiveChatId');
        })
        .catch((err) => console.log(err.response));
});

app.get('/startListening', async (req, res) => {
    listening = true;
    let nextPageToken;
    let pollingIntervalMillis;
    let requestOTW = true;
    axios
        .get(
            `https://youtube.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${liveChatId}&part=id&part=snippet&key=${secrets.OAuth2.apiKey}`,
            {
                headers: {
                    Authorization: `Bearer ${oauth2Client.credentials.tokens.access_token}`,
                    Accept: 'application/json',
                },
            }
        )
        .then(async (response) => {
            let responseJSON = response.data;
            for (let item of responseJSON.items) {
                console.log(
                    'Messaged Received : ' + item.snippet.displayMessage
                );
            }
            nextPageToken = responseJSON.nextPageToken;
            pollingIntervalMillis = responseJSON.pollingIntervalMillis;
            requestOTW = false;

            while (listening) {
                if (!requestOTW) {
                    requestOTW = true;
                    console.log(
                        'In Here1',
                        pollingIntervalMillis,
                        nextPageToken
                    );
                    setTimeout(() => {
                        console.log('In Here2');
                        axios
                            .get(
                                `https://youtube.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${liveChatId}&part=id&part=snippet&pageToken=${nextPageToken}&key=${secrets.OAuth2.apiKey}`,
                                {
                                    headers: {
                                        Authorization: `Bearer ${oauth2Client.credentials.tokens.access_token}`,
                                        Accept: 'application/json',
                                    },
                                }
                            )
                            .then((response) => {
                                let responseJSON = response.data;
                                console.log(responseJSON);
                                nextPageToken = responseJSON.nextPageToken;
                                pollingIntervalMillis =
                                    responseJSON.pollingIntervalMillis;
                                requestOTW = false;
                            })
                            .catch((err) => console.log(err.response));
                    }, pollingIntervalMillis);
                }
            }
        })
        .catch((err) => console.log(err.response));
});

app.get('/stop', () => {
    listening = false;
    res.send('Stopped');
});

app.listen(3000, () => {
    console.log('Listening to Port 3000');
});
