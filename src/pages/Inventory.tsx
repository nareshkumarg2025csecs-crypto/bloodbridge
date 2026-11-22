import React, { useEffect, useState } from 'react';
import { TopBar } from '../components/TopBar';
import { BloodCard } from '../components/BloodCard';
import { inventoryService } from '../services/inventoryService';
import { BloodGroupItem } from '../data/inventory';

export const Inventory: React.FC = () => {
  const [stockList, setStockList] = useState<BloodGroupItem[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<BloodGroupItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    inventoryService.getInventory().then((data) => {
      setStockList(data);
    });
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleConfirmUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    await inventoryService.bulkUploadStock();
    setIsUploading(false);
    setShowUploadModal(false);
    triggerToast('Stock inventory updated successfully from sheet!');
  };

  return (
    <div className="w-full flex flex-col gap-6 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-navy text-white px-5 py-3 rounded-btn shadow-soft-lg flex items-center gap-3 text-sm font-medium border border-navy-light animate-in fade-in slide-in-from-top-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TopBar with Page Title and Update Button */}
      <TopBar
        title="Blood Inventory"
        subtitle="Real-time stock overview"
        actionButton={
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-btn bg-primary hover:bg-primary-dark text-white font-medium text-sm shadow-soft transition-all duration-200 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>Update</span>
          </button>
        }
      />

      {/* Grid of 8 Blood Cards: 4 columns x 2 rows */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl">
        {stockList.map((item) => (
          <BloodCard
            key={item.id}
            stock={item}
            onSelect={(selected) => setSelectedStock(selected)}
          />
        ))}
      </div>

      {/* Upload Excel/CSV Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card p-6 sm:p-8 w-full max-w-md shadow-soft-lg border border-border animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-navy">Update Inventory</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-text-muted hover:text-navy text-lg p-1"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-text-muted">
              Upload blood bank stock record to sync available units.
            </p>

            <form onSubmit={handleConfirmUpload} className="mt-6 space-y-6">
              {/* Dashed Drag & Drop Zone */}
              <div className="border-2 border-dashed border-[#BCD3F5] rounded-xl p-8 bg-[#F5F8FD]/60 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary-50/50 hover:border-primary transition-all">
                <div className="w-12 h-12 rounded-full bg-[#EAF2FD] flex items-center justify-center mb-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1255B5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-navy">
                  Upload Excel sheet (.xlsx / .csv)
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Drag and drop files here or click to browse
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  id="file-upload"
                  onChange={() => triggerToast('File attached')}
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-5 py-2.5 text-sm font-medium text-text-muted hover:text-navy cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-btn shadow-soft cursor-pointer flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Confirm</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Edit Stock Modal */}
      {selectedStock && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card p-6 w-full max-w-sm shadow-soft-lg border border-border animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-navy">Adjust {selectedStock.type} Stock</h3>
            <p className="text-xs text-text-muted mt-0.5">Quickly edit units reserved</p>

            <div className="mt-4 flex items-center gap-4">
              <input
                type="number"
                min="0"
                max="999"
                defaultValue={selectedStock.units}
                id="units-input"
                className="w-full px-4 py-2 rounded-input border border-border text-lg font-bold text-navy focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setSelectedStock(null)}
                className="px-4 py-2 text-sm text-text-muted hover:text-navy"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = parseInt((document.getElementById('units-input') as HTMLInputElement).value) || 0;
                  inventoryService.updateStock(selectedStock.id, val).then((updated) => {
                    if (updated) {
                      setStockList((prev) =>
                        prev.map((s) => (s.id === updated.id ? { ...updated } : s))
                      );
                    }
                  });
                  setSelectedStock(null);
                  triggerToast(`${selectedStock.type} updated to ${val} units`);
                }}
                className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-btn"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
