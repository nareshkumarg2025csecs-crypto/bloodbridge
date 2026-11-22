import React from 'react';
import { BloodGroupItem } from '../data/inventory';

interface BloodCardProps {
  stock: BloodGroupItem;
  onSelect?: (stock: BloodGroupItem) => void;
}

export const BloodCard: React.FC<BloodCardProps> = ({ stock, onSelect }) => {
  return (
    <div
      onClick={() => onSelect?.(stock)}
      style={{
        backgroundColor: stock.tintBg,
        borderColor: stock.borderColor,
      }}
      className="h-[140px] rounded-card p-4 border shadow-soft flex flex-col items-center justify-center text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-soft-md cursor-pointer group select-none relative overflow-hidden"
    >
      {/* Centered droplet icon in a colored circle */}
      <div className="w-11 h-11 mb-2 rounded-full bg-white/80 border border-white flex items-center justify-center shadow-sm relative shrink-0">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 transition-transform duration-200 group-hover:scale-105"
        >
          {/* Droplet shape */}
          <path
            d="M12 2.5 C12 2.5 5 10.5 5 15.5 C5 19.4 8.1 22.5 12 22.5 C15.9 22.5 19 19.4 19 15.5 C19 10.5 12 2.5 12 2.5 Z"
            fill={stock.dropColor}
          />
          {/* Subtle glossy glare */}
          <ellipse
            cx="9.5"
            cy="15"
            rx="1.8"
            ry="3.2"
            transform="rotate(-25 9.5 15)"
            fill="#FFFFFF"
            fillOpacity="0.45"
          />
        </svg>

        {/* Navy droplet with "AB" text inside for AB+ and AB- */}
        {stock.hasInnerLabel && (
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white pt-1 pointer-events-none tracking-tighter">
            AB
          </span>
        )}
      </div>

      {/* Blood group label */}
      <h3 className="text-base font-bold text-navy tracking-tight leading-none mb-1">
        {stock.type}
      </h3>

      {/* Units */}
      <p className="text-xs text-text-muted font-normal">
        {stock.units} units
      </p>
    </div>
  );
};
