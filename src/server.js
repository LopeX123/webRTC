const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

io.on('connection', (socket) => {
    console.log('New user connected');
    
    socket.on('join-room', (roomId) => {
        const role = roomId.role;
        if (role === 'student') {
            io.emit('student-connected', socket.id);
        } else if (role === 'admin') {
            io.emit('admin-connected', socket.id);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});