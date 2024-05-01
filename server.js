const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const { Worker } = require('worker_threads');

app.get('/', (req, res) => {
    console.log("Serving index.html")
    res.sendFile(__dirname + '/index.html');
});

const worker = new Worker('./robot.js');

worker.on('error', (error) => {
    console.error('Error in worker: ', error);
});

worker.on('exit', (code) => {
    if (code !== 0)
        console.error(`Worker stopped with exit code ${code}`);
});

io.on('connection', (socket) => {
    console.log('User connected');
    socket.on('keydown', (keyCode) => {
        worker.postMessage({ action: "keydown", keyCode });
    });
    socket.on('keyup', (keyCode) => {
        worker.postMessage({ action: "keyup", keyCode });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});

