import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

interface AuthenticatedClient {
  ws: WebSocket;
  userId: string;
  institutionId?: string;
}

export class WebSocketGateway {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, AuthenticatedClient> = new Map();

  public initialize(server: any): void {
    this.wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', (request: IncomingMessage, socket: any, head: Buffer) => {
      // Parse query string for token
      const url = new URL(request.url || '', `http://${request.headers.host}`);
      if (url.pathname !== '/ws') {
        socket.destroy();
        return;
      }

      const token = url.searchParams.get('token');
      if (!token) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      try {
        const decoded = jwt.verify(token, config.jwt.secret) as { userId: string; institutionId?: string };
        this.wss!.handleUpgrade(request, socket, head, (ws) => {
          this.wss!.emit('connection', ws, request, decoded);
        });
      } catch (err) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
      }
    });

    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage, user: { userId: string; institutionId?: string }) => {
      const clientId = `${user.userId}-${Date.now()}`;
      this.clients.set(clientId, { ws, userId: user.userId, institutionId: user.institutionId });
      console.log(`[WebSocket] Client connected: ${user.userId} (Active clients: ${this.clients.size})`);

      ws.on('message', (message: string) => {
        try {
          const parsed = JSON.parse(message.toString());
          this.handleIncomingEvent(user, parsed);
        } catch (e) {
          console.error('[WebSocket] Malformed message received');
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`[WebSocket] Client disconnected: ${user.userId}`);
      });
    });
  }

  private handleIncomingEvent(sender: { userId: string; institutionId?: string }, payload: any): void {
    // Broadcast chat messages or emergency alerts to connected institution sessions
    const broadcastPayload = JSON.stringify({
      event: payload.event || 'broadcast',
      data: payload.data,
      timestamp: new Date().toISOString(),
    });

    for (const client of this.clients.values()) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(broadcastPayload);
      }
    }
  }

  public broadcastEmergencyAlert(alertData: any): void {
    const payload = JSON.stringify({
      event: 'emergency:alert',
      data: alertData,
      timestamp: new Date().toISOString(),
    });

    for (const client of this.clients.values()) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payload);
      }
    }
  }
}

export const wsGateway = new WebSocketGateway();
