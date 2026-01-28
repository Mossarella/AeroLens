import type { FlightSearchParams, FlightSearchResponse } from "@/interfaces/flight";
import type { AmadeusTokenResponse, AmadeusLocationsResponse } from "@/lib/amadeus/types";
import { getAmadeusFlightOffersUrl, getAmadeusTokenUrl, getAmadeusReferenceDataBase } from "@/lib/amadeus/config";

export async function getAmadeusAccessToken(): Promise<string> {
  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Amadeus credentials not configured");
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const tokenUrl = getAmadeusTokenUrl();
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Amadeus token failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as AmadeusTokenResponse;
  return data.access_token;
}

export async function searchAmadeusFlights(
  params: FlightSearchParams,
  accessToken: string
): Promise<FlightSearchResponse> {
  const searchParams = new URLSearchParams({
    originLocationCode: params.origin,
    destinationLocationCode: params.destination,
    departureDate: params.departureDate,
    adults: String(params.adults ?? 1),
  });

  if (params.returnDate) {
    searchParams.set("returnDate", params.returnDate);
  }
  if (params.children && params.children > 0) {
    searchParams.set("children", String(params.children));
  }
  if (params.infants && params.infants > 0) {
    searchParams.set("infants", String(params.infants));
  }

  const baseUrl = getAmadeusFlightOffersUrl();
  const url = `${baseUrl}?${searchParams.toString()}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Amadeus flight search failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as FlightSearchResponse;
  return data;
}

/**
 * Fetch airports/cities from Amadeus Airport & City Search.
 * Requires keyword (start of name/code); use countryCode to filter by country.
 */
export async function getAmadeusLocations(
  accessToken: string,
  params: {
    keyword: string;
    countryCode?: string;
    subType?: "AIRPORT" | "CITY";
    pageLimit?: number;
    view?: "LIGHT" | "FULL";
  }
): Promise<AmadeusLocationsResponse> {
  const searchParams = new URLSearchParams({
    subType: params.subType ?? "AIRPORT",
    keyword: params.keyword,
  });
  if (params.countryCode) {
    searchParams.set("countryCode", params.countryCode);
  }
  searchParams.set("page[limit]", String(params.pageLimit ?? 100));
  if (params.view) {
    searchParams.set("view", params.view);
  }

  const base = getAmadeusReferenceDataBase();
  const url = `${base}/reference-data/locations?${searchParams.toString()}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.amadeus+json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Amadeus locations failed: ${res.status} ${text}`);
  }

  return (await res.json()) as AmadeusLocationsResponse;
}
