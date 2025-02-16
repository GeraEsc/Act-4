// Test para funciones simples (como la suma)
const sumar = (a, b) => a + b;  // Función a probar

describe('Funciones de Usuarios', () => {
  it('debería sumar dos números correctamente', () => {
    expect(sumar(2, 3)).toBe(5);  // Verifica que 2 + 3 sea igual a 5
  });
});

// Test para obtener un usuario por ID (función asíncrona)
const obtenerUsuario = async (id) => {
  // Simulamos una llamada a la base de datos
  if (id === 1) {
    return { id: 1, nombre: 'Juan' };
  } else {
    throw new Error('Usuario no encontrado');
  }
};

describe('Funciones de Obtener Usuario', () => {
  it('debería obtener un usuario por su id', async () => {
    const usuario = await obtenerUsuario(1);
    expect(usuario).toEqual({ id: 1, nombre: 'Juan' });
  });

  it('debería lanzar un error si el usuario no existe', async () => {
    await expect(obtenerUsuario(999)).rejects.toThrow('Usuario no encontrado');
  });
});

// Pruebas de las rutas de la API (con Supertest y mock de fs)
const request = require('supertest');
const app = require('../App');

// Mock para evitar manipulación real del archivo durante las pruebas
jest.mock('fs');
const fs = require('fs');

describe('Rutas de Usuarios', () => {
  beforeEach(() => {
    // Preparamos un mock para que devuelva un contenido controlado
    fs.readFileSync.mockReturnValue(JSON.stringify([
      { id: 1739719351563, username: "ejemplo", password: "hashedPassword1" },
      { id: 1739723006732, username: "Juan", password: "hashedPassword2" },
      { id: 1739723049960, username: "Axel", password: "hashedPassword3" }
    ]));
  });

  it('debería retornar todos los usuarios', async () => {
    const respuesta = await request(app).get('/api/usuarios');
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual([
      { id: 1739719351563, username: "ejemplo", password: "hashedPassword1" },
      { id: 1739723006732, username: "Juan", password: "hashedPassword2" },
      { id: 1739723049960, username: "Axel", password: "hashedPassword3" }
    ]);
  });

  it('debería retornar un usuario por ID', async () => {
    const respuesta = await request(app).get('/api/usuarios/1739723006732');
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({ id: 1739723006732, username: "Juan", password: "hashedPassword2" });
  });

  it('debería retornar un error si el usuario no existe', async () => {
    const respuesta = await request(app).get('/api/usuarios/999999999999');
    expect(respuesta.status).toBe(404);
    expect(respuesta.body).toEqual({ error: 'Usuario no encontrado' });
  });
});
