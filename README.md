# Youtube Live Comments

This is a Node.js API that fetches comments from your active livestream.

# Installation

1. Navigate to the Google Cloud Console and [Create a new OAuth2 Client Id](https://console.cloud.google.com/apis/credentials/oauthclient)

2. Configure the OAuth2 Consent Screen

3. Create OAuth 2.0 Client IDs and download it as a JSON file

4. Create API key for Youtube Data API V3

5. Copy the content of OAuth 2.0 Client ID and the API key and paste it into secrets.json

6. Run ` npm install`

7. RUN ` npm run start`

# Usage

1.  Go to `/getUrl` and log in

2.  Go to `/getStreamID`

3.  Go to `/startListening`

4.  Go to`/stop` when you want to stop

# Available APIs

## GET `/getUrl`

        Returns a link to OAuth2 Consent Screen

## GET `/getStreamID`

        Save LiveChatId to the temporary variable

## GET `/startListening`

        Start fetching the comments from youtube livestream and print them in the console

## GET `/stop`

        Stop Fetching Comments

---
