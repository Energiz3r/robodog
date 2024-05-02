const express = require('express');
const http = require('http');
const { Server: Robot } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Robot(server);
const { Worker } = require('worker_threads');
const config = require("./config");

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/src/index.html');
});

const worker = new Worker('./src/thread');

worker.on('error', (error) => {
    console.error('Error in worker: ', error);
});

worker.on('exit', (code) => {
    if (code !== 0) console.error(`Worker stopped with exit code ${code}. Stopping server.`);
    process.exit(0)
});

io.on('connection', (socket) => {
    console.log('Web UI: User connected');
    socket.on('keydown', (keyCode) => {
        worker.postMessage({ action: "keydown", keyCode });
    });
    socket.on('keyup', (keyCode) => {
        worker.postMessage({ action: "keyup", keyCode });
    });

    socket.on('disconnect', () => {
        console.log('Web UI: User disconnected');
    });
});

server.listen(config.port, () => {
    console.log(`✦ Robot web UI is running on port ${config.port} ✦`);
});

