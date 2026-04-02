import "dotenv/config";
import { PrismaClient } from "@prisma/client";

// Tạo PrismaClient
const prisma = new PrismaClient();

export default prisma;