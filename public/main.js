document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const localVideo = document.getElementById('localVideo');
    const remoteVideo = document.getElementById('remoteVideo');
    const micButton = document.getElementById('micButton');
    const camButton = document.getElementById('camButton');
    const roleForm = document.getElementById('roleForm');
    const startButton = document.getElementById('startButton');
    let localStream;

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
        remoteVideo.append(video);
        updateStudentsCount(); // Actualiza la cuenta al agregar un video
    }

    function updateStudentsCount() {
        const studentsCountElement = document.getElementById('studentsCount');
        const studentsCount = Object.keys(peers).length;
        studentsCountElement.innerText = `Students Connected: ${studentsCount}`;
    }
});
