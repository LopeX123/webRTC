import { v4 as uuidv4 } from 'uuid';

document.addEventListener('DOMContentLoaded', () => {
    const socket = io(); // Asegúrate de tener configurado el socket.io como en tu configuración.
    const studentsVideoContainer = document.getElementById('studentsVideoContainer');
    const adminsVideoContainer = document.getElementById('adminsVideoContainer');
    const studentsCountElement = document.getElementById('studentsCount');
    const adminsCountElement = document.getElementById('adminsCount');
    let peers = {};
    
    socket.on('connect', () => {
        console.log('Connected to server'); // Registro para verificar la conexión
    });

    document.getElementById('simulateStudentConnect').addEventListener('click', () => {
        const simulatedStudentId = uuidv4();
        console.log(simulatedStudentId);
        socket.emit('student-connected', simulatedStudentId);
        peers[simulatedStudentId] = {}; // Añadir el estudiante simulado a la lista de pares
        updateStudentsCount();
    });

    document.getElementById('simulateAdminConnect').addEventListener('click', () => {
        const simulatedAdminId = uuidv4();
        console.log(simulatedAdminId);
        socket.emit('admin-connected', simulatedAdminId);
        peers[simulatedAdminId] = {}; // Añadir el administrador simulado a la lista de pares
        updateAdminsCount();
    });
    
    socket.on('student-connected', userId => {
        console.log('Student connected:', userId); // Registro para verificar la conexión de estudiantes

        const video = document.createElement('video');
        video.autoplay = true;
        video.playsinline = true;

        const peer = new Peer();
        const call = peer.call(userId, null);

        call.on('stream', studentVideoStream => {
            video.srcObject = studentVideoStream;
            studentsVideoContainer.appendChild(video);
        });

        peers[userId] = call;
        updateStudentsCount();
    });

    // Escuchar admins conectados
    socket.on('admin-connected', adminId => {
        console.log('Admin connected:', adminId); // Registro para verificar la conexión de administradores

        const video = document.createElement('video');
        video.autoplay = true;
        video.playsinline = true;

        const peer = new Peer();
        const call = peer.call(adminId, null);

        call.on('stream', adminVideoStream => {
            video.srcObject = adminVideoStream;
            adminsVideoContainer.appendChild(video);
        });

        peers[adminId] = call;
        updateAdminsCount();
    });

    // Actualizar la cantidad de estudiantes conectados
    function updateStudentsCount() {
        const studentsCount = Object.keys(peers).filter(id => !id.startsWith('admin')).length;
        studentsCountElement.innerText = studentsCount;
        console.log('Updated student count:', studentsCount); // Registro para verificar el contador de estudiantes
    }

    function updateAdminsCount() {
        const adminsCount = Object.keys(peers).filter(id => id.startsWith('admin')).length;
        adminsCountElement.innerText = adminsCount;
        console.log('Updated admin count:', adminsCount); // Registro para verificar el contador de administradores
    }
});
