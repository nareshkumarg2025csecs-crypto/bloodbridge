import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  jwt: {
    secret: process.env.JWT_SECRET || 'bloodbridge_dev_jwt_secret_key_chennai_2026_super_secure',
    expiresIn: parseInt(process.env.JWT_EXPIRATION_TIME || '900', 10),
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'bloodbridge_refresh_secret_key_2026_secure',
    refreshExpiresIn: parseInt(process.env.JWT_REFRESH_EXPIRATION_TIME || '604800', 10),
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bloodbridge_db',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'bloodbridge_db',
  },
  nexconn: {
    apiKey: process.env.NEXCONN_API_KEY || '',
    appId: process.env.NEXCONN_APP_ID || '',
    endpoint: process.env.NEXCONN_ENDPOINT || 'https://api.nexconn.io/v1',
    secret: process.env.NEXCONN_SECRET || '',
  },
  notifications: {
    smsApiKey: process.env.SMS_API_KEY || '',
    whatsappApiKey: process.env.WHATSAPP_API_KEY || '',
    exotelSid: process.env.IVR_EXOTEL_SID || '',
    exotelToken: process.env.IVR_EXOTEL_TOKEN || '',
    ivrCallerId: process.env.IVR_CALLER_ID || '+914425501122',
  },
};
