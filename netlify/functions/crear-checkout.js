const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    const { items } = JSON.parse(event.body);

    // Convierte los productos del carrito en line_items para Stripe
    const line_items = items.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.nombre,
        },
        unit_amount: Math.round(item.precio * 100),
      },
      quantity: item.cantidad,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url: `${event.headers.origin}/success.html`,
      cancel_url: `${event.headers.origin}/cancel.html`,
      automatic_tax: { enabled: true },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id }),
    };
  } catch (error) {
    console.error('❌ Error creando sesión de pago:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
