// === crear-checkout.js ===
// Backend para crear sesiones de Stripe Checkout dinámicamente

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // ⚠️ Usa la variable de entorno de Netlify

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { line_items, success_url, cancel_url, shipping_address_collection, metadata } = JSON.parse(event.body || '{}');

    // Validar que haya productos
    if (!Array.isArray(line_items) || line_items.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'line_items vacío' }) };
    }

    // Crear sesión de checkout en Stripe
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: success_url || 'https://example.com/success',
      cancel_url: cancel_url || 'https://example.com/cancel',
      shipping_address_collection,
      automatic_tax: { enabled: true },
      metadata,
      billing_address_collection: 'auto',
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id }),
    };

  } catch (err) {
    console.error('❌ Error en Stripe:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
