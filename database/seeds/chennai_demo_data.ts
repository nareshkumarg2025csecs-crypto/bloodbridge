export interface ChennaiAreaConfig {
  area: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  institutionName: string;
  type: 'HOSPITAL' | 'PRIVATE_BLOOD_BANK' | 'GOVERNMENT_BLOOD_BANK' | 'STORAGE_CENTRE';
  address: string;
  phone: string;
  email: string;
  license: string;
}

export const CHENNAI_DEMO_INSTITUTIONS: ChennaiAreaConfig[] = [
  // 1-8 Existing Initial Hubs
  {
    area: 'Kilpauk',
    postalCode: '600010',
    latitude: 13.08268,
    longitude: 80.2435,
    institutionName: 'Govt Central Blood Bank - Kilpauk Medical Hub [SYNTHETIC DEMO]',
    type: 'GOVERNMENT_BLOOD_BANK',
    address: '822 EVR Periyar Salai, Kilpauk',
    phone: '+914428364001',
    email: 'kilpauk.hub@bloodbridge.demo',
    license: 'LIC-CHN-GOV-2026-001'
  },
  {
    area: 'Anna Nagar',
    postalCode: '600040',
    latitude: 13.085,
    longitude: 80.21,
    institutionName: 'Anna Nagar Premier Blood Centre [SYNTHETIC DEMO]',
    type: 'PRIVATE_BLOOD_BANK',
    address: '2nd Avenue, Block C, Anna Nagar',
    phone: '+914426215002',
    email: 'annanagar.premier@bloodbridge.demo',
    license: 'LIC-CHN-PVT-2026-002'
  },
  {
    area: 'Adyar',
    postalCode: '600020',
    latitude: 13.0012,
    longitude: 80.2565,
    institutionName: 'Adyar Regional Transfusion & Research Centre [SYNTHETIC DEMO]',
    type: 'HOSPITAL',
    address: 'Sardar Patel Road, Adyar',
    phone: '+914424916003',
    email: 'adyar.transfusion@bloodbridge.demo',
    license: 'LIC-CHN-HOS-2026-003'
  },
  {
    area: 'Tambaram',
    postalCode: '600047',
    latitude: 12.9249,
    longitude: 80.1197,
    institutionName: 'Tambaram Emergency Blood Storage Centre [SYNTHETIC DEMO]',
    type: 'STORAGE_CENTRE',
    address: 'GST Road, Tambaram Sanatorium',
    phone: '+914422267004',
    email: 'tambaram.storage@bloodbridge.demo',
    license: 'LIC-CHN-STG-2026-004'
  },
  {
    area: 'Kolathur',
    postalCode: '600099',
    latitude: 13.1235,
    longitude: 80.2089,
    institutionName: 'Kolathur LifeBridge Blood Hub [SYNTHETIC DEMO]',
    type: 'PRIVATE_BLOOD_BANK',
    address: 'Redhills Main Road, Kolathur',
    phone: '+914425508005',
    email: 'kolathur.life@bloodbridge.demo',
    license: 'LIC-CHN-PVT-2026-005'
  },
  {
    area: 'Perambur',
    postalCode: '600011',
    latitude: 13.111,
    longitude: 80.235,
    institutionName: 'Perambur Central Railway Blood Bank [SYNTHETIC DEMO]',
    type: 'GOVERNMENT_BLOOD_BANK',
    address: 'Siruvallur High Road, Perambur',
    phone: '+914426749006',
    email: 'perambur.railway@bloodbridge.demo',
    license: 'LIC-CHN-GOV-2026-006'
  },
  {
    area: 'T. Nagar',
    postalCode: '600017',
    latitude: 13.0418,
    longitude: 80.2341,
    institutionName: 'T. Nagar Metro Care Blood Bank [SYNTHETIC DEMO]',
    type: 'HOSPITAL',
    address: 'Usman Road, T. Nagar',
    phone: '+914424341007',
    email: 'tnagar.metro@bloodbridge.demo',
    license: 'LIC-CHN-HOS-2026-007'
  },
  {
    area: 'Velachery',
    postalCode: '600042',
    latitude: 12.975,
    longitude: 80.22,
    institutionName: 'Velachery South Transfusion Depot [SYNTHETIC DEMO]',
    type: 'STORAGE_CENTRE',
    address: '100 Feet Bypass Road, Velachery',
    phone: '+914422442008',
    email: 'velachery.depot@bloodbridge.demo',
    license: 'LIC-CHN-STG-2026-008'
  },

  // 9-36 Comprehensive Chennai Demo Network
  {
    area: 'Ambattur',
    postalCode: '600053',
    latitude: 13.1143,
    longitude: 80.1548,
    institutionName: 'Ambattur Industrial Area Blood Centre [SYNTHETIC DEMO]',
    type: 'PRIVATE_BLOOD_BANK',
    address: 'MTH Road, Ambattur Industrial Estate',
    phone: '+914426581009',
    email: 'ambattur.blood@bloodbridge.demo',
    license: 'LIC-CHN-PVT-2026-009'
  },
  {
    area: 'Avadi',
    postalCode: '600054',
    latitude: 13.1147,
    longitude: 80.1018,
    institutionName: 'Avadi Defence Colony Blood Storage Unit [SYNTHETIC DEMO]',
    type: 'STORAGE_CENTRE',
    address: 'HVF Road, Avadi Military Base Area',
    phone: '+914426382010',
    email: 'avadi.storage@bloodbridge.demo',
    license: 'LIC-CHN-STG-2026-010'
  },
  {
    area: 'Nungambakkam',
    postalCode: '600034',
    latitude: 13.0595,
    longitude: 80.2425,
    institutionName: 'Nungambakkam Specialty Hospital Blood Bank [SYNTHETIC DEMO]',
    type: 'HOSPITAL',
    address: 'College Road, Nungambakkam',
    phone: '+914428273011',
    email: 'nungambakkam.care@bloodbridge.demo',
    license: 'LIC-CHN-HOS-2026-011'
  },
  {
    area: 'Greams Road',
    postalCode: '600006',
    latitude: 13.0601,
    longitude: 80.2522,
    institutionName: 'Greams Road Metro Transfusion Hub [SYNTHETIC DEMO]',
    type: 'PRIVATE_BLOOD_BANK',
    address: '21 Greams Lane, Thousand Lights West',
    phone: '+914428294012',
    email: 'greams.transfusion@bloodbridge.demo',
    license: 'LIC-CHN-PVT-2026-012'
  },
  {
    area: 'Thousand Lights',
    postalCode: '600006',
    latitude: 13.0569,
    longitude: 80.2536,
    institutionName: 'Thousand Lights Apex Blood Bank [SYNTHETIC DEMO]',
    type: 'HOSPITAL',
    address: 'Anna Salai, Thousand Lights',
    phone: '+914428295013',
    email: 'thousandlights.apex@bloodbridge.demo',
    license: 'LIC-CHN-HOS-2026-013'
  },
  {
    area: 'Egmore',
    postalCode: '600008',
    latitude: 13.0782,
    longitude: 80.2606,
    institutionName: 'Egmore Children & Maternity Blood Centre [SYNTHETIC DEMO]',
    type: 'GOVERNMENT_BLOOD_BANK',
    address: 'EVR Periyar Salai, Egmore',
    phone: '+914428196014',
    email: 'egmore.mch@bloodbridge.demo',
    license: 'LIC-CHN-GOV-2026-014'
  },
  {
    area: 'Royapettah',
    postalCode: '600014',
    latitude: 13.0538,
    longitude: 80.2642,
    institutionName: 'Royapettah Emergency Blood Services [SYNTHETIC DEMO]',
    type: 'GOVERNMENT_BLOOD_BANK',
    address: 'Westcott Road, Royapettah',
    phone: '+914428487015',
    email: 'royapettah.gov@bloodbridge.demo',
    license: 'LIC-CHN-GOV-2026-015'
  },
  {
    area: 'Mylapore',
    postalCode: '600004',
    latitude: 13.0368,
    longitude: 80.2676,
    institutionName: 'Mylapore Heritage Community Blood Bank [SYNTHETIC DEMO]',
    type: 'PRIVATE_BLOOD_BANK',
    address: 'Kutchery Road, Mylapore',
    phone: '+914424988016',
    email: 'mylapore.blood@bloodbridge.demo',
    license: 'LIC-CHN-PVT-2026-016'
  },
  {
    area: 'Guindy',
    postalCode: '600032',
    latitude: 13.0067,
    longitude: 80.2025,
    institutionName: 'Guindy Institutional Blood Storage Hub [SYNTHETIC DEMO]',
    type: 'STORAGE_CENTRE',
    address: 'GST Road, Guindy Industrial Corridor',
    phone: '+914422329017',
    email: 'guindy.storage@bloodbridge.demo',
    license: 'LIC-CHN-STG-2026-017'
  },
  {
    area: 'Chromepet',
    postalCode: '600044',
    latitude: 12.9516,
    longitude: 80.1462,
    institutionName: 'Chromepet Sub-Divisional Hospital Blood Bank [SYNTHETIC DEMO]',
    type: 'GOVERNMENT_BLOOD_BANK',
    address: 'GST Road, Chromepet',
    phone: '+914422410018',
    email: 'chromepet.hospital@bloodbridge.demo',
    license: 'LIC-CHN-GOV-2026-018'
  },
  {
    area: 'Pallavaram',
    postalCode: '600043',
    latitude: 12.9675,
    longitude: 80.1491,
    institutionName: 'Pallavaram Cantonment Blood Storage Depot [SYNTHETIC DEMO]',
    type: 'STORAGE_CENTRE',
    address: 'Old Trunk Road, Pallavaram',
    phone: '+914422641019',
    email: 'pallavaram.depot@bloodbridge.demo',
    license: 'LIC-CHN-STG-2026-019'
  },
  {
    area: 'Porur',
    postalCode: '600116',
    latitude: 13.0382,
    longitude: 80.1565,
    institutionName: 'Porur Medical College Blood Bank [SYNTHETIC DEMO]',
    type: 'HOSPITAL',
    address: 'Mount Poonamallee High Road, Porur',
    phone: '+914424762020',
    email: 'porur.medcollege@bloodbridge.demo',
    license: 'LIC-CHN-HOS-2026-020'
  },
  {
    area: 'Vadapalani',
    postalCode: '600026',
    latitude: 13.05,
    longitude: 80.2121,
    institutionName: 'Vadapalani Multi-Speciality Blood Bank [SYNTHETIC DEMO]',
    type: 'PRIVATE_BLOOD_BANK',
    address: 'Arcot Road, Vadapalani',
    phone: '+914424833021',
    email: 'vadapalani.blood@bloodbridge.demo',
    license: 'LIC-CHN-PVT-2026-021'
  },
  {
    area: 'Sholinganallur',
    postalCode: '600119',
    latitude: 12.8996,
    longitude: 80.2279,
    institutionName: 'Sholinganallur IT-Corridor Emergency Blood Centre [SYNTHETIC DEMO]',
    type: 'HOSPITAL',
    address: 'OMR Junction, Sholinganallur',
    phone: '+914424504022',
    email: 'sholinganallur.emer@bloodbridge.demo',
    license: 'LIC-CHN-HOS-2026-022'
  },
  {
    area: 'OMR',
    postalCode: '600096',
    latitude: 12.9366,
    longitude: 80.2312,
    institutionName: 'OMR Perungudi Tech-Park Blood Storage [SYNTHETIC DEMO]',
    type: 'STORAGE_CENTRE',
    address: 'Rajiv Gandhi Salai, Perungudi, OMR',
    phone: '+914424965023',
    email: 'omr.storage@bloodbridge.demo',
    license: 'LIC-CHN-STG-2026-023'
  },
  {
    area: 'Thiruvanmiyur',
    postalCode: '600041',
    latitude: 12.983,
    longitude: 80.2594,
    institutionName: 'Thiruvanmiyur Coastal Blood Care [SYNTHETIC DEMO]',
    type: 'PRIVATE_BLOOD_BANK',
    address: 'East Coast Road, Thiruvanmiyur',
    phone: '+914424416024',
    email: 'thiruvanmiyur.care@bloodbridge.demo',
    license: 'LIC-CHN-PVT-2026-024'
  },
  {
    area: 'Saidapet',
    postalCode: '600015',
    latitude: 13.0213,
    longitude: 80.2231,
    institutionName: 'Saidapet Taluk Hospital Blood Unit [SYNTHETIC DEMO]',
    type: 'GOVERNMENT_BLOOD_BANK',
    address: 'Anna Salai, Saidapet',
    phone: '+914424357025',
    email: 'saidapet.taluk@bloodbridge.demo',
    license: 'LIC-CHN-GOV-2026-025'
  },
  {
    area: 'Triplicane',
    postalCode: '600005',
    latitude: 13.0587,
    longitude: 80.2757,
    institutionName: 'Triplicane Coastal Charitable Blood Centre [SYNTHETIC DEMO]',
    type: 'PRIVATE_BLOOD_BANK',
    address: 'Triplicane High Road, Triplicane',
    phone: '+914428448026',
    email: 'triplicane.blood@bloodbridge.demo',
    license: 'LIC-CHN-PVT-2026-026'
  },
  {
    area: 'Poonamallee',
    postalCode: '600056',
    latitude: 13.0489,
    longitude: 80.0911,
    institutionName: 'Poonamallee Suburban Blood Storage Depot [SYNTHETIC DEMO]',
    type: 'STORAGE_CENTRE',
    address: 'Trunk Road, Poonamallee',
    phone: '+914426279027',
    email: 'poonamallee.depot@bloodbridge.demo',
    license: 'LIC-CHN-STG-2026-027'
  },
  {
    area: 'Madhavaram',
    postalCode: '600060',
    latitude: 13.1488,
    longitude: 80.2306,
    institutionName: 'Madhavaram North Transfusion Centre [SYNTHETIC DEMO]',
    type: 'GOVERNMENT_BLOOD_BANK',
    address: 'Madhavaram High Road, Madhavaram',
    phone: '+914425530028',
    email: 'madhavaram.north@bloodbridge.demo',
    license: 'LIC-CHN-GOV-2026-028'
  },
  {
    area: 'Kotturpuram',
    postalCode: '600085',
    latitude: 13.0167,
    longitude: 80.2435,
    institutionName: 'Kotturpuram Advanced Research Blood Bank [SYNTHETIC DEMO]',
    type: 'HOSPITAL',
    address: 'Gandhi Mandapam Road, Kotturpuram',
    phone: '+914424421029',
    email: 'kotturpuram.research@bloodbridge.demo',
    license: 'LIC-CHN-HOS-2026-029'
  },
  {
    area: 'Alwarpet',
    postalCode: '600018',
    latitude: 13.0336,
    longitude: 80.2504,
    institutionName: 'Alwarpet Specialized Transfusion Clinic [SYNTHETIC DEMO]',
    type: 'PRIVATE_BLOOD_BANK',
    address: 'TTK Road, Alwarpet',
    phone: '+914424992030',
    email: 'alwarpet.clinic@bloodbridge.demo',
    license: 'LIC-CHN-PVT-2026-030'
  },
  {
    area: 'Medavakkam',
    postalCode: '600100',
    latitude: 12.9193,
    longitude: 80.1923,
    institutionName: 'Medavakkam South Transfusion Storage [SYNTHETIC DEMO]',
    type: 'STORAGE_CENTRE',
    address: 'Velachery Main Road, Medavakkam',
    phone: '+914422773031',
    email: 'medavakkam.storage@bloodbridge.demo',
    license: 'LIC-CHN-STG-2026-031'
  },
  {
    area: 'Pallikaranai',
    postalCode: '600100',
    latitude: 12.9372,
    longitude: 80.2144,
    institutionName: 'Pallikaranai Marshland Regional Blood Hub [SYNTHETIC DEMO]',
    type: 'HOSPITAL',
    address: '200 Feet Radial Road, Pallikaranai',
    phone: '+914422464032',
    email: 'pallikaranai.hub@bloodbridge.demo',
    license: 'LIC-CHN-HOS-2026-032'
  },
  {
    area: 'Teynampet',
    postalCode: '600018',
    latitude: 13.0405,
    longitude: 80.2503,
    institutionName: 'Teynampet Central Healthcare Blood Bank [SYNTHETIC DEMO]',
    type: 'HOSPITAL',
    address: 'Anna Salai, Teynampet',
    phone: '+914424335033',
    email: 'teynampet.health@bloodbridge.demo',
    license: 'LIC-CHN-HOS-2026-033'
  },
  {
    area: 'Chetpet',
    postalCode: '600031',
    latitude: 13.0716,
    longitude: 80.2415,
    institutionName: 'Chetpet Railway Hospital Blood Unit [SYNTHETIC DEMO]',
    type: 'GOVERNMENT_BLOOD_BANK',
    address: 'McNichols Road, Chetpet',
    phone: '+914428366034',
    email: 'chetpet.railway@bloodbridge.demo',
    license: 'LIC-CHN-GOV-2026-034'
  },
  {
    area: 'Shenoy Nagar',
    postalCode: '600030',
    latitude: 13.0789,
    longitude: 80.2248,
    institutionName: 'Shenoy Nagar Metro Blood Storage Depot [SYNTHETIC DEMO]',
    type: 'STORAGE_CENTRE',
    address: 'Pulla Avenue, Shenoy Nagar',
    phone: '+914426647035',
    email: 'shenoynagar.depot@bloodbridge.demo',
    license: 'LIC-CHN-STG-2026-035'
  },
  {
    area: 'Koyambedu',
    postalCode: '600107',
    latitude: 13.0694,
    longitude: 80.1948,
    institutionName: 'Koyambedu Transit Hub Emergency Blood Unit [SYNTHETIC DEMO]',
    type: 'STORAGE_CENTRE',
    address: 'Inner Ring Road, Koyambedu CMBT',
    phone: '+914424798036',
    email: 'koyambedu.transit@bloodbridge.demo',
    license: 'LIC-CHN-STG-2026-036'
  }
];
