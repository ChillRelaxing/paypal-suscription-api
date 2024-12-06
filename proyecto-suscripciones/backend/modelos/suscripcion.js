const mongoose = require('mongoose');

const suscripcionSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true },
  telefono: { type: String, required: true },
  planId: { type: String, required: true },
  fechaInicio: { type: Date, default: Date.now },
  fechaFin: { type: Date, required: true },
  estado: {
    type: String,
    enum: ['PENDING', 'ACTIVE', 'CANCELLED'],
    default: 'PENDING',
  },
  paypalOrderId: { type: String, required: true },
});

module.exports = mongoose.model('Suscripcion', suscripcionSchema);






