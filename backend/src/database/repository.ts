import { 
  Institution, 
  User, 
  BloodBatch, 
  BloodRequest, 
  BloodReservation, 
  ChatMessageEntity, 
  AuditLog 
} from '../types/models';

/**
 * Data Access Layer (Repository Pattern)
 * Designed to connect to PostgreSQL via pg/Prisma/Drizzle owned by Person 2.
 * Includes resilient in-memory fallback store initialized with Chennai institutions
 * to guarantee immediate availability for frontend integration and testing.
 */
class DatabaseRepository {
  public institutions: Map<string, Institution> = new Map();
  public users: Map<string, User> = new Map();
  public inventoryBatches: Map<string, BloodBatch> = new Map();
  public bloodRequests: Map<string, BloodRequest> = new Map();
  public bloodReservations: Map<string, BloodReservation> = new Map();
  public chatMessages: Map<string, ChatMessageEntity[]> = new Map();
  public auditLogs: AuditLog[] = [];

  constructor() {
    this.seedInitialChennaiData();
  }

  private seedInitialChennaiData(): void {
    // 1. Seed Verified Chennai Institutions
    const hospRajalakshmi: Institution = {
      id: 'inst-rajalakshmi',
      name: 'Rajalakshmi Hospital Blood Bank',
      registrationLicenseNumber: 'TN/CHN/2021/BL/0892',
      licenseAuthority: 'Tamil Nadu State Drugs Control / CDSCO',
      institutionType: 'HOSPITAL_BLOOD_BANK',
      latitude: 13.0827,
      longitude: 80.2707,
      addressLine1: 'Poonamallee High Road, Kilpauk',
      locality: 'Kilpauk',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600010',
      emergencyContactPhone: '+91-44-2641-0000',
      officialEmail: 'rajalakshmi@bloodbridge.in',
      isVerified: true,
      verifiedAt: '2021-06-15T10:00:00Z',
      createdAt: '2021-06-15T10:00:00Z',
    };

    const hospCityGeneral: Institution = {
      id: 'inst-city',
      name: 'City General Hospital Blood Centre',
      registrationLicenseNumber: 'TN/CHN/2019/BL/0451',
      licenseAuthority: 'Tamil Nadu State Drugs Control / CDSCO',
      institutionType: 'GOVERNMENT_BLOOD_BANK',
      latitude: 13.1112,
      longitude: 80.2285,
      addressLine1: 'Paper Mills Road, Perambur',
      locality: 'Perambur',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600011',
      emergencyContactPhone: '+91-44-2550-1122',
      officialEmail: 'contact@citygeneral.gov.in',
      isVerified: true,
      verifiedAt: '2019-04-10T11:00:00Z',
      createdAt: '2019-04-10T11:00:00Z',
    };

    const hospApollo: Institution = {
      id: 'inst-apollo',
      name: 'Apollo Blood Bank Greams Road',
      registrationLicenseNumber: 'TN/CHN/2018/BL/0112',
      licenseAuthority: 'Tamil Nadu State Drugs Control / CDSCO',
      institutionType: 'HOSPITAL_BLOOD_BANK',
      latitude: 13.0569,
      longitude: 80.2503,
      addressLine1: '21 Greams Lane, Thousand Lights',
      locality: 'Thousand Lights',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600006',
      emergencyContactPhone: '+91-44-2829-0200',
      officialEmail: 'bloodbank@apollohospitals.com',
      isVerified: true,
      verifiedAt: '2018-02-12T09:30:00Z',
      createdAt: '2018-02-12T09:30:00Z',
    };

    const hospCare: Institution = {
      id: 'inst-care',
      name: 'Care Hospital Blood Storage Centre',
      registrationLicenseNumber: 'TN/CHN/2022/BL/1054',
      licenseAuthority: 'Tamil Nadu State Drugs Control / CDSCO',
      institutionType: 'HOSPITAL_STORAGE_CENTRE',
      latitude: 13.0067,
      longitude: 80.2206,
      addressLine1: 'Mount-Poonamallee Road, Guindy',
      locality: 'Guindy',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600032',
      emergencyContactPhone: '+91-44-4299-8800',
      officialEmail: 'blooddesk@carehospital.org',
      isVerified: true,
      verifiedAt: '2022-09-01T14:00:00Z',
      createdAt: '2022-09-01T14:00:00Z',
    };

    this.institutions.set(hospRajalakshmi.id, hospRajalakshmi);
    this.institutions.set(hospCityGeneral.id, hospCityGeneral);
    this.institutions.set(hospApollo.id, hospApollo);
    this.institutions.set(hospCare.id, hospCare);

    // 2. Seed Users
    // Password for dev user is 'password123'
    // Storing precomputed bcrypt hash: $2a$10$wT8vP0Kq/W5YyU7P8wK2UuIqK9LwT8vP0Kq/W5YyU7P8wK2UuIqK (or handled via auth helper)
    const primaryUser: User = {
      id: 'usr-rajalakshmi-admin',
      institutionId: hospRajalakshmi.id,
      fullName: 'Dr. R. Ramanathan',
      email: 'rajalakshmi@bloodbridge.in',
      phoneNumber: '+919840112233',
      // bcrypt hash for 'password123':
      passwordHash: '$2b$10$epR3Y.Fq.6kH0uT9fWJz3.Ff.1oT0jRzFhQjN/2r8lF4vH7rZ1u1S',
      role: 'HOSPITAL_MEDICAL_OFFICER',
      isActive: true,
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
    };
    this.users.set(primaryUser.id, primaryUser);

    // 3. Seed Batch Inventory for Rajalakshmi Hospital (245 Total Units)
    const batchesData: Array<Partial<BloodBatch>> = [
      { bloodGroup: 'A+', availableUnits: 55, componentType: 'PACKED_RED_BLOOD_CELLS', storageTemperatureC: 4.1 },
      { bloodGroup: 'A-', availableUnits: 28, componentType: 'PACKED_RED_BLOOD_CELLS', storageTemperatureC: 4.0 },
      { bloodGroup: 'B+', availableUnits: 40, componentType: 'PACKED_RED_BLOOD_CELLS', storageTemperatureC: 3.9 },
      { bloodGroup: 'B-', availableUnits: 22, componentType: 'PACKED_RED_BLOOD_CELLS', storageTemperatureC: 4.2 },
      { bloodGroup: 'O+', availableUnits: 40, componentType: 'PACKED_RED_BLOOD_CELLS', storageTemperatureC: 4.1 },
      { bloodGroup: 'O-', availableUnits: 30, componentType: 'PACKED_RED_BLOOD_CELLS', storageTemperatureC: 3.8 },
      { bloodGroup: 'AB+', availableUnits: 18, componentType: 'PACKED_RED_BLOOD_CELLS', storageTemperatureC: 4.0 },
      { bloodGroup: 'AB-', availableUnits: 12, componentType: 'PACKED_RED_BLOOD_CELLS', storageTemperatureC: 4.3 },
      { bloodGroup: 'Bombay Oh', availableUnits: 2, componentType: 'PACKED_RED_BLOOD_CELLS', storageTemperatureC: 4.0, rarePhenotypeDetails: 'Bombay Oh (hh phenotype, non-secretor)' },
    ];

    batchesData.forEach((b, index) => {
      const batchId = `batch-raj-${index + 1}`;
      const now = new Date();
      const expiry = new Date();
      expiry.setDate(now.getDate() + (index === 4 ? 2 : index === 3 ? 4 : 28)); // O+ expiring in 2 days, B- in 4 days

      this.inventoryBatches.set(batchId, {
        id: batchId,
        institutionId: hospRajalakshmi.id,
        donorIdHash: `hash-donor-raj-${index}`,
        bagBarcode: `ISBT-IND-TN-2026-0048${index + 10}`,
        bloodGroup: b.bloodGroup!,
        rarePhenotypeDetails: b.rarePhenotypeDetails,
        componentType: b.componentType!,
        availableUnits: b.availableUnits!,
        reservedUnits: 0,
        collectionDate: now.toISOString().split('T')[0],
        expiryDate: expiry.toISOString().split('T')[0],
        testingStatus: 'MANDATORY_TESTS_PASSED',
        storageTemperatureC: b.storageTemperatureC || 4.0,
        freshnessStatus: 'LIVE_VERIFIED',
        lastVerifiedAt: now.toISOString(),
        createdAt: now.toISOString(),
      });
    });

    // 4. Seed Nearby Partner Inventory (City General, Apollo, Care)
    this.inventoryBatches.set('batch-city-bpos', {
      id: 'batch-city-bpos',
      institutionId: hospCityGeneral.id,
      donorIdHash: 'hash-city-1',
      bagBarcode: 'ISBT-IND-TN-2026-009911',
      bloodGroup: 'B+',
      componentType: 'PACKED_RED_BLOOD_CELLS',
      availableUnits: 12,
      reservedUnits: 0,
      collectionDate: '2026-11-15',
      expiryDate: '2026-12-20',
      testingStatus: 'MANDATORY_TESTS_PASSED',
      storageTemperatureC: 4.0,
      freshnessStatus: 'LIVE_VERIFIED',
      lastVerifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    this.inventoryBatches.set('batch-city-opos', {
      id: 'batch-city-opos',
      institutionId: hospCityGeneral.id,
      donorIdHash: 'hash-city-2',
      bagBarcode: 'ISBT-IND-TN-2026-009912',
      bloodGroup: 'O+',
      componentType: 'PACKED_RED_BLOOD_CELLS',
      availableUnits: 14,
      reservedUnits: 2,
      collectionDate: '2026-11-18',
      expiryDate: '2026-12-25',
      testingStatus: 'MANDATORY_TESTS_PASSED',
      storageTemperatureC: 3.9,
      freshnessStatus: 'LIVE_VERIFIED',
      lastVerifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    this.inventoryBatches.set('batch-apollo-opos', {
      id: 'batch-apollo-opos',
      institutionId: hospApollo.id,
      donorIdHash: 'hash-ap-1',
      bagBarcode: 'ISBT-IND-TN-2026-008811',
      bloodGroup: 'O+',
      componentType: 'PACKED_RED_BLOOD_CELLS',
      availableUnits: 8,
      reservedUnits: 1,
      collectionDate: '2026-11-12',
      expiryDate: '2026-12-18',
      testingStatus: 'MANDATORY_TESTS_PASSED',
      storageTemperatureC: 4.1,
      freshnessStatus: 'RECENTLY_UPDATED',
      lastVerifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    // 5. Seed Initial Chat Messages
    this.chatMessages.set('ch-city', [
      {
        id: 'm1',
        channelId: 'ch-city',
        senderUserId: 'usr-city-admin',
        senderInstitutionId: hospCityGeneral.id,
        senderName: 'City General Hospital',
        senderType: 'hospital',
        messageText: 'We have 10 units of B+ available.',
        isRead: true,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'm2',
        channelId: 'ch-city',
        senderUserId: primaryUser.id,
        senderInstitutionId: hospRajalakshmi.id,
        senderName: 'Rajalakshmi Hospital',
        senderType: 'hospital',
        messageText: 'Great! Please confirm the transfer.',
        isRead: true,
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
    ]);

    this.chatMessages.set('ch-apollo', [
      {
        id: 'm-ap-1',
        channelId: 'ch-apollo',
        senderUserId: 'usr-apollo-admin',
        senderInstitutionId: hospApollo.id,
        senderName: 'Apollo Blood Bank',
        senderType: 'hospital',
        messageText: 'Hello Rajalakshmi Hospital, A+ units are in stock.',
        isRead: true,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'm-ap-2',
        channelId: 'ch-apollo',
        senderUserId: primaryUser.id,
        senderInstitutionId: hospRajalakshmi.id,
        senderName: 'Rajalakshmi Hospital',
        senderType: 'hospital',
        messageText: 'Understood. We will place a reservation shortly.',
        isRead: true,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ]);
  }
}

export const db = new DatabaseRepository();
