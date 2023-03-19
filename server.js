// Source:
// https://youtu.be/D7OWuslFYCw?t=326

// server.js allows the bot to stay online, if you have the paid replit you don't need this file
// after starting the bot add the url to https://uptimerobot.com/ so it gets pinged and stays online
const express = require('express');
const server = express();

server.all(`/`, (req, res) => {
    res.send(`Result: [OK].`);
});

function keepAlive() {
    server.listen(3000, () => {
        console.log(`Server is now ready! | ` + Date.now());
    });
}

module.exports = keepAlive;