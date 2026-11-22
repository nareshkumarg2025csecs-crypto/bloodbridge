-- ==============================================================================
-- BLOODBRIDGE REFERENCE SEEDS: BLOOD CATALOG & CLINICAL PHENOTYPES
-- Engine: MySQL 8.0.46 | Charset: utf8mb4
-- ==============================================================================

-- 1. Standard ABO & Rh Blood Groups (8 Standard Groups)
INSERT INTO `blood_groups` (`id`, `abo_group`, `rh_factor`, `label`, `antigen_a`, `antigen_b`, `antigen_d`, `description`, `is_active`) VALUES
(1, 'A', 'POSITIVE', 'A+', TRUE, FALSE, TRUE, 'A RhD Positive: Carries A and D antigens; Anti-B in plasma.', TRUE),
(2, 'A', 'NEGATIVE', 'A-', TRUE, FALSE, FALSE, 'A RhD Negative: Carries A antigen only; Anti-B and potential Anti-D.', TRUE),
(3, 'B', 'POSITIVE', 'B+', FALSE, TRUE, TRUE, 'B RhD Positive: Carries B and D antigens; Anti-A in plasma.', TRUE),
(4, 'B', 'NEGATIVE', 'B-', FALSE, TRUE, FALSE, 'B RhD Negative: Carries B antigen only; Anti-A and potential Anti-D.', TRUE),
(5, 'AB', 'POSITIVE', 'AB+', TRUE, TRUE, TRUE, 'AB RhD Positive: Carries A, B, and D antigens; Universal recipient for red cells.', TRUE),
(6, 'AB', 'NEGATIVE', 'AB-', TRUE, TRUE, FALSE, 'AB RhD Negative: Carries A and B antigens; lacking D antigen.', TRUE),
(7, 'O', 'POSITIVE', 'O+', FALSE, FALSE, TRUE, 'O RhD Positive: Lacks A and B antigens; carries D antigen.', TRUE),
(8, 'O', 'NEGATIVE', 'O-', FALSE, FALSE, FALSE, 'O RhD Negative: Lacks A, B, and D antigens; Universal donor for emergency RBCs.', TRUE)
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- 2. Clinically Relevant Blood Components
INSERT INTO `blood_components` (`id`, `code`, `name`, `storage_temperature_celsius`, `standard_shelf_life_days`, `volume_ml_min`, `volume_ml_max`, `requires_agitation`, `clinical_notes`, `is_active`) VALUES
(1, 'WHOLE_BLOOD', 'Whole Blood (CPDA-1 / SAGM)', '2°C to 6°C', 35, 350.00, 450.00, FALSE, 'Primary collection unit; indicated in massive transfusion protocols with clinical oversight.', TRUE),
(2, 'PRBC', 'Packed Red Blood Cells (PRBC)', '2°C to 6°C', 42, 250.00, 350.00, FALSE, 'Centrifuged red cells indicated for acute anemia and blood loss resuscitation.', TRUE),
(3, 'PLATELETS', 'Platelet Concentrate (Random / Apheresis)', '20°C to 24°C', 5, 50.00, 300.00, TRUE, 'Requires continuous gentle flatbed agitation; indicated for thrombocytopenia and bleeding.', TRUE),
(4, 'FFP', 'Fresh Frozen Plasma (FFP)', '-25°C or colder', 365, 200.00, 300.00, FALSE, 'Frozen within 8 hours of phlebotomy; rich in coagulation factors.', TRUE),
(5, 'CRYOPRECIPITATE', 'Cryoprecipitate AHF', '-25°C or colder', 365, 15.00, 30.00, FALSE, 'Rich in Factor VIII, Fibrinogen, von Willebrand factor, and Factor XIII.', TRUE)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 3. Rare Blood Phenotypes & Antigen Characterization
INSERT INTO `blood_phenotypes` (`id`, `code`, `name`, `is_rare`, `category`, `clinically_relevant_antigens`, `transfusion_safety_warning`, `description`, `is_active`) VALUES
(1, 'BOMBAY_OH', 'Bombay Phenotype (Oh / H-deficient)', TRUE, 'BOMBAY',
 '{"H": false, "A": false, "B": false, "anti_H_present": true}',
 'CRITICAL SAFETY ALERT: Patient produces potent clinically active Anti-H antibodies that lyse all O, A, B, and AB red cells. Must ONLY be transfused with confirmed autologous blood or Bombay phenotype (Oh) blood.',
 'Extremely rare inherited recessive phenotype characterized by the absence of the H gene (FUT1/FUT2), resulting in no H antigen on erythrocytes.', TRUE),
(2, 'RH_NULL', 'Rh-Null (Amorph / Regulator)', TRUE, 'RH_VARIANT',
 '{"Rh_antigens": false, "D": false, "C": false, "c": false, "E": false, "e": false}',
 'CRITICAL SAFETY ALERT: Complete absence of all Rh system antigens. Produces pan-reactive Anti-Rh antibodies upon exposure. Transfusion strictly restricted to Rh-null units.',
 'The "Golden Blood" phenotype with complete lack of Rh antigens, often causing stomatocytosis and mild compensated hemolytic anemia.', TRUE),
(3, 'KELL_NULL', 'Kell-Null (K0 / K-null)', TRUE, 'KELL',
 '{"K": false, "k": false, "Kpa": false, "Kpb": false, "Jsa": false, "Jsb": false, "anti_Ku_risk": true}',
 'HIGH RISK: Immunized K0 individuals produce anti-Ku which destroys all normal Kell-positive blood. Only compatible with K0 donors.',
 'Absence of all Kell blood group system antigens. High risk of severe hemolytic transfusion reactions if mismatched.', TRUE),
(4, 'DUFFY_NULL', 'Duffy-Null (Fy(a-b-))', TRUE, 'DUFFY',
 '{"Fya": false, "Fyb": false, "erythrocyte_expression": false}',
 'Moderate-High risk: Antibodies to Duffy antigens cause delayed hemolytic transfusion reactions. Requires antigen-negative matched units.',
 'Common phenotype in West/Sub-Saharan African ancestry conferring malaria resistance; rare in Caucasian/Asian populations.', TRUE)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
