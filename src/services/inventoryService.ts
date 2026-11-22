import { BloodGroupItem, inventoryStock, getTotalStockUnits } from '../data/inventory';
import { StatSummary, initialStats } from '../data/mockData';

// Inventory Service
// Coordinates blood inventory quantities and dashboard counts
// TODO: replace with Nexconn SDK / backend

export const inventoryService = {
  async getStats(): Promise<StatSummary> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return {
      ...initialStats,
      totalUnits: getTotalStockUnits(),
    };
  },

  async getInventory(): Promise<BloodGroupItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return [...inventoryStock];
  },

  async updateStock(id: string, units: number): Promise<BloodGroupItem | null> {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const item = inventoryStock.find((b) => b.id === id);
    if (item) {
      item.units = units;
      return { ...item };
    }
    return null;
  },

  async bulkUploadStock(): Promise<boolean> {
    // Simulated Excel / CSV upload
    await new Promise((resolve) => setTimeout(resolve, 800));
    return true;
  },
};
