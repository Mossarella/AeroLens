import type { FlightOffer } from "@/interfaces/flight"
import { getTotalStops } from "@/lib/utils"

/** Parse ISO 8601 duration (e.g. "PT5H25M") to total minutes */
function parseDurationToMinutes(iso: string): number {
  const hours = iso.match(/(\d+)H/)?.[1] ?? "0"
  const minutes = iso.match(/(\d+)M/)?.[1] ?? "0"
  return parseInt(hours, 10) * 60 + parseInt(minutes, 10)
}

/** Total journey duration in minutes (all itineraries summed) */
function getTotalDurationMinutes(flight: FlightOffer): number {
  return flight.itineraries.reduce(
    (sum, it) => sum + parseDurationToMinutes(it.duration),
    0
  )
}

/**
 * Returns the flight id that is "Best Value", or null if no flights.
 * Best Value = lowest-priced flight with stops <= 1 and duration <= median(duration) * 1.2.
 * If no flights meet constraints, falls back to overall cheapest.
 */
export function getBestValueFlightId(flights: FlightOffer[]): string | null {
  if (flights.length === 0) return null

  const MAX_STOPS = 1
  const DURATION_MULTIPLIER = 1.2

  const withMeta = flights.map((f) => ({
    id: f.id,
    price: parseFloat(f.price.total) || 0,
    stops: getTotalStops(f),
    durationMinutes: getTotalDurationMinutes(f),
  }))

  const durations = withMeta
    .map((f) => f.durationMinutes)
    .slice()
    .sort((a, b) => a - b)
  const median =
    durations.length % 2 === 0
      ? (durations[durations.length / 2 - 1] +
          durations[durations.length / 2]) /
        2
      : durations[Math.floor(durations.length / 2)]
  const maxDuration = median * DURATION_MULTIPLIER

  const qualifying = withMeta.filter(
    (f) => f.stops <= MAX_STOPS && f.durationMinutes <= maxDuration
  )

  const candidates = qualifying.length > 0 ? qualifying : withMeta
  const byPrice = [...candidates].sort((a, b) => {
    if (a.price !== b.price) return a.price - b.price
    return a.id.localeCompare(b.id)
  })
  return byPrice[0]?.id ?? null
}
