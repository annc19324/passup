const { PayOS } = require('@payos/node'); require('dotenv').config(); 
const payos = new PayOS({ 
    clientId: process.env.PAYOS_CLIENT_ID, 
    apiKey: process.env.PAYOS_API_KEY, 
    checksumKey: process.env.PAYOS_CHECKSUM_KEY 
}); 
async function test() { 
    try { 
        const orderCode = Math.floor(Date.now() / 1000); 
        const amount = 10000; 
        const description = '1 luot day tin'; 
        const type = 'PUSH_PACK_1'; 
        const paymentData = { 
            orderCode: orderCode, 
            amount: Number(amount), 
            description: description || 'Thanh toan PassUp', 
            items: [ 
                { 
                    name: 'Nap Luot PassUp', 
                    quantity: 1, 
                    price: Number(amount), 
                } 
            ], 
            cancelUrl: 'http://localhost:5173/profile', 
            returnUrl: 'http://localhost:5173/profile', 
        }; 
        console.log('payload', paymentData); 
        const paymentLink = await payos.paymentRequests.create(paymentData); 
        console.log('success', paymentLink.checkoutUrl); 
    } catch (error) { 
        console.error('error', error); 
    } 
} 
test();
