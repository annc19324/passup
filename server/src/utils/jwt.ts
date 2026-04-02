import jwt from "jsonwebtoken";

const JWT_SECRET = process.env["JWT_SECRET"] || "fallback_secret";

export function generateToken(userId: number): string {
    return jwt.sign(
        { userId },
        JWT_SECRET,
        {
            expiresIn: "7d"
        }
    )

}

export function verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET)
}