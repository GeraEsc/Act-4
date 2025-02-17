const API_URL = 'http://localhost:3000/api'; // Se usa la ruta /api como prefijo

const express = require('express');
const usuariosRoutes = require('./Routes/UsuariosRoutes');

const app = express();

// Middleware para JSON
app.use(express.json());

// Usamos las rutas definidas
app.use('/api', usuariosRoutes);

module.exports = app;

// Esperar a que el DOM cargue antes de asignar eventos
document.addEventListener("DOMContentLoaded", function () {
    // Capturamos el formulario y agregamos el evento submit
    document.getElementById("registration-form").addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = document.getElementById("name").value; // Corregido ID del input
        const password = document.getElementById("password").value;

        if (!username || !password) {
            alert("Todos los campos son obligatorios");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error al registrar el usuario");
            }

            const data = await response.json();
            alert("Usuario registrado con éxito");
            localStorage.setItem("token", data.token); // Guardamos el token de sesión

            this.reset(); // Limpiamos el formulario
            fetchUsers(); // Actualizamos la lista de usuarios
        } catch (error) {
            alert(error.message);
        }
    });

    // Evento para obtener usuarios al hacer clic en el botón
    document.getElementById("fetch-users").addEventListener("click", fetchUsers);

    // Cargar usuarios automáticamente al cargar la página
    fetchUsers();
});

// Función para obtener y mostrar usuarios
async function fetchUsers() {
    const userList = document.getElementById("user-list");
    userList.innerHTML = ""; // Limpiamos la lista

    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("No estás autenticado. Inicia sesión para ver los usuarios.");
            return;
        }

        const response = await fetch(`${API_URL}/users`, {
            headers: { "Authorization": `Bearer ${token}` },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al obtener la lista de usuarios");
        }

        const users = await response.json();
        users.forEach(user => {
            const li = document.createElement("li");
            li.textContent = `ID: ${user.id} - Nombre: ${user.username}`;

            const editButton = document.createElement("button");
            editButton.textContent = "Editar";
            editButton.onclick = () => editUser(user);
            li.appendChild(editButton);

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Eliminar";
            deleteButton.onclick = async () => await deleteUser(user.id);
            li.appendChild(deleteButton);

            userList.appendChild(li);
        });
    } catch (error) {
        alert(error.message);
    }
}

// Función para editar un usuario
function editUser(user) {
    const username = prompt("Nuevo nombre de usuario:", user.username);

    if (username) {
        const token = localStorage.getItem("token");

        fetch(`${API_URL}/users/${user.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ username, password: user.password }), // Mantiene la contraseña actual
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message || "Error al editar el usuario"); });
            }
            return response.json();
        })
        .then(data => {
            alert("Usuario editado con éxito");
            fetchUsers(); // Recargar usuarios
        })
        .catch(error => {
            alert(error.message);
        });
    }
}

// Función para eliminar un usuario
async function deleteUser(userId) {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`${API_URL}/users/${userId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error al eliminar el usuario");
            }

            alert("Usuario eliminado con éxito");
            fetchUsers(); // Actualizar lista
        } catch (error) {
            alert(error.message);
        }
    }
}
