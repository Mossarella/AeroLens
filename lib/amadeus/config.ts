/**
 * Amadeus API URLs from env (with test API defaults).
 */

const DEFAULT_TOKEN_URL =
  "https://test.api.amadeus.com/v1/security/oauth2/token";
const DEFAULT_FLIGHT_OFFERS_URL =
  "https://test.api.amadeus.com/v2/shopping/flight-offers";
const DEFAULT_REFERENCE_DATA_BASE =
  "https://test.api.amadeus.com/v1";

export function getAmadeusTokenUrl(): string {
  return process.env.AMADEUS_TOKEN_URL ?? DEFAULT_TOKEN_URL;
}

export function getAmadeusFlightOffersUrl(): string {
  return process.env.AMADEUS_FLIGHT_OFFERS_URL ?? DEFAULT_FLIGHT_OFFERS_URL;
}

export function getAmadeusReferenceDataBase(): string {
  return process.env.AMADEUS_REFERENCE_DATA_BASE ?? DEFAULT_REFERENCE_DATA_BASE;
}
