const express = require('express');
const { obtenerUsuarios, obtenerUsuarioPorId } = require('../controllers/UsuariosController');
const router = express.Router();

router.get('/usuarios', obtenerUsuarios);
router.get('/usuarios/:id', obtenerUsuarioPorId);

module.exports = router;
