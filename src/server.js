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

io.on('connection', (socket) => {
    socket.on('join-room', (roomId) => {
        const role = roomId.role;
        if (role === 'student') {
            console.log('New user connected Estudiante');
            io.emit('student-connected', socket.id);
        } else if (role === 'admin') {
            console.log('New user connected Admin');
            io.emit('admin-connected', socket.id);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});