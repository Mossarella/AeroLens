'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { FlightOffer, Dictionaries } from '@/interfaces/flight'
import { getAirlineCodes } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { TrendingUp } from 'lucide-react'

interface PriceGraphProps {
  flights: FlightOffer[]
  dictionaries?: Dictionaries
  className?: string
}

/**
 * Get airline name from code, using dictionary if available
 */
function getAirlineName(code: string, dictionaries?: Dictionaries): string {
  if (dictionaries?.carriers?.[code]) {
    return dictionaries.carriers[code]
  }
  return code
}

/**
 * Format ISO datetime string to readable time (e.g., "8:00 AM")
 */
function formatTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format date from ISO string (e.g., "Feb 20")
 */
function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Parse ISO 8601 duration string (e.g., "PT5H25M") to human-readable format
 */
function formatDuration(duration: string): string {
  const timeStr = duration.replace('PT', '')
  const hoursMatch = timeStr.match(/(\d+)H/)
  const minutesMatch = timeStr.match(/(\d+)M/)
  
  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0
  
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`
  } else if (hours > 0) {
    return `${hours}h`
  } else if (minutes > 0) {
    return `${minutes}m`
  }
  return '0m'
}

/**
 * Calculate total number of stops for a flight offer
 */
function getTotalStops(flight: FlightOffer): number {
  return flight.itineraries.reduce((total, itinerary) => {
    return (
      total +
      itinerary.segments.reduce((segTotal, segment) => {
        return segTotal + segment.numberOfStops
      }, 0)
    )
  }, 0)
}

/**
 * Custom tooltip component for the chart
 */
interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    payload: ChartDataPoint
  }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload
    const price = parseFloat(data.price) || 0
    const currency = data.currency || 'USD'
    
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
    
    return (
      <div
        className="border border-border rounded-lg shadow-lg p-3 min-w-50"
        style={{
          position: 'relative',
          zIndex: 1000,
          backgroundColor: 'hsl(var(--card))',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          isolation: 'isolate',
        }}
      >
        <p className="font-semibold text-sm mb-2">{label}</p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price:</span>
            <span className="font-semibold">{formattedPrice}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Airline:</span>
            <span>{data.airlineNames}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duration:</span>
            <span>{data.duration}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Stops:</span>
            <span>
              {data.totalStops === 0
                ? 'Non-stop'
                : `${data.totalStops} ${data.totalStops === 1 ? 'stop' : 'stops'}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Route:</span>
            <span className="font-mono text-xs">
              {data.departureAirport} → {data.arrivalAirport}
            </span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

/**
 * Chart data point interface
 */
interface ChartDataPoint {
  time: string // Formatted time for display
  timeValue: number // Numeric value for sorting
  price: string // Price as string
  priceValue: number // Numeric price for chart
  currency: string
  flightId: string
  airlineNames: string
  duration: string
  totalStops: number
  departureAirport: string
  arrivalAirport: string
  departureDate: string
}

/**
 * Process flight data for chart display
 */
function processFlightData(
  flights: FlightOffer[],
  dictionaries?: Dictionaries
): ChartDataPoint[] {
  return flights
    .map((flight) => {
      const outboundItinerary = flight.itineraries[0]
      const firstSegment = outboundItinerary?.segments[0]
      const lastSegment =
        outboundItinerary?.segments[outboundItinerary.segments.length - 1]

      if (!firstSegment?.departure.at) {
        return null
      }

      const departureTime = firstSegment.departure.at
      const departureDate = new Date(departureTime)
      const timeValue = departureDate.getTime() // For sorting
      const formattedTime = formatTime(departureTime)
      const formattedDate = formatDate(departureTime)

      const departureAirport = firstSegment.departure.iataCode || 'N/A'
      const arrivalAirport = lastSegment?.arrival.iataCode || 'N/A'

      const duration = outboundItinerary?.duration
        ? formatDuration(outboundItinerary.duration)
        : 'N/A'

      const totalStops = getTotalStops(flight)

      const airlineCodes = getAirlineCodes(flight)
      const airlineNames = airlineCodes
        .map((code) => getAirlineName(code, dictionaries))
        .join(', ')

      const price = flight.price.total
      const priceValue = parseFloat(price) || 0
      const currency = flight.price.currency || 'USD'

      return {
        time: `${formattedDate} ${formattedTime}`,
        timeValue,
        price,
        priceValue,
        currency,
        flightId: flight.id,
        airlineNames,
        duration,
        totalStops,
        departureAirport,
        arrivalAirport,
        departureDate: formattedDate,
      }
    })
    .filter((item): item is ChartDataPoint => item !== null)
    .sort((a, b) => a.timeValue - b.timeValue) // Sort by departure time
}

/** Enable horizontal scroll when data points exceed this count. */
const SCROLL_THRESHOLD = 40
/** Pixel width per data point when scroll is active. */
const PX_PER_POINT = 10

export function PriceGraph({
  flights,
  dictionaries,
  className,
}: PriceGraphProps) {
  // Process flight data for chart
  const chartData = useMemo(() => {
    return processFlightData(flights, dictionaries)
  }, [flights, dictionaries])

  const useScroll = chartData.length > SCROLL_THRESHOLD
  const chartWidth = useScroll ? chartData.length * PX_PER_POINT : undefined

  // Calculate price range for Y-axis
  const priceRange = useMemo(() => {
    if (chartData.length === 0) {
      return { min: 0, max: 1000 }
    }

    const prices = chartData.map((d) => d.priceValue)
    const min = Math.floor(Math.min(...prices) * 0.9) // 10% padding below
    const max = Math.ceil(Math.max(...prices) * 1.1) // 10% padding above

    return { min, max }
  }, [chartData])

  if (chartData.length === 0) {
    return (
      <Card className={cn('', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Price Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <p className="text-sm text-muted-foreground text-center">
              No flight data available to display. Search for flights to see price trends.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Price Trend
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Flight prices over time ({chartData.length} {chartData.length === 1 ? 'flight' : 'flights'})
        </p>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            useScroll && 'overflow-x-auto overflow-y-hidden overscroll-x-contain'
          )}
        >
          <div style={useScroll ? { minWidth: chartWidth } : undefined}>
            <ResponsiveContainer
              width={useScroll ? chartWidth! : '100%'}
              height={300}
            >
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 20,
                  left: 10,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="time"
                  className="text-xs"
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[priceRange.min, priceRange.max]}
                  className="text-xs"
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  tickFormatter={(value) => {
                    const currency = chartData[0]?.currency || 'USD'
                    return new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: currency,
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(value)
                  }}
                  width={80}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={false}
                  wrapperStyle={{
                    zIndex: 1000,
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                    outline: 'none',
                  }}
                  contentStyle={{
                    zIndex: 1000,
                    backgroundColor: 'hsl(var(--card))',
                    border: 'none',
                    padding: 0,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="priceValue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
