const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env')
});

const connectDB = async () => {
  console.log('Ruta del .env:', path.resolve(__dirname, '../../.env'));
  console.log('MONGODB_URI:', process.env.MONGODB_URI);

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI no está definida');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Conexión a MongoDB establecida exitosamente');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;