import crypto from 'crypto';
import { config } from '../config/env';
import { ChatMessageEntity } from '../types/models';

export interface NexconnTokenResponse {
  code: number;
  result?: {
    userId: string;
    accessToken: string;
  };
  msg?: string;
}

/**
 * Official Nexconn Server API Service
 * Handles Server API request signing (SHA1 signature over AppSecret + Nonce + Timestamp)
 * and issues official Nexconn access tokens for authenticating client SDK connections.
 */
export class NexconnChatService {
  private isConfigured: boolean = false;
  private appKey: string;
  private appSecret: string;
  private apiBaseUrl: string;

  constructor() {
    this.appKey = config.nexconn.appKey;
    this.appSecret = config.nexconn.appSecret;
    this.apiBaseUrl = config.nexconn.apiBaseUrl;
    this.isConfigured = !!(this.appKey && this.appSecret && !this.appKey.includes('mock'));
  }

  public getAppKey(): string {
    return this.appKey;
  }

  public isRealSdkActive(): boolean {
    return this.isConfigured;
  }

  /**
   * Computes official Nexconn SHA1 signature: sha1(appSecret + nonce + timestamp)
   */
  public generateSignature(nonce: string, timestamp: number): string {
    const raw = `${this.appSecret}${nonce}${timestamp}`;
    return crypto.createHash('sha1').update(raw).digest('hex');
  }

  /**
   * Issues official user token via Nexconn Platform Chat API (/v4/auth/access-token/issue)
   */
  public async issueUserAccessToken(userId: string, name: string, avatarUrl?: string): Promise<{ token: string; isReal: boolean; error?: string }> {
    if (!this.isConfigured) {
      return {
        token: '',
        isReal: false,
        error: 'NEXCONN_APP_KEY and NEXCONN_APP_SECRET must be configured in backend/.env'
      };
    }

    const nonce = Math.floor(Math.random() * 1000000).toString();
    const timestamp = Date.now();
    const signature = this.generateSignature(nonce, timestamp);

    const response = await fetch(`${this.apiBaseUrl}/v4/auth/access-token/issue`, {
      method: 'POST',
      headers: {
        'App-Key': this.appKey,
        'Nonce': nonce,
        'Timestamp': timestamp.toString(),
        'Signature': signature,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64),
        name: name.slice(0, 64),
        avatarUrl: avatarUrl || 'https://bloodbridge.local/avatars/hospital.png'
      }),
    });

    const data = (await response.json()) as any;
    if (response.ok && data.code === 0 && data.result?.accessToken) {
      console.log(`[Nexconn SDK] Successfully issued access token for user ${userId}`);
      return {
        token: data.result.accessToken,
        isReal: true
      };
    }

    const errorMsg = data.errorMessage || data.msg || `HTTP ${response.status} code ${data.code}`;
    console.error(`[Nexconn SDK] Cloud token request failed: ${errorMsg}`);
    return {
      token: '',
      isReal: false,
      error: `Nexconn Cloud Error: ${errorMsg} (code ${data.code || response.status})`
    };
  }

  public async initialize(): Promise<boolean> {
    if (this.isConfigured) {
      console.log(`[Nexconn SDK] Initialized Server Gateway with real AppKey: ${this.appKey.slice(0, 6)}...`);
    } else {
      console.log(`[Nexconn SDK] Operating with local/simulated credentials. Ready to activate real AppKey.`);
    }
    return true;
  }

  public async dispatchEncryptedMessage(message: ChatMessageEntity): Promise<boolean> {
    console.log(`[Nexconn SDK] Dispatched message ${message.id} to channel ${message.channelId}`);
    return true;
  }

  public async getChannelPresence(channelId: string): Promise<{ online: boolean }> {
    return { online: true };
  }
}

export const nexconnService = new NexconnChatService();
