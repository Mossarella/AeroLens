/**
 * Amadeus API response types (auth, etc.)
 * Flight search response shape is in @/interfaces/flight.
 */

export interface AmadeusTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/** Airport & City Search (reference-data/locations) response */
export interface AmadeusLocation {
  id: string;
  type: string;
  subType: string;
  name: string;
  detailedName?: string;
  iataCode: string;
  address?: {
    cityName?: string;
    cityCode?: string;
    countryName?: string;
    countryCode?: string;
  };
}

export interface AmadeusLocationsResponse {
  data: AmadeusLocation[];
  meta?: { count?: number };
}
