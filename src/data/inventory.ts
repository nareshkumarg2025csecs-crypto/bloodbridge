export interface BloodGroupItem {
  id: string;
  type: string;
  units: number;
  rh: '+' | '-';
  tintBg: string;      // Soft pastel background tint
  borderColor: string; // Subtle border color matching tint
  dropColor: string;   // Drop icon color
  hasInnerLabel?: boolean; // Show "AB" text inside droplet
}

export const inventoryStock: BloodGroupItem[] = [
  {
    id: 'a-pos',
    type: 'A+',
    units: 55,
    rh: '+',
    tintBg: '#FDF2F2',
    borderColor: '#FCE7E7',
    dropColor: '#E5484D',
    hasInnerLabel: false,
  },
  {
    id: 'a-neg',
    type: 'A-',
    units: 28,
    rh: '-',
    tintBg: '#F0F6FF',
    borderColor: '#E1EDFE',
    dropColor: '#0284C7',
    hasInnerLabel: false,
  },
  {
    id: 'b-pos',
    type: 'B+',
    units: 40,
    rh: '+',
    tintBg: '#EFF5FF',
    borderColor: '#DBE9FE',
    dropColor: '#1255B5',
    hasInnerLabel: false,
  },
  {
    id: 'b-neg',
    type: 'B-',
    units: 22,
    rh: '-',
    tintBg: '#F0FDF8',
    borderColor: '#D7F7EB',
    dropColor: '#10B981',
    hasInnerLabel: false,
  },
  {
    id: 'o-pos',
    type: 'O+',
    units: 40, // 40 units so the sum equals 245
    rh: '+',
    tintBg: '#FEF9EE',
    borderColor: '#FDF0D5',
    dropColor: '#F59E0B',
    hasInnerLabel: false,
  },
  {
    id: 'o-neg',
    type: 'O-',
    units: 30,
    rh: '-',
    tintBg: '#F0FDFB',
    borderColor: '#D4FAF4',
    dropColor: '#14B8A6',
    hasInnerLabel: false,
  },
  {
    id: 'ab-pos',
    type: 'AB+',
    units: 18,
    rh: '+',
    tintBg: '#F0F5FD',
    borderColor: '#DEEBFB',
    dropColor: '#102B55',
    hasInnerLabel: true,
  },
  {
    id: 'ab-neg',
    type: 'AB-',
    units: 12,
    rh: '-',
    tintBg: '#F0F7FC',
    borderColor: '#E0EEF9',
    dropColor: '#1255B5',
    hasInnerLabel: true,
  },
];

export const getTotalStockUnits = (): number => {
  return inventoryStock.reduce((acc, item) => acc + item.units, 0);
};
