import mysql from 'mysql2/promise';

/**
 * BLOODBRIDGE CHENNAI SPATIAL DISCOVERY SERVICE
 *
 * Utilizes native MySQL 8.0 spatial functions (ST_Distance_Sphere, ST_X, ST_Y)
 * with WGS 84 (SRID 4326) coordinates.
 *
 * Coordinate Convention in MySQL 8.0:
 * POINT(longitude, latitude) with SRID 4326 (X = longitude, Y = latitude).
 */

export interface SpatialSearchFilters {
  userLatitude: number;
  userLongitude: number;
  radiusKm?: number;
  bloodGroupId?: number;
  bloodComponentId?: number;
  phenotypeId?: number | bigint;
  requireRarePhenotype?: boolean;
  limit?: number;
}

export interface NearbyInstitutionResult {
  branchId: number;
  branchName: string;
  institutionName: string;
  institutionType: string;
  area: string;
  city: string;
  contactPhone: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  availableUnits: number;
  verifiedPhenotypeName?: string;
  verificationStatus: string;
}

/**
 * Discovers institutions within a specified radial distance with stock availability
 */
export async function findNearbyBloodStock(
  pool: mysql.Pool,
  filters: SpatialSearchFilters
): Promise<NearbyInstitutionResult[]> {
  const radiusMeters = (filters.radiusKm || 25) * 1000;
  const limit = filters.limit || 20;

  // MySQL 8.0 ST_Distance_Sphere calculates distance in meters on the Earth sphere
  // Coordinates in ST_SRID(POINT(longitude, latitude), 4326)
  const query = `
    SELECT
      b.id AS branch_id,
      b.branch_name,
      i.name AS institution_name,
      i.institution_type,
      b.area,
      b.city,
      b.contact_phone,
      b.latitude,
      b.longitude,
      ROUND(
        ST_Distance_Sphere(
          b.location_point,
          ST_SRID(POINT(?, ?), 4326)
        ) / 1000, 2
      ) AS distance_km,
      COALESCE(SUM(CASE
        WHEN u.status = 'AVAILABLE'
         AND u.verification_status = 'LAB_VERIFIED'
         AND u.expiry_date >= CURDATE()
        THEN 1 ELSE 0 END), 0) AS available_units,
      p.name AS verified_phenotype_name,
      i.verification_status
    FROM institution_branches b
    JOIN institutions i ON b.institution_id = i.id
    LEFT JOIN blood_inventory_units u ON u.branch_id = b.id
      AND (? IS NULL OR u.blood_group_id = ?)
      AND (? IS NULL OR u.blood_component_id = ?)
      AND (? IS NULL OR u.phenotype_id = ?)
    LEFT JOIN blood_phenotypes p ON u.phenotype_id = p.id
    WHERE b.is_active = TRUE
      AND i.is_active = TRUE
      AND i.verification_status = 'VERIFIED'
      AND ST_Distance_Sphere(
        b.location_point,
        ST_SRID(POINT(?, ?), 4326)
      ) <= ?
    GROUP BY
      b.id, b.branch_name, i.name, i.institution_type,
      b.area, b.city, b.contact_phone, b.latitude, b.longitude,
      p.name, i.verification_status
    HAVING available_units > 0
    ORDER BY distance_km ASC
    LIMIT ?;
  `;

  // ST_SRID(POINT(longitude, latitude), 4326)
  const params = [
    filters.userLongitude,
    filters.userLatitude,
    filters.bloodGroupId ?? null,
    filters.bloodGroupId ?? null,
    filters.bloodComponentId ?? null,
    filters.bloodComponentId ?? null,
    filters.phenotypeId ?? null,
    filters.phenotypeId ?? null,
    filters.userLongitude,
    filters.userLatitude,
    radiusMeters,
    limit,
  ];

  const [rows]: any[] = await pool.query(query, params);

  return rows.map((r: any) => ({
    branchId: Number(r.branch_id),
    branchName: r.branch_name,
    institutionName: r.institution_name,
    institutionType: r.institution_type,
    area: r.area,
    city: r.city,
    contactPhone: r.contact_phone,
    latitude: parseFloat(r.latitude),
    longitude: parseFloat(r.longitude),
    distanceKm: parseFloat(r.distance_km),
    availableUnits: Number(r.available_units),
    verifiedPhenotypeName: r.verified_phenotype_name || undefined,
    verificationStatus: r.verification_status,
  }));
}
