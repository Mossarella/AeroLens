import { NextRequest, NextResponse } from "next/server";
import {
  getAmadeusAccessToken,
  getAmadeusLocations,
} from "@/lib/amadeus/client";
import type { AmadeusLocation } from "@/lib/amadeus/types";

/** Letters used to fetch airports by country (Amadeus requires a keyword). */
const KEYWORDS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export interface AirportOption {
  iataCode: string;
  name: string;
  cityName?: string;
  countryName?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const countryCode = searchParams.get("countryCode");

  if (!countryCode || countryCode.length !== 2) {
    return NextResponse.json(
      { error: "countryCode (ISO 3166-1 alpha-2) is required" },
      { status: 400 }
    );
  }

  let accessToken: string;
  try {
    accessToken = await getAmadeusAccessToken();
  } catch {
    return NextResponse.json(
      { error: "Amadeus unavailable", airports: [] as AirportOption[] },
      { status: 200 }
    );
  }

  const seen = new Map<string, AmadeusLocation>();

  await Promise.all(
    KEYWORDS.map(async (letter) => {
      try {
        const res = await getAmadeusLocations(accessToken, {
          keyword: letter,
          countryCode: countryCode.toUpperCase(),
          subType: "AIRPORT",
          pageLimit: 100,
          view: "LIGHT",
        });
        for (const loc of res.data ?? []) {
          if (loc.iataCode && !seen.has(loc.iataCode)) {
            seen.set(loc.iataCode, loc);
          }
        }
      } catch {
        // ignore per-letter failures
      }
    })
  );

  const airports: AirportOption[] = Array.from(seen.values())
    .filter((loc) => loc.iataCode)
    .map((loc) => ({
      iataCode: loc.iataCode,
      name: loc.name ?? loc.iataCode,
      cityName: loc.address?.cityName,
      countryName: loc.address?.countryName,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({ airports });
}
