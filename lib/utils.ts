import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { FlightOffer, FilterState } from "@/interfaces/flight";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate total number of stops for a flight offer
 * @param flight - The flight offer
 * @returns Total number of stops across all segments
 */
function getTotalStops(flight: FlightOffer): number {
  return flight.itineraries.reduce((total, itinerary) => {
    return (
      total +
      itinerary.segments.reduce((segTotal, segment) => {
        return segTotal + segment.numberOfStops;
      }, 0)
    );
  }, 0);
}

/**
 * Extract all unique airline codes from a flight offer
 * @param flight - The flight offer
 * @returns Array of unique airline codes
 */
export function getAirlineCodes(flight: FlightOffer): string[] {
  const codes = new Set<string>();
  flight.itineraries.forEach((itinerary) => {
    itinerary.segments.forEach((segment) => {
      codes.add(segment.carrierCode);
    });
  });
  return Array.from(codes);
}

/**
 * Parse price string to number
 * @param priceString - Price as string (e.g., "123.45")
 * @returns Price as number
 */
function parsePrice(priceString: string): number {
  return parseFloat(priceString) || 0;
}

/**
 * Filter flights by number of stops
 * @param flights - Array of flight offers
 * @param stops - Stop filter option ('all', 'nonstop', '1stop', '2plus')
 * @returns Filtered array of flight offers
 */
export function filterByStops(
  flights: FlightOffer[],
  stops: FilterState["stops"]
): FlightOffer[] {
  if (stops === "all") {
    return flights;
  }

  return flights.filter((flight) => {
    const totalStops = getTotalStops(flight);

    switch (stops) {
      case "nonstop":
        return totalStops === 0;
      case "1stop":
        return totalStops === 1;
      case "2plus":
        return totalStops >= 2;
      default:
        return true;
    }
  });
}

/**
 * Filter flights by price range
 * @param flights - Array of flight offers
 * @param min - Minimum price
 * @param max - Maximum price
 * @returns Filtered array of flight offers
 */
export function filterByPrice(
  flights: FlightOffer[],
  min: number,
  max: number
): FlightOffer[] {
  return flights.filter((flight) => {
    const price = parsePrice(flight.price.total);
    return price >= min && price <= max;
  });
}

/**
 * Filter flights by airline codes
 * @param flights - Array of flight offers
 * @param airlines - Array of selected airline codes (empty array means all airlines)
 * @returns Filtered array of flight offers
 */
export function filterByAirlines(
  flights: FlightOffer[],
  airlines: string[]
): FlightOffer[] {
  if (airlines.length === 0) {
    return flights;
  }

  return flights.filter((flight) => {
    const flightAirlines = getAirlineCodes(flight);
    // Check if any of the flight's airlines match the selected airlines
    return flightAirlines.some((code) => airlines.includes(code));
  });
}

/**
 * Apply only stops and airline filters (no price).
 * Used to derive price slider min/max from the "price trend" cohort (graph data before price filter).
 */
export function applyStopsAndAirlinesOnly(
  flights: FlightOffer[],
  stops: FilterState["stops"],
  airlines: string[]
): FlightOffer[] {
  const byStops = filterByStops(flights, stops);
  return filterByAirlines(byStops, airlines);
}

/**
 * Apply all filters to flight offers
 * @param flights - Array of flight offers
 * @param filterState - Filter state object
 * @returns Filtered array of flight offers
 */
export function applyAllFilters(
  flights: FlightOffer[],
  filterState: FilterState
): FlightOffer[] {
  let filtered = flights;

  // Apply stops filter
  filtered = filterByStops(filtered, filterState.stops);

  // Apply price filter
  filtered = filterByPrice(
    filtered,
    filterState.priceRange[0],
    filterState.priceRange[1]
  );

  // Apply airline filter
  filtered = filterByAirlines(filtered, filterState.airlines);

  return filtered;
}
