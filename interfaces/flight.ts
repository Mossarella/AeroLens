/**
 * TypeScript type definitions for Amadeus Flight Offers Search API
 * These types match the structure returned by the Amadeus API
 */

/**
 * Search parameters for flight search form
 */
export interface FlightSearchParams {
  origin: string; // Airport IATA code (e.g., "JFK")
  destination: string; // Airport IATA code (e.g., "LAX")
  departureDate: string; // ISO date string (e.g., "2024-01-15")
  returnDate?: string; // Optional return date for round-trip
  adults?: number; // Number of adult passengers (default: 1)
  children?: number; // Number of child passengers (default: 0)
  infants?: number; // Number of infant passengers (default: 0)
}

/**
 * Location information (airport/city)
 */
export interface Location {
  iataCode: string;
  terminal?: string;
  at?: string; // ISO datetime string for departure/arrival
}

/**
 * Aircraft information
 */
export interface Aircraft {
  code: string; // Aircraft type code
}

/**
 * Individual flight segment (one leg of a journey)
 */
export interface FlightSegment {
  departure: Location;
  arrival: Location;
  carrierCode: string; // Airline IATA code (e.g., "AA")
  number: string; // Flight number
  aircraft?: Aircraft;
  duration: string; // ISO 8601 duration (e.g., "PT5H25M")
  numberOfStops: number; // Number of stops (0 for non-stop)
  blacklistedInEU?: boolean;
}

/**
 * Complete itinerary (outbound or return journey)
 */
export interface Itinerary {
  duration: string; // Total duration of the itinerary
  segments: FlightSegment[]; // Array of flight segments
}

/**
 * Fee information
 */
export interface Fee {
  amount: string; // Fee amount as string
  type: string; // Fee type (e.g., "SUPPLIER", "TICKETING", "FORM_OF_PAYMENT", "SUPPLIER")
}

/**
 * Price breakdown
 */
export interface Price {
  currency: string; // Currency code (e.g., "USD", "EUR")
  total: string; // Total price as string
  base: string; // Base fare as string
  fees?: Fee[]; // Array of fees
  grandTotal?: string; // Grand total including all fees
}

/**
 * Pricing options
 */
export interface PricingOptions {
  fareType?: string[]; // Array of fare types (e.g., ["PUBLISHED"])
  includedCheckedBagsOnly?: boolean;
}

/**
 * Traveler pricing information
 */
export interface TravelerPricing {
  travelerId: string;
  fareOption: string; // e.g., "STANDARD"
  travelerType: string; // e.g., "ADULT", "CHILD", "INFANT"
  price: Price;
  fareDetailsBySegment: Array<{
    segmentId: string;
    cabin: string; // e.g., "ECONOMY", "BUSINESS"
    fareBasis: string;
    class: string; // Booking class
    includedCheckedBags?: {
      quantity?: number;
    };
  }>;
}

/**
 * Individual flight offer
 */
export interface FlightOffer {
  type: string; // Always "flight-offer"
  id: string; // Unique identifier for the offer
  source: string; // Source of the data (e.g., "GDS")
  instantTicketingRequired?: boolean;
  nonHomogeneous?: boolean;
  oneWay: boolean; // true for one-way, false for round-trip
  lastTicketingDate?: string; // Last date to book (ISO date)
  numberOfBookableSeats?: number; // Number of available seats
  itineraries: Itinerary[]; // Array of itineraries (outbound and return)
  price: Price; // Total price information
  pricingOptions?: PricingOptions;
  validatingAirlineCodes?: string[]; // Array of airline codes
  travelerPricings?: TravelerPricing[]; // Detailed pricing per traveler
}

/**
 * Dictionary entries for locations
 */
export interface LocationDictionary {
  [key: string]: {
    cityCode?: string;
    countryCode?: string;
  };
}

/**
 * Dictionary entries for aircraft
 */
export interface AircraftDictionary {
  [key: string]: string; // Aircraft code -> Aircraft name
}

/**
 * Dictionary entries for currencies
 */
export interface CurrencyDictionary {
  [key: string]: string; // Currency code -> Currency name
}

/**
 * Dictionary entries for carriers (airlines)
 */
export interface CarrierDictionary {
  [key: string]: string; // Carrier code -> Carrier name
}

/**
 * Dictionaries containing reference data
 */
export interface Dictionaries {
  locations?: LocationDictionary;
  aircraft?: AircraftDictionary;
  currencies?: CurrencyDictionary;
  carriers?: CarrierDictionary;
}

/**
 * Metadata about the response
 */
export interface Meta {
  count: number; // Number of flight offers returned
}

/**
 * Complete API response structure
 */
export interface FlightSearchResponse {
  data: FlightOffer[]; // Array of flight offers
  dictionaries?: Dictionaries; // Reference dictionaries
  meta?: Meta; // Response metadata
}

/**
 * Helper type for filter state
 */
export interface FilterState {
  stops: 'all' | 'nonstop' | '1stop' | '2plus';
  priceRange: [number, number]; // [min, max]
  airlines: string[]; // Selected airline codes
}

/**
 * Helper type for processed flight data (for display)
 */
export interface ProcessedFlightOffer extends FlightOffer {
  // Computed properties for easier filtering/display
  totalStops: number; // Total number of stops across all segments
  displayPrice: number; // Numeric price for sorting/filtering
  airlineCodes: string[]; // All unique airline codes in the offer
  departureTime?: string; // First departure time
  arrivalTime?: string; // Final arrival time
  totalDuration?: string; // Total journey duration
}
