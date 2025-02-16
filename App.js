const API_URL = 'http://localhost:3000/register';

const express = require('express');
const usuariosRoutes = require('./src/routes/UsuariosRoutes');

const app = express();

// Usamos las rutas definidas
app.use('/api', usuariosRoutes);

module.exports = app;



// Función para registrar un usuario
document.getElementById('registration-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === '' || password === '') {
        alert('Todos los campos son obligatorios');
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al registrar el usuario');
        }

        const data = await response.json();
        alert('Usuario registrado con éxito');
        localStorage.setItem('token', data.token);
        this.reset();
        fetchUsers();
    } catch (error) {
        alert(error.message);
    }
});

// Función para obtener y mostrar usuarios
async function fetchUsers() {
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('No estás autenticado. Inicia sesión para ver los usuarios.');
            return;
        }

        const response = await fetch('http://localhost:3000/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener la lista de usuarios');
        }

        const users = await response.json();
        users.forEach(user => {
            const li = document.createElement('li');
            li.textContent = `${user.username}`;
            
            const editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.onclick = () => editUser (user);
            li.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.onclick = async () => await deleteUser (user.id); // Cambiado a 'user.id'
            li.appendChild(deleteButton);

            userList.appendChild(li);
        });
    } catch (error) {
        alert(error.message);
    }
}

function editUser (user) {
    const username = prompt("Nuevo nombre de usuario:", user.username);

    if (username) {
        const token = localStorage.getItem('token');

        fetch(`http://localhost:3000/users/${user.id}`, { // Cambiado a 'user.id'
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ username, password: user.password }) // Asegúrate de enviar la contraseña también
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message || 'Error al editar el usuario'); });
            }
            return response.json();
        })
        .then(data => {
            alert('Usuario editado con éxito');
            fetchUsers();
        })
        .catch(error => {
            alert(error.message);
        });
    }
}

async function deleteUser (userId) {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:3000/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar el usuario');
            }

            alert('Usuario eliminado con éxito');
            fetchUsers();
        } catch (error) {
            alert(error.message);
        }
    }
}

document.addEventListener('DOMContentLoaded', fetchUsers);