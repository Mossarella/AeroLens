/**
 * Mock flight search response matching Amadeus API structure.
 * Used as fallback when the Amadeus API is unavailable or fails.
 */
import type { FlightSearchResponse } from '@/interfaces/flight';

export const MOCK_FLIGHT_SEARCH_RESPONSE: FlightSearchResponse = {
  data: [
    {
      type: 'flight-offer',
      id: '1',
      source: 'GDS',
      instantTicketingRequired: false,
      nonHomogeneous: false,
      oneWay: true,
      lastTicketingDate: '2025-02-15',
      numberOfBookableSeats: 9,
      itineraries: [
        {
          duration: 'PT5H25M',
          segments: [
            {
              departure: {
                iataCode: 'JFK',
                terminal: '4',
                at: '2025-02-20T08:00:00',
              },
              arrival: {
                iataCode: 'LAX',
                terminal: '4',
                at: '2025-02-20T11:25:00',
              },
              carrierCode: 'AA',
              number: '123',
              aircraft: { code: '321' },
              duration: 'PT5H25M',
              numberOfStops: 0,
            },
          ],
        },
      ],
      price: {
        currency: 'USD',
        total: '249.00',
        base: '220.00',
        fees: [
          { amount: '15.00', type: 'SUPPLIER' },
          { amount: '14.00', type: 'TICKETING' },
        ],
        grandTotal: '249.00',
      },
      validatingAirlineCodes: ['AA'],
      travelerPricings: [
        {
          travelerId: '1',
          fareOption: 'STANDARD',
          travelerType: 'ADULT',
          price: { currency: 'USD', total: '249.00', base: '220.00' },
          fareDetailsBySegment: [
            {
              segmentId: '1',
              cabin: 'ECONOMY',
              fareBasis: 'Y',
              class: 'Y',
              includedCheckedBags: { quantity: 1 },
            },
          ],
        },
      ],
    },
    {
      type: 'flight-offer',
      id: '2',
      source: 'GDS',
      instantTicketingRequired: false,
      nonHomogeneous: false,
      oneWay: true,
      lastTicketingDate: '2025-02-15',
      numberOfBookableSeats: 5,
      itineraries: [
        {
          duration: 'PT7H10M',
          segments: [
            {
              departure: {
                iataCode: 'JFK',
                terminal: '7',
                at: '2025-02-20T06:30:00',
              },
              arrival: {
                iataCode: 'ORD',
                terminal: '3',
                at: '2025-02-20T08:40:00',
              },
              carrierCode: 'UA',
              number: '456',
              aircraft: { code: '738' },
              duration: 'PT2H10M',
              numberOfStops: 0,
            },
            {
              departure: {
                iataCode: 'ORD',
                terminal: '2',
                at: '2025-02-20T10:30:00',
              },
              arrival: {
                iataCode: 'LAX',
                terminal: '7',
                at: '2025-02-20T12:40:00',
              },
              carrierCode: 'UA',
              number: '789',
              aircraft: { code: '739' },
              duration: 'PT4H10M',
              numberOfStops: 0,
            },
          ],
        },
      ],
      price: {
        currency: 'USD',
        total: '189.00',
        base: '165.00',
        fees: [
          { amount: '12.00', type: 'SUPPLIER' },
          { amount: '12.00', type: 'TICKETING' },
        ],
        grandTotal: '189.00',
      },
      validatingAirlineCodes: ['UA'],
      travelerPricings: [
        {
          travelerId: '1',
          fareOption: 'STANDARD',
          travelerType: 'ADULT',
          price: { currency: 'USD', total: '189.00', base: '165.00' },
          fareDetailsBySegment: [
            {
              segmentId: '1',
              cabin: 'ECONOMY',
              fareBasis: 'Y',
              class: 'Y',
              includedCheckedBags: { quantity: 1 },
            },
            {
              segmentId: '2',
              cabin: 'ECONOMY',
              fareBasis: 'Y',
              class: 'Y',
              includedCheckedBags: { quantity: 1 },
            },
          ],
        },
      ],
    },
    {
      type: 'flight-offer',
      id: '3',
      source: 'GDS',
      instantTicketingRequired: false,
      nonHomogeneous: false,
      oneWay: true,
      lastTicketingDate: '2025-02-15',
      numberOfBookableSeats: 12,
      itineraries: [
        {
          duration: 'PT5H50M',
          segments: [
            {
              departure: {
                iataCode: 'JFK',
                terminal: '5',
                at: '2025-02-20T14:00:00',
              },
              arrival: {
                iataCode: 'LAX',
                terminal: '2',
                at: '2025-02-20T17:50:00',
              },
              carrierCode: 'DL',
              number: '234',
              aircraft: { code: '763' },
              duration: 'PT5H50M',
              numberOfStops: 0,
            },
          ],
        },
      ],
      price: {
        currency: 'USD',
        total: '299.00',
        base: '265.00',
        fees: [
          { amount: '17.00', type: 'SUPPLIER' },
          { amount: '17.00', type: 'TICKETING' },
        ],
        grandTotal: '299.00',
      },
      validatingAirlineCodes: ['DL'],
      travelerPricings: [
        {
          travelerId: '1',
          fareOption: 'STANDARD',
          travelerType: 'ADULT',
          price: { currency: 'USD', total: '299.00', base: '265.00' },
          fareDetailsBySegment: [
            {
              segmentId: '1',
              cabin: 'ECONOMY',
              fareBasis: 'Y',
              class: 'Y',
              includedCheckedBags: { quantity: 1 },
            },
          ],
        },
      ],
    },
  ],
  dictionaries: {
    locations: {
      JFK: { cityCode: 'NYC', countryCode: 'US' },
      LAX: { cityCode: 'LAX', countryCode: 'US' },
      ORD: { cityCode: 'CHI', countryCode: 'US' },
    },
    aircraft: {
      '321': 'Airbus A321',
      '738': 'Boeing 737-800',
      '739': 'Boeing 737-900',
      '763': 'Boeing 767-300',
    },
    currencies: {
      USD: 'US Dollar',
    },
    carriers: {
      AA: 'American Airlines',
      UA: 'United Airlines',
      DL: 'Delta Air Lines',
    },
  },
  meta: {
    count: 3,
  },
};
