import http from "http";
import app from "./app";
import { initSocket } from "./config/socket";

const PORT = process.env["PORT"] || 3000;
const server = http.createServer(app);

// Khởi tạo Socket.io
initSocket(server);

server.listen(PORT, () => {
    console.log(`Server & Socket.io is running on http://localhost:${PORT}`);
});
