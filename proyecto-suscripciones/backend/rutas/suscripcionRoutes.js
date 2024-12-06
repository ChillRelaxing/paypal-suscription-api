const express = require('express');
const router = express.Router();
const suscripcionController = require('../controladores/suscripcionController');

router.post('/suscribir', suscripcionController.crearSuscripcion);
router.post('/cancelar/:suscripcionId', suscripcionController.cancelarSuscripcion);

module.exports = router;