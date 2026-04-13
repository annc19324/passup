import { PayOS } from "@payos/node";

// Khởi tạo theo đúng tài liệu chính thức PayOS v2
const payos = new PayOS({
    clientId: process.env.PAYOS_CLIENT_ID as string,
    apiKey: process.env.PAYOS_API_KEY as string,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY as string,
});

export default payos;
