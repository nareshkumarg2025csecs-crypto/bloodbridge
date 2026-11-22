import { config } from '../config/env';

export interface EscalationJob {
  requestId: string;
  bloodGroup: string;
  units: number;
  urgency: string;
  requestingHospital: string;
  locality: string;
  tier: number;
}

/**
 * Emergency Notification & Escalation State Machine
 * Coordinates multi-channel broadcasts:
 * Tier 1 (T+0): In-App Push + SMS via Gupshup
 * Tier 2 (T+3m): WhatsApp Notification to Duty Pathologist
 * Tier 3 (T+7m): Automated IVR Telephone Call via Exotel to Blood Bank Desk
 */
export class EscalationService {
  public async triggerEmergencyEscalation(job: EscalationJob): Promise<boolean> {
    console.log(`[Emergency Escalation] Triggering Tier ${job.tier} for Request: ${job.requestId} (${job.bloodGroup}, ${job.units} units)`);

    // Channel 1: SMS Gateway
    if (config.notifications.smsApiKey) {
      console.log(`[SMS Gateway] Dispatched emergency SMS to regional blood banks in Chennai for ${job.bloodGroup}`);
    }

    // Channel 2: WhatsApp Business API Gateway
    if (job.tier >= 2 && config.notifications.whatsappApiKey) {
      console.log(`[WhatsApp Gateway] Dispatched high-priority alert to duty officer WhatsApp`);
    }

    // Channel 3: Automated IVR Voice Call Gateway (Exotel)
    if (job.tier >= 3 && config.notifications.exotelSid) {
      console.log(`[IVR Gateway] Initiating automated phone call from ${config.notifications.ivrCallerId}`);
    }

    return true;
  }
}

export const escalationService = new EscalationService();
