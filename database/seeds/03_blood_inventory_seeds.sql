-- ==============================================================================
-- BLOODBRIDGE SYNTHETIC INVENTORY & UNIT-LEVEL SEEDS
-- Covers Standard Groups, Expired Units, Quarantined Units, and Verified Rare Bombay Phenotype
-- ==============================================================================

-- 1. Summary Batch Inventory Records
-- (Inst 1, Branch 1: Kilpauk) - 10 PRBC O-, 5 FFP Bombay, 20 PRBC B+
INSERT INTO `blood_inventory` (`id`, `institution_id`, `branch_id`, `blood_group_id`, `phenotype_id`, `blood_component_id`, `available_units`, `reserved_units`, `quarantined_units`, `expired_units`, `last_updated_by`) VALUES
(1, 1, 1, 8, NULL, 2, 1, 0, 0, 0, 2), -- O- PRBC: 1 available (Critical Concurrency Test Unit)
(2, 1, 1, 3, NULL, 2, 15, 2, 1, 1, 2), -- B+ PRBC
(3, 3, 3, 7, 1, 2, 2, 0, 0, 0, 4),    -- O+ PRBC with BOMBAY PHENOTYPE: 2 units (Adyar Research)
(4, 5, 5, 8, NULL, 2, 4, 0, 0, 1, 2),    -- O- PRBC in Kolathur (Nearby)
(5, 2, 2, 1, NULL, 3, 10, 0, 0, 0, 3)    -- A+ Platelets in Anna Nagar
ON DUPLICATE KEY UPDATE `available_units` = VALUES(`available_units`);

-- 2. Traceable Unit-Level Inventory Records
INSERT INTO `blood_inventory_units` (`id`, `inventory_id`, `unit_identifier`, `institution_id`, `branch_id`, `blood_group_id`, `phenotype_id`, `blood_component_id`, `volume_ml`, `collection_date`, `expiry_date`, `status`, `verification_status`, `verified_by_staff_id`, `storage_location_ref`, `storage_temperature_current`) VALUES
-- Unit 1: The Single Available O- Negative PRBC in Kilpauk for Concurrency Contention
(1, 1, 'DIN-2026-CHN-00001', 1, 1, 8, NULL, 2, 300.00, '2026-11-01', '2026-12-13', 'AVAILABLE', 'LAB_VERIFIED', 1, 'FRIDGE-A1-SHELF2', 3.8),

-- Unit 2: Expired Unit (Must NEVER be returned by availability search)
(2, 2, 'DIN-2026-CHN-00002', 1, 1, 3, NULL, 2, 280.00, '2026-09-01', '2026-10-13', 'EXPIRED', 'LAB_VERIFIED', 1, 'DISCARD-BAY-01', 4.0),

-- Unit 3: Quarantined Unit (Must NEVER be returned by availability search)
(3, 2, 'DIN-2026-CHN-00003', 1, 1, 3, NULL, 2, 310.00, '2026-11-10', '2026-12-22', 'QUARANTINED', 'REJECTED', 1, 'QUARANTINE-LOCKER-Q2', 4.1),

-- Unit 4: Pending Verification Unit (Must NOT be advertised as confirmed stock)
(4, 2, 'DIN-2026-CHN-00004', 1, 1, 3, NULL, 2, 290.00, '2026-11-20', '2027-01-01', 'PENDING_VERIFICATION', 'UNVERIFIED', NULL, 'INTAKE-COLD-TRAY', 3.5),

-- Unit 5 & 6: Rare Bombay Phenotype Units in Adyar (Verified by Qualified Pathologist Dr. Karthik)
(5, 3, 'DIN-2026-CHN-BOMBAY-01', 3, 3, 7, 1, 2, 320.00, '2026-11-15', '2026-12-27', 'AVAILABLE', 'LAB_VERIFIED', 3, 'ULTRA-COLD-BIO-BAY-B', -25.5),
(6, 3, 'DIN-2026-CHN-BOMBAY-02', 3, 3, 7, 1, 2, 315.00, '2026-11-18', '2026-12-30', 'AVAILABLE', 'LAB_VERIFIED', 3, 'ULTRA-COLD-BIO-BAY-B', -25.2),

-- Unit 7: O- Unit in Kolathur (Available)
(7, 4, 'DIN-2026-CHN-KOL-01', 5, 5, 8, NULL, 2, 305.00, '2026-11-12', '2026-12-24', 'AVAILABLE', 'LAB_VERIFIED', 1, 'FRIDGE-K1-SHELF1', 4.0)
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- 3. Inventory Movement History for Initial Units
INSERT INTO `inventory_movements` (`inventory_unit_id`, `movement_type`, `previous_status`, `new_status`, `performed_by_user_id`, `notes`) VALUES
(1, 'VERIFICATION_PASSED', 'PENDING_VERIFICATION', 'AVAILABLE', 2, 'Routine intake screening passed for Kilpauk Unit 1'),
(2, 'DISCARDED_EXPIRED', 'AVAILABLE', 'EXPIRED', 2, 'Passed 42 days shelf life limit; quarantined for autoclaving'),
(3, 'QUARANTINED', 'PENDING_VERIFICATION', 'QUARANTINED', 2, 'Serology screening irregular antibody detected'),
(5, 'VERIFICATION_PASSED', 'PENDING_VERIFICATION', 'AVAILABLE', 4, 'Pathologist anti-H serology confirmed Bombay phenotype'),
(6, 'VERIFICATION_PASSED', 'PENDING_VERIFICATION', 'AVAILABLE', 4, 'Pathologist anti-H serology confirmed Bombay phenotype')
ON DUPLICATE KEY UPDATE `notes` = VALUES(`notes`);
