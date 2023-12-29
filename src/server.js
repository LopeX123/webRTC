const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});

const peers = {};

io.on('connection', socket => {
    socket.on('join-room', roomId => {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected', socket.id);

        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', socket.id);
            delete peers[socket.id];
        });
    });
});

