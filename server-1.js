const express = require('express');
const app = express();
const PORT = 3000;
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Middleware para permitir recibir JSON
app.use(express.json());

const SECRET_KEY = 'mysecretkey'; // En producción, usar variables de entorno

// Funciones para manejar usuarios
async function obtenerUsuarios() {
  try {
    const data = await fs.readFile('Usuarios.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Si no hay archivo o hay un error, devuelve un array vacío
    return [];
  }
}

async function guardarUsuarios(usuarios) {
  try {
    console.log("Guardando usuarios:", JSON.stringify(usuarios, null, 2)); 
    await fs.writeFile('Usuarios.json', JSON.stringify(usuarios, null, 2));
  } catch (error) {
    console.error('Error al guardar usuarios:', error);
  }
}


// Función para registrar usuario
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Verificar que los campos no estén vacíos
    if (!username || !password) {
      return res.status(400).json({ message: 'El nombre de usuario y la contraseña son requeridos' });
    }

    const usuarios = await obtenerUsuarios();
    
    if (usuarios.find(user => user.username === username)) {
      return res.status(400).json({ message: 'Usuario ya registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoUsuario = { id: Date.now(), username, password: hashedPassword };
    usuarios.push(nuevoUsuario);

    // Guardar el usuario en el archivo
    await guardarUsuarios(usuarios);

    // Responder con mensaje de éxito
    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ message: 'Error en el registro del usuario' });
  }
});

// Función para iniciar sesión
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const usuarios = await obtenerUsuarios();
    const usuario = usuarios.find(user => user.username === username);

    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // Crear un token JWT
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    res.status(500).json({ message: 'Error en el inicio de sesión' });
  }
});

// Middleware para verificar token
function verificarToken(req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Acceso denegado' });

  jwt.verify(token.replace('Bearer ', ''), SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token no válido' });
    req.user = user;
    next();
  });
}

// Ruta para obtener todos los usuarios (requiere autenticación)
app.get('/users', verificarToken, async (req, res) => {
  try {
    const usuarios = await obtenerUsuarios();
    const usuariosResponse = usuarios.map(user => ({ id: user.id, username: user.username })); // Cambiado a 'id'
    res.json(usuariosResponse);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener la lista de usuarios' });
  }
});

// Ruta para obtener un usuario por ID (requiere autenticación)
app.get('/users/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const usuarios = await obtenerUsuarios();
    const usuario = usuarios.find(user => user.id === parseInt(id));

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    res.status(500).json({ message: 'Error al obtener el usuario' });
  }
});

// Ruta para actualizar un usuario por ID (requiere autenticación)
app.put('/users/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'El nombre de usuario y la contraseña son requeridos' });
    }

    const usuarios = await obtenerUsuarios();
    const usuarioIndex = usuarios.findIndex(user => user.id === parseInt(id));

    if (usuarioIndex === -1) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    usuarios[usuarioIndex] = { ...usuarios[usuarioIndex], username, password: hashedPassword };

    await guardarUsuarios(usuarios);

    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({ message: 'Error al actualizar el usuario' });
  }
});

// Ruta para eliminar un usuario por ID (requiere autenticación)
app.delete('/users/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const usuarios = await obtenerUsuarios();
    const usuarioIndex = usuarios.findIndex(user => user.id === parseInt(id));

    if (usuarioIndex === -1) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    usuarios.splice(usuarioIndex, 1);
    await guardarUsuarios(usuarios);

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).json({ message: 'Error al eliminar el usuario' });
  }
});

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Bienvenido a la API de usuarios');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});