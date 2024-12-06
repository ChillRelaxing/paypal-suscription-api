const axios = require('axios');
const Suscripcion = require('../modelos/suscripcion');

const getAccessToken = async () => {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const response = await axios.post(
    'https://api-m.sandbox.paypal.com/v1/oauth2/token',
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data.access_token;
};

exports.crearSuscripcion = async (req, res) => {
  try {
    const { nombre, correo, telefono, planId } = req.body;
    console.log('datos:',nombre, correo, telefono, planId);

    const accessToken = await getAccessToken();

    const response = await axios.post(
      'https://api-m.sandbox.paypal.com/v1/billing/subscriptions',
      {
        plan_id: planId,
        subscriber: {
          name: {
            given_name: nombre.split(' ')[0],
            surname: nombre.split(' ')[1] || '',
          },
          email_address: correo,
        },
        application_context: {
          brand_name: 'Mi Aplicación',
          locale: 'es-ES',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          return_url: 'http://localhost:3000/cancelar-suscripcion.html',
          cancel_url: 'http://localhost:3000',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const approvalLink = response.data.links.find(
      (link) => link.rel === 'approve'
    ).href;

    const suscripcion = new Suscripcion({
      nombre,
      correo,
      telefono,
      planId,
      fechaInicio: new Date(),
      fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      estado: 'ACTIVE',
      paypalOrderId: response.data.id,
    });

    await suscripcion.save();

    res.json({
      mensaje: 'Suscripción creada con éxito',
      approvalLink,
      suscripcionId: suscripcion._id,
    });
  } catch (error) {
    console.error('Error creando suscripción:', error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.cancelarSuscripcion = async (req, res) => {
  try {
    const { suscripcionId } = req.params;

    const suscripcionList = await Suscripcion.find({paypalOrderId:suscripcionId});
    const suscripcion = suscripcionList[0]
    if (!suscripcion) {
      return res.status(404).json({ mensaje: 'Suscripción no encontrada' });
    }

    const accessToken = await getAccessToken();

    await axios.post(
      `https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${suscripcion.paypalOrderId}/cancel`,
      {
        reason: 'Cancelada por el usuario.',
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    suscripcion.estado = 'CANCELLED';
    await suscripcion.save();

    res.json({
      mensaje: 'Suscripción cancelada exitosamente',
      suscripcion,
    });
  } catch (error) {
    console.error('Error cancelando suscripción:', error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
};
