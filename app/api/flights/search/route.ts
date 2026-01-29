import { NextRequest, NextResponse } from "next/server";
import type { FlightSearchParams } from "@/interfaces/flight";
import {
  getAmadeusAccessToken,
  searchAmadeusFlights,
} from "@/lib/amadeus/client";
import { parseAndValidateBody } from "@/lib/amadeus/validate";
import { MOCK_FLIGHT_SEARCH_RESPONSE } from "@/lib/mockdata/mock-data";

export async function POST(request: NextRequest) {
  let params: FlightSearchParams;

  try {
    const body = await request.json();
    const parsed = parseAndValidateBody(body);
    if (!parsed) {
      return NextResponse.json(
        {
          error:
            "Invalid request. Required: origin, destination, departureDate.",
        },
        { status: 400 }
      );
    }
    params = parsed;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const accessToken = await getAmadeusAccessToken();
    const result = await searchAmadeusFlights(params, accessToken);
    return NextResponse.json(result);
  } catch (err) {
    console.log("armadeus call error");
    // if (process.env.NODE_ENV === "development") {
    //   console.warn(
    //     "[flights/search] Amadeus API unavailable, using mock data:",
    //     err instanceof Error ? err.message : err
    //   );
    // }
    return NextResponse.json(MOCK_FLIGHT_SEARCH_RESPONSE);
  }
}
