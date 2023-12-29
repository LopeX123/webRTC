document.addEventListener('DOMContentLoaded', () => {
    const socket = io(); // Asegúrate de tener configurado el socket.io como en tu configuración.
    const joinButton = document.getElementById('joinButton');
    const roleSelect = document.getElementById('role');

    joinButton.addEventListener('click', () => {
        const selectedRole = roleSelect.value;
        
        // Redirigir al usuario según el rol seleccionado
        if (selectedRole === 'admin') {
            window.location.href = 'admin.html';
        } else if (selectedRole === 'student') {
            window.location.href = 'student.html';
        }
        
        // Emitir un evento para unirse a la sala con el rol seleccionado
        socket.emit('join-room', { role: selectedRole });
    });
});
