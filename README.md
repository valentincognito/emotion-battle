# emotion-battle

### Credit

This project is inspired by the work of several people but I want to credit this repository: (https://github.com/omar178/Emotion-recognition) in particular since I trained the model with his code. I then converted the model for tensorflow.js and imported it in my project.

### Description

This project is a webapp mini game that uses machine learning with tensorflow.js to detect one's emotion. You share a link to your friend to join your room and then the goal is to mimic different emotions showing your face at the camera. You earn points based on how accurate your emotion is and the player with most points win the game.

![](https://github.com/valentincognito/emotion-battle/blob/master/public/images/game_preview.jpg)

### Installation

```
git clone https://github.com/valentincognito/emotion-battle.git
cd emotion-battle
npm update

//generate a self-signed SSL cert to access the camera
openssl req -x509 -newkey rsa:2048 -keyout keytmp.pem -out cert.pem -days 365
openssl rsa -in keytmp.pem -out key.pem

//start the application
node app.js
```

When the application is started open https://server-ip:3005 (don't forget the https!)

### Notes

This application has still a few bugs that will be resolved eventually !
This application has only been tested on android mobile with Google Chrome.

### Known issues

- Sometimes the camera don't start correctly
- Sometimes the score is not being updated
