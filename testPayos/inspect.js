const { PayOS } = require('@payos/node');
const payOS = new PayOS({
  clientId: "b6c1202c-f42d-4f26-885d-df1d17536568",
  apiKey: "86da5ed1-25ac-471a-b249-5cb30065be44",
  checksumKey: "12f00730e075f71de32e27ad393307f88c3abd6dd3cdb38a9ca3240918e432a7"
});
console.log('PaymentRequests Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(payOS.paymentRequests)));
