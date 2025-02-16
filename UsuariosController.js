// /src/controllers/UsuariosController.js

const fs = require('fs');
const path = require('path');

// Ruta del archivo JSON
const usuariosFilePath = path.join(__dirname, '../data/Usuarios.json');

// Función para leer los usuarios desde el archivo
const leerUsuarios = () => {
  const data = fs.readFileSync(usuariosFilePath, 'utf8');
  return JSON.parse(data);
};

// Obtener todos los usuarios
const obtenerUsuarios = (req, res) => {
  const usuarios = leerUsuarios();
  res.status(200).json(usuarios);
};

// Obtener un usuario por ID
const obtenerUsuarioPorId = (req, res) => {
  const { id } = req.params;
  const usuarios = leerUsuarios();
  const usuario = usuarios.find(u => u.id == id);

  if (!usuario) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  res.status(200).json(usuario);
};

module.exports = { obtenerUsuarios, obtenerUsuarioPorId };
