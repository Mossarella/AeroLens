import { NextRequest, NextResponse } from 'next/server';
import type { FlightSearchParams, FlightSearchResponse } from '@/interfaces/flight';
import { MOCK_FLIGHT_SEARCH_RESPONSE } from '@/lib/mock-data';

const AMADEUS_TOKEN_URL = 'https://test.api.amadeus.com/v1/security/oauth2/token';
const AMADEUS_FLIGHT_OFFERS_URL = 'https://test.api.amadeus.com/v2/shopping/flight-offers';

interface AmadeusTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

async function getAmadeusAccessToken(): Promise<string> {
  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Amadeus credentials not configured');
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(AMADEUS_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
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

async function searchAmadeusFlights(
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
    searchParams.set('returnDate', params.returnDate);
  }
  if (params.children && params.children > 0) {
    searchParams.set('children', String(params.children));
  }
  if (params.infants && params.infants > 0) {
    searchParams.set('infants', String(params.infants));
  }

  const url = `${AMADEUS_FLIGHT_OFFERS_URL}?${searchParams.toString()}`;
  const res = await fetch(url, {
    method: 'GET',
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

function parseAndValidateBody(body: unknown): FlightSearchParams | null {
  if (!body || typeof body !== 'object') return null;
  const o = body as Record<string, unknown>;
  if (
    typeof o.origin !== 'string' ||
    typeof o.destination !== 'string' ||
    typeof o.departureDate !== 'string'
  ) {
    return null;
  }
  return {
    origin: o.origin,
    destination: o.destination,
    departureDate: o.departureDate,
    returnDate: typeof o.returnDate === 'string' ? o.returnDate : undefined,
    adults: typeof o.adults === 'number' ? o.adults : 1,
    children: typeof o.children === 'number' ? o.children : 0,
    infants: typeof o.infants === 'number' ? o.infants : 0,
  };
}

export async function POST(request: NextRequest) {
  let params: FlightSearchParams;

  try {
    const body = await request.json();
    const parsed = parseAndValidateBody(body);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Invalid request. Required: origin, destination, departureDate.' },
        { status: 400 }
      );
    }
    params = parsed;
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body.' },
      { status: 400 }
    );
  }

  try {
    const accessToken = await getAmadeusAccessToken();
    const result = await searchAmadeusFlights(params, accessToken);
    return NextResponse.json(result);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[flights/search] Amadeus API unavailable, using mock data:',
        err instanceof Error ? err.message : err
      );
    }
    return NextResponse.json(MOCK_FLIGHT_SEARCH_RESPONSE);
  }
}
