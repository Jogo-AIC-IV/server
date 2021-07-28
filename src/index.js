require('dotenv').config()

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const { newConnection } = require('./socketHandler');

const port = process.env.PORT
const url = process.env.URL

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

io.on('connection', newConnection);

server.listen(port, () => {
  console.log(`listening on ${url}:${port}`);
});