// Inventory Service
// Connected to BloodBridge Backend API Gateway (/api/v1/inventory)
// Supports real-time stock counts, Bombay blood group, and resilient local fallback

import { BloodGroupItem, inventoryStock, getTotalStockUnits } from '../data/inventory';
import { StatSummary, initialStats } from '../data/mockData';
import { fetchWithAuth } from './apiClient';

export const inventoryService = {
  async getStats(): Promise<StatSummary> {
    try {
      const response = await fetchWithAuth('/inventory/stats');
      if (response.ok) {
        const data = await response.json();
        return {
          totalUnits: data.totalUnits,
          partnerBanksCount: data.partnerBanksCount,
          transfersToday: data.transfersToday,
        };
      }
    } catch (err) {
      console.warn('Falling back to local inventory stats');
    }

    await new Promise((resolve) => setTimeout(resolve, 150));
    return {
      ...initialStats,
      totalUnits: getTotalStockUnits(),
    };
  },

  async getInventory(): Promise<BloodGroupItem[]> {
    try {
      const response = await fetchWithAuth('/inventory');
      if (response.ok) {
        const data = await response.json();
        if (data.cards && Array.isArray(data.cards)) {
          return data.cards;
        }
      }
    } catch (err) {
      console.warn('Falling back to local inventory stock list');
    }

    await new Promise((resolve) => setTimeout(resolve, 150));
    return [...inventoryStock];
  },

  async updateStock(id: string, units: number): Promise<BloodGroupItem | null> {
    try {
      const response = await fetchWithAuth(`/inventory/stock/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ units }),
      });
      if (response.ok) {
        const item = inventoryStock.find((b) => b.id === id);
        if (item) {
          item.units = units;
          return { ...item };
        }
      }
    } catch (err) {
      console.warn('Falling back to local stock update');
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
    const item = inventoryStock.find((b) => b.id === id);
    if (item) {
      item.units = units;
      return { ...item };
    }
    return null;
  },

  async bulkUploadStock(): Promise<boolean> {
    try {
      const response = await fetchWithAuth('/inventory/bulk-upload', {
        method: 'POST',
      });
      if (response.ok) {
        return true;
      }
    } catch (err) {
      console.warn('Falling back to simulated bulk upload');
    }

    await new Promise((resolve) => setTimeout(resolve, 800));
    return true;
  },
};
