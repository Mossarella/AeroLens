import type { FlightSearchParams } from "@/interfaces/flight";

export function parseAndValidateBody(body: unknown): FlightSearchParams | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  if (
    typeof o.origin !== "string" ||
    typeof o.destination !== "string" ||
    typeof o.departureDate !== "string"
  ) {
    return null;
  }
  return {
    origin: o.origin,
    destination: o.destination,
    departureDate: o.departureDate,
    returnDate: typeof o.returnDate === "string" ? o.returnDate : undefined,
    adults: typeof o.adults === "number" ? o.adults : 1,
    children: typeof o.children === "number" ? o.children : 0,
    infants: typeof o.infants === "number" ? o.infants : 0,
  };
}
