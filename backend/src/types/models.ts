// Data types mapped to Person 2's PostgreSQL Schema

export type InstitutionType = 
  | 'GOVERNMENT_BLOOD_BANK'
  | 'PRIVATE_BLOOD_BANK'
  | 'HOSPITAL_BLOOD_BANK'
  | 'HOSPITAL_STORAGE_CENTRE'
  | 'AUTHORIZED_DIAGNOSTIC_LAB';

export type BloodGroup = 
  | 'A+' | 'A-'
  | 'B+' | 'B-'
  | 'O+' | 'O-'
  | 'AB+' | 'AB-'
  | 'Bombay Oh'
  | 'Other Rare';

export type ComponentType = 
  | 'WHOLE_BLOOD'
  | 'PACKED_RED_BLOOD_CELLS'
  | 'FRESH_FROZEN_PLASMA'
  | 'PLATELET_CONCENTRATE_RDP'
  | 'PLATELET_CONCENTRATE_SDP'
  | 'CRYOPRECIPITATE';

export type TestingStatus = 
  | 'MANDATORY_TESTS_PASSED'
  | 'PENDING_TESTING'
  | 'QUARANTINED'
  | 'REJECTED_DISCARD';

export type FreshnessStatus = 
  | 'LIVE_VERIFIED'
  | 'RECENTLY_UPDATED'
  | 'STALE'
  | 'AWAITING_CONFIRMATION'
  | 'RESERVED'
  | 'UNAVAILABLE';

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'HOSPITAL_MEDICAL_OFFICER'
  | 'BLOOD_BANK_TECHNICIAN'
  | 'PATHOLOGIST'
  | 'PATIENT_ATTENDANT'
  | 'SYSTEM_AUDITOR';

export type UrgencyTier = 
  | 'CODE_RED_MASSIVE_HEMORRHAGE'
  | 'EMERGENCY_SURGERY'
  | 'URGENT_WITHIN_6_HOURS'
  | 'ROUTINE_PLANNED';

export type RequestStatus = 
  | 'PENDING_MATCH'
  | 'NOTIFIED_INSTITUTIONS'
  | 'ACKNOWLEDGED'
  | 'CROSSMATCHING'
  | 'DISPATCHED'
  | 'FULFILLED'
  | 'CANCELLED'
  | 'EXPIRED';

export type ReservationStatus = 
  | 'HELD_PROVISIONAL_TTL'
  | 'CONFIRMED_CROSSMATCHED'
  | 'RELEASED_FOR_TRANSIT'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface Institution {
  id: string;
  name: string;
  registrationLicenseNumber: string;
  licenseAuthority: string;
  institutionType: InstitutionType;
  latitude: number;
  longitude: number;
  addressLine1: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  emergencyContactPhone: string;
  officialEmail: string;
  isVerified: boolean;
  verifiedAt?: string;
  createdAt: string;
}

export interface User {
  id: string;
  institutionId?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  mfaEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface BloodBatch {
  id: string;
  institutionId: string;
  donorIdHash: string;
  bagBarcode: string;
  bloodGroup: BloodGroup;
  rarePhenotypeDetails?: string;
  componentType: ComponentType;
  availableUnits: number;
  reservedUnits: number;
  collectionDate: string;
  expiryDate: string;
  testingStatus: TestingStatus;
  storageTemperatureC: number;
  freshnessStatus: FreshnessStatus;
  lastVerifiedAt: string;
  createdAt: string;
}

export interface BloodRequest {
  id: string;
  requestingInstitutionId?: string;
  createdByUserId: string;
  urgencyTier: UrgencyTier;
  bloodGroupRequested: BloodGroup;
  componentTypeRequested: ComponentType;
  unitsRequested: number;
  patientPseudonymId: string;
  clinicalIndication: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  deliveryLocality: string;
  requisitionDocumentUrl?: string;
  requestStatus: RequestStatus;
  acknowledgedAt?: string;
  fulfilledAt?: string;
  createdAt: string;
}

export interface BloodReservation {
  id: string;
  requestId: string;
  inventoryBatchId: string;
  fulfillingInstitutionId: string;
  unitsReserved: number;
  reservationStatus: ReservationStatus;
  expiresAt: string;
  verificationOtpHash?: string;
  crossmatchVerifiedByUserId?: string;
  releasedAt?: string;
  createdAt: string;
}

export interface ChatMessageEntity {
  id: string;
  channelId: string;
  senderUserId: string;
  senderInstitutionId: string;
  senderName: string;
  senderType: 'hospital' | 'blood_bank' | 'user';
  messageText: string;
  attachmentUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorUserId?: string;
  targetInstitutionId?: string;
  actionCode: string;
  resourceType: string;
  resourceId: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}
