document.addEventListener('DOMContentLoaded', () => {
    const socket = io(); // Asegúrate de tener configurado el socket.io como en tu configuración.
    const localVideo = document.getElementById('localVideo');
    const remoteVideosContainer = document.getElementById('remoteVideos');
    const micButton = document.getElementById('micButton');
    const camButton = document.getElementById('camButton');
    let localStream;

    // Obtener el stream de la cámara y micrófono
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            localStream = stream;
            localVideo.srcObject = stream;

            // Enviar el stream al servidor para compartir con otros estudiantes
            socket.emit('join-room', 'roomId'); // Reemplaza 'roomId' con un identificador de sala si es necesario
        })
        .catch(error => {
            console.error('Error accessing media devices:', error);
        });

    // Escuchar streams de otros estudiantes
    socket.on('user-connected', userId => {
        const video = document.createElement('video');
        video.setAttribute('id', userId);
        video.autoplay = true;
        video.playsinline = true;

        const peer = new Peer();
        const call = peer.call(userId, localStream);

        call.on('stream', userVideoStream => {
            video.srcObject = userVideoStream;
            remoteVideosContainer.appendChild(video);
        });
    });

    // Botón para mutear/desmutear el micrófono
    micButton.addEventListener('click', () => {
        const audioTracks = localStream.getAudioTracks();
        audioTracks.forEach(track => {
            track.enabled = !track.enabled;
        });
        micButton.innerText = audioTracks[0].enabled ? 'Mute' : 'Unmute';
    });

    // Botón para iniciar/detener la cámara
    camButton.addEventListener('click', () => {
        const videoTracks = localStream.getVideoTracks();
        videoTracks.forEach(track => {
            track.enabled = !track.enabled;
        });
        camButton.innerText = videoTracks[0].enabled ? 'Stop Camera' : 'Start Camera';
    });
});
