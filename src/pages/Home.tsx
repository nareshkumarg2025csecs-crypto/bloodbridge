import React, { useEffect, useState } from 'react';
import { TopBar } from '../components/TopBar';
import { HeroBanner } from '../components/HeroBanner';
import { StatCard } from '../components/StatCard';
import { ExpiryAlertCard } from '../components/ExpiryAlertCard';
import { inventoryService } from '../services/inventoryService';
import { initialAlerts, currentHospital, StatSummary } from '../data/mockData';

export const Home: React.FC = () => {
  const [stats, setStats] = useState<StatSummary>({
    totalUnits: 0,
    partnerBanksCount: 0,
    transfersToday: 0,
  });

  useEffect(() => {
    inventoryService.getStats().then((data) => {
      setStats(data);
    });
  }, []);

  const primaryAlert = initialAlerts[0];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* TopBar with Notifications & Navy 'H' Avatar */}
      <TopBar />

      {/* Hero Welcome Banner with 3D Glossy Red Blood Drop */}
      <section aria-label="Welcome Banner" className="relative">
        <HeroBanner
          hospitalName={currentHospital.name}
          subtitle="Together for a healthier community."
        />
      </section>

      {/* 3 Stat Cards in a row */}
      <section
        aria-label="Overview Statistics"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <StatCard
          iconType="droplet"
          value={stats.totalUnits}
          label="Units Available"
        />
        <StatCard
          iconType="landmark"
          value={stats.partnerBanksCount}
          label="Partner Banks"
        />
        <StatCard
          iconType="transfer"
          value={stats.transfersToday}
          label="Transfers Today"
        />
      </section>

      {/* Expiry Alert Card */}
      <section aria-label="Expiry Alert Notification">
        <ExpiryAlertCard
          bloodType={primaryAlert?.bloodType || 'O+'}
          units={primaryAlert?.units || 2}
          days={primaryAlert?.expiresInDays || 2}
        />
      </section>
    </div>
  );
};
