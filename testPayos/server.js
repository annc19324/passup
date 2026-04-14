const express = require('express');
const cors = require('cors');
const { PayOS } = require('@payos/node');
require('dotenv').config();

const payOS = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/create-payment-link', async (req, res) => {
  const orderCode = Math.floor(Date.now() / 1000);
  const paymentData = {
    orderCode: orderCode,
    amount: 2000,
    description: 'Demo QR Code',
    items: [
      {
        name: 'Sản phẩm thử nghiệm',
        quantity: 1,
        price: 2000,
      },
    ],
    cancelUrl: `http://localhost:${process.env.PORT}/cancel.html`,
    returnUrl: `http://localhost:${process.env.PORT}/success.html`,
  };

  try {
    const paymentLink = await payOS.paymentRequests.create(paymentData);
    res.json(paymentLink);
  } catch (error) {
    console.error('SERVER ERROR:', error);
    res.status(500).json({ 
        error: 'Internal Server Error', 
        message: error.message,
        details: error.response ? error.response.data : 'No additional data'
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Demo server running at http://localhost:${PORT}`);
});
