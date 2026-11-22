
import "dotenv/config";
function required(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`missing enviorment variable ${name}`);

    }
    return value;
}
function requiredSecret(name: string): string {
    const value = required(name);
    if (value.length < 32) {
        throw new Error(`${name} must be at least 32 characters`);
    }
    return value;
}
export const env = {
    port: Number(required("PORT")),
    jwtSecret: requiredSecret("JWT_SECRET"),
    redisUrl: required("REDIS_URL"),
    db: {
        host: required("DB_HOST"),
        port: Number(required("DB_PORT")),
       
        user: required("DB_USER"),
        password: required("DB_PASSWORD"),
        name: required("DB_NAME"),
    },
};