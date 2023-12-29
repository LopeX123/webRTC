document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const localVideo = document.getElementById('localVideo');
    const studentsVideoContainer = document.getElementById('studentsVideoContainer');
    const micButton = document.getElementById('micButton');
    const camButton = document.getElementById('camButton');
    const roleForm = document.getElementById('roleForm');
    const startButton = document.getElementById('startButton');
    let localStream;
    let peers = {}; // Objeto para mantener las conexiones con los estudiantes

    startButton.addEventListener('click', () => {
        const selectedRole = document.getElementById('role').value;

        if (selectedRole === 'student') {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(stream => {
                    localVideo.srcObject = stream;
                    localStream = stream;

                    socket.emit('join-room', 'room1');

                    socket.on('user-connected', userId => {
                        connectToNewUser(userId, stream);
                    });

                    roleForm.style.display = 'none';
                    localVideo.style.display = 'block';
                    micButton.style.display = 'block';
                    camButton.style.display = 'block';
                })
                .catch(error => console.error('Error accessing media devices:', error));
        } else if (selectedRole === 'admin') {
            window.location.href = 'admin.html'; // Redirige a la página de admin
            setupAdminSocketEvents();
        }
    });

    micButton.addEventListener('click', () => {
        const audioTracks = localStream.getAudioTracks();
        audioTracks.forEach(track => {
            track.enabled = !track.enabled;
        });
        micButton.innerText = audioTracks[0].enabled ? 'Mute' : 'Unmute';
    });

    camButton.addEventListener('click', () => {
        const videoTracks = localStream.getVideoTracks();
        videoTracks.forEach(track => {
            track.enabled = !track.enabled;
        });
        camButton.innerText = videoTracks[0].enabled ? 'Stop Camera' : 'Start Camera';
    });

    function connectToNewUser(userId, stream) {
        const call = peer.call(userId, stream);
        const video = document.createElement('video');

        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        });

        call.on('close', () => {
            video.remove();
            updateStudentsCount(); // Actualiza la cuenta al cerrar una conexión
        });

        peers[userId] = call;
        updateStudentsCount(); // Actualiza la cuenta al establecer una conexión
    }

    function addVideoStream(video, stream) {
        video.srcObject = stream;
        video.addEventListener('loadedmetadata', () => {
            video.play();
        });
        studentsVideoContainer.appendChild(video);
        updateStudentsCount(); // Actualiza la cuenta al agregar un video
    }

    function updateStudentsCount() {
        const studentsCountElement = document.getElementById('studentsCount');
        const studentsCount = Object.keys(peers).length;
        studentsCountElement.innerText = `Students Connected: ${studentsCount}`;
    }

    function setupAdminSocketEvents() {
        socket.on('user-connected', userId => {
            const call = peer.call(userId, localStream);
            const video = document.createElement('video');

            call.on('stream', userVideoStream => {
                addVideoStream(video, userVideoStream);
            });

            call.on('close', () => {
                video.remove();
                updateStudentsCount(); // Actualiza la cuenta al cerrar una conexión
            });

            peers[userId] = call;
            updateStudentsCount(); // Actualiza la cuenta al establecer una conexión
        });

        socket.on('user-disconnected', userId => {
            if (peers[userId]) {
                peers[userId].close();
                delete peers[userId];
                updateStudentsCount(); // Actualiza la cuenta al cerrar una conexión
            }
        });
    }
});
