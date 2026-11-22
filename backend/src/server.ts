import http from 'http';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/env';
import { authRouter } from './routes/authRoutes';
import { inventoryRouter } from './routes/inventoryRoutes';
import { requestRouter } from './routes/requestRoutes';
import { alertRouter } from './routes/alertRoutes';
import { profileRouter } from './routes/profileRoutes';
import { chatRouter } from './routes/chatRoutes';
import { wsGateway } from './websocket/gateway';
import { nexconnService } from './services/nexconnService';

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'BloodBridge Backend API Gateway',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    nexconnStatus: 'ACTIVE',
  });
});

// Mount Routes under API Prefix (/api/v1)
const prefix = config.apiPrefix;
app.use(`${prefix}/auth`, authRouter);
app.use(`${prefix}/inventory`, inventoryRouter);
app.use(`${prefix}/requests`, requestRouter);
app.use(`${prefix}/alerts`, alertRouter);
app.use(`${prefix}/profile`, profileRouter);
app.use(`${prefix}/chat`, chatRouter);

// Initialize WebSockets Gateway & Nexconn Service
wsGateway.initialize(server);
nexconnService.initialize();

// Start Server
if (process.env.NODE_ENV !== 'test') {
  server.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 BloodBridge Backend API Running on http://localhost:${config.port}`);
    console.log(`🌐 API Routes Mounted at ${prefix}`);
    console.log(`💬 WebSocket Gateway Ready at ws://localhost:${config.port}/ws`);
    console.log(`🏥 Chennai Regional Blood Bank Cluster Active`);
    console.log(`=======================================================`);
  });
}

export { app, server };
